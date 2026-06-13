import os
import sys
import pytest
from fastapi.testclient import TestClient

# Setup sys.path to resolve truth_discovery modules
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Enforce default test settings
os.environ["MOCK_AWS"] = "true"
os.environ["MOCK_BEDROCK"] = "true"

from app.main import app
from app.config import settings

@pytest.fixture(autouse=True)
def configure_test_settings():
    """Ensures settings reset to default mock values between each test run."""
    settings.MOCK_AWS = True
    settings.MOCK_BEDROCK = True
    settings.CONFIDENCE_THRESHOLD = 0.60
    yield

@pytest.fixture
def api_client():
    """Provides a FastAPI TestClient instance."""
    return TestClient(app)

@pytest.fixture
def standard_request_payload():
    """Returns a valid standard request payload dictionary."""
    return {
        "returnId": "RET123",
        "customerId": "C123",
        "productId": "P123",
        "sellerId": "S123",
        "statedReason": "Defective",
        "customerComment": "Standard return comment for testing",
        "images": ["s3://bucket/image.jpg"]
    }
