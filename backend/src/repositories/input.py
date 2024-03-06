from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.exceptions import DuplicatedError
from models.sqlmodels.input import Input


def create_input(session: Session, who: str, what: str, detail: str) -> Input:
    try:
        input = Input(
            who=who,
            what=what,
            detail=detail,
        )
        session.add(input)
        session.commit()
        return input
    except IntegrityError as e:
        raise DuplicatedError(detail=str(e.orig))
    except Exception as e:
        raise e


def get_input_by_id(session: Session, id: str) -> Input | None:
    input = session.query(Input).filter(Input.id == id).first()
    return input


def update_vote_count(session: Session, input: Input, vote_count: int) -> Input:
    input.vote_count = vote_count
    session.add(input)
    session.commit()
    return input
