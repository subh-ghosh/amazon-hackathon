export interface TrendPoint {
  month: string;
  value: number;
}

export interface RecoveredRevenue {
  total: number;
  growthPercent: number;
  targetProgress: number;
  monthlyTrend: TrendPoint[];
}

export interface ReturnlessRefundSavings {
  costAvoided: number;
  shippingSavings: number;
  refundEfficiency: number;
  eligibleRefunds: number;
}

export interface SustainabilityImpact {
  carbonPreventedTonnes: number;
  productsDiverted: number;
  recyclingSuccessRate: number;
  landfillDiversionRate: number;
}

export interface DonationImpact {
  productsDonated: number;
  ngosSupported: number;
  beneficiariesReached: number;
  yearOverYearGrowth: number;
}

export interface RecoveryChannel {
  label: "Resold" | "Refurbished" | "Donated" | "Recycled";
  units: number;
  percentage: number;
  recoveredValue: number;
  color: string;
}

export interface ExecutiveInsight {
  title: string;
  detail: string;
}

export interface ExecutiveSummary {
  headline: string;
  insights: ExecutiveInsight[];
  risks: ExecutiveInsight[];
  opportunities: ExecutiveInsight[];
  recommendations: ExecutiveInsight[];
}

export interface ExecutiveDashboardData {
  reportingPeriod: string;
  lastUpdated: string;
  recoveredRevenue: RecoveredRevenue;
  refundSavings: ReturnlessRefundSavings;
  sustainability: SustainabilityImpact;
  donation: DonationImpact;
  recoveryPerformance: RecoveryChannel[];
  aiSummary: ExecutiveSummary;
}
