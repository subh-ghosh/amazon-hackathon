export type TrendDirection = "up" | "down";
export type IssueSeverity = "High" | "Medium" | "Low";

export interface SellerKpi {
  label: string;
  value: string;
  change: number;
  trend: TrendDirection;
  comparison: string;
  tone: "emerald" | "blue" | "amber" | "rose";
}

export interface ReturnCause {
  cause: string;
  returns: number;
  percentage: number;
  change: number;
}

export interface SellerIssue {
  title: string;
  detail: string;
  affectedOrders: number;
  returnCorrelation?: number;
  severity: IssueSeverity;
}

export interface FraudExposure {
  exposureAmount: number;
  flaggedOrders: number;
  blockedClaims: number;
  recoveredAmount: number;
  riskScore: number;
}

export interface LossCategory {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface EstimatedLosses {
  total: number;
  preventable: number;
  projectedAnnual: number;
  categories: LossCategory[];
}

export interface SellerAnalytics {
  sellerName: string;
  reportingPeriod: string;
  kpis: SellerKpi[];
  returnCauses: ReturnCause[];
  packagingProblems: SellerIssue[];
  listingProblems: SellerIssue[];
  fraudExposure: FraudExposure;
  estimatedLosses: EstimatedLosses;
}
