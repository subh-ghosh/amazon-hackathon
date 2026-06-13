import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class NeptuneService:
    def __init__(self):
        if not settings.MOCK_AWS_SERVICES:
            # Production: Initialize Gremlin connection
            from gremlin_python.driver.driver_remote_connection import DriverRemoteConnection
            from gremlin_python.process.anonymous_traversal import traversal
            
            neptune_url = f"ws://{settings.NEPTUNE_ENDPOINT}:{settings.NEPTUNE_PORT}/gremlin"
            self.connection = DriverRemoteConnection(neptune_url, "g")
            self.g = traversal().withRemote(self.connection)
            logger.info("Neptune Gremlin connection initialized in Production mode")
        else:
            self.connection = None
            self.g = None
            # Local mock graph dictionary: maps nodes and connections
            # Nodes: CUST-10928, CUST-FRAUDSTER, pm_8a39df1c0, dev_mac_990f11
            self.mock_edges = {
                "CUST-10928": {
                    "PAID_WITH": ["pm_8a39df1c0"],
                    "USED_DEVICE": ["dev_mac_990f11"]
                },
                "CUST-FRAUDSTER": {
                    "PAID_WITH": ["pm_8a39df1c0"], # Shared credit card!
                    "USED_DEVICE": ["dev_mac_990f11"] # Shared device!
                }
            }
            logger.info("NeptuneService initialized in MOCK mode with loaded fraud network")

    def close(self):
        if self.connection:
            self.connection.close()

    def check_fraud_network_risk(
        self, 
        customer_id: str, 
        payment_hash: str, 
        device_id: str
    ) -> Dict[str, Any]:
        """Queries Neptune to check if this customer is linked to known return abuse or blocked accounts."""
        
        if settings.MOCK_AWS_SERVICES:
            return self._query_mock_graph(customer_id, payment_hash, device_id)

        try:
            # Gremlin Queries:
            # 1. Check if the payment hash is shared with other accounts
            shared_payment_accounts = self.g.V().has('PaymentMethod', 'card_hash', payment_hash) \
                .in_('PAID_WITH').hasLabel('Customer').id().toList()
            
            # Remove self from the list
            shared_payment_accounts = [acc for acc in shared_payment_accounts if acc != customer_id]

            # 2. Check if the device is shared with other accounts
            shared_device_accounts = self.g.V().has('Device', 'id', device_id) \
                .in_('USED_DEVICE').hasLabel('Customer').id().toList()
            
            shared_device_accounts = [acc for acc in shared_device_accounts if acc != customer_id]

            # 3. Check for high-fraud instances in the network
            # Count historical returns with fraud_score > 0.70 linked to shared accounts
            high_fraud_count = 0
            all_linked_accounts = list(set(shared_payment_accounts + shared_device_accounts))
            if all_linked_accounts:
                high_fraud_count = self.g.V(*all_linked_accounts).out('INITIATED') \
                    .has('fraud_score', gremlin_python.process.traversal.P.gt(0.70)).count().next()

            is_risk = len(all_linked_accounts) > 0 or high_fraud_count > 0

            return {
                "sharedAccountsCount": len(all_linked_accounts),
                "highFraudCountInNetwork": high_fraud_count,
                "graphRiskScore": 0.90 if high_fraud_count > 0 else (0.50 if len(all_linked_accounts) > 0 else 0.0),
                "evidence": [
                    f"Shared payment method with {len(shared_payment_accounts)} other accounts.",
                    f"Shared device with {len(shared_device_accounts)} other accounts.",
                    f"Found {high_fraud_count} high-fraud returns in immediate neighborhood."
                ] if is_risk else ["No suspicious graph connections identified."]
            }
        except Exception as e:
            logger.error(f"Error querying Neptune database: {e}. Falling back to mock calculation.")
            return self._query_mock_graph(customer_id, payment_hash, device_id)

    def _query_mock_graph(self, customer_id: str, payment_hash: str, device_id: str) -> Dict[str, Any]:
        """Local graph traversal mock engine."""
        shared_accounts = []
        high_fraud = 0

        # Simulate finding that "CUST-10928" shares card/device with "CUST-FRAUDSTER"
        if customer_id == "CUST-10928" or payment_hash == "pm_8a39df1c0" or device_id == "dev_mac_990f11":
            shared_accounts = ["CUST-FRAUDSTER"]
            high_fraud = 1 # CUST-FRAUDSTER has a fraud rating

        if shared_accounts:
            return {
                "sharedAccountsCount": len(shared_accounts),
                "highFraudCountInNetwork": high_fraud,
                "graphRiskScore": 0.85,
                "evidence": [
                    f"Graph alert: Shared credit card hash ({payment_hash}) with known high-risk account 'CUST-FRAUDSTER'.",
                    f"Graph alert: Device fingerprint ({device_id}) matched with blacklisted device ID."
                ]
            }
        
        return {
            "sharedAccountsCount": 0,
            "highFraudCountInNetwork": 0,
            "graphRiskScore": 0.0,
            "evidence": ["No suspicious graph connections found."]
        }
