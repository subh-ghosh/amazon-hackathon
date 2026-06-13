"""
Custom exception hierarchy for the Knowledge Graph Service.
FastAPI exception handlers map these to proper HTTP responses.
"""

from fastapi import HTTPException, status


class KnowledgeGraphException(Exception):
    """Base exception for all service errors."""
    def __init__(self, message: str, detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)


class EntityNotFoundException(KnowledgeGraphException):
    """Raised when a node/entity is not found in Neptune or DynamoDB."""
    pass


class GraphQueryException(KnowledgeGraphException):
    """Raised when a Neptune query fails."""
    pass


class EventPublishException(KnowledgeGraphException):
    """Raised when publishing to EventBridge fails."""
    pass


class DynamoDBException(KnowledgeGraphException):
    """Raised when a DynamoDB operation fails."""
    pass


# ── FastAPI Exception Handlers ──────────────────

def entity_not_found_handler(request, exc: EntityNotFoundException):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": exc.message, "detail": exc.detail},
    )


def graph_query_error_handler(request, exc: GraphQueryException):
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={"error": "Graph query failed", "detail": exc.message},
    )
