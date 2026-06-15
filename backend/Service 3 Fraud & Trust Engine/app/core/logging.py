import logging
import uuid
from contextvars import ContextVar

request_id_ctx = ContextVar("request_id", default=None)

class StructuredFormatter(logging.Formatter):
    def format(self, record):
        req_id = request_id_ctx.get()
        msg = super().format(record)
        return f"[RequestID: {req_id or 'SYSTEM'}] {msg}"

def setup_logging():
    logger = logging.getLogger("fraud_engine")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    if not logger.handlers:
        logger.addHandler(handler)
    return logger

logger = setup_logging()
