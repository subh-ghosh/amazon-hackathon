import { circularDemoProduct } from "../demo/circular-demo-data";

const REQUEST_TIMEOUT_MS = 30000;

const SERVICE3_PROXY_PATH = "/api/proxy/s3/api/v1/fraud/score";
const SERVICE5_PROXY_PATH = "/api/proxy/s5/api/v1/simulation/run";
const SERVICE6_PROXY_PATH = "/api/proxy/s6/api/v1/recovery/optimize";
const SERVICE7_PROXY_PATH = "/api/proxy/s7/api/v1/logistics/optimize";
const SERVICE2_PROXY_PATH = "/api/proxy/s2/api/v1/truth/analyze";

export interface ProductDetailsPayload {
  productId: string;
  category: string;
  condition: string;
  originalPrice: number;
  returnReason: string;
  daysSincePurchase: number;
}

interface SimulationRequest {
  returnId: string;
  productId: string;
  category: string;
  conditionScore: number;
  utilityScore: number;
  fraudScore: number;
  estimatedValue: number;
  returnReason: string;
  sellerTrustScore: number;
}

interface FraudScoreRequest {
  customer_id: string;
  product_id: string;
  return_id: string;
  device_id: string;
  payment_method_hash: string;
  images?: string[];
}

interface OptimizeRequest {
  returnId: string;
  productId: string;
  fraudScore: number;
  sellerTrustScore: number;
  simulations: Array<{
    scenario: string;
    recoveryValue: number;
    carbonImpact: number;
    processingTimeDays: number;
    confidence: number;
  }>;
}

interface LogisticsRequest {
  returnId: string;
  productId: string;
  recommendedDecision: string;
  customerLocation: string;
  conditionScore: number;
  estimatedValue: number;
  warehouses: Array<{
    warehouseId: string;
    city: string;
    capacity: number;
    distanceKm: number;
  }>;
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

export interface FraudTrustAssessment {
  fraudScore: number;
  trustScore: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  signals: string[];
}

export interface TruthDiscoveryResult {
  rootCause: string;
  confidence: number;
  signals: string[];
}

export interface DemoAwarePayload<T = unknown> {
  data: T;
  demoMode: boolean;
  source: string;
  message?: string;
}

async function postJson<T>(
  baseUrl: string,
  path: string,
  body: unknown,
  serviceName: string,
  logLabel: "S2" | "S3" | "S5" | "S6" | "S7",
  fallback: T,
  options: { allowFallback?: boolean } = {},
): Promise<DemoAwarePayload<T>> {
  const allowFallback = options.allowFallback ?? true;

  if (isDemoModeForced() && allowFallback) {
    return {
      data: fallback,
      demoMode: true,
      source: `${logLabel} fallback`,
      message: `${serviceName} skipped because DEMO_MODE is enabled.`,
    };
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const url = `${baseUrl}${path}`;
    const method = "POST";
    const serializedBody = JSON.stringify(body);

    console.log(`${logLabel} request`, body);
    console.log("[RecoveryWorkflow API] request", {
      service: serviceName,
      url,
      method,
      contentType: "application/json",
      body,
    });

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: serializedBody,
      signal: controller.signal,
    });
    const responseBody = await parseResponseBody(response);

    console.log(`${logLabel} response`, responseBody);
    console.log("[RecoveryWorkflow API] response", {
      service: serviceName,
      url,
      method,
      status: response.status,
      body: responseBody,
    });

    if (!response.ok) {
      throw new Error(buildResponseErrorMessage(serviceName, response, responseBody));
    }

