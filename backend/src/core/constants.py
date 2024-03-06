from enum import Enum


class OrderBy(str, Enum):
    latest = "latest"
    ranking = "ranking"


AI_MODEL = "gpt-4-turbo-preview"
TEMPERATURE = 0.1

PROJECT_NAME = "iikaesankai"

NUM_PARAPHRASES_PER_CONTENT = 3
