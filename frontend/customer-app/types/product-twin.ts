export type ProductCondition = "Excellent" | "Good" | "Fair" | "Needs repair";

export interface ProductInformation {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpires: string;
  currentOwner: string;
  condition: ProductCondition;
}

export interface RepairRecord {
  id: string;
  date: string;
  service: string;
  provider: string;
  partsReplaced: string[];
  cost: number;
  status: "Completed" | "In progress" | "Scheduled";
}

export interface RecoveryRecord {
  id: string;
  date: string;
  channel: "Return" | "Trade-in" | "Refurbishment" | "Recycling";
  outcome: string;
  valueRecovered: number;
  carbonAvoidedKg: number;
}

export interface ProductDigitalTwin {
  productId: string;
  conditionScore: number;
  utilityScore: number;
  returnCount: number;
  repairHistory: RepairRecord[];
  recoveryHistory: RecoveryRecord[];
  product: ProductInformation;
}

export interface RecoveryProjection {
  projectedValue: number;
  retainedUtility: number;
  carbonAvoidedKg: number;
  recommendedPath: "Resell" | "Refurbish" | "Recycle";
}
