# local development
run containers locally
```sh
docker compose build && docker compose up
```

build and deploy only api
```sh
docker compose build api && docker compose up --force-recreate --no-deps api
```

# migrations

1. change models in `backend/models/sqlmodels`
1. add the models to `backend/src/models/__init__.py`
1. in project root directory
```sh
export ENV_NAME=local
python -m alembic revision --autogenerate -m "<message>"
```
1. edit created migration file in `migrations/versions` if needed
1. apply the migration to DB
```sh
python -m alembic upgrade head
```

downgrade
```she
python -m alembic downgrade <revision ID>
```

# migrations on non local environments

1. set ENV_NAME
```sh
export ENV_NAME=dev
# or
export ENV_NAME=prod
```
1. apply the migration to DB
```sh
python -m alembic upgrade head
```

# Test
```sh
export ENV_NAME=local
cd backend
pytest
```

# frontend
```sh
cd frontend
npm install
npm start
```
