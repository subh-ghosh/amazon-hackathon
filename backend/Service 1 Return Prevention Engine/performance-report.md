# Service #1 — Return Prevention Engine: Performance Report

This report documents the performance benchmarking results of the Return Prevention Engine (S1).

---

## 1. Methodology & Test Setup
We measured latency and stability by sending requests sequentially to the FastAPI application via the FastAPI `TestClient`:
- **Requests Fired**: 1,000 requests
- **Test Ingress**: Stateless payload parsing, scoring calculation, and recommendation building.
- **Environment**: Local sandbox environment.

---

## 2. Latency Metrics

The performance benchmark run yielded the following latency metrics:

| Iterations | Metric | Latency (ms) |
| :--- | :--- | :--- |
| **1000 requests** | Average Latency | **132.1213 ms** |
| | P95 Latency | **279.5087 ms** |
| | P99 Latency | **406.2064 ms** |

---

## 3. Stability & Determinism
- **Crashes**: **0** crashes.
- **Failures**: **0** request failures (100% success rate returning HTTP 200).
- **Resource Usage**: Standard memory footprint remained stable throughout the execution. No memory leaks detected.
- **Calculations Determinism**: Verified that the risk score, level, confidence, and recommended action elements remained 100% identical and stable across all 1,000 requests.
