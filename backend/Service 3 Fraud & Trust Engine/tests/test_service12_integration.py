from app.clients.service12_client import service12

def test_get_customer():
    data = service12.get_customer_history("C-1")
    assert "return_rate" in data
