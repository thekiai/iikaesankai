from __future__ import annotations

from pydantic import BaseModel

from models.custom_types.content import Content


class GetContentsResponse(BaseModel):
    contents: list[Content]
