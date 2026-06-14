import threading
import uuid
import datetime

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

    def cache_decision(self, decision_id: str, response: dict):
        with self._lock:
            self.decisions_cache[decision_id] = response

    def get_decision(self, decision_id: str):
        with self._lock:
            return self.decisions_cache.get(decision_id)

    def record_analytics(self, facility_type: str, facility_id: str, co2: float, circularity: int):
        with self._lock:
            self.total_optimizations += 1
            
            # Simulated cost savings based on recovery route
            savings = 0.0
            if facility_type in ["REFURBISHMENT", "DONATION"]:
                savings = 45.50
            elif facility_type == "RECYCLING":
                savings = 12.00
            
            self.total_cost_savings += savings
            self.total_co2_saved += co2
            self.total_circularity += circularity
            
            self.facility_utilization[facility_id] = self.facility_utilization.get(facility_id, 0) + 1
            self.recovery_path_distribution[facility_type] = self.recovery_path_distribution.get(facility_type, 0) + 1

    def get_analytics(self):
        with self._lock:
            return {
                "totalOptimizations": self.total_optimizations,
                "averageCostSavings": self.total_cost_savings / self.total_optimizations if self.total_optimizations > 0 else 0,
                "averageCO2Saved": self.total_co2_saved / self.total_optimizations if self.total_optimizations > 0 else 0,
                "circularityImpact": self.total_circularity / self.total_optimizations if self.total_optimizations > 0 else 0,
                "facilityUtilization": self.facility_utilization.copy(),
                "recoveryPathDistribution": self.recovery_path_distribution.copy()
            }

audit_service = AuditAndCacheService()
