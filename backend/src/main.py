from __future__ import annotations

from fastapi import BackgroundTasks, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from sqlalchemy.orm import Session

from core.config import settings
from core.constants import AI_MODEL, TEMPERATURE, TEST_POST_IIKAE_RESPONSE
from core.db_settings import get_db_session_for_depends
from core.logging import configure_logging
from models.custom_types.content import Content
from models.custom_types.pagination import Pagination
from models.requests.iikae_request import IikaeRequest
from models.requests.vote_request import VoteRequest
from models.responses.get_contents_response import GetContentsResponse
from models.responses.post_iikae_response import PostIikaeResponse
from models.sqlmodels.paraphrase import Paraphrase
from repositories.content import get_contents_by_order
from repositories.input import create_input
from repositories.paraphrase import add_vote_count, create_paraphrase

app = FastAPI()

client = OpenAI(api_key=settings.openai_api_key.get_secret_value())

logger = configure_logging()

# Set up CORS
origins = [settings.frontend_url]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    if settings.env_name == "prod":
        logger.info("Hello World")
    return {"message": "Hello World"}


@app.post("/iikae/", response_model=PostIikaeResponse)
async def post_iikae(
    iikae_request: IikaeRequest, session: Session = Depends(get_db_session_for_depends)
):
    if settings.is_test:
        import time

        time.sleep(3)
        return TEST_POST_IIKAE_RESPONSE

    # limit the text length
    if (
        len(iikae_request.what) > 100
        or len(iikae_request.who) > 100
        or len(iikae_request.detail) > 200
    ):
        raise ValueError("Text length is too long")

    logger.info(f"iikae_request: {iikae_request}")

    text = f"""
[言いたいこと]
{iikae_request.what}

[相手]
{iikae_request.who}

[背景]
{iikae_request.detail}
"""
    system_message = """
##役割##
あなたは言いにくいことを面白く言い換える天才です。

##指示##
例え話などを盛り込んでユーザが抱える言いにくいことを面白く言い換えて伝えてください。回答は3パターン用意し、三つ目は関西弁でお願いします。フォーマットは以下の通りです。
「---」で囲まれた中身を出力して、「---」自体は出力しないでください。

##例##
ユーザーの入力：
---
[言いたいこと]
飲み会に誘わないでほしいです

[相手]
上司

[背景]
会社の上司に頻繁に飲み会に誘われて困っている
---

あなたの出力：
---
ここのところ私のお財布も定期的にダイエット中なんです。お酒代を節約するために、今回はお誘いを辞退させていただければと思っています。

最近、胃薬の株価が上昇傾向なんです。今回はアルコールとの距離を置いて、少し充電をしてみるのも悪くないかなと思っているんです。

今、肝臓がキャンプファイヤーやってる感じで、ヤバいかもしれへんねん。今回は酒とおさらばして、ちょっとお休みしてみようかなって思てるねん。
---
"""
    MAX_RETRIES = 3
    for i in range(MAX_RETRIES):
        completion = client.chat.completions.create(
            model=AI_MODEL,
            temperature=TEMPERATURE,
            messages=[
                {
                    "role": "system",
                    "content": system_message,
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
        )
        generated_texts = completion.choices[0].message.content.split("\n\n")
        generated_texts = [
            iikae_text.replace("---", "").strip() for iikae_text in generated_texts
        ]

        logger.info(f"generated_texts: {generated_texts}")

        if len(generated_texts) == 3:
            break
        elif i + 1 == MAX_RETRIES:
            raise Exception("Failed to generate response")

    input = create_input(
        session,
        who=iikae_request.who,
        what=iikae_request.what,
        detail=iikae_request.detail,
    )
    paraphrases: list[Paraphrase] = []
    for generated_text in generated_texts:
        paraphrases.append(create_paraphrase(session, input.id, generated_text))

    return PostIikaeResponse(
        content=Content(
            content_id=input.id,
            who=input.who,
            what=input.what,
            detail=input.detail,
            paraphrases=[
                {
                    "paraphrase_id": paraphrase.id,
                    "content": paraphrase.content,
                    "vote_count": paraphrase.vote_count,
                }
                for paraphrase in paraphrases
            ],
        )
    )


def add_vote_count_background(session: Session, paraphrase_id: str):
    add_vote_count(session, paraphrase_id)


@app.post("/vote/")
async def vote(
    vote_request: VoteRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_db_session_for_depends),
):
    # タスクをバックグラウンドで実行
    background_tasks.add_task(
        add_vote_count_background, session, vote_request.paraphrase_id
    )
    return {"message": "success"}


@app.get("/contents/", response_model=GetContentsResponse)
async def get_contents(
    pagination: Pagination = Depends(),
    order_by: str = "latest",
    session: Session = Depends(get_db_session_for_depends),
):
    contents = get_contents_by_order(
        session,
        skip=(pagination.page - 1) * pagination.per_page,
        limit=pagination.per_page,
        order_by=order_by,
    )
    return GetContentsResponse(contents=contents)
