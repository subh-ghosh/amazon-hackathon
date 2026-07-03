export type TrendDirection = "up" | "down";
export type IssueSeverity = "High" | "Medium" | "Low";

export interface SellerKpi {
  label: string;
  value: string;
  change: number;
  trend: TrendDirection;
  comparison: string;
  tone: "emerald" | "blue" | "amber" | "rose" | "slate";
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

export interface ActionRecommendation {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  impact: string;
}

export interface RecoveryIntelligence {
  restocked: { value: number; count: number; percentage: number };
  refurbished: { value: number; count: number; percentage: number };
  resold: { value: number; count: number; percentage: number };
  donated: { value: number; count: number; percentage: number };
  recycled: { value: number; count: number; percentage: number };
  totalRecoveredValue: number;
  totalRecoveryRate: number;
  potentialRevenue: number;
}

export interface MonthlyTrend {
  month: string;
  returns: number;
}

export interface AiInsights {
  highlights: string[];
}

export interface ProductInsight {
  sku: string;
  name: string;
  category: string;
  price: number;
  orders: number;
  returns: number;
  returnRate: number;
  healthScore: number;
  topComplaints: string[];
  returnCauses: ReturnCause[];
  packagingIssues: SellerIssue[];
  listingIssues: SellerIssue[];
  recovery: RecoveryIntelligence;
  recommendations: ActionRecommendation[];
  monthlyTrend: MonthlyTrend[];
}

export interface SellerAnalytics {
  sellerName: string;
  reportingPeriod: string;
  aiInsights: AiInsights;
  kpis: SellerKpi[];
  returnCauses: ReturnCause[];
  productInsights: ProductInsight[];
  packagingProblems: SellerIssue[];
  listingProblems: SellerIssue[];
  recoveryIntelligence: RecoveryIntelligence;
  recommendations: ActionRecommendation[];
  monthlyTrend: MonthlyTrend[];
}
