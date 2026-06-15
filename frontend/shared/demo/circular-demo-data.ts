export const circularDemoProduct = {
  productId: "P123",
  productName: "Echo Show 10",
  category: "Smart Home",
  brand: "Amazon",
  sellerId: "SEL-44A",
  sellerName: "Tech Haven Official",
  returnCount: 2,
  fraudScore: 0.72,
  fraudScorePercent: 72,
  recoveryDecision: "Refurbish",
  warehouseId: "WH-BLR-04",
  warehouseName: "BLR Reverse Logistics Center 04",
  recoveredValue: 180,
  returnReason: "Changed mind return with repeat-return risk",
  carbonAvoidedKg: 15.4,
};

export const circularDemoReturnCauses = [
  { cause: "Changed mind", returns: 2, percentage: 28.6, change: 3.1 },
  { cause: "Listing expectation mismatch", returns: 2, percentage: 28.6, change: 4.7 },
  { cause: "Packaging scuffs", returns: 1, percentage: 14.3, change: -1.2 },
  { cause: "Accessory missing", returns: 1, percentage: 14.3, change: 1.8 },
  { cause: "Late delivery", returns: 1, percentage: 14.2, change: -2.4 },
];

export const circularDemoListingProblems = [
  {
    title: "Missing size information",
    detail: "Dimensions and fit guidance are incomplete for smart display placement.",
    affectedOrders: 2,
    returnCorrelation: 42,
    severity: "High",
  },
  {
    title: "Insufficient product images",
    detail: "Customers cannot inspect ports, stand clearance, and included accessories.",
    affectedOrders: 2,
    returnCorrelation: 36,
    severity: "Medium",
  },
  {
    title: "Ambiguous product description",
    detail: "Condition notes do not clearly separate cosmetic wear from functional checks.",
    affectedOrders: 1,
    returnCorrelation: 29,
    severity: "Medium",
  },
] as const;

export const circularDemoReturnTrend = [
  { month: "Jan", returns: 92 },
  { month: "Feb", returns: 108 },
  { month: "Mar", returns: 97 },
  { month: "Apr", returns: 126 },
  { month: "May", returns: 118 },
];

export const circularDemoSeller = {
  sellerId: circularDemoProduct.sellerId,
  sellerName: circularDemoProduct.sellerName,
  totalOrders: 48,
  totalReturns: 7,
  returnRate: 14.6,
  fraudCases: 1,
  fraudExposure: 1260,
  estimatedLosses: 406,
};

export const circularDemoRecoveryMix = [
  { label: "Resold", units: 3, percentage: 42.9, recoveredValue: 420, color: "bg-emerald-500" },
  { label: "Refurbished", units: 2, percentage: 28.6, recoveredValue: 360, color: "bg-blue-500" },
  { label: "Donated", units: 1, percentage: 14.3, recoveredValue: 72, color: "bg-violet-500" },
  { label: "Recycled", units: 1, percentage: 14.2, recoveredValue: 24, color: "bg-amber-500" },
] as const;
