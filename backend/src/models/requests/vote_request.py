from pydantic import BaseModel


class VoteRequest(BaseModel):
    paraphrase_id: str