    return {
      data: responseBody as T,
      demoMode: false,
      source: `${logLabel} live`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!allowFallback) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      return {
        data: fallback,
        demoMode: true,
        source: `${logLabel} fallback`,
        message: `${serviceName} timed out. Using demo fallback data.`,
      };
    }

    if (error instanceof TypeError) {
      console.error("[RecoveryWorkflow API] fetch failed before receiving a response", {
        service: serviceName,
        url: `${baseUrl}${path}`,
        method: "POST",
        contentType: "application/json",
        body,
        error: error.message,
      });

      return {
        data: fallback,
        demoMode: true,
        source: `${logLabel} fallback`,
        message:
          `${serviceName} could not be reached from the browser. ` +
          `Using demo fallback data. Browser error: ${error.message}`,
      };
    }

    return {
      data: fallback,
      demoMode: true,
      source: `${logLabel} fallback`,
      message: `${message} Using demo fallback data.`,
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function runFraudTrust(product: ProductDetailsPayload) {
  return postJson<unknown>(
    "",
    SERVICE3_PROXY_PATH,
    toFraudScoreRequest(product),
    "Service #3 Fraud & Trust Engine",
    "S3",
    fallbackFraudTrustPayload(product),
    { allowFallback: false },
  );
}

export function runFutureSimulator(product: ProductDetailsPayload) {
  return postJson<unknown>(
    "",
    SERVICE5_PROXY_PATH,
    toSimulationRequest(product),
    "Service #5 Future Simulator",
    "S5",
    fallbackSimulationPayload(product),
  );
}

export function runRecoveryOptimizer(
  product: ProductDetailsPayload,
  scenarios: SimulationScenario[],
) {
  return postJson<unknown>(
    "",
    SERVICE6_PROXY_PATH,
    toOptimizeRequest(product, scenarios),
    "Service #6 Recovery Optimizer",
    "S6",
    fallbackOptimizerPayload(product, scenarios),
  );
}

export function runReverseLogistics(
  product: ProductDetailsPayload,
  decision: OptimizedDecision,
) {
  return postJson<unknown>(
    "",
    SERVICE7_PROXY_PATH,
    toLogisticsRequest(product, decision),
    "Service #7 Reverse Logistics",
    "S7",
    fallbackLogisticsPayload(product, decision),
  );
}

export function discoverTruth(product: ProductDetailsPayload) {
  return postJson<unknown>(
    "",
    SERVICE2_PROXY_PATH,
    toTruthDiscoveryRequest(product),
    "Service #2 Truth Discovery",
    "S2",
    fallbackTruthDiscoveryPayload(product),
  );
}

export function adaptSimulationScenarios(payload: unknown): SimulationScenario[] {
  const rows = asArray(payload, ["scenarios", "simulation_scenarios", "simulations", "results"]);

  return rows.map((row, index) => ({
    id: stringFrom(row, ["id", "scenario_id"], `SC-${index + 1}`),
    name: stringFrom(row, ["name", "scenario", "path"], `Scenario ${index + 1}`),
    recoveryValue: numberFrom(row, ["recoveryValue", "recovery_value", "value"]),
    carbonSavedKg: numberFrom(row, ["carbonSavedKg", "carbon_saved_kg", "carbonImpact", "carbon"]),
    successProbability: normalizePercent(
      numberFrom(row, ["successProbability", "success_probability", "confidence", "probability"], 0),
    ),
    timeframeDays: numberFrom(row, ["timeframeDays", "timeframe_days", "processingTimeDays", "days"], 0),
  }));
}

export function adaptOptimizedDecision(payload: unknown): OptimizedDecision {
  const record = asRecord(payload);

  return {
    decision: normalizeDecision(stringFrom(record, ["decision", "recommendedDecision", "recommended_decision", "path"], "Refurbish")),
    confidence: normalizePercent(numberFrom(record, ["confidence", "score", "probability"], 0)),
    expectedValue: numberFrom(record, ["expectedValue", "expected_value", "expectedProfit", "value"], 0),
    reason: stringFrom(record, ["reason", "rationale", "explanation"], arrayReason(record.reasoning)),
  };
}

export function adaptLogisticsPlan(payload: unknown): LogisticsPlan {
  const record = asRecord(payload);

  return {
    warehouse: stringFrom(record, ["warehouse", "recommendedWarehouse", "facility", "destination"], "BLR Reverse Logistics Center 04"),
    route: stringFrom(record, ["route", "recommendedRoute", "route_summary", "path"], "Customer pickup -> sort center -> recovery facility"),
    cost: numberFrom(record, ["cost", "estimatedCost", "estimated_cost", "logisticsCost"], 14.75),
    eta: stringFrom(record, ["eta", "estimated_arrival", "delivery_eta"], `${numberFrom(record, ["estimatedDays"], 2)} days`),
  };
}

export function adaptFraudTrust(payload: unknown): FraudTrustAssessment {
  const record = asRecord(payload);
  const nested = asRecord(record.data ?? record.result ?? record.score ?? record);
  const fraudScore = normalizePercent(
    numberFrom(nested, ["fraudScore", "fraud_score", "riskScore", "risk_score", "score"], 12),
  );

  return {
    fraudScore,
    trustScore: normalizePercent(
      numberFrom(nested, ["trustScore", "trust_score", "sellerTrustScore", "seller_trust_score"], 92),
    ),
    severity: severityFromScore(fraudScore, stringFrom(nested, ["severity", "risk_level"], "")),
    signals: stringArrayFrom(nested, ["signals", "reasons", "explanations", "risk_factors"], [
      "Return history normal",
      "Customer and product signals verified",
    ]),
  };
}

export function adaptTruthDiscovery(payload: unknown): TruthDiscoveryResult {
  const record = asRecord(payload);
  const nested = asRecord(record.data ?? record.result ?? record);

  return {
    rootCause: stringFrom(
      nested,
      ["rootCause", "root_cause", "cause", "category"],
      "Changed mind return",
    ),
    confidence: normalizePercent(numberFrom(nested, ["confidence", "score"], 84)),
    signals: stringArrayFrom(nested, ["signals", "evidence", "reasons"], [
      "Inspection data ready for S2 integration",
    ]),
  };
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

function buildResponseErrorMessage(
  serviceName: string,
  response: Response,
  responseBody: unknown,
) {
  const details = formatErrorDetails(responseBody);

  return [
    `${serviceName} failed: ${response.status} ${response.statusText}`.trim(),
    details ? `Backend error: ${details}` : "Backend returned no response body.",
  ].join(". ");
}

function formatErrorDetails(body: unknown) {
  if (!body) {
    return "";
  }

  if (typeof body === "string") {
    return body;
  }

  const record = asRecord(body);
  const detail = record.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const detailRecord = asRecord(item);
        const loc = Array.isArray(detailRecord.loc)
          ? detailRecord.loc.join(".")
          : "body";
        const msg =
          typeof detailRecord.msg === "string"
            ? detailRecord.msg
            : JSON.stringify(detailRecord);

        return `${loc}: ${msg}`;
      })
      .join("; ");
  }

  return JSON.stringify(body);
}

