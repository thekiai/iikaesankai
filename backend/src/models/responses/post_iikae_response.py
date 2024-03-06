from pydantic import BaseModel

from models.custom_types.content import Content


class PostIikaeResponse(BaseModel):
    content: Content
