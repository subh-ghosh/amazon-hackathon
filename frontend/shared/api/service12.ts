export const SERVICE12_BASE_URL =
  process.env.NEXT_PUBLIC_SERVICE12_API_BASE ??
  "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com";

const INTELLIGENCE_BASE = "/api/v1/intelligence";
const REQUEST_TIMEOUT_MS = 30000;

export type Service12Json = unknown;

async function request<T = Service12Json>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${SERVICE12_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Service #12 request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Service #12 timed out. Check that the backend ELB is healthy and reachable.",
      );
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function getTopReturnCauses(limit = 10) {
  return request(
    `${INTELLIGENCE_BASE}/analytics/top-return-causes?limit=${limit}`,
  );
}

export function getFraudulentProducts(limit = 10) {
  return request(
    `${INTELLIGENCE_BASE}/analytics/fraudulent-products?limit=${limit}`,
  );
}

export function getSellerReturnAnalysis(limit = 10) {
  return request(
    `${INTELLIGENCE_BASE}/analytics/seller-return-analysis?limit=${limit}`,
  );
}

export function getRecoveryEffectiveness() {
  return request(`${INTELLIGENCE_BASE}/analytics/recovery-effectiveness`);
}

export function getGraphStats() {
  return request(`${INTELLIGENCE_BASE}/analytics/graph-stats`);
}

export function getSellerIntelligence(sellerId: string) {
  return request(`${INTELLIGENCE_BASE}/sellers/${encodeURIComponent(sellerId)}`);
}
