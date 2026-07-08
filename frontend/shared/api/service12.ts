export const SERVICE12_BASE_URL =
  process.env.NEXT_PUBLIC_SERVICE12_API_BASE ??
  "/api/proxy/s12";

const REQUEST_TIMEOUT_MS = 30000;
const INTELLIGENCE_ANALYTICS_BASE = "/api/v1/intelligence/analytics";

export type Service12Json = unknown;

async function request<T = Service12Json>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const url = `${SERVICE12_BASE_URL}${path}`;
    const method = init?.method ?? "GET";

    // Log removed for production demo
      url,
      method,
      body: init?.body ? safeParseBody(init.body) : undefined,
    });

    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      signal: controller.signal,
    });
    const responseBody = await parseResponseBody(response);

    // Log removed for production demo
      url,
      method,
      status: response.status,
      body: responseBody,
    });

    if (!response.ok) {
      throw new Error(
        `Service #12 request failed: ${response.status} ${summarizeBody(responseBody)}`,
      );
    }

    return responseBody as T;
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

function safeParseBody(body: BodyInit) {
  return typeof body === "string" ? tryJson(body) : "[non-string body]";
}

function tryJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function summarizeBody(body: unknown) {
  if (!body) {
    return "";
  }

  if (typeof body === "string") {
    return body.slice(0, 160);
  }

  return JSON.stringify(body).slice(0, 160);
}

export function getIntelligence() {
  return request("/api/v1/intelligence");
}

export function getCustomers() {
  return request("/api/v1/customers");
}

export function getProducts() {
  return request("/api/v1/products");
}

export function getReturns() {
  return request("/api/v1/returns");
}

export function getRecoveryActions() {
  return request("/api/v1/recovery-actions");
}

export function ingestFraudCase(fraudCase: unknown) {
  return request("/api/v1/fraud-cases/", {
    method: "POST",
    body: JSON.stringify(fraudCase),
  });
}

export function getTopReturnCauses(limit = 10) {
  return request(`${INTELLIGENCE_ANALYTICS_BASE}/top-return-causes?limit=${limit}`);
}

export function getFraudulentProducts(limit = 10) {
  return request(`${INTELLIGENCE_ANALYTICS_BASE}/fraudulent-products?limit=${limit}`);
}

export function getSellerReturnAnalysis(limit = 10) {
  return request(`${INTELLIGENCE_ANALYTICS_BASE}/seller-return-analysis?limit=${limit}`);
}

export function getRecoveryEffectiveness() {
  return request(`${INTELLIGENCE_ANALYTICS_BASE}/recovery-effectiveness`);
}

export function getGraphStats() {
  return request(`${INTELLIGENCE_ANALYTICS_BASE}/graph-stats`);
}

export function getSellerIntelligence(sellerId: string) {
  return request(`/api/v1/intelligence/sellers/${encodeURIComponent(sellerId)}`);
}

export function getProductIntelligence(productId: string) {
  return request(`/api/v1/intelligence/products/${encodeURIComponent(productId)}`);
}
