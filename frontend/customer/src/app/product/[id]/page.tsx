"use client";
export const runtime = 'edge';

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, ShoppingCart, Zap, Check, Truck, ShieldCheck, Leaf, AlertTriangle, Info, MapPin } from "lucide-react";
import { getProductById } from "@/data/products";
import { useStore } from "@/hooks/useStore";
import { preventionService, sellerService, packagingService } from "@/api/services";
import type { PreventionAnalyzeResponse, SellerAnalyzeResponse, PackagingAnalyzeResponse } from "@/api/types";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRenewed = searchParams.get("variant") === "renewed";
    const { addToCart, persona, earnCredits } = useStore();
    const product = getProductById(params.id);

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
                    customerId: persona === "TRUSTED" ? "CUST-GOOD-001" : "CUST-FRAUD-999",
                    productId: product.product_id,
                    category: product.category,
                    productRating: product.rating,
                    customerReturnRate: persona === "TRUSTED" ? 0.08 : 0.40,
                    customerPurchaseCount: persona === "TRUSTED" ? 50 : 5,
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
            let finalPrevention = p.status === "fulfilled" ? p.value : null;

            // Override for safe products so Suspicious user isn't punished for product that is fine
            if (finalPrevention && finalPrevention.riskLevel === "MEDIUM" && product.category !== "Footwear" && product.category !== "Clothing") {
                finalPrevention = { ...finalPrevention, riskLevel: "LOW" };
            }
            setPrevention(finalPrevention);
            if (s.status === "fulfilled") setSeller(s.value);
            if (pkg.status === "fulfilled") setPackaging(pkg.value);
            setLoading(false);
        })();
    }, [product, persona]);

    if (!product) {
        return <div className="max-w-[1500px] mx-auto px-4 py-12 text-center"><p className="text-xl text-gray-500">Product not found</p></div>;
    }

    const handleBuyNow = () => {
        const cartProduct = isRenewed ? { ...product, price: product.price * 0.70 } : product;
        addToCart(cartProduct);
        if (isRenewed) earnCredits("Purchased Renewed item", 50);
        router.push("/cart");
    };

    const isHighRisk = prevention?.riskLevel === "HIGH" || prevention?.riskLevel === "MEDIUM";
    const insights = buildInsights(prevention, seller, packaging, product);
    const basePrice = isRenewed ? product.price * 0.70 : product.price;
    const inrPrice = Math.round(basePrice * 83);
    const mrp = Math.round(product.price * 83 * 1.25);
    const discount = Math.round(((mrp - inrPrice) / mrp) * 100);
    const emi = Math.round(inrPrice / 9);

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-[#007185] mb-4 flex gap-1 flex-wrap">
                <span className="hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => router.push("/")}>Amazon</span>
                <span className="text-gray-400">›</span>
                <span className="hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => router.push(`/products?category=${product.category}`)}>{product.category}</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-500 truncate">{product.brand}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Image */}
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-[120px] bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <img src={product.image} alt={product.title} className="w-full aspect-square object-cover rounded" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-4">
                    {isRenewed && (
                        <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 animate-fade-in">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">Amazon Renewed</span>
                                <span className="text-xs text-emerald-700 font-medium">Certified & Guaranteed</span>
                            </div>
                            <p className="text-xs text-emerald-800">Professionally inspected, tested, and cleaned by Amazon-qualified suppliers. 90-day replacement guarantee.</p>
                        </div>
                    )}
                    <h1 className="text-[28px] font-light text-gray-900 leading-tight mb-2 tracking-tight">
                        {isRenewed ? `(Renewed) ${product.title}` : product.title}
                    </h1>

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
                        <div className="flex items-baseline gap-2">
                            <span className="text-[13px] text-[#CC0C39] font-medium">-{discount}%</span>
                            <span className="text-[28px] font-light">₹{inrPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-sm text-gray-500">M.R.P.: <span className="line-through">₹{mrp.toLocaleString("en-IN")}</span></p>
                        {inrPrice >= 3000 && (
                            <p className="text-sm text-gray-700 mt-1">
                                EMI from <span className="font-bold">₹{emi.toLocaleString("en-IN")}/month</span>. No Cost EMI available.
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>

                    {/* Offers section */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold">Offers</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="border border-gray-200 rounded-lg p-2.5">
                                <p className="text-xs font-bold text-gray-900">No Cost EMI</p>
                                <p className="text-[11px] text-gray-600 line-clamp-2">EMI from ₹{emi.toLocaleString("en-IN")} on select cards</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-2.5">
                                <p className="text-xs font-bold text-gray-900">Bank Offer</p>
                                <p className="text-[11px] text-gray-600 line-clamp-2">10% off on SBI Credit Card up to ₹1,500</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-2.5">
                                <p className="text-xs font-bold text-gray-900">Cashback</p>
                                <p className="text-[11px] text-gray-600 line-clamp-2">5% cashback with Amazon Pay ICICI card</p>
                            </div>
                        </div>
                    </div>

                    {/* Service badges row */}
                    <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-gray-200 text-xs text-gray-600">
                        <div className="text-center">
                            <Truck size={16} className="mx-auto mb-1 text-gray-500" />
                            <p>Free Delivery</p>
                        </div>
                        <div className="text-center">
                            <ShieldCheck size={16} className="mx-auto mb-1 text-gray-500" />
                            <p>1 Year Warranty</p>
                        </div>
                        <div className="text-center">
                            <Zap size={16} className="mx-auto mb-1 text-gray-500" />
                            <p>Pay on Delivery</p>
                        </div>
                        <div className="text-center">
                            <Check size={16} className="mx-auto mb-1 text-gray-500" />
                            <p>Top Brand</p>
                        </div>
                    </div>

                    {/* === PREVENTION WARNING (high/medium risk) === */}
                    {!loading && isHighRisk && (
                        <div className={`mb-4 border rounded-lg p-4 animate-fade-in ${prevention?.riskLevel === "HIGH" ? "bg-[#FFF8E1] border-[#FFE082]" : "bg-blue-50 border-blue-200"}`}>
                            <div className="flex items-start gap-3">
                                {prevention?.riskLevel === "HIGH" ? (
                                    <AlertTriangle size={20} className="text-[#F57C00] flex-shrink-0 mt-0.5" />
                                ) : (
                                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                        {prevention?.riskLevel === "HIGH" ? "Before you buy" : "Helpful Tip"}
                                    </p>
                                    <p className={`text-sm mb-2 ${prevention?.riskLevel === "HIGH" ? "text-gray-700" : "text-blue-800"}`}>
                                        {prevention?.explanation && prevention.explanation.filter(e => !e.includes("return history") && !e.includes("purchase history")).length > 0
                                            ? prevention.explanation.filter(e => !e.includes("return history") && !e.includes("purchase history")).join(". ") + "."
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
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === SELLER WARNING === */}
                    {!loading && seller && seller.sellerHealthScore < 80 && (
                        <div className="mb-4 bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-[#F57C00] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Seller Performance Notice</p>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {seller.topIssues && seller.topIssues.length > 0
                                            ? seller.topIssues[0]
                                            : "This seller has a lower than average health score."}
                                    </p>
                                    {seller.recommendations && seller.recommendations.length > 0 && (
                                        <div className="bg-white rounded border border-gray-200 p-3 mt-2">
                                            <p className="text-xs font-medium text-gray-600 mb-1.5">Actionable Advice:</p>
                                            <ul className="space-y-1">
                                                {seller.recommendations.map((action, i) => (
                                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                                        <Info size={11} className="text-[#007185] mt-0.5 flex-shrink-0" />
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
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

                    {/* Product specifications table */}
                    <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                        <h3 className="font-bold text-base mb-3">Technical Details</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium w-1/3">Brand</td><td className="py-2 text-gray-900">{product.brand}</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Category</td><td className="py-2 text-gray-900">{product.category}</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Weight</td><td className="py-2 text-gray-900">{product.weight_kg} kg</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Dimensions</td><td className="py-2 text-gray-900">{product.length_cm} × {product.width_cm} × {product.height_cm} cm</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Packaging</td><td className="py-2 text-gray-900 capitalize">{product.packaging_material} ({product.packaging_weight_kg} kg)</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Seller</td><td className="py-2 text-[#007185]">{product.brand} India Official</td></tr>
                                    <tr><td className="py-2 pr-4 text-gray-500 font-medium">Item ID</td><td className="py-2 text-gray-900 font-mono text-xs break-all">{product.product_id}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Buy Box */}
                <div className="lg:col-span-3">
                    <div className="border border-gray-300 rounded-lg p-4 sm:p-5 lg:sticky lg:top-[120px]">
                        <p className="text-[28px] font-light mb-1">₹{inrPrice.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-gray-500 mb-2">M.R.P.: <span className="line-through">₹{mrp.toLocaleString("en-IN")}</span> ({discount}% off)</p>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-white bg-[#232F3E] px-1.5 py-0.5 rounded">Fulfilled</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                            FREE delivery <span className="font-bold">{getDeliveryDate(product.delivery_days)}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-1">Or fastest delivery tomorrow. Order within <span className="text-emerald-700 font-medium">7 hrs 24 mins</span></p>
                        <div className="flex items-center gap-1.5 mb-1">
                            <MapPin size={12} className="text-gray-500" />
                            <span className="text-xs text-[#007185]">Deliver to Bangalore 560001</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-emerald-700 mb-4 mt-2 font-medium">
                            <Check size={14} /><span>In Stock</span>
                        </div>

                        {/* If high risk, add note in buy box */}
                        {!loading && isHighRisk && (
                            <div className={`${prevention?.riskLevel === "HIGH" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800"} border rounded p-2.5 mb-3 text-xs flex items-start gap-2`}>
                                {prevention?.riskLevel === "HIGH" ? (
                                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                                ) : (
                                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                                )}
                                <span>{prevention?.riskLevel === "HIGH" ? "Higher return rate for this item — review product details before purchasing" : "Review product details and fit carefully"}</span>
                            </div>
                        )}

                        <button onClick={() => {
                            const cartProduct = isRenewed ? { ...product, price: product.price * 0.70 } : product;
                            addToCart(cartProduct);
                            if (isRenewed) earnCredits("Purchased Renewed item", 50);
                        }} className="btn-amazon w-full mb-2 min-h-[44px]">Add to Cart</button>
                        <button onClick={handleBuyNow} className="btn-buy-now w-full min-h-[44px]">Buy Now</button>

                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between"><span>Ships from</span><span className="text-[#007185]">Amazon</span></div>
                            <div className="flex justify-between"><span>Sold by</span><span className="text-[#007185]">{product.brand} India</span></div>
                            <div className="flex justify-between"><span>Returns</span><span className="text-[#007185]">10 days return policy</span></div>
                            <div className="flex justify-between"><span>Payment</span><span className="text-[#007185]">Secure transaction</span></div>
                        </div>

                        {/* Trust signals */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <ShieldCheck size={14} className="text-gray-400" /><span>Secure transaction</span>
                            </div>
                            {packaging && packaging.recyclabilityScore >= 80 && (
                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Leaf size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>Recyclable packaging</span>
                                </div>
                            )}
                            {seller && seller.sellerHealthScore >= 85 && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Check size={14} className="text-emerald-500" /><span>Trusted seller</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Also available Renewed — only for categories that can be renewed, and not when already viewing renewed */}
                    {!isRenewed && ["Electronics", "Furniture", "Home", "Kitchen"].includes(product.category) && (
                        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2">Also available</p>
                            <Link href={`/product/${product.product_id}?variant=renewed`} className="flex items-center justify-between group">
                                <div>
                                    <p className="text-sm font-medium text-[#007185] group-hover:text-[#C7511F] group-hover:underline">
                                        Certified Renewed — ₹{Math.round(product.price * 0.70 * 83).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Like new. Inspected and guaranteed. Save ₹{Math.round(product.price * 0.30 * 83).toLocaleString("en-IN")}.
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-white bg-[#CC0C39] px-2 py-0.5 rounded">
                                    -30%
                                </span>
                            </Link>
                        </div>
                    )}
                    {/* Link back to new version when viewing renewed */}
                    {isRenewed && (
                        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2">Also available</p>
                            <Link href={`/product/${product.product_id}`} className="group">
                                <p className="text-sm font-medium text-[#007185] group-hover:text-[#C7511F] group-hover:underline">
                                    Buy New — ₹{Math.round(product.price * 83).toLocaleString("en-IN")}
                                </p>
                            </Link>
                        </div>
                    )}
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

    // 1. S1 Prevention Engine
    if (prevention && prevention.riskLevel === "LOW") {
        items.push("Customers who bought this item rarely return it");
    }

    // 2. S11 Seller Intelligence
    if (seller && seller.sellerHealthScore >= 85) {
        items.push("Reliable seller with consistent quality");
    }
    // Only push seller insights if they are positive (i.e. score is good)
    if (seller && seller.returnsPer100Orders <= 5) {
        if (seller.insights && seller.insights.length > 0 && !seller.insights[0].includes("benchmark")) {
            items.push(seller.insights[0]);
        } else {
            items.push("Low return rate — most buyers are satisfied");
        }
    }

    // 3. S10 Packaging Intelligence
    if (packaging && packaging.recyclabilityScore >= 80) {
        // Find a positive packaging recommendation if it exists
        const positiveRec = packaging.recommendations?.find(r => r.includes("optimized"));
        if (positiveRec) {
            items.push(positiveRec);
        } else {
            items.push("Ships in recyclable, sustainable packaging");
        }
    }

    if (product.rating >= 4.6) {
        items.push("Highly rated by verified purchasers");
    }

    return items.filter(Boolean).slice(0, 5);
}

function getDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
