import threading
import uuid
import datetime
from app.services.persistence import persistence

class AuditAndCacheService:
    def __init__(self):
        self._lock = threading.RLock()
        self.decisions_cache = {}
        self.audit_log = []
        
        # Analytics counters
        self.total_optimizations = 0
        self.total_cost_savings = 0.0
        self.total_co2_saved = 0.0
        self.total_circularity = 0.0
        self.facility_utilization = {}
        self.recovery_path_distribution = {}

    def log_audit(self, event: str, details: str, correlation_id: str = None):
        with self._lock:
            entry = {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "event": event,
                "details": details,
                "correlationId": correlation_id
            }
            self.audit_log.append(entry)
            persistence.log_audit(entry)

    def cache_decision(self, decision_id: str, response: dict):
        with self._lock:
            self.decisions_cache[decision_id] = response
            persistence.put_decision(decision_id, response)

    def get_decision(self, decision_id: str):
        with self._lock:
            decision = self.decisions_cache.get(decision_id)
            if decision:
                return decision
            persisted = persistence.get_decision(decision_id)
            if persisted:
                self.decisions_cache[decision_id] = persisted
            return persisted

    def record_analytics(self, facility_type: str, facility_id: str, co2: float, circularity: int):
        with self._lock:
            analytics = persistence.get_analytics()
            analytics["totalOptimizations"] += 1
            
            # Simulated cost savings based on recovery route
            savings = 0.0
            if facility_type in ["REFURBISHMENT", "DONATION"]:
                savings = 45.50
            elif facility_type == "RECYCLING":
                savings = 12.00
            
            analytics["totalCostSavings"] += savings
            analytics["totalCO2Saved"] += co2
            analytics["totalCircularity"] += circularity
            
            facility_utilization = analytics["facilityUtilization"]
            recovery_distribution = analytics["recoveryPathDistribution"]
            facility_utilization[facility_id] = facility_utilization.get(facility_id, 0) + 1
            recovery_distribution[facility_type] = recovery_distribution.get(facility_type, 0) + 1
            persistence.put_analytics(analytics)

    def get_analytics(self):
        with self._lock:
            analytics = persistence.get_analytics()
            total = analytics["totalOptimizations"]
            return {
                "totalOptimizations": total,
                "averageCostSavings": analytics["totalCostSavings"] / total if total > 0 else 0,
                "averageCO2Saved": analytics["totalCO2Saved"] / total if total > 0 else 0,
                "circularityImpact": analytics["totalCircularity"] / total if total > 0 else 0,
                "facilityUtilization": dict(analytics["facilityUtilization"]),
                "recoveryPathDistribution": dict(analytics["recoveryPathDistribution"])
            }

audit_service = AuditAndCacheService()
