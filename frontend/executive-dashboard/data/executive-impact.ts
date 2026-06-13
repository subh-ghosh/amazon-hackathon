import type { ExecutiveDashboardData } from "@/types/executive-impact";

export const executiveDashboardData: ExecutiveDashboardData = {
  reportingPeriod: "Year to date · January 1 - June 13, 2026",
  lastUpdated: "June 13, 2026 at 3:05 PM",
  recoveredRevenue: {
    total: 48270000,
    growthPercent: 18.6,
    targetProgress: 76,
    monthlyTrend: [
      { month: "Jan", value: 6.1 },
      { month: "Feb", value: 6.8 },
      { month: "Mar", value: 7.4 },
      { month: "Apr", value: 8.3 },
      { month: "May", value: 9.1 },
      { month: "Jun", value: 10.6 },
    ],
  },
  refundSavings: {
    costAvoided: 12840000,
    shippingSavings: 4190000,
    refundEfficiency: 87.4,
    eligibleRefunds: 186420,
  },
  sustainability: {
    carbonPreventedTonnes: 18420,
    productsDiverted: 1268000,
    recyclingSuccessRate: 94.2,
    landfillDiversionRate: 91.7,
  },
  donation: {
    productsDonated: 142600,
    ngosSupported: 284,
    beneficiariesReached: 486000,
    yearOverYearGrowth: 22.8,
  },
  recoveryPerformance: [
    {
      label: "Resold",
      units: 684200,
      percentage: 54,
      recoveredValue: 31600000,
      color: "bg-emerald-500",
    },
    {
      label: "Refurbished",
      units: 291600,
      percentage: 23,
      recoveredValue: 13100000,
      color: "bg-blue-500",
    },
    {
      label: "Donated",
      units: 142600,
      percentage: 11,
      recoveredValue: 2180000,
      color: "bg-violet-500",
    },
    {
      label: "Recycled",
      units: 149600,
      percentage: 12,
      recoveredValue: 1390000,
      color: "bg-amber-500",
    },
  ],
  aiSummary: {
    headline:
      "Recovery operations are outperforming plan, with revenue growth and landfill diversion both accelerating.",
    insights: [
      {
        title: "Revenue momentum is strengthening",
        detail:
          "June recovered revenue is tracking 16% above the Q2 monthly average.",
      },
      {
        title: "Returnless refunds are scaling efficiently",
        detail:
          "Policy automation avoided $12.8M in processing and product handling costs.",
      },
    ],
    risks: [
      {
        title: "Refurbishment capacity is nearing limit",
        detail:
          "Three regional centers are operating above 88% utilization, increasing cycle time.",
      },
      {
        title: "High-value electronics recovery is uneven",
        detail:
          "Laptop and premium audio recovery rates trail portfolio average by 6.3 points.",
      },
    ],
    opportunities: [
      {
        title: "Expand direct resale eligibility",
        detail:
          "AI inspection can route an additional 74,000 low-risk units directly to resale.",
      },
      {
        title: "Grow NGO matching coverage",
        detail:
          "Education partners have demand for 38,000 more tablets and e-readers this quarter.",
      },
    ],
    recommendations: [
      {
        title: "Add refurbishment shifts in BLR and DFW",
        detail:
          "A 12% capacity increase could unlock approximately $3.4M in quarterly recovery value.",
      },
      {
        title: "Pilot dynamic recovery pricing",
        detail:
          "Prioritize resale timing using category demand, condition, and inventory signals.",
      },
    ],
  },
};
