"""
FastAPI dependencies — shared across all routes.
Provides service singletons via Depends().
"""

from functools import lru_cache

from app.services.graph_service import GraphService
from app.services.event_service import EventService
from app.services.metadata_service import MetadataService


@lru_cache()
def get_graph_service() -> GraphService:
    return GraphService()


@lru_cache()
def get_event_service() -> EventService:
    return EventService()


@lru_cache()
def get_metadata_service() -> MetadataService:
    return MetadataService()