function toSimulationRequest(product: ProductDetailsPayload): SimulationRequest {
  return {
    returnId: returnIdFromProduct(product.productId),
    productId: product.productId,
    category: product.category,
    conditionScore: conditionScore(product.condition),
    utilityScore: utilityScore(product.condition),
    fraudScore: fraudScore(product.returnReason),
    estimatedValue: estimatedValue(product),
    returnReason: normalizeReturnReason(product.returnReason),
    sellerTrustScore: 0.92,
  };
}

function toFraudScoreRequest(product: ProductDetailsPayload): FraudScoreRequest {
  return {
    customer_id: "CUST-DEMO-PLACEHOLDER-1042",
    product_id: product.productId,
    return_id: returnIdFromProduct(product.productId),
    device_id: "DEVICE-DEMO-PLACEHOLDER-BLR-01",
    payment_method_hash: "PMT_DEMO_PLACEHOLDER_9F86D081884C",
    images: [],
  };
}

function toOptimizeRequest(
  product: ProductDetailsPayload,
  scenarios: SimulationScenario[],
): OptimizeRequest {
  return {
    returnId: returnIdFromProduct(product.productId),
    productId: product.productId,
    fraudScore: fraudScore(product.returnReason),
    sellerTrustScore: 0.92,
    simulations: scenarios.map((scenario) => ({
      scenario: scenario.name,
      recoveryValue: scenario.recoveryValue,
      carbonImpact: scenario.carbonSavedKg,
      processingTimeDays: scenario.timeframeDays,
      confidence: ratioFromPercent(scenario.successProbability),
    })),
  };
}

function toLogisticsRequest(
  product: ProductDetailsPayload,
  decision: OptimizedDecision,
): LogisticsRequest {
  return {
    returnId: returnIdFromProduct(product.productId),
    productId: product.productId,
    recommendedDecision: decision.decision.toUpperCase(),
    customerLocation: "Bengaluru, KA",
    conditionScore: conditionScore(product.condition),
    estimatedValue: decision.expectedValue || estimatedValue(product),
    warehouses: [
      { warehouseId: "WH-BLR-04", city: "Bengaluru", capacity: 82, distanceKm: 18 },
      { warehouseId: "WH-HYD-02", city: "Hyderabad", capacity: 64, distanceKm: 575 },
      { warehouseId: "WH-MAA-01", city: "Chennai", capacity: 71, distanceKm: 346 },
    ],
  };
}

function returnIdFromProduct(productId: string) {
  return `RET-${productId}`;
}

function estimatedValue(product: ProductDetailsPayload) {
  const conditionMultiplier = conditionScore(product.condition) / 100;

  return Number((product.originalPrice * conditionMultiplier).toFixed(2));
}

function conditionScore(condition: string) {
  const normalized = condition.toLowerCase();

  if (normalized.includes("excellent")) return 94;
  if (normalized.includes("good")) return 82;
  if (normalized.includes("fair")) return 62;
  if (normalized.includes("repair")) return 38;
  return 72;
}

function utilityScore(condition: string) {
  return Math.min(100, conditionScore(condition) + 6);
}

function fraudScore(returnReason: string) {
  const normalized = returnReason.toLowerCase();

  if (normalized.includes("fraud")) return 85;
  if (normalized.includes("wrong") || normalized.includes("not as described")) return 35;
  return 12;
}

