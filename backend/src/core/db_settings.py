from contextlib import contextmanager

from sqlalchemy import create_engine, engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

from core.config import settings

Base = declarative_base()

if settings.env_name == "local":
    url = "mysql://%s:%s@%s:%s/%s?charset=utf8mb4" % (
        settings.db_username,
        settings.db_password.get_secret_value(),
        settings.db_host,
        settings.db_port,
        settings.db_name,
    )
else:
    url = engine.url.URL.create(
        drivername="mysql",
        username=settings.db_username,
        password=settings.db_password.get_secret_value(),
        database=settings.db_name,
        query={
            "unix_socket": "/cloudsql/" + settings.instance_connection_name,
            "charset": "utf8mb4",
        },
    )


db_engine = create_engine(url, pool_pre_ping=True)

Session = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
ScopedSession = scoped_session(Session)


@contextmanager
def get_db_session():
    session = ScopedSession()
    try:
        yield session
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def get_db_session_for_depends():
    with get_db_session() as session:
        yield session
