import type { ExecutiveDashboardData } from "@/types/executive-impact";

export const executiveDashboardData: ExecutiveDashboardData = {
  reportingPeriod: "Year to date · Jan 1 - Jun 13, 2026",
  lastUpdated: "June 13, 2026 at 3:05 PM",
  scorecard: {
    moneySaved: "₹4.82 Cr",
    carbonSaved: "18.4K Tons",
    inventoryRecovered: "1.26M Units",
    socialImpact: "486K Lives",
  },
  kpis: [
    { label: "Returns Prevented", value: "1.25M", change: "+12.4%", trend: "up" },
    { label: "Revenue Recovered", value: "₹4.82 Cr", change: "+18.6%", trend: "up" },
    { label: "Returnless Savings", value: "₹1.28 Cr", change: "+8.2%", trend: "up" },
    { label: "CO₂ Saved (Tons)", value: "18,420", change: "+24.1%", trend: "up" },
    { label: "Fraud Prevented", value: "₹64.2L", change: "-4.3%", trend: "down" },
  ],
  recoveryMix: [
    { label: "Restocked", units: 684200, percentage: 54, recoveredValue: 31600000, color: "bg-emerald-500" },
    { label: "Refurbished", units: 291600, percentage: 23, recoveredValue: 13100000, color: "bg-blue-500" },
    { label: "Resold", units: 142600, percentage: 11, recoveredValue: 2180000, color: "bg-indigo-500" },
    { label: "Donated", units: 88000, percentage: 7, recoveredValue: 840000, color: "bg-amber-500" },
    { label: "Recycled", units: 61600, percentage: 5, recoveredValue: 550000, color: "bg-slate-400" },
  ],
  financial: {
    totalRecovered: 48270000,
    resaleRevenue: 31600000,
    refurbishmentRecovery: 13100000,
    returnlessSavings: 12840000,
    fraudSavings: 6420000,
    monthlyTrend: [
      { month: "Jan", value: 4.2 },
      { month: "Feb", value: 4.8 },
      { month: "Mar", value: 5.4 },
      { month: "Apr", value: 6.3 },
      { month: "May", value: 7.1 },
      { month: "Jun", value: 8.6 },
    ],
  },
  sustainability: {
    co2SavedTonnes: 18420,
    wasteDivertedTonnes: 4250,
    itemsDonated: 142600,
    circularRecoveryRate: 94.2,
  },
  intelligence: {
    topCategories: [
      { name: "Electronics", value: "420K", percentage: 34 },
      { name: "Fashion", value: "310K", percentage: 25 },
      { name: "Home & Kitchen", value: "185K", percentage: 15 },
    ],
    topReasons: [
      { name: "Expectation Mismatch", value: "380K", percentage: 31 },
      { name: "Defective", value: "290K", percentage: 23 },
      { name: "Size Issue", value: "245K", percentage: 20 },
    ],
    packagingIssues: [
      { name: "Poor Cushioning", value: "85K", percentage: 42 },
      { name: "Oversized Box", value: "62K", percentage: 31 },
      { name: "No Tamper Seal", value: "34K", percentage: 17 },
    ],
    sellerProblemAreas: [
      { name: "Missing Dimensions", value: "112K", percentage: 45 },
      { name: "Color Mismatch", value: "84K", percentage: 34 },
      { name: "Poor Images", value: "41K", percentage: 16 },
    ],
  },
  aiSummary: {
    headline: "Recovery operations are outperforming targets, driving unprecedented margin protection.",
    biggestIssue: "Electronics expectation mismatch due to incomplete listing specifications.",
    biggestOpportunity: "Increase resale recovery for smart home devices via automated QA grading.",
    stats: {
      recovered: "₹2.4M",
      prevented: "1,250",
      co2: "14.2 tons",
    },
  },
  operational: {
    avgProcessingTime: "14.2 hours",
    recoverySuccessRate: 94.2,
    donationImpact: "284 NGOs Supported",
    facilityPerformance: [
      { name: "BLR Center 04 (Bangalore)", score: 98, status: "Optimal" },
      { name: "DFW Center 09 (Dallas)", score: 92, status: "Optimal" },
      { name: "LHR Center 02 (London)", score: 84, status: "Capacity Constrained" },
    ],
  },
};
