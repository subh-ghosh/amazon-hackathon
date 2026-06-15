"use client";

import Link from "next/link";
import { Star, Check, AlertTriangle, Info } from "lucide-react";
import type { Product } from "@/api/types";
import { useStore } from "@/hooks/useStore";

import { useState, useEffect } from "react";
import { preventionService } from "@/api/services";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart, persona } = useStore();
    const [insight, setInsight] = useState<{ type: "positive" | "caution" | "info"; badge: string; message: string } | null>(null);

    useEffect(() => {
        let isMounted = true;
        preventionService.analyze({
            customerId: persona === "TRUSTED" ? "CUST-GOOD-001" : "CUST-FRAUD-999",
            productId: product.product_id,
            category: product.category,
            productRating: product.rating,
            customerReturnRate: persona === "TRUSTED" ? 0.08 : 0.40,
            customerPurchaseCount: persona === "TRUSTED" ? 50 : 5,
            productReturnRate: product.category === "Footwear" || product.category === "Clothing" ? 0.25 : 0.08,
            sellerRating: 4.8,
            price: product.price,
        }).then(res => {
            if (!isMounted) return;
            let finalRiskLevel = res.riskLevel;
            // If the product is generally safe, do not punish the suspicious user
            if (res.riskLevel === "MEDIUM" && product.category !== "Footwear" && product.category !== "Clothing") {
                finalRiskLevel = "LOW";
            }

            const friendlyExplanations = res.explanation.filter(e => !e.includes("return history") && !e.includes("purchase history"));
            const safeMessage = friendlyExplanations.length > 0 ? friendlyExplanations[0] : "Review product details carefully";

            if (finalRiskLevel === "HIGH") {
                setInsight({
                    type: "caution",
                    badge: "High Risk",
                    message: safeMessage,
                });
            } else if (finalRiskLevel === "MEDIUM") {
                setInsight({
                    type: "info",
                    badge: "Fit Tip",
                    message: safeMessage,
                });
            } else {
                setInsight({
                    type: "positive",
                    badge: product.rating >= 4.7 ? "Popular Choice" : "Frequently Kept",
                    message: product.rating >= 4.7 ? "Highly rated — rarely returned" : "Customers who buy this keep it",
                });
            }
        }).catch(() => {
            if (isMounted) setInsight(getStaticProductInsight(product));
        });
        return () => { isMounted = false; };
    }, [product, persona]);

    return (
        <div className="card group flex flex-col h-full">
            <Link href={`/product/${product.product_id}`} className="block mb-3">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Removed overlay badges to keep UI clean and friendly */}
                </div>
            </Link>

            <div className="flex-1 flex flex-col">
                <Link href={`/product/${product.product_id}`}>
                    <h3 className="text-sm text-gray-900 line-clamp-2 hover:text-[#C7511F] mb-1">
                        {product.title}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-1">
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"} />
                        ))}
                    </div>
                    <span className="text-xs text-[#007185]">{product.reviews_count.toLocaleString()}</span>
                </div>

                {/* Price */}
                <div className="mb-1.5">
                    <span className="text-xl font-medium">${product.price.toFixed(2)}</span>
                </div>

                {/* Delivery */}
                <p className="text-xs text-gray-700 mb-2">
                    FREE delivery <span className="font-bold">{getDeliveryDate(product.delivery_days)}</span>
                </p>

                {/* Customer insight line */}
                <div className="h-4 mb-3">
                    {insight && (
                        <p className={`text-xs line-clamp-1 ${insight.type === "caution" ? "text-amber-700 font-medium" :
                                insight.type === "info" ? "text-blue-700 font-medium" :
                                    "text-emerald-700"
                            }`}>
                            {insight.message}
                        </p>
                    )}
                </div>

                <button onClick={() => addToCart(product)} className="btn-amazon w-full mt-auto text-sm">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

function getStaticProductInsight(product: Product): { type: "positive" | "caution" | "info"; badge: string; message: string } {
    if (product.category === "Footwear") {
        return { type: "caution", badge: "Check fit", message: "Sizing varies — check size guide before ordering" };
    }
    if (product.category === "Clothing") {
        return { type: "caution", badge: "Size varies", message: "Fit varies by brand — review size chart" };
    }
    if (product.category === "Furniture" && product.price > 1000) {
        return { type: "caution", badge: "Measure first", message: "Confirm dimensions match your space" };
    }
    if (product.rating >= 4.7) {
        return { type: "positive", badge: "Best Seller", message: "Customers frequently keep this item" };
    }
    if (product.category === "Electronics" && product.rating >= 4.5) {
        return { type: "positive", badge: "Top Rated", message: "Very low return rate" };
    }
    if (product.category === "Kitchen") {
        return { type: "positive", badge: "Popular", message: "Customers love this product" };
    }
    return { type: "positive", badge: "Well Reviewed", message: "Highly rated by buyers" };
}

function getDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
