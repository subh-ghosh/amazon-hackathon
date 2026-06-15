export type TrendDirection = "up" | "down" | "neutral";

export interface KpiMetric {
  label: string;
  value: string;
  change: string;
  trend: TrendDirection;
}

export interface RecoveryChannel {
  label: string;
  units: number;
  percentage: number;
  recoveredValue: number;
  color: string;
}

export interface FinancialBreakdown {
  totalRecovered: number;
  resaleRevenue: number;
  refurbishmentRecovery: number;
  returnlessSavings: number;
  fraudSavings: number;
  monthlyTrend: { month: string; value: number }[];
}

export interface SustainabilityMetrics {
  co2SavedTonnes: number;
  wasteDivertedTonnes: number;
  itemsDonated: number;
  circularRecoveryRate: number;
}

export interface IntelligenceItem {
  name: string;
  value: string;
  percentage: number;
}

export interface ReturnIntelligence {
  topCategories: IntelligenceItem[];
  topReasons: IntelligenceItem[];
  packagingIssues: IntelligenceItem[];
  sellerProblemAreas: IntelligenceItem[];
}

export interface AiSummary {
  headline: string;
  biggestIssue: string;
  biggestOpportunity: string;
  stats: {
    recovered: string;
    prevented: string;
    co2: string;
  };
}

export interface OperationalMetrics {
  avgProcessingTime: string;
  recoverySuccessRate: number;
  donationImpact: string;
  facilityPerformance: { name: string; score: number; status: string }[];
}

export interface ScorecardMetrics {
  moneySaved: string;
  carbonSaved: string;
  inventoryRecovered: string;
  socialImpact: string;
}

export interface ExecutiveDashboardData {
  reportingPeriod: string;
  lastUpdated: string;
  kpis: KpiMetric[];
  scorecard: ScorecardMetrics;
  recoveryMix: RecoveryChannel[];
  financial: FinancialBreakdown;
  sustainability: SustainabilityMetrics;
  intelligence: ReturnIntelligence;
  aiSummary: AiSummary;
  operational: OperationalMetrics;
}
