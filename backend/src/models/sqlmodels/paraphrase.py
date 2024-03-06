from datetime import datetime

import ulid
from sqlmodel import Column, DateTime, Field, SQLModel, func


class Paraphrase(SQLModel, table=True):
    __tablename__ = "paraphrases"

    id: str = Field(primary_key=True, max_length=33)
    input_id: str = Field(max_length=33, foreign_key="inputs.id")
    content: str = Field(max_length=500)
    vote_count: int = Field(default=0)
    ai_model: str = Field(max_length=50)
    temperature: float
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
