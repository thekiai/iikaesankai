from __future__ import annotations


from sqlalchemy import desc
from sqlalchemy.orm import Session

from core.constants import NUM_PARAPHRASES_PER_CONTENT, OrderBy
from models.custom_types.content import Content, Paraphrase as ParaphraseType
from models.sqlmodels.input import Input
from models.sqlmodels.paraphrase import Paraphrase


def get_contents_by_order(
    session: Session, skip: int = 0, limit: int = 10, order_by: OrderBy = OrderBy.latest
) -> list[Content]:
    order_column = Input.created_at
    if order_by == OrderBy.ranking:
        order_column = Input.vote_count

    query_result = (
        session.query(Input, Paraphrase)
        .join(
            Paraphrase,
            Input.id == Paraphrase.input_id,
        )
        .filter(Input.deleted_at.is_(None))
        .order_by(desc(order_column))
        .offset(skip)
        .limit(limit * NUM_PARAPHRASES_PER_CONTENT)
        .all()
    )

    contents: list[Content] = []
    for input, paraphrase in query_result:
        paraphrase = ParaphraseType(
            paraphrase_id=paraphrase.id,
            content=paraphrase.content,
            vote_count=paraphrase.vote_count,
        )
        if contents and contents[-1].content_id == input.id:
            contents[-1].paraphrases.append(paraphrase)
        else:
            contents.append(
                Content(
                    content_id=input.id,
                    who=input.who,
                    what=input.what,
                    detail=input.detail,
                    paraphrases=[paraphrase],
                )
            )

    return contents


def get_content_by_id(session: Session, content_id: str) -> Content:
    query_result = (
        session.query(Input, Paraphrase)
        .join(
            Paraphrase,
            Input.id == Paraphrase.input_id,
        )
        .filter(Input.id == content_id)
        .filter(Input.deleted_at.is_(None))
        .all()
    )
    input: Input = query_result[0][0]
    content = Content(
        content_id=content_id,
        who=input.who,
        what=input.what,
        detail=input.detail,
        paraphrases=[],
    )
    for _, paraphrase in query_result:
        paraphrase = ParaphraseType(
            paraphrase_id=paraphrase.id,
            content=paraphrase.content,
            vote_count=paraphrase.vote_count,
        )
        content.paraphrases.append(paraphrase)

    return content
