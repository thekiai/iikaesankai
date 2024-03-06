import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlmodel import SQLModel


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

iikaesankai = Path(__file__).resolve().parents[1]
src_dir = iikaesankai / "backend/src"
sys.path.append(str(src_dir))

if not os.environ.get("ENV_NAME"):
    os.environ["ENV_NAME"] = "local"

ENV_NAME = os.environ["ENV_NAME"]

from backend.src.core.config import settings

# Model imports
from backend.src.models import sqlmodels

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations() -> None:
    configuration = config.get_section(config.config_ini_section)
    user = settings.db_username
    password = settings.db_password.get_secret_value()
    host = "localhost" if settings.env_name == "local" else settings.db_host
    port = settings.db_port
    db_name = settings.db_name
    configuration["sqlalchemy.url"] = (
        f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db_name}"
    )

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


def red(text: str) -> str:
    return f"\033[91m{text}\033[0m"


if "revision" in sys.argv:
    run_migrations()
else:
    response = input(
        f"Are you sure you want to perform the migration on the {red(ENV_NAME)} environment? (y/n): "
    )

    if response.lower() == "y":
        print("Proceeding with the operation...")
        run_migrations()
    else:
        print("Operation aborted.")
