import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

payload = {
    "customerId": "C123",
    "productId": "P456",
    "category": "Electronics",
    "productRating": 4.2,
    "customerReturnRate": 0.35,
    "customerPurchaseCount": 22,
    "productReturnRate": 0.18,
    "sellerRating": 4.7,
    "price": 15000.0
}

def run_benchmark(iterations: int):
    latencies = []
    
    # Warmup
    for _ in range(5):
        client.post("/api/v1/prevention/analyze", json=payload)
        
    for _ in range(iterations):
        start_time = time.perf_counter()
        response = client.post("/api/v1/prevention/analyze", json=payload)
        end_time = time.perf_counter()
        
        assert response.status_code == 200
        latencies.append((end_time - start_time) * 1000.0) # in ms
        
    sorted_latencies = sorted(latencies)
    avg_latency = sum(latencies) / len(latencies)
    
    # Percentile indices
    p95_idx = min(len(sorted_latencies) - 1, int(len(sorted_latencies) * 0.95))
    p99_idx = min(len(sorted_latencies) - 1, int(len(sorted_latencies) * 0.99))
    
    p95_latency = sorted_latencies[p95_idx]
    p99_latency = sorted_latencies[p99_idx]
    
    print(f"\nBenchmark Results for {iterations} requests:")
    print(f"  Average Latency: {avg_latency:.4f} ms")
    print(f"  P95 Latency:     {p95_latency:.4f} ms")
    print(f"  P99 Latency:     {p99_latency:.4f} ms")
    return avg_latency, p95_latency, p99_latency

if __name__ == "__main__":
    print("Starting Return Prevention Engine Performance Benchmarking (Pure Python)...")
    run_benchmark(100)
    run_benchmark(500)
    run_benchmark(1000)
    print("Benchmarking completed successfully.")
