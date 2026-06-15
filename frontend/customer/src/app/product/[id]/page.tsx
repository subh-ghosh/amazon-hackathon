"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Star, ShoppingCart, Zap, Check, Truck, ShieldCheck, Leaf, AlertTriangle, Info } from "lucide-react";
import { getProductById } from "@/data/products";
import { useStore } from "@/hooks/useStore";
import { preventionService, sellerService, packagingService } from "@/api/services";
import type { PreventionAnalyzeResponse, SellerAnalyzeResponse, PackagingAnalyzeResponse } from "@/api/types";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useStore();
    const product = getProductById(params.id as string);

    const [prevention, setPrevention] = useState<PreventionAnalyzeResponse | null>(null);
    const [seller, setSeller] = useState<SellerAnalyzeResponse | null>(null);
    const [packaging, setPackaging] = useState<PackagingAnalyzeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!product) return;
        (async () => {
            setLoading(true);
            const [p, s, pkg] = await Promise.allSettled([
                preventionService.analyze({
                    customerId: "CUST-DEMO-001",
                    productId: product.product_id,
                    category: product.category,
                    productRating: product.rating,
                    customerReturnRate: 0.05,
                    customerPurchaseCount: 25,
                    productReturnRate: product.category === "Footwear" || product.category === "Clothing" ? 0.25 : 0.08,
                    sellerRating: product.rating,
                    price: product.price,
                }),
                sellerService.analyze({
                    sellerId: product.seller_id,
                    sellerName: product.brand,
                    totalOrders: 5000,
                    totalReturns: 250,
                    fraudCases: 3,
                    averageRating: product.rating,
                    packagingScore: 85.0,
                }),
                packagingService.analyze({
                    productId: product.product_id,
                    category: product.category,
                    productWeight: product.weight_kg,
                    packagingWeight: product.packaging_weight_kg,
                    packagingMaterial: product.packaging_material,
                    length: product.length_cm,
                    width: product.width_cm,
                    height: product.height_cm,
                }),
            ]);
            if (p.status === "fulfilled") setPrevention(p.value);
            if (s.status === "fulfilled") setSeller(s.value);
            if (pkg.status === "fulfilled") setPackaging(pkg.value);
            setLoading(false);
        })();
    }, [product]);

    if (!product) {
        return <div className="max-w-[1500px] mx-auto px-4 py-12 text-center"><p className="text-xl text-gray-500">Product not found</p></div>;
    }

    const handleBuyNow = () => { addToCart(product); router.push("/cart"); };

    const isHighRisk = prevention?.riskLevel === "HIGH" || prevention?.riskLevel === "MEDIUM";
    const insights = buildInsights(prevention, seller, packaging, product);

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-[#007185] mb-4 flex gap-1">
                <span className="hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => router.push("/")}>Amazon</span>
                <span className="text-gray-400">›</span>
                <span className="hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => router.push(`/products?category=${product.category}`)}>{product.category}</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-500">{product.brand}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Image */}
                <div className="lg:col-span-5">
                    <div className="sticky top-[120px] bg-white border border-gray-200 rounded-lg p-6">
                        <img src={product.image} alt={product.title} className="w-full aspect-square object-cover rounded" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-4">
                    <h1 className="text-2xl font-normal text-gray-900 leading-tight mb-2">{product.title}</h1>

                    <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">Visit the {product.brand} Store</span>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2 mb-3 pb-3 border-b border-gray-200">
                        <span className="text-sm text-[#007185]">{product.rating}</span>
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-sm text-[#007185]">{product.reviews_count.toLocaleString()} ratings</span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-[28px] font-light">${product.price.toFixed(2)}</span>
                    </div>

                    {/* === PREVENTION WARNING (high/medium risk) === */}
                    {!loading && isHighRisk && (
                        <div className="mb-4 bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-[#F57C00] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Before you buy</p>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {product.category === "Footwear"
                                            ? "This shoe is frequently returned due to sizing. Many customers find it runs small."
                                            : product.category === "Clothing"
                                                ? "Sizing varies for this item. Customers recommend checking the detailed size chart."
                                                : "This item is returned more often than similar products. Review details carefully."}
                                    </p>
                                    {prevention?.recommendedActions && prevention.recommendedActions.length > 0 && (
                                        <div className="bg-white rounded border border-gray-200 p-3 mt-2">
                                            <p className="text-xs font-medium text-gray-600 mb-1.5">Our suggestions:</p>
                                            <ul className="space-y-1">
                                                {prevention.recommendedActions.map((action, i) => (
                                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                                        <Info size={11} className="text-[#007185] mt-0.5 flex-shrink-0" />
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {prevention?.explanation && (
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                            Based on: {prevention.explanation.join(", ").toLowerCase()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === POSITIVE SIGNALS (low risk) === */}
                    {!loading && !isHighRisk && insights.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-200 animate-fade-in">
                            <div className="space-y-2">
                                {insights.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="mb-4 space-y-2">
                            <div className="skeleton h-4 w-3/4" />
                            <div className="skeleton h-4 w-1/2" />
                            <div className="skeleton h-4 w-2/3" />
                        </div>
                    )}

                    {/* About this item */}
                    <div className="mb-4">
                        <h3 className="font-bold text-base mb-2">About this item</h3>
                        <ul className="space-y-1.5">
                            {product.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-gray-400 mt-1">•</span>{f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Buy Box */}
                <div className="lg:col-span-3">
                    <div className="border border-gray-300 rounded-lg p-5 sticky top-[120px]">
                        <p className="text-[28px] font-light mb-1">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-700 mb-1">
                            FREE delivery <span className="font-bold">{getDeliveryDate(product.delivery_days)}</span>
                        </p>
                        <div className="flex items-center gap-1 text-sm text-emerald-700 mb-4">
                            <Truck size={14} /><span>In Stock</span>
                        </div>

                        {/* If high risk, add note in buy box */}
                        {!loading && isHighRisk && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2.5 mb-3 text-xs text-amber-800 flex items-start gap-2">
                                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                                <span>Higher return rate for this item — review product details before purchasing</span>
                            </div>
                        )}

                        <button onClick={() => addToCart(product)} className="btn-amazon w-full mb-2">Add to Cart</button>
                        <button onClick={handleBuyNow} className="btn-buy-now w-full">Buy Now</button>

                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between"><span>Ships from</span><span className="text-[#007185]">Amazon</span></div>
                            <div className="flex justify-between"><span>Sold by</span><span className="text-[#007185]">{product.brand}</span></div>
                            <div className="flex justify-between"><span>Returns</span><span className="text-[#007185]">FREE returns</span></div>
                        </div>

                        {/* Trust signals */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <ShieldCheck size={14} className="text-gray-400" /><span>Secure transaction</span>
                            </div>
                            {packaging && packaging.recyclabilityScore >= 80 && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Leaf size={14} className="text-emerald-500" /><span>Recyclable packaging</span>
                                </div>
                            )}
                            {seller && seller.sellerHealthScore >= 85 && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Check size={14} className="text-emerald-500" /><span>Trusted seller</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function buildInsights(
    prevention: PreventionAnalyzeResponse | null,
    seller: SellerAnalyzeResponse | null,
    packaging: PackagingAnalyzeResponse | null,
    product: { category: string; rating: number }
): string[] {
    const items: string[] = [];

    if (prevention && prevention.riskLevel === "LOW") {
        items.push("Customers who bought this item rarely return it");
    }
    if (seller && seller.sellerHealthScore >= 85) {
        items.push("Reliable seller with consistent quality");
    }
    if (seller && seller.returnsPer100Orders <= 5) {
        items.push("Low return rate — most buyers are satisfied");
    }
    if (packaging && packaging.recyclabilityScore >= 80) {
        items.push("Ships in recyclable, sustainable packaging");
    }
    if (product.rating >= 4.6) {
        items.push("Highly rated by verified purchasers");
    }
    if (prevention && prevention.confidence >= 0.9) {
        items.push("Good match based on your shopping history");
    }

    return items.slice(0, 5);
}

function getDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
