import time
import threading
from typing import Dict, Tuple
from app.services.persistence import persistence

class RateLimiter:
    def __init__(self, rate: float = 20.0, capacity: float = 50.0):
        """
        Token Bucket Rate Limiter.
        rate: Number of tokens replenished per second.
        capacity: Maximum tokens the bucket can hold.
        """
        self.rate = rate
        self.capacity = capacity
        self.buckets: Dict[str, Tuple[float, float]] = {}  # ip -> (tokens, last_updated_timestamp)
        self._lock = threading.RLock()

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        with self._lock:
            persisted = persistence.get_rate_limit(client_ip)
            if persisted:
                tokens = float(persisted.get("tokens", self.capacity))
                last_updated = float(persisted.get("lastUpdated", now))
            else:
                tokens, last_updated = self.buckets.get(client_ip, (self.capacity, now))
            
            # Replenish tokens
            elapsed = now - last_updated
            tokens = min(self.capacity, tokens + elapsed * self.rate)
            
            if tokens >= 1.0:
                self.buckets[client_ip] = (tokens - 1.0, now)
                persistence.put_rate_limit(client_ip, {"tokens": tokens - 1.0, "lastUpdated": now})
                return True
            else:
                self.buckets[client_ip] = (tokens, now)
                persistence.put_rate_limit(client_ip, {"tokens": tokens, "lastUpdated": now})
                return False

# Global instance of rate limiter
api_rate_limiter = RateLimiter()
