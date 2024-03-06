from pydantic import BaseModel


class Pagination(BaseModel):
    page: int = 1
    per_page: int = 10
