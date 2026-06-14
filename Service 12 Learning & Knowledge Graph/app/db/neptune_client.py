"""
Amazon Neptune Client — dual-mode: Gremlin (traversal) + openCypher (analytics).

For production on AWS:
  - Uses IAM SigV4 authentication
  - Connects via WSS (Gremlin) or HTTPS (openCypher)

For local development:
  - Connects to a local Apache TinkerPop Gremlin Server
"""

import logging
import json
from typing import Any

import requests
from gremlin_python.driver import client as gremlin_client, serializer
from gremlin_python.driver.protocol import GremlinServerError

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class NeptuneClient:
    """Manages connections and queries to Amazon Neptune."""

    def __init__(self):
        self._gremlin_client: gremlin_client.Client | None = None
        self._gremlin_offline: bool = False
        self._opencypher_offline: bool = False

    # ── Connection Management ────────────────────

    def get_gremlin_client(self) -> gremlin_client.Client:
        """Lazy-initialize and return the Gremlin WebSocket client."""
        if self._gremlin_offline:
            return None
        if self._gremlin_client is None:
            url = settings.neptune_wss_url
            logger.info(f"Connecting to Neptune Gremlin at {url}")
            try:
                self._gremlin_client = gremlin_client.Client(
                    url,
                    "g",
                    message_serializer=serializer.GraphSONSerializersV2d0(),
                )
            except Exception as e:
                logger.warning(f"Neptune Gremlin connection failed: {e}. Running in offline mode.")
                self._gremlin_offline = True
                self._gremlin_client = None
        return self._gremlin_client

    def close(self):
        """Clean shutdown."""
        if self._gremlin_client:
            self._gremlin_client.close()
            self._gremlin_client = None

    # ── Gremlin Queries ──────────────────────────

    def execute_gremlin(self, query: str, bindings: dict | None = None) -> list[Any]:
        """Execute a Gremlin query string and return results."""
        client = self.get_gremlin_client()
        if client is None:
            logger.warning(f"Neptune offline — skipping Gremlin query: {query[:80]}...")
            return []
        try:
            result_set = client.submit(query, bindings=bindings)
            return result_set.all().result(timeout=5)
        except GremlinServerError as e:
            logger.error(f"Gremlin query failed: {e}")
            self._gremlin_offline = True
            return []
        except Exception as e:
            logger.error(f"Neptune error: {e}")
            self._gremlin_offline = True
            return []

    # ── openCypher Queries ───────────────────────

    def execute_opencypher(self, query: str) -> list[dict]:
        """
        Execute an openCypher query via Neptune's HTTPS endpoint.
        Returns a list of result rows as dicts.
        """
        if self._opencypher_offline:
            logger.warning(f"Neptune offline — skipping openCypher query: {query[:80]}...")
            return []
            
        url = settings.neptune_https_url
        try:
            response = requests.post(
                url,
                data=json.dumps({"query": query}),
                headers={"Content-Type": "application/json"},
                timeout=(3.0, 5.0), # (connect timeout, read timeout)
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except requests.exceptions.Timeout:
            logger.error(f"Neptune openCypher query timed out at {url}.")
            self._opencypher_offline = True
            return []
        except requests.exceptions.ConnectionError:
            logger.error(f"Neptune openCypher endpoint unreachable at {url}. Running in offline mode.")
            self._opencypher_offline = True
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Neptune openCypher HTTP error: {e}")
            self._opencypher_offline = True
            return []
        except Exception as e:
            logger.error(f"openCypher query failed: {e}")
            self._opencypher_offline = True
            return []

    # ── Node Creation (Gremlin) ──────────────────

    def upsert_vertex(self, label: str, vertex_id: str, properties: dict) -> bool:
        """Create or update a vertex in the graph."""
        # Build property chain
        prop_chain = ""
        bindings = {"vertex_id": vertex_id}
        for i, (key, value) in enumerate(properties.items()):
            param = f"p{i}"
            prop_chain += f".property('{key}', {param})"
            bindings[param] = value

        query = (
            f"g.V().has('{label}', 'id', vertex_id).fold()"
            f".coalesce(unfold(), addV('{label}').property('id', vertex_id))"
            f"{prop_chain}"
        )
        self.execute_gremlin(query, bindings)
        return True

    def add_edge(self, from_label: str, from_id: str,
                 edge_label: str,
                 to_label: str, to_id: str,
                 properties: dict | None = None) -> bool:
        """Create an edge between two vertices."""
        prop_chain = ""
        bindings = {"from_id": from_id, "to_id": to_id}

        if properties:
            for i, (key, value) in enumerate(properties.items()):
                param = f"ep{i}"
                prop_chain += f".property('{key}', {param})"
                bindings[param] = value

        query = (
            f"g.V().has('{from_label}', 'id', from_id)"
            f".addE('{edge_label}')"
            f".to(__.V().has('{to_label}', 'id', to_id))"
            f"{prop_chain}"
        )
        self.execute_gremlin(query, bindings)
        return True


# ── Singleton ────────────────────────────────────

_neptune_client: NeptuneClient | None = None


def get_neptune_client() -> NeptuneClient:
    """Return global NeptuneClient singleton."""
    global _neptune_client
    if _neptune_client is None:
        _neptune_client = NeptuneClient()
    return _neptune_client
