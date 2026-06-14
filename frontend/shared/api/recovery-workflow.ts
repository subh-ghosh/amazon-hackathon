const REQUEST_TIMEOUT_MS = 30000;

const SERVICE5_BASE_URL = process.env.NEXT_PUBLIC_SERVICE5_API_BASE;
const SERVICE6_BASE_URL = process.env.NEXT_PUBLIC_SERVICE6_API_BASE;
const SERVICE7_BASE_URL = process.env.NEXT_PUBLIC_SERVICE7_API_BASE;

export interface ProductDetailsPayload {
  productId: string;
  category: string;
  condition: string;
  originalPrice: number;
  returnReason: string;
  daysSincePurchase: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  recoveryValue: number;
  carbonSavedKg: number;
  successProbability: number;
  timeframeDays: number;
}

export interface OptimizedDecision {
  decision: "Resell" | "Refurbish" | "Repair" | "Donate" | "Recycle";
  confidence: number;
  expectedValue: number;
  reason: string;
}

export interface LogisticsPlan {
  warehouse: string;
  route: string;
  cost: number;
  eta: string;
}

async function postJson<T>(
  baseUrl: string | undefined,
  path: string,
  body: unknown,
  serviceName: string,
): Promise<T> {
  if (!baseUrl) {
    throw new Error(`${serviceName} base URL is not documented/configured.`);
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${serviceName} request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${serviceName} timed out.`);
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function runFutureSimulator(product: ProductDetailsPayload) {
  return postJson<unknown>(
    SERVICE5_BASE_URL,
    "/api/v1/simulate",
    product,
    "Service #5 Future Simulator",
  );
}

export function runRecoveryOptimizer(
  product: ProductDetailsPayload,
  scenarios: SimulationScenario[],
) {
  return postJson<unknown>(
    SERVICE6_BASE_URL,
    "/api/v1/optimize",
    { product, scenarios },
    "Service #6 Recovery Optimizer",
  );
}

export function runReverseLogistics(
  product: ProductDetailsPayload,
  decision: OptimizedDecision,
) {
  return postJson<unknown>(
    SERVICE7_BASE_URL,
    "/api/v1/logistics",
    { product, decision },
    "Service #7 Reverse Logistics",
  );
}

export function adaptSimulationScenarios(payload: unknown): SimulationScenario[] {
  const rows = asArray(payload, ["scenarios", "simulation_scenarios", "results"]);

  return rows.map((row, index) => ({
    id: stringFrom(row, ["id", "scenario_id"], `SC-${index + 1}`),
    name: stringFrom(row, ["name", "scenario", "path"], `Scenario ${index + 1}`),
    recoveryValue: numberFrom(row, ["recoveryValue", "recovery_value", "value"]),
    carbonSavedKg: numberFrom(row, ["carbonSavedKg", "carbon_saved_kg", "carbon"]),
    successProbability: numberFrom(row, ["successProbability", "success_probability", "probability"], 0),
    timeframeDays: numberFrom(row, ["timeframeDays", "timeframe_days", "days"], 0),
  }));
}

export function adaptOptimizedDecision(payload: unknown): OptimizedDecision {
  const record = asRecord(payload);

  return {
    decision: normalizeDecision(stringFrom(record, ["decision", "recommended_decision", "path"], "Refurbish")),
    confidence: numberFrom(record, ["confidence", "score", "probability"], 0),
    expectedValue: numberFrom(record, ["expectedValue", "expected_value", "value"], 0),
    reason: stringFrom(record, ["reason", "rationale", "explanation"], "Optimizer selected the highest expected circular value."),
  };
}

export function adaptLogisticsPlan(payload: unknown): LogisticsPlan {
  const record = asRecord(payload);

  return {
    warehouse: stringFrom(record, ["warehouse", "facility", "destination"], "BLR Reverse Logistics Center 04"),
    route: stringFrom(record, ["route", "route_summary", "path"], "Customer pickup -> sort center -> recovery facility"),
    cost: numberFrom(record, ["cost", "estimated_cost", "logisticsCost"], 14.75),
    eta: stringFrom(record, ["eta", "estimated_arrival", "delivery_eta"], "48 hours"),
  };
}

export function mockScenarios(product: ProductDetailsPayload): SimulationScenario[] {
  const baseValue = Math.max(product.originalPrice * 0.18, 20);

  return [
    {
      id: "MOCK-RESALE",
      name: "Direct resale",
      recoveryValue: Math.round(baseValue * 2.4),
      carbonSavedKg: 7.8,
      successProbability: 82,
      timeframeDays: 4,
    },
    {
      id: "MOCK-REFURBISH",
      name: "Light refurbishment",
      recoveryValue: Math.round(baseValue * 2.9),
      carbonSavedKg: 10.6,
      successProbability: 76,
      timeframeDays: 9,
    },
    {
      id: "MOCK-RECYCLE",
      name: "Parts recovery",
      recoveryValue: Math.round(baseValue * 0.9),
      carbonSavedKg: 4.2,
      successProbability: 95,
      timeframeDays: 3,
    },
  ];
}

export function mockDecision(scenarios: SimulationScenario[]): OptimizedDecision {
  const best = [...scenarios].sort(
    (a, b) => b.recoveryValue * b.successProbability - a.recoveryValue * a.successProbability,
  )[0];

  return {
    decision: best?.name.toLowerCase().includes("refurbish") ? "Refurbish" : "Resell",
    confidence: best?.successProbability ?? 80,
    expectedValue: best?.recoveryValue ?? 85,
    reason: `${best?.name ?? "Recovery"} maximizes expected value while preserving product utility.`,
  };
}

export function mockLogistics(): LogisticsPlan {
  return {
    warehouse: "BLR Reverse Logistics Center 04",
    route: "Customer pickup -> Bengaluru sort center -> recovery bench A",
    cost: 13.9,
    eta: "2 days",
  };
}

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

function asArray(payload: unknown, keys: string[]): AnyRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
  }

  const record = asRecord(payload);

  for (const key of ["data", ...keys]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
    }
  }

  return [];
}

function stringFrom(record: AnyRecord, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function numberFrom(record: AnyRecord, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[$,%]/g, ""));

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function normalizeDecision(value: string): OptimizedDecision["decision"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("REPAIR")) return "Repair";
  if (normalized.includes("DONATE")) return "Donate";
  if (normalized.includes("RECYCLE")) return "Recycle";
  if (normalized.includes("RESELL")) return "Resell";
  return "Refurbish";
}
