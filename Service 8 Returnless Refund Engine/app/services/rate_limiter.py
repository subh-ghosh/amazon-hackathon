import time
import threading
from typing import Dict, Tuple

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
            tokens, last_updated = self.buckets.get(client_ip, (self.capacity, now))
            
            # Replenish tokens
            elapsed = now - last_updated
            tokens = min(self.capacity, tokens + elapsed * self.rate)
            
            if tokens >= 1.0:
                self.buckets[client_ip] = (tokens - 1.0, now)
                return True
            else:
                self.buckets[client_ip] = (tokens, now)
                return False

# Global instance of rate limiter
api_rate_limiter = RateLimiter()
