import os
import pytest
import boto3
from moto import mock_aws
from fastapi.testclient import TestClient

# Set mock env vars BEFORE importing app to ensure settings are correct
os.environ["AWS_REGION"] = "us-east-1"
os.environ["DYNAMODB_TABLE_NAME"] = "TestProductDigitalTwin"
os.environ["ENVIRONMENT"] = "test"

from app.main import app
from app.config import settings

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"

@pytest.fixture(scope="function")
def dynamodb_mock(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        dynamodb.create_table(
            TableName="TestProductDigitalTwin",
            KeySchema=[{"AttributeName": "productId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "productId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield dynamodb

@pytest.fixture(scope="function")
def client(dynamodb_mock):
    with TestClient(app) as test_client:
        yield test_client
