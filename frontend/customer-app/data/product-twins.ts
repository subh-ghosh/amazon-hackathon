import type { ProductDigitalTwin } from "@/types/product-twin";

export const productTwins: ProductDigitalTwin[] = [
  {
    productId: "P123",
    conditionScore: 92,
    utilityScore: 96,
    returnCount: 1,
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
  return productTwins.find((twin) => twin.productId === productId);
}
