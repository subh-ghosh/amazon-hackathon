"use client";

import Link from "next/link";
import { Star, Check, AlertTriangle } from "lucide-react";
import type { Product } from "@/api/types";
import { useStore } from "@/hooks/useStore";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useStore();
    const insight = getProductInsight(product);

    return (
        <div className="card group flex flex-col h-full">
            <Link href={`/product/${product.product_id}`} className="block mb-3">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Risk overlay badge for risky items */}
                    {insight.type === "caution" && (
                        <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-1 flex items-center gap-1">
                            <AlertTriangle size={10} className="text-amber-600" />
                            <span className="text-[10px] font-medium text-amber-700">{insight.badge}</span>
                        </div>
                    )}
                    {insight.type === "positive" && (
                        <div className="absolute top-2 left-2 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex items-center gap-1">
                            <Check size={10} className="text-emerald-600" />
                            <span className="text-[10px] font-medium text-emerald-700">{insight.badge}</span>
                        </div>
                    )}
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
                <p className={`text-xs mb-3 ${insight.type === "caution" ? "text-amber-700" : "text-emerald-700"}`}>
                    {insight.message}
                </p>

                <button onClick={() => addToCart(product)} className="btn-amazon w-full mt-auto text-sm">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

function getProductInsight(product: Product): { type: "positive" | "caution"; badge: string; message: string } {
    // High-risk categories: Footwear, Clothing — these are the return prevention story
    if (product.category === "Footwear") {
        return {
            type: "caution",
            badge: "Check fit",
            message: "Frequently returned — check size guide before buying",
        };
    }
    if (product.category === "Clothing") {
        return {
            type: "caution",
            badge: "Size varies",
            message: "Fit varies by brand — review size chart",
        };
    }
    if (product.category === "Furniture" && product.price > 1000) {
        return {
            type: "caution",
            badge: "Measure first",
            message: "High-value item — confirm dimensions before ordering",
        };
    }

    // Safe categories
    if (product.rating >= 4.7) {
        return { type: "positive", badge: "Popular Choice", message: "Highly rated — rarely returned" };
    }
    if (product.category === "Electronics" && product.rating >= 4.5) {
        return { type: "positive", badge: "Frequently Kept", message: "Customers who buy this keep it" };
    }
    if (product.category === "Kitchen") {
        return { type: "positive", badge: "Frequently Kept", message: "Very low return rate" };
    }

    return { type: "positive", badge: "Good match", message: "Well-reviewed by similar shoppers" };
}

function getDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
