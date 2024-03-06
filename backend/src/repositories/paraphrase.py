from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.constants import AI_MODEL, TEMPERATURE
from core.exceptions import DuplicatedError
from models.sqlmodels.input import Input
from models.sqlmodels.paraphrase import Paraphrase


def create_paraphrase(session: Session, input_id: str, paraphrase: str) -> Paraphrase:
    try:
        paraphrase = Paraphrase(
            input_id=input_id,
            content=paraphrase,
            ai_model=AI_MODEL,
            temperature=TEMPERATURE,
        )
        session.add(paraphrase)
        session.commit()
        return paraphrase
    except IntegrityError as e:
        raise DuplicatedError(detail=str(e.orig))
    except Exception as e:
        raise e


def get_paraphrases_by_input_id(session: Session, input_id: str) -> list[Paraphrase]:
    paraphrases = (
        session.query(Paraphrase).filter(Paraphrase.input_id == input_id).all()
    )
    return paraphrases


def add_vote_count(session: Session, paraphrase_id: str) -> Paraphrase:
    paraphrase = (
        session.query(Paraphrase).filter(Paraphrase.id == paraphrase_id).first()
    )
    paraphrase.vote_count += 1
    input_id = paraphrase.input_id
    input = session.query(Input).filter(Input.id == input_id).first()
    input.vote_count += 1
    session.commit()
    return paraphrase
