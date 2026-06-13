import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import requests

from app.main import app
from app.db.neptune_client import get_neptune_client

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_neptune_client():
    neptune = get_neptune_client()
    neptune._offline = False
    yield
    neptune._offline = False


@patch("requests.post")
def test_analytics_fallback_on_neptune_timeout(mock_post):
    """Test that a timeout exception gracefully degrades the analytics endpoints."""
    mock_post.side_effect = requests.exceptions.Timeout("Connection timed out")
    
    # First call will timeout and set _offline = True
    response = client.get("/api/v1/intelligence/analytics/top-return-causes")
    assert response.status_code == 200
    assert response.json() == {"status": "degraded", "data": []}
    
    neptune = get_neptune_client()
    assert neptune._offline is True


@patch("requests.post")
def test_analytics_fallback_on_invalid_endpoint(mock_post):
    """Test that a connection error gracefully degrades the endpoints."""
    mock_post.side_effect = requests.exceptions.ConnectionError("Failed to connect")
    
    response = client.get("/api/v1/intelligence/analytics/fraudulent-products")
    assert response.status_code == 200
    assert response.json() == {"status": "degraded", "data": []}
    
    neptune = get_neptune_client()
    assert neptune._offline is True


def test_graph_stats_fallback_mode():
    """Test that graph-stats returns 0 nodes/edges in degraded mode."""
    neptune = get_neptune_client()
    neptune._offline = True
    
    response = client.get("/api/v1/intelligence/analytics/graph-stats")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["nodes"] == 0
    assert data["edges"] == 0


@patch("requests.post")
def test_empty_graph_returns_ok_with_empty_data(mock_post):
    """Test that an empty graph result is handled as 'ok' but empty data."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"results": []}
    mock_resp.raise_for_status.return_value = None
    mock_post.return_value = mock_resp
    
    response = client.get("/api/v1/intelligence/analytics/seller-return-analysis")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "data": []}
