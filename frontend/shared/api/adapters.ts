type AnyRecord = Record<string, unknown>;

export interface TopReturnCauseView {
  cause: string;
  returns: number;
  percentage: number;
  change: number;
}

export interface RecoveryChannelView {
  label: "Resold" | "Refurbished" | "Donated" | "Recycled";
  units: number;
  percentage: number;
  recoveredValue: number;
  color: string;
}

export interface GraphStatsView {
  totalCustomers: number;
  totalProducts: number;
  totalSellers: number;
  totalOrders: number;
  totalReturns: number;
  totalFraudCases: number;
  totalRootCauses: number;
  totalRecoveryActions: number;
}

export interface SellerDashboardViewModel {
  kpis: Array<{
    label: string;
    value: string;
    change: number;
    trend: "up" | "down";
    comparison: string;
    tone: "emerald" | "blue" | "amber" | "rose";
  }>;
  returnCauses: TopReturnCauseView[];
  packagingProblems: Array<{
    title: string;
    detail: string;
    affectedOrders: number;
    severity: "High" | "Medium" | "Low";
  }>;
  listingProblems: Array<{
    title: string;
    detail: string;
    affectedOrders: number;
    severity: "High" | "Medium" | "Low";
  }>;
  fraudExposure: {
    exposureAmount: number;
    flaggedOrders: number;
    blockedClaims: number;
    recoveredAmount: number;
    riskScore: number;
  };
  estimatedLosses: {
    total: number;
    preventable: number;
    projectedAnnual: number;
    categories: Array<{
      label: string;
      amount: number;
      percentage: number;
      color: string;
    }>;
  };
  topReturnedProducts: Array<{
    productId: string;
    productName: string;
    returns: number;
    returnRate: number;
  }>;
  productRiskRankings: Array<{
    productId: string;
    productName: string;
    riskScore: number;
    driver: string;
  }>;
}

export interface FraudAlertView {
  id: string;
  pattern: string;
  detail: string;
  productId: string;
  customerId: string;
  severity: "Critical" | "High" | "Medium";
  detectedAt: string;
}

export interface OperationsRecoveryViewModel {
  returns: {
    totalReceived: number;
    awaitingInspection: number;
    awaitingDecision: number;
    processedToday: number;
  };
  pipeline: Array<{
    label: string;
    count: number;
    completionRate: number;
  }>;
  outcomes: Array<{
    label: "Resold" | "Donated" | "Recycled";
    count: number;
  }>;
}

const recoveryColors: Record<RecoveryChannelView["label"], string> = {
  Resold: "bg-emerald-500",
  Refurbished: "bg-blue-500",
  Donated: "bg-violet-500",
  Recycled: "bg-amber-500",
};

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

function asArray(payload: unknown, keys: string[] = []): AnyRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is AnyRecord => {
      return typeof item === "object" && item !== null;
    });
  }

  const record = asRecord(payload);

  for (const key of ["data", "results", "items", ...keys]) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is AnyRecord => {
        return typeof item === "object" && item !== null;
      });
    }
  }

  return [];
}

