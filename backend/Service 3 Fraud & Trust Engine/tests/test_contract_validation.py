import pytest
import json
import jsonschema
from app.models.schemas import FraudScoreComputedEvent

def test_tc_004_fraud_score_computed_contract():
    import os
    # Find the shared contract relative to the tests folder
    contract_path = os.path.join(os.path.dirname(__file__), "../../shared/events/FraudScoreComputed.json")
    with open(contract_path, "r") as f:
        schema = json.load(f)
        
    event = FraudScoreComputedEvent(
        case_id="CASE-1",
        entity_id="CUST-1",
        entity_type="Customer",
        severity="HIGH",
        fraud_score=85,
        related_return_ids=["RTN-1"]
    )
    
    event_dict = json.loads(event.model_dump_json())
    jsonschema.validate(instance=event_dict, schema=schema)
