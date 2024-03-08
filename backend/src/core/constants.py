from enum import Enum

from models.custom_types.content import Content
from models.responses.post_iikae_response import PostIikaeResponse


class OrderBy(str, Enum):
    latest = "latest"
    ranking = "ranking"


AI_MODEL = "gpt-4-turbo-preview"
TEMPERATURE = 1

PROJECT_NAME = "iikaesankai"

NUM_PARAPHRASES_PER_CONTENT = 3

TEST_POST_IIKAE_RESPONSE = PostIikaeResponse(
    content=Content(
        content_id="test_content_id",
        who="大切な人",
        what="ありがとう",
        detail="いつも感謝している大切な人に",
        paraphrases=[
            {
                "paraphrase_id": "test_paraphrase_id",
                "content": "ありがとう",
                "vote_count": 0,
            },
            {
                "paraphrase_id": "test_paraphrase_id2",
                "content": "感謝してるよ",
                "vote_count": 0,
            },
            {
                "paraphrase_id": "test_paraphrase_id3",
                "content": "そのままでいてね",
                "vote_count": 0,
            },
        ],
    )
)