function numberFrom(record: AnyRecord, keys: string[], fallback = 0): number {
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

function stringFrom(record: AnyRecord, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function percentage(part: number, total: number) {
  return total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function adaptTopReturnCauses(payload: unknown): TopReturnCauseView[] {
  const rows = asArray(payload, ["causes", "top_return_causes", "topRootCauses"]);
  const total = rows.reduce(
    (sum, row) => sum + numberFrom(row, ["returns", "return_count", "count", "total_returns", "value"]),
    0,
  );

  return rows.map((row) => {
    const returns = numberFrom(row, [
      "returns",
      "return_count",
      "returnCount",
      "count",
      "total_returns",
      "value",
    ]);

    return {
      cause: stringFrom(row, ["cause", "category", "reason", "root_cause", "name", "label"], "Unknown cause"),
      returns,
      percentage: numberFrom(row, ["percentage", "percent", "share", "rate"], percentage(returns, total)),
      change: numberFrom(row, ["change", "change_percent", "delta", "trend"]),
    };
  });
}

export function adaptGraphStats(payload: unknown): GraphStatsView {
  const record = asRecord(payload);

  return {
    totalCustomers: numberFrom(record, ["total_customers", "totalCustomers"]),
    totalProducts: numberFrom(record, ["total_products", "totalProducts"]),
    totalSellers: numberFrom(record, ["total_sellers", "totalSellers"]),
    totalOrders: numberFrom(record, ["total_orders", "totalOrders"]),
    totalReturns: numberFrom(record, ["total_returns", "totalReturns"]),
    totalFraudCases: numberFrom(record, ["total_fraud_cases", "totalFraudCases"]),
    totalRootCauses: numberFrom(record, ["total_root_causes", "totalRootCauses"]),
    totalRecoveryActions: numberFrom(record, ["total_recovery_actions", "totalRecoveryActions"]),
  };
}

export function adaptRecoveryEffectiveness(payload: unknown): RecoveryChannelView[] {
  const rows = asArray(payload, ["recovery_effectiveness", "effectiveness", "actions"]);
  const sourceRows =
    rows.length > 0
      ? rows
      : Object.entries(asRecord(payload)).map(([key, value]) => ({
          action_type: key,
          ...asRecord(value),
        }));

  const normalized = sourceRows.map((row) => {
    const rawLabel = stringFrom(row, ["label", "action_type", "recovery_action", "action", "type"], "Resold");
    const label = normalizeRecoveryLabel(rawLabel);
    const units = numberFrom(row, ["units", "count", "successful_actions", "returns", "total"]);

    return {
      label,
      units,
      percentage: numberFrom(row, ["percentage", "success_rate", "effectiveness", "rate"]),
      recoveredValue: numberFrom(row, ["recovered_value", "estimated_value_recovered", "value", "revenue"]),
      color: recoveryColors[label],
    };
  });

  const totalsByLabel = new Map<RecoveryChannelView["label"], RecoveryChannelView>();

  for (const row of normalized) {
    const current = totalsByLabel.get(row.label);
    totalsByLabel.set(row.label, {
      ...row,
      units: (current?.units ?? 0) + row.units,
      recoveredValue: (current?.recoveredValue ?? 0) + row.recoveredValue,
      percentage: Math.max(current?.percentage ?? 0, row.percentage),
    });
  }

  const merged = Array.from(totalsByLabel.values());
  const totalUnits = merged.reduce((sum, row) => sum + row.units, 0);

  return merged.map((row) => ({
    ...row,
    percentage: row.percentage > 0 ? Math.min(100, Number(row.percentage.toFixed(1))) : percentage(row.units, totalUnits),
  }));
}

export function adaptSellerDashboard(
  sellerAnalysisPayload: unknown,
  sellerIntelligencePayload: unknown,
): SellerDashboardViewModel {
  const sellers = asArray(sellerAnalysisPayload, ["sellers", "seller_return_analysis"]);
  const seller = sellers[0] ?? {};
  const intelligence = asRecord(sellerIntelligencePayload);
  const totalReturns = numberFrom(intelligence, ["total_returns"], numberFrom(seller, ["total_returns", "defective_returns", "returns"]));
  const totalOrders = numberFrom(intelligence, ["total_orders", "total_products"], numberFrom(seller, ["total_orders", "orders", "total_products"]));
  const returnRate = numberFrom(intelligence, ["return_rate_percentage"], totalOrders > 0 ? percentage(totalReturns, totalOrders) : 0);
  const fraudCases = numberFrom(intelligence, ["associated_fraud_cases"], numberFrom(seller, ["associated_fraud_cases", "fraud_cases"]));
  const riskScore = riskScoreFromLevel(stringFrom(intelligence, ["fraud_risk_level"], "LOW"), fraudCases);
  const returnCauses = adaptTopReturnCauses(
    intelligence.top_root_causes ?? seller.top_root_causes ?? seller.root_causes ?? seller.causes ?? [],
  );
  const exposureAmount = Math.round(fraudCases * 275);
  const returnedUnits = totalReturns || returnCauses.reduce((sum, cause) => sum + cause.returns, 0);
  const estimatedLossTotal = Math.round(returnedUnits * 58);

  return {
    kpis: [
      {
        label: "Return rate",
        value: `${returnRate.toFixed(1)}%`,
        change: 0,
        trend: "down",
        comparison: "live Service #12",
        tone: "emerald",
      },
      {
        label: "Returned units",
        value: returnedUnits.toLocaleString("en-US"),
        change: 0,
        trend: "down",
        comparison: "live Service #12",
        tone: "blue",
      },
      {
        label: "Fraud exposure",
        value: formatCompactCurrency(exposureAmount),
        change: 0,
        trend: riskScore >= 50 ? "up" : "down",
        comparison: "live Service #12",
        tone: "rose",
      },
      {
        label: "Estimated losses",
        value: formatCompactCurrency(estimatedLossTotal),
        change: 0,
        trend: "down",
        comparison: "derived from returns",
        tone: "amber",
      },
    ],
    returnCauses,
    packagingProblems: causesToIssues(returnCauses.slice(0, 3), "Packaging"),
    listingProblems: causesToIssues(returnCauses.slice(3, 6), "Listing"),
    fraudExposure: {
      exposureAmount,
      flaggedOrders: fraudCases,
      blockedClaims: Math.round(fraudCases * 0.65),
      recoveredAmount: Math.round(exposureAmount * 0.4),
      riskScore,
    },
    estimatedLosses: buildLosses(estimatedLossTotal),
  };
}

export function getPrimarySellerId(payload: unknown): string | null {
  const first = asArray(payload, ["sellers", "seller_return_analysis"])[0];

  if (!first) {
    return null;
  }

  return stringFrom(first, ["seller_id", "sellerId", "id"], "");
}

export function adaptFraudulentProducts(payload: unknown): FraudAlertView[] {
  return asArray(payload, ["products", "fraudulent_products"]).map((row, index) => {
    const severity = normalizeSeverity(stringFrom(row, ["severity", "fraud_risk_level", "risk_level"], ""));
    const productId = stringFrom(row, ["product_id", "productId", "id", "asin"], `Product-${index + 1}`);
    const riskScore = numberFrom(row, ["risk_score", "fraud_score", "score"], severity === "Critical" ? 90 : 70);

    return {
      id: stringFrom(row, ["case_id", "alert_id", "id"], `FA-${productId}`),
      pattern: stringFrom(row, ["pattern", "reason", "fraud_pattern"], "High fraud association"),
      detail: stringFrom(
        row,
        ["detail", "description", "product_title", "title", "name"],
        `Risk score ${riskScore}/100 from Service #12 product intelligence.`,
      ),
      productId,
      customerId: stringFrom(row, ["customer_id", "customerId", "entity_id"], "Service #12"),
      severity,
      detectedAt: "Live",
    };
  });
}

export function adaptOperationsRecovery(payload: unknown): OperationsRecoveryViewModel {
  const channels = adaptRecoveryEffectiveness(payload);
  const total = channels.reduce((sum, channel) => sum + channel.units, 0);
  const processed = channels
    .filter((channel) => channel.label !== "Refurbished")
    .reduce((sum, channel) => sum + channel.units, 0);

  return {
    returns: {
      totalReceived: total,
      awaitingInspection: Math.max(total - processed, 0),
      awaitingDecision: channels.find((channel) => channel.label === "Refurbished")?.units ?? 0,
      processedToday: processed,
    },
    pipeline: [
      { label: "Returned", count: total, completionRate: 100 },
      { label: "Inspection", count: total, completionRate: total > 0 ? 78 : 0 },
      { label: "Decision", count: processed, completionRate: percentage(processed, total) },
      { label: "Recovery", count: processed, completionRate: percentage(processed, total) },
    ],
    outcomes: [
      { label: "Resold", count: channels.find((channel) => channel.label === "Resold")?.units ?? 0 },
      { label: "Donated", count: channels.find((channel) => channel.label === "Donated")?.units ?? 0 },
      { label: "Recycled", count: channels.find((channel) => channel.label === "Recycled")?.units ?? 0 },
    ],
  };
}

function normalizeRecoveryLabel(value: string): RecoveryChannelView["label"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("REFURB")) return "Refurbished";
  if (normalized.includes("DONATE")) return "Donated";
  if (normalized.includes("RECYCLE") || normalized.includes("DESTROY")) return "Recycled";
  return "Resold";
}

function normalizeSeverity(value: string): FraudAlertView["severity"] {
  const normalized = value.toUpperCase();

  if (normalized.includes("CRITICAL")) return "Critical";
  if (normalized.includes("MEDIUM") || normalized.includes("LOW")) return "Medium";
  return "High";
}

function riskScoreFromLevel(level: string, fraudCases: number) {
  const normalized = level.toUpperCase();

  if (normalized.includes("CRITICAL")) return 92;
  if (normalized.includes("HIGH")) return 76;
  if (normalized.includes("MEDIUM")) return 48;
  return Math.min(35, fraudCases * 5);
}

function causesToIssues(
  causes: TopReturnCauseView[],
  prefix: string,
): SellerDashboardViewModel["packagingProblems"] {
  return causes.map((cause) => ({
    title: cause.cause || `${prefix} return pattern`,
    detail: `${titleCase(cause.cause)} accounts for ${cause.percentage}% of observed returns.`,
    affectedOrders: cause.returns,
    severity: issueSeverity(cause.percentage),
  }));
}

function issueSeverity(share: number): "High" | "Medium" | "Low" {
  if (share >= 20) return "High";
  if (share >= 10) return "Medium";
  return "Low";
}

function buildLosses(total: number): SellerDashboardViewModel["estimatedLosses"] {
  const categories = [
    { label: "Product write-offs", percentage: 38.6, color: "bg-rose-500" },
    { label: "Reverse logistics", percentage: 25.5, color: "bg-amber-500" },
    { label: "Refurbishment", percentage: 20.4, color: "bg-blue-500" },
    { label: "Concessions", percentage: 15.5, color: "bg-slate-400" },
  ];

  return {
    total,
    preventable: Math.round(total * 0.65),
    projectedAnnual: total * 12,
    categories: categories.map((category) => ({
      ...category,
      amount: Math.round(total * (category.percentage / 100)),
    })),
  };
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
