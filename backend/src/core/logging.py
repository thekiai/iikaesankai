import json
import logging
import sys
import traceback

from core.config import settings


class FormatterJSON(logging.Formatter):
    def format(self, record):
        if self.usesTime():
            record.asctime = self.formatTime(record, self.datefmt)
        j = {
            "logLevel": record.levelname,
            "timestamp": "%(asctime)s.%(msecs)dZ"
            % dict(asctime=record.asctime, msecs=record.msecs),
            "timestamp_epoch": record.created,
            "message": record.getMessage().splitlines(),
            "module": record.module,
            "filename": record.filename,
            "funcName": record.funcName,
            "levelno": record.levelno,
            "lineno": record.lineno,
            "traceback": {},
            "extra_data": record.__dict__.get("extra_data", {}),
            "event": record.__dict__.get("event", {}),
        }
        if record.exc_info:
            j["traceback"] = traceback.format_exc().splitlines()

        return json.dumps(j, ensure_ascii=False)


def configure_logging():
    logger = logging.getLogger("uvicorn")
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    logger.setLevel(logging.DEBUG)
    formatter = FormatterJSON(
        "[%(levelname)s]\t%(asctime)s.%(msecs)dZ\t%(levelno)s\t%(message)s\n",
        "%Y-%m-%dT%H:%M:%S",
    )
    # if settings.env_name in ["prod", "dev"]:
    #     handler.setFormatter(formatter)
    # if logger.hasHandlers():
    #     logger.handlers.clear()
    # logger.addHandler(handler)
    # alchemy_logger = logging.getLogger("sqlalchemy")
    # if alchemy_logger.hasHandlers():
    #     alchemy_logger.handlers.clear()
    # alchemy_logger.addHandler(handler)
    # if settings.env_name in ["prod", "dev"]:
    #     alchemy_logger.setLevel(logging.INFO)

    # logger.propagate = False
    # alchemy_logger.propagate = False

    return logger
