import type { SellerAnalytics } from "@/types/seller-analytics";

export const sellerAnalytics: SellerAnalytics = {
  sellerName: "Northstar Electronics",
  reportingPeriod: "May 1 - May 31, 2026",
  kpis: [
    {
      label: "Return rate",
      value: "6.8%",
      change: 0.7,
      trend: "down",
      comparison: "vs. last month",
      tone: "emerald",
    },
    {
      label: "Returned units",
      value: "1,284",
      change: 8.2,
      trend: "down",
      comparison: "vs. last month",
      tone: "blue",
    },
    {
      label: "Fraud exposure",
      value: "$18.4K",
      change: 12.5,
      trend: "up",
      comparison: "vs. last month",
      tone: "rose",
    },
    {
      label: "Estimated losses",
      value: "$74.2K",
      change: 4.1,
      trend: "down",
      comparison: "vs. last month",
      tone: "amber",
    },
  ],
  returnCauses: [
    { cause: "Item not as described", returns: 326, percentage: 25.4, change: 4.8 },
    { cause: "Defective or malfunctioning", returns: 282, percentage: 22.0, change: -2.1 },
    { cause: "Damaged in transit", returns: 218, percentage: 17.0, change: 6.4 },
    { cause: "Ordered by mistake", returns: 174, percentage: 13.6, change: -1.2 },
    { cause: "Missing parts or accessories", returns: 156, percentage: 12.1, change: 3.3 },
    { cause: "Arrived too late", returns: 128, percentage: 9.9, change: -0.8 },
  ],
  packagingProblems: [
    {
      title: "Insufficient internal cushioning",
      detail: "Most common in Echo-compatible speaker bundles.",
      affectedOrders: 92,
      severity: "High",
    },
    {
      title: "Oversized shipping cartons",
      detail: "Excess movement is increasing cosmetic damage.",
      affectedOrders: 71,
      severity: "Medium",
    },
    {
      title: "Weak accessory compartment",
      detail: "Power adapters are separating during transit.",
      affectedOrders: 55,
      severity: "Medium",
    },
  ],
  listingProblems: [
    {
      title: "Product dimensions are unclear",
      detail: "Three top ASINs omit assembled dimensions.",
      affectedOrders: 118,
      severity: "High",
    },
    {
      title: "Compatibility guidance is incomplete",
      detail: "Customers are selecting unsupported device models.",
      affectedOrders: 84,
      severity: "High",
    },
    {
      title: "Color imagery differs from product",
      detail: "Studio lighting makes charcoal units appear blue.",
      affectedOrders: 43,
      severity: "Low",
    },
  ],
  fraudExposure: {
    exposureAmount: 18420,
    flaggedOrders: 63,
    blockedClaims: 41,
    recoveredAmount: 7280,
    riskScore: 38,
  },
  estimatedLosses: {
    total: 74210,
    preventable: 48140,
    projectedAnnual: 890520,
    categories: [
      { label: "Product write-offs", amount: 28640, percentage: 38.6, color: "bg-rose-500" },
      { label: "Reverse logistics", amount: 18920, percentage: 25.5, color: "bg-amber-500" },
      { label: "Refurbishment", amount: 15170, percentage: 20.4, color: "bg-blue-500" },
      { label: "Concessions", amount: 11480, percentage: 15.5, color: "bg-slate-400" },
    ],
  },
};
