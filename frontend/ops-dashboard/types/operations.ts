export type Priority = "Urgent" | "High" | "Normal";
export type InspectorStatus = "In progress" | "Waiting" | "Escalated";
export type FraudSeverity = "Critical" | "High" | "Medium";
export type RecoveryOptionType = "RESTOCK" | "REFURBISH" | "RESELL" | "DONATE" | "RECYCLE";

export interface ReturnsSummary {
  totalReceived: number;
  awaitingInspection: number;
  awaitingDecision: number;
  processedToday: number;
  recoveryValueGenerated: number;
}

export interface InspectionProduct {
  productId: string;
  returnId: string;
  productName: string;
  category: string;
  conditionScore: number;
  inspectorStatus: InspectorStatus;
  arrivalTime: string;
  priority: Priority;
}

export interface PipelineStage {
  label: string;
  count: number;
  completionRate: number;
}

export interface TriageTwinEvent {
  date: string;
  title: string;
  description: string;
  type: "purchase" | "return" | "inspection" | "repair";
}

export interface TriageFraudSignal {
  name: string;
  status: "Safe" | "Warning" | "Critical";
  detail: string;
}

export interface TriageRecoveryOption {
  type: RecoveryOptionType;
  label: string;
  expectedValue: number;
  confidence: number;
  timeRequiredHours: number;
  isRecommended: boolean;
  details: {
    resaleDemand?: "High" | "Medium" | "Low";
    resaleChannel?: string;
    ngoName?: string;
    carbonBenefit?: string;
    socialImpact?: string;
    facilityName?: string;
    distanceKm?: number;
    processingCost?: number;
    etaDays?: number;
    carbonImpact?: string;
  };
}

export interface TriageItemDetails {
  returnId: string;
  productName: string;
  customerStatedReason: string;
  conditionAssessment: string;
  productImage: string;
  riskLevel: "Low" | "Medium" | "High";
  twinEvents: TriageTwinEvent[];
  fraudSignals: TriageFraudSignal[];
  recoveryOptions: TriageRecoveryOption[];
}

export interface OperationsData {
  facility: string;
  lastUpdated: string;
  returns: ReturnsSummary;
  inspections: InspectionProduct[];
  pipeline: PipelineStage[];
  triageDetails: Record<string, TriageItemDetails>;
}
