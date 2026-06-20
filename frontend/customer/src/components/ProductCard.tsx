"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/api/types";
import { useStore } from "@/hooks/useStore";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useStore();
    const insight = getStaticProductInsight(product);
    const inrPrice = Math.round(product.price * 83);
    const mrp = Math.round(inrPrice * 1.25); // Show MRP 25% higher
    const discount = Math.round(((mrp - inrPrice) / mrp) * 100);

    return (
        <div className="card group flex flex-col h-full">
            <Link href={`/product/${product.product_id}`} className="block mb-3">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.rating >= 4.7 && (
                        <span className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[10px] font-bold px-2 py-0.5 rounded">Best Seller</span>
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
                    <span className="text-xs text-[#007185]">{product.reviews_count.toLocaleString("en-IN")}</span>
                </div>

                {/* Price — Indian style */}
                <div className="mb-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-medium">₹{inrPrice.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-[#CC0C39] font-medium">({discount}% off)</span>
                    </div>
                    {inrPrice >= 3000 && (
                        <p className="text-[11px] text-gray-500">EMI from ₹{Math.round(inrPrice / 6).toLocaleString("en-IN")}/mo</p>
                    )}
                </div>

                {/* Fulfilled + Delivery */}
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-white bg-[#232F3E] px-1.5 py-0.5 rounded">Fulfilled</span>
                    <span className="text-xs text-gray-600">FREE delivery <span className="font-bold">{getDeliveryDate(product.delivery_days)}</span></span>
                </div>

                {/* Insight line */}
                <p className={`text-xs mb-3 line-clamp-1 ${insight.type === "caution" ? "text-amber-700" : insight.type === "info" ? "text-blue-700" : "text-emerald-700"}`}>
                    {insight.message}
                </p>

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
        return { type: "info", badge: "Size varies", message: "Fit varies by brand — review size chart" };
    }
    if (product.category === "Furniture" && product.price > 1000) {
        return { type: "info", badge: "Measure first", message: "Confirm dimensions match your space" };
    }
    if (product.rating >= 4.7) {
        return { type: "positive", badge: "Best Seller", message: "Highly rated — rarely returned" };
    }
    if (product.category === "Electronics" && product.rating >= 4.5) {
        return { type: "positive", badge: "Top Rated", message: "Very low return rate in this category" };
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
