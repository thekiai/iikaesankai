from pydantic import BaseModel


class IikaeRequest(BaseModel):
    what: str
    who: str
    detail: str
