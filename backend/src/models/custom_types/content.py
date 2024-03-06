from __future__ import annotations

from pydantic import BaseModel


class Paraphrase(BaseModel):
    paraphrase_id: str
    content: str
    vote_count: int


class Content(BaseModel):
    content_id: str
    who: str
    what: str
    detail: str
    paraphrases: list[Paraphrase]
