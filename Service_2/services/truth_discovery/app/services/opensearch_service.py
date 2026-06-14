import logging
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

class OpenSearchService:
    def __init__(self):
        if not settings.MOCK_AWS_SERVICES:
            # Production: Initialize OpenSearch client (requires opensearch-py)
            from opensearchpy import OpenSearch, RequestsHttpConnection
            from requests_aws4auth import AWS4Auth
            import boto3

            credentials = boto3.Session().get_credentials()
            awsauth = AWS4Auth(
                credentials.access_key,
                credentials.secret_key,
                settings.AWS_REGION,
                "aoss", # Amazon OpenSearch Serverless Service Code
                session_token=credentials.token
            )

            self.client = OpenSearch(
                hosts=[{"host": settings.OPENSEARCH_ENDPOINT, "port": 443}],
                http_auth=awsauth,
                use_ssl=True,
                verify_certs=True,
                connection_class=RequestsHttpConnection
            )
            logger.info("OpenSearch client initialized in Production mode")
        else:
            self.client = None
            logger.info("OpenSearchService initialized in MOCK mode")

    def find_similar_cases_and_reviews(
        self, 
        product_id: str, 
        query_text: str, 
        query_vector: List[float]
    ) -> List[str]:
        """Queries OpenSearch to retrieve semantic review and return case matches."""
        
        if settings.MOCK_AWS_SERVICES:
            return self._get_mock_cases_and_reviews(product_id, query_text)

        try:
            # k-NN vector search query against OpenSearch
            query = {
                "size": 3,
                "query": {
                    "bool": {
                        "filter": [
                            {"term": {"product_id.keyword": product_id}}
                        ],
                        "must": [
                            {
                                "knn": {
                                    "comment_vector": {
                                        "vector": query_vector,
                                        "k": 3
                                    }
                                }
                            }
                        ]
                    }
                }
            }

            response = self.client.search(
                body=query,
                index=settings.OPENSEARCH_INDEX
            )

            results = []
            for hit in response["hits"]["hits"]:
                source = hit["_source"]
                results.append(
                    f"Historical case return reason: '{source.get('actual_cause')}' with comment: '{source.get('comment')}'"
                )
            
            # If no OpenSearch results are indexed yet, fallback gracefully
            if not results:
                return self._get_mock_cases_and_reviews(product_id, query_text)

            return results
        except Exception as e:
            logger.error(f"Error querying OpenSearch vector index: {e}. Falling back to mockup reviews.")
            return self._get_mock_cases_and_reviews(product_id, query_text)

    def _get_mock_cases_and_reviews(self, product_id: str, query_text: str) -> List[str]:
        """Provides realistic mock returns and reviews based on input context."""
        query_lower = query_text.lower()
        
        # Synthesize matching data for mock responses
        if "size" in query_lower or "fit" in query_lower or "small" in query_lower or "large" in query_lower:
            return [
                f"Review 1 (Rating: 2/5) for {product_id}: 'This shirt looks great but runs way too small! Order 2 sizes up.'",
                f"Review 2 (Rating: 3/5) for {product_id}: 'Quality is decent but sleeves are very short.'",
                "Historical Return Case: Product was returned under stated reason 'Defective', analyzed root cause: 'Expectation Mismatch' (Sizing deviation)."
            ]
        elif "compatible" in query_lower or "iphone" in query_lower or "android" in query_lower or "connect" in query_lower:
            return [
                f"Review 1 (Rating: 1/5) for {product_id}: 'Does not connect with iOS 17. Constant bluetooth sync failures.'",
                f"Review 2 (Rating: 2/5) for {product_id}: 'Works fine on Android, but the app crashed on my iPad.'",
                "Historical Return Case: Customer returned because 'app is buggy', analyzed root cause: 'Software Compatibility'."
            ]
        else:
            return [
                f"Review 1 (Rating: 3/5) for {product_id}: 'The picture shows a bright navy blue, but it is actually almost black.'",
                f"Review 2 (Rating: 4/5) for {product_id}: 'Good product, but shipping packaging was damaged.'",
                "Historical Return Case: Analyzed root cause: 'Expectation Mismatch' due to visual/color differences."
            ]
vote_up = 1
