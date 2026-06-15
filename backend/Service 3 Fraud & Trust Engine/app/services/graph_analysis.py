import networkx as nx

class GraphAnalysis:
    def __init__(self):
        self.G = nx.Graph()

    def analyze_device_sharing(self, customer_id: str, device_id: str) -> bool:
        # Fallback networkx logic
        # Mock response for hackathon: return True if DEV-001 (shared fraud ring)
        if device_id == "DEV-001":
            return True
        return False

    def analyze_payment_sharing(self, customer_id: str, payment_hash: str) -> bool:
        if payment_hash == "PM-001":
            return True
        return False

graph_analyzer = GraphAnalysis()
