"""
In-Memory TTL Cache — No Redis needed, works on free tiers.
Thread-safe with automatic expiry.
"""
import time
import hashlib
import json
import threading
from config import Config


class CacheService:
    """Simple in-memory cache with TTL and max-size eviction."""

    def __init__(self, ttl=None, max_size=None):
        self.ttl = ttl or Config.CACHE_TTL
        self.max_size = max_size or Config.CACHE_MAX_SIZE
        self._store = {}  # key -> (value, expiry_time)
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def _make_key(self, *args, **kwargs) -> str:
        """Create a deterministic cache key from arguments."""
        raw = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        return hashlib.md5(raw.encode()).hexdigest()

    def get(self, key: str):
        """Get item from cache. Returns None if expired or missing."""
        with self._lock:
            if key in self._store:
                value, expiry = self._store[key]
                if time.time() < expiry:
                    self._hits += 1
                    return value
                else:
                    del self._store[key]
            self._misses += 1
            return None

    def set(self, key: str, value, ttl: int = None):
        """Store item with TTL."""
        with self._lock:
            # Evict oldest if at max size
            if len(self._store) >= self.max_size:
                oldest_key = min(self._store, key=lambda k: self._store[k][1])
                del self._store[oldest_key]

            expiry = time.time() + (ttl or self.ttl)
            self._store[key] = (value, expiry)

    def invalidate(self, key: str):
        """Remove a specific key."""
        with self._lock:
            self._store.pop(key, None)

    def clear(self):
        """Clear all cached data."""
        with self._lock:
            self._store.clear()

    def stats(self) -> dict:
        """Return cache statistics."""
        with self._lock:
            # Purge expired entries
            now = time.time()
            expired = [k for k, (_, exp) in self._store.items() if now >= exp]
            for k in expired:
                del self._store[k]

            total = self._hits + self._misses
            return {
                "size": len(self._store),
                "max_size": self.max_size,
                "ttl_seconds": self.ttl,
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": f"{(self._hits / total * 100):.1f}%" if total > 0 else "0%",
            }


# Global cache instances
recommendation_cache = CacheService(ttl=300, max_size=50)   # 5 min for recs
catalog_cache = CacheService(ttl=600, max_size=30)           # 10 min for catalog
analytics_cache = CacheService(ttl=60, max_size=20)          # 1 min for analytics
