import type { ReturnOrder, ReturnReason } from "@/types/return-portal";

export const returnReasons: ReturnReason[] = [
  "Damaged or defective",
  "Wrong item received",
  "No longer needed",
  "Missing parts or accessories",
  "Performance did not meet expectations",
];

export const returnOrders: ReturnOrder[] = [
  {
    orderId: "114-7852146-9035421",
    purchaseDate: "2026-05-28",
    customerName: "Aarav Mehta",
    products: [
      {
        id: "P123",
        name: "Echo Show 10",
        brand: "Amazon",
        category: "Smart Home",
        condition: "Like new",
        price: 179.99,
        returnWindowEnds: "2026-06-27",
        relifePath: "Inspect",
      },
      {
        id: "P389",
        name: "Fire TV Stick 4K Max",
        brand: "Amazon",
        category: "Electronics",
        condition: "Refurbished",
        price: 34.99,
        returnWindowEnds: "2026-06-27",
        relifePath: "Resell",
      },
    ],
  },
  {
    orderId: "113-2471938-6612059",
    purchaseDate: "2026-06-02",
    customerName: "Mira Shah",
    products: [
      {
        id: "P412",
        name: "Amazon Basics Air Fryer",
        brand: "Amazon Basics",
        category: "Home & Kitchen",
        condition: "Open box",
        price: 62.49,
        returnWindowEnds: "2026-07-02",
        relifePath: "Inspect",
      },
      {
        id: "P844",
        name: "Echo Buds",
        brand: "Amazon",
        category: "Electronics",
        condition: "Refurbished",
        price: 54.99,
        returnWindowEnds: "2026-07-02",
        relifePath: "Repair",
      },
    ],
  },
  {
    orderId: "112-6084419-1748302",
    purchaseDate: "2026-06-06",
    customerName: "Dev Rao",
    products: [
      {
        id: "P247",
        name: "Kindle Paperwhite",
        brand: "Amazon",
        category: "Electronics",
        condition: "Open box",
        price: 104.99,
        returnWindowEnds: "2026-07-06",
        relifePath: "Resell",
      },
    ],
  },
];