function normalizeReturnReason(reason: string) {
  const normalized = reason.toLowerCase();

  if (normalized.includes("defect")) return "DEFECTIVE";
  if (normalized.includes("wrong")) return "WRONG_ITEM";
  if (normalized.includes("size")) return "SIZE_MISMATCH";
  if (normalized.includes("description") || normalized.includes("described")) return "DESCRIPTION_MISMATCH";
  if (normalized.includes("damage")) return "DAMAGED_IN_TRANSIT";
  if (normalized.includes("fraud")) return "FRAUDULENT";
  if (normalized.includes("mind")) return "CHANGED_MIND";
  return "OTHER";
}

function toTruthDiscoveryRequest(product: ProductDetailsPayload) {
  return {
    return_id: returnIdFromProduct(product.productId),
    product_id: product.productId,
    category: product.category,
    return_reason: normalizeReturnReason(product.returnReason),
    condition: product.condition,
  };
}

function fallbackFraudTrustPayload(product: ProductDetailsPayload) {
  const score =
    product.productId === circularDemoProduct.productId
      ? circularDemoProduct.fraudScorePercent
      : fraudScore(product.returnReason);

  return {
    fraudScore: score,
    trustScore: 92,
    severity: score >= 70 ? "High" : score >= 35 ? "Medium" : "Low",
    signals: [
      "Customer return cadence within normal range",
      "Product serial and category history verified",
      "No linked fraud case in demo graph",
    ],
  };
}

function fallbackSimulationPayload(product: ProductDetailsPayload) {
  const value = estimatedValue(product);
  const p123 = product.productId === circularDemoProduct.productId;

  return {
    scenarios: [
      {
        id: "SIM-RESALE",
        scenario: "Resell",
        recoveryValue: p123 ? 162 : Number((value * 0.91).toFixed(2)),
        carbonImpact: 11.8,
        processingTimeDays: 2,
        confidence: p123 ? 0.84 : 0.93,
      },
      {
        id: "SIM-REFURBISH",
        scenario: "Refurbish",
        recoveryValue: p123 ? circularDemoProduct.recoveredValue : Number((value * 0.78).toFixed(2)),
        carbonImpact: p123 ? circularDemoProduct.carbonAvoidedKg : 15.4,
        processingTimeDays: 5,
        confidence: p123 ? 0.91 : 0.88,
      },
      {
        id: "SIM-DONATE",
        scenario: "Donate",
        recoveryValue: Number((value * 0.34).toFixed(2)),
        carbonImpact: 9.6,
        processingTimeDays: 3,
        confidence: 0.81,
      },
    ],
  };
}

function fallbackOptimizerPayload(
  product: ProductDetailsPayload,
  scenarios: SimulationScenario[],
) {
  const best =
    [...scenarios].sort((first, second) => second.recoveryValue - first.recoveryValue)[0] ??
    adaptSimulationScenarios(fallbackSimulationPayload(product))[0];

  return {
    decision: best.name,
    confidence: best.successProbability,
    expectedValue: best.recoveryValue,
    reason:
      "Demo optimizer selected the path with the strongest recovered value, confidence, and circular impact.",
  };
}

function fallbackLogisticsPayload(
  _product: ProductDetailsPayload,
  decision: OptimizedDecision,
) {
  return {
    warehouse: "BLR Reverse Logistics Center 04",
    route: `Customer pickup -> Bengaluru sort center -> ${circularDemoProduct.warehouseId} ${decision.decision} lane`,
    estimatedCost: 14.75,
    eta: "2 days",
  };
}

function fallbackTruthDiscoveryPayload(product: ProductDetailsPayload) {
  return {
    rootCause: normalizeReturnReason(product.returnReason).replace(/_/g, " "),
    confidence: 0.84,
    signals: [
      "S2 endpoint not listed in API_DIRECTORY.md",
      "Payload is ready for deployment-time wiring",
    ],
  };
}

function ratioFromPercent(value: number) {
  return value > 1 ? Number((value / 100).toFixed(4)) : value;
}

function normalizePercent(value: number) {
  return value <= 1 ? Number((value * 100).toFixed(1)) : value;
}

function isDemoModeForced() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

function arrayReason(value: unknown) {
  return Array.isArray(value) && value.length > 0
    ? value.filter((item): item is string => typeof item === "string").join(" ")
    : "Optimizer selected the highest expected circular value.";
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

function stringArrayFrom(record: AnyRecord, keys: string[], fallback: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      const strings = value.filter((item): item is string => {
        return typeof item === "string" && item.trim().length > 0;
      });

      if (strings.length > 0) {
        return strings;
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

function severityFromScore(
  score: number,
  rawSeverity: string,
): FraudTrustAssessment["severity"] {
  const normalized = rawSeverity.toUpperCase();

  if (normalized.includes("CRITICAL") || score >= 85) return "Critical";
  if (normalized.includes("HIGH") || score >= 65) return "High";
  if (normalized.includes("MEDIUM") || score >= 35) return "Medium";
  return "Low";
}
