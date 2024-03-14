from __future__ import annotations

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from sqlalchemy.orm import Session

from core.config import settings
from core.constants import (
    AI_MODEL,
    NUM_PARAPHRASES_PER_CONTENT,
    TEMPERATURE,
    TEST_POST_IIKAE_RESPONSE,
)
from core.db_settings import get_db_session_for_depends
from core.logging import configure_logging
from models.custom_types.content import Content
from models.custom_types.pagination import Pagination
from models.requests.iikae_request import IikaeRequest
from models.requests.vote_request import VoteRequest
from models.responses.get_contents_response import GetContentsResponse
from models.responses.post_iikae_response import PostIikaeResponse
from models.sqlmodels.paraphrase import Paraphrase
from repositories.content import get_content_by_id, get_contents_by_order
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

    text = f"""
[言いたいこと]
{iikae_request.what}

[相手]
{iikae_request.who}

[詳しく]
{iikae_request.detail}
"""

    system_message = """
# 役割
あなたは人々が抱える「言いにくいこと」を面白く言い換える天才です。

# 指示
ユーザが入力した「言いにくいこと」を、例え話などを盛り込み面白く言い換えてください。
回答はアプローチを変えて3パターンで簡潔に、3つ目の回答は関西弁でお願いします。
もしもユーザーの入力が[誰に] [言いたいこと] [詳しく] と関係ないものや公序良俗に反するものであったり、[詳しく] に正しい文章が書かれていないときは「無効な入力かい！」とだけ返答してください。

# 例1
ユーザー：
---
[誰に]
会社のお偉いさん

[言いたいこと]
カツラずれてますよ

[詳しく]
たまに会社のお偉いさんと一緒にゴルフに行くことがあるが、よくカツラがずれていて気まずい
---

あなた：
---
今日の風、なかなかのやんちゃ坊主ですね。お帽子の下の小鳥さんが巣立ちそうになってますよ。

今のプレイは素晴らしかったですね。でも、どうやら頭上の草原が少し南に移動しているようです。風のせいかもしれませんね。

社長さん、今日の頭ん上、ちょっとお出かけモードやないですか？カツラさんが、"今日はこっち行こか～"って、ちょっとお散歩してるみたいですわ。
---

# 例2
ユーザー：
---
[誰に]
友達

[言いたいこと]
おはよう

[詳しく]
あああ
---

あなた：
---
無効な入力かい！
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

        generated_message = completion.choices[0].message.content

        if "無効な入力かい！" in generated_message:
            logger.info(f"Got invalid input: {iikae_request}")
            raise HTTPException(status_code=400, detail="Invalid input")
        else:
            logger.info(f"iikae_request: {iikae_request}")

        generated_texts = generated_message.split("\n\n")

        generated_texts = [
            iikae_text.replace("---", "").strip() for iikae_text in generated_texts
        ]

        logger.info(f"generated_texts: {generated_texts}")

        if len(generated_texts) == NUM_PARAPHRASES_PER_CONTENT:
            logger.info("Successfully generated response")
            break
        elif i + 1 == MAX_RETRIES:
            raise Exception("Failed to generate response")
        else:
            logger.warning("Failed to generate response. Retrying...")

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
        page=pagination.page,
        per_page=pagination.per_page,
        order_by=order_by,
    )
    return GetContentsResponse(contents=contents)


@app.get("/contents/{content_id}/", response_model=Content)
async def get_content(
    content_id: str, session: Session = Depends(get_db_session_for_depends)
):
    content = get_content_by_id(session, content_id)
    return content
