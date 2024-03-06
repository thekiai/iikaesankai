from __future__ import annotations

import json
import os

from dotenv import load_dotenv
from google.cloud import secretmanager
from pydantic import SecretStr
from pydantic_settings import BaseSettings

from core.constants import PROJECT_NAME


if os.environ.get("ENV_NAME") == "local":
    local_env_file_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../.env",
        )
    )
    load_dotenv(dotenv_path=local_env_file_path)

else:
    client = secretmanager.SecretManagerServiceClient()
    secret_name = f"projects/{PROJECT_NAME}/secrets/{PROJECT_NAME}/versions/latest"

    response = client.access_secret_version(name=secret_name)
    payload_data = response.payload.data.decode("UTF-8")
    secret_dict = json.loads(payload_data)

    for key, value in secret_dict.items():
        os.environ[key] = value


class Settings(BaseSettings):
    env_name: str
    db_name: str
    db_host: str
    db_password: SecretStr
    db_port: str
    db_username: str
    openai_api_key: SecretStr

    class Config:
        case_sensitive = False


settings = Settings()
