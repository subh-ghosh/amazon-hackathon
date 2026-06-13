export type ProductCategory =
  | "Smart Home"
  | "Electronics"
  | "Home & Kitchen"
  | "Apparel"
  | "Books";

export type ProductCondition = "New" | "Like new" | "Open box" | "Refurbished";

export interface CustomerSearchProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  listPrice: number;
  rating: number;
  reviewCount: number;
  returnRisk: number;
  purchaseSuccessScore: number;
  deliveryPromise: string;
  carbonSavedKg: number;
  relifeCertified: boolean;
  badges: string[];
  summary: string;
  color: "emerald" | "blue" | "amber" | "slate" | "rose";
}
