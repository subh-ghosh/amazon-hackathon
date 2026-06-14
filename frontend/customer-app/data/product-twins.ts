import type { ProductDigitalTwin } from "@/types/product-twin";

export const productTwins: ProductDigitalTwin[] = [
  {
    productId: "P123",
    conditionScore: 92,
    utilityScore: 96,
    returnCount: 1,
    fraudFlags: ["No active fraud pattern", "Verified serial number"],
    currentRecoveryDecision: "Resell",
    product: {
      name: "Echo Show 10",
      category: "Smart Home",
      brand: "Amazon",
      model: "3rd Generation",
      serialNumber: "G090LF1172840X2Q",
      purchaseDate: "2025-01-18",
      warrantyExpires: "2027-01-18",
      currentOwner: "Aarav Mehta",
      condition: "Excellent",
    },
    repairHistory: [
      {
        id: "REP-1042",
        date: "2025-08-12",
        service: "Display calibration",
        provider: "Amazon Authorized Service",
        partsReplaced: [],
        cost: 0,
        status: "Completed",
      },
      {
        id: "REP-1188",
        date: "2026-02-03",
        service: "Power adapter replacement",
        provider: "Amazon ReLife Center",
        partsReplaced: ["30W power adapter"],
        cost: 24.99,
        status: "Completed",
      },
    ],
    recoveryHistory: [
      {
        id: "REC-0319",
        date: "2025-07-28",
        channel: "Return",
        outcome: "Inspected and returned to customer",
        valueRecovered: 219,
        carbonAvoidedKg: 8.4,
      },
    ],
  },
];

export function getProductTwin(productId: string) {
  return productTwins.find((twin) => twin.productId === productId) ?? getMockProductTwin(productId);
}

function getMockProductTwin(productId: string): ProductDigitalTwin {
  return {
    productId,
    conditionScore: 78,
    utilityScore: 82,
    returnCount: 2,
    fraudFlags: ["Mock data", "Backend twin unavailable"],
    currentRecoveryDecision: "Refurbish",
    product: {
      name: "Unknown Product Twin",
      category: "Marketplace",
      brand: "Amazon",
      model: "Mock profile",
      serialNumber: `SN-${productId}`,
      purchaseDate: "2025-11-03",
      warrantyExpires: "2027-11-03",
      currentOwner: "Customer",
      condition: "Good",
    },
    repairHistory: [
      {
        id: "REP-MOCK-1",
        date: "2026-03-14",
        service: "Functional inspection",
        provider: "Amazon ReLife Center",
        partsReplaced: [],
        cost: 0,
        status: "Completed",
      },
    ],
    recoveryHistory: [
      {
        id: "REC-MOCK-1",
        date: "2026-04-22",
        channel: "Return",
        outcome: "Mock recovery record generated while backend is unavailable",
        valueRecovered: 86,
        carbonAvoidedKg: 5.8,
      },
    ],
  };
}
