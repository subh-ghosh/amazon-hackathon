from app.db.dynamodb import db_client

def test_store():
    db_client.store_fraud_score("C-1", {"score": 50})
    assert "CUSTOMER#C-1_RISK#PROFILE" in db_client.mock_store
