import type { ProductDigitalTwin } from "@/types/product-twin";
import { circularDemoProduct } from "../../shared/demo/circular-demo-data";
import { getProductIntelligence } from "../../shared/api/service12";

export const productTwins: ProductDigitalTwin[] = [
  {
    productId: "P123",
    conditionScore: 82,
    utilityScore: 88,
    returnCount: circularDemoProduct.returnCount,
    fraudFlags: [
      `Fraud score: ${circularDemoProduct.fraudScore}`,
      "Repeat return pattern detected",
      "Verified serial number",
    ],
    currentRecoveryDecision: "Refurbish",
    product: {
      name: "Echo Show 10",
      category: "Smart Home",
      brand: "Amazon",
      model: "3rd Generation",
      serialNumber: "G090LF1172840X2Q",
      purchaseDate: "2025-01-18",
      warrantyExpires: "2027-01-18",
      currentOwner: "Aarav Mehta",
      condition: "Good",
    },
    repairHistory: [
      {
        id: "REP-1042",
        date: "2025-08-12",
        service: "Display calibration",
        provider: "Amazon Authorized Service",
        partsReplaced: [],
        cost: 0,
        status: "Completed",
      },
      {
        id: "REP-1188",
        date: "2026-02-03",
        service: "Power adapter replacement",
        provider: "Amazon ReLife Center",
        partsReplaced: ["30W power adapter"],
        cost: 24.99,
        status: "Completed",
      },
    ],
    recoveryHistory: [
      {
        id: "REC-0319",
        date: "2025-07-28",
        channel: "Return",
        outcome: "Inspected and returned to customer",
        valueRecovered: 219,
        carbonAvoidedKg: 8.4,
      },
      {
        id: "REC-P123-REFURBISH",
        date: "2026-04-22",
        channel: "Refurbishment",
        outcome: `${circularDemoProduct.recoveryDecision} through ${circularDemoProduct.warehouseId}`,
        valueRecovered: circularDemoProduct.recoveredValue,
        carbonAvoidedKg: circularDemoProduct.carbonAvoidedKg,
      },
    ],
  },
];

export function getProductTwin(productId: string) {
  return productTwins.find((twin) => twin.productId === productId) ?? getMockProductTwin(productId);
}

export async function getProductTwinFromService12(productId: string) {
  const fallback = getProductTwin(productId);

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return fallback;
  }

  try {
    const product = await getProductIntelligence(productId);

    if (!product) {
      return fallback;
    }

    return adaptLiveTwin(productId, asRecord(product), [], fallback);
  } catch {
    return fallback;
  }
}

function getMockProductTwin(productId: string): ProductDigitalTwin {
  return {
    productId,
    conditionScore: 78,
    utilityScore: 82,
    returnCount: circularDemoProduct.returnCount,
    fraudFlags: [
      `Fraud score: ${circularDemoProduct.fraudScore}`,
      "Demo Mode fallback",
    ],
    currentRecoveryDecision: "Refurbish",
    product: {
      name: "Unknown Product Twin",
      category: "Marketplace",
      brand: "Amazon",
      model: "Mock profile",
      serialNumber: `SN-${productId}`,
      purchaseDate: "2025-11-03",
      warrantyExpires: "2027-11-03",
      currentOwner: "Customer",
      condition: "Good",
    },
    repairHistory: [
      {
        id: "REP-MOCK-1",
        date: "2026-03-14",
        service: "Functional inspection",
        provider: "Amazon ReLife Center",
        partsReplaced: [],
        cost: 0,
        status: "Completed",
      },
    ],
    recoveryHistory: [
      {
        id: "REC-MOCK-1",
        date: "2026-04-22",
        channel: "Return",
        outcome: "Mock recovery record generated while backend is unavailable",
        valueRecovered: circularDemoProduct.recoveredValue,
        carbonAvoidedKg: circularDemoProduct.carbonAvoidedKg,
      },
    ],
  };
}

type AnyRecord = Record<string, unknown>;

