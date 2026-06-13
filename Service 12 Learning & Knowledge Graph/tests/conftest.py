"""
Test fixtures shared across all test modules.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    """TestClient for FastAPI — reused across all tests."""
    with TestClient(app) as c:
        yield c
