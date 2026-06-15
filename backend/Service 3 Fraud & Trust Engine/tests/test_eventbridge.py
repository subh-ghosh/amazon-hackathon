from app.handlers.eventbridge import event_publisher

def test_publish():
    res = event_publisher.publish_fraud_event({"test": "data"})
    assert res is True