function adaptLiveTwin(
  productId: string,
  product: AnyRecord,
  recoveryActions: AnyRecord[],
  fallback: ProductDigitalTwin,
): ProductDigitalTwin {
  const latestRecovery = recoveryActions[0];

  return {
    ...fallback,
    productId,
    conditionScore: numberFrom(product, ["condition_score", "conditionScore", "score"], fallback.conditionScore),
    utilityScore: numberFrom(product, ["utility_score", "utilityScore"], fallback.utilityScore),
    returnCount: numberFrom(product, ["return_count", "returnCount", "returns", "total_returns"], fallback.returnCount),
    fraudFlags: fraudFlagsFromProduct(product),
    currentRecoveryDecision: normalizeDecision(
      stringFrom(
        latestRecovery ?? product,
        ["decision", "recommended_decision", "action_type", "recovery_action", "action"],
        fallback.currentRecoveryDecision,
      ),
    ),
    product: {
      ...fallback.product,
      name: stringFrom(product, ["product_name", "productName", "title", "name"], fallback.product.name),
      category: stringFrom(product, ["category", "product_category"], fallback.product.category),
      brand: stringFrom(product, ["brand"], fallback.product.brand),
      model: stringFrom(product, ["model", "model_number"], fallback.product.model),
      serialNumber: stringFrom(product, ["serial_number", "serialNumber", "serial"], fallback.product.serialNumber),
      purchaseDate: stringFrom(product, ["purchase_date", "purchaseDate"], fallback.product.purchaseDate),
      warrantyExpires: stringFrom(product, ["warranty_expires", "warrantyExpires"], fallback.product.warrantyExpires),
      currentOwner: stringFrom(product, ["customer_name", "currentOwner", "owner"], fallback.product.currentOwner),
      condition: normalizeCondition(stringFrom(product, ["condition"], fallback.product.condition)),
    },
    recoveryHistory: recoveryActions.length > 0
      ? recoveryActions.map((action, index) => ({
          id: stringFrom(action, ["id", "action_id", "recovery_id"], `REC-LIVE-${index + 1}`),
          date: stringFrom(action, ["date", "created_at", "timestamp"], "Live"),
          channel: normalizeChannel(stringFrom(action, ["channel", "action_type", "recovery_action", "action"], "Refurbishment")),
          outcome: stringFrom(action, ["outcome", "result", "status", "decision"], "Live recovery action from Service #12"),
          valueRecovered: numberFrom(action, ["value_recovered", "recovered_value", "estimated_value_recovered", "value"]),
          carbonAvoidedKg: numberFrom(action, ["carbon_avoided_kg", "carbonAvoidedKg", "carbon_saved_kg"]),
        }))
      : fallback.recoveryHistory,
  };
}

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

function asArray(payload: unknown, keys: string[] = []): AnyRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
  }

  const record = asRecord(payload);

  for (const key of ["data", "results", "items", ...keys]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
    }
  }

  for (const value of Object.values(record)) {
    const nested = asArray(value, keys);

    if (nested.length > 0) {
      return nested;
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

function fraudFlagsFromProduct(product: AnyRecord) {
  const rawFlags = product.fraud_flags ?? product.fraudFlags;

  if (Array.isArray(rawFlags)) {
    const flags = rawFlags.filter((flag): flag is string => {
      return typeof flag === "string" && flag.trim().length > 0;
    });

    if (flags.length > 0) {
      return flags;
    }
  }

  const riskLevel = stringFrom(product, ["fraud_risk_level", "risk_level"], "");
  const score = numberFrom(product, ["risk_score", "fraud_score", "score"]);

  if (riskLevel || score > 0) {
    return [`Fraud risk: ${riskLevel || "Scored"}`, `Risk score: ${score}/100`];
  }

  return ["No active fraud pattern", "Verified by Service #12 product graph"];
}

function normalizeDecision(value: string): ProductDigitalTwin["currentRecoveryDecision"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("REPAIR")) return "Repair";
  if (normalized.includes("DONATE")) return "Donate";
  if (normalized.includes("RECYCLE") || normalized.includes("DESTROY")) return "Recycle";
  if (normalized.includes("RESELL")) return "Resell";
  return "Refurbish";
}

function normalizeCondition(value: string): ProductDigitalTwin["product"]["condition"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("EXCELLENT")) return "Excellent";
  if (normalized.includes("FAIR")) return "Fair";
  if (normalized.includes("REPAIR")) return "Needs repair";
  return "Good";
}

function normalizeChannel(value: string): ProductDigitalTwin["recoveryHistory"][number]["channel"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("TRADE")) return "Trade-in";
  if (normalized.includes("RECYCLE") || normalized.includes("DESTROY")) return "Recycling";
  if (normalized.includes("RETURN")) return "Return";
  return "Refurbishment";
}
