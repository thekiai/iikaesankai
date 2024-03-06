from datetime import datetime

import ulid
from sqlmodel import Column, DateTime, Field, SQLModel, func


class Input(SQLModel, table=True):
    __tablename__ = "inputs"

    id: str = Field(primary_key=True, max_length=33)
    who: str = Field(max_length=200)
    what: str = Field(max_length=500)
    detail: str = Field(max_length=500)
    vote_count: int = Field(default=0)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), default=func.now(), onupdate=func.now()
        ),
    )
    deleted_at: datetime = Field(default=None, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.id = ulid.new().str.lower()
