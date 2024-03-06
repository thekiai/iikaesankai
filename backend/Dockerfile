FROM python:3.9-slim-buster
WORKDIR /src
RUN pip install poetry
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml poetry.lock /src/
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi
COPY ./src /src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
