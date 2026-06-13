export type Priority = "Urgent" | "High" | "Normal";
export type InspectorStatus = "In progress" | "Waiting" | "Escalated";
export type FraudSeverity = "Critical" | "High" | "Medium";

export interface ReturnsSummary {
  totalReceived: number;
  awaitingInspection: number;
  awaitingDecision: number;
  processedToday: number;
}

export interface InspectionProduct {
  productId: string;
  productName: string;
  category: string;
  conditionScore: number;
  inspectorStatus: InspectorStatus;
  inspector?: string;
  priority: Priority;
}

export interface RepairItem {
  productId: string;
  productName: string;
  issue: string;
  waitTimeHours: number;
  estimatedRepairCost: number;
  expectedRecoveryValue: number;
  progress: number;
}

export interface DonationCandidate {
  productId: string;
  productName: string;
  category: string;
  suggestedNgo: string;
  impactScore: number;
  beneficiaries: number;
}

export interface FraudAlert {
  id: string;
  pattern: string;
  detail: string;
  productId: string;
  customerId: string;
  severity: FraudSeverity;
  detectedAt: string;
}

export interface PipelineStage {
  label: string;
  count: number;
  completionRate: number;
}

export interface RecoveryOutcome {
  label: "Resold" | "Donated" | "Recycled";
  count: number;
}

export interface OperationsData {
  facility: string;
  lastUpdated: string;
  returns: ReturnsSummary;
  inspections: InspectionProduct[];
  repairQueue: RepairItem[];
  donationCandidates: DonationCandidate[];
  fraudAlerts: FraudAlert[];
  pipeline: PipelineStage[];
  outcomes: RecoveryOutcome[];
}
