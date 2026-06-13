export type ReturnReason =
  | "Damaged or defective"
  | "Wrong item received"
  | "No longer needed"
  | "Missing parts or accessories"
  | "Performance did not meet expectations";

export interface ReturnProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: string;
  price: number;
  returnWindowEnds: string;
  relifePath: "Inspect" | "Repair" | "Resell" | "Recycle";
}

export interface ReturnOrder {
  orderId: string;
  purchaseDate: string;
  customerName: string;
  products: ReturnProduct[];
}
