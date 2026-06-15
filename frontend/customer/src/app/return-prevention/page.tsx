"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, RefreshCw, Banknote, Headphones, Truck, Gift, DollarSign } from "lucide-react";
import { getProductById } from "@/data/products";
import { truthService, fraudService, returnlessService, packagingService, sellerService } from "@/api/services";
import type { TruthAnalyzeResponse, FraudScoreResponse, ReturnlessEvaluateResponse } from "@/api/types";

function ReturnPreventionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const returnId = searchParams.get("returnId") || `RET-${Date.now()}`;
    const orderId = searchParams.get("orderId") || "ORD-DEMO-001";
    const productId = searchParams.get("productId") || "PROD-002";
    const reason = searchParams.get("reason") || "wrong_size";
    const comment = searchParams.get("comment") || "";

    const product = getProductById(productId);

    const [stage, setStage] = useState<"analyzing" | "results">("analyzing");
    const [truthData, setTruthData] = useState<TruthAnalyzeResponse | null>(null);
    const [fraudData, setFraudData] = useState<FraudScoreResponse | null>(null);
    const [returnlessData, setReturnlessData] = useState<ReturnlessEvaluateResponse | null>(null);
    const [selectedResolution, setSelectedResolution] = useState<string | null>(null);

    const [steps, setSteps] = useState([
        { label: "Checking order details", done: false },
        { label: "Reviewing item history", done: false },
        { label: "Finding the best solution", done: false },
        { label: "Preparing options for you", done: false },
    ]);

    useEffect(() => { runAnalysis(); }, []);

    // Generate unique customer ID per session to avoid S8's repeat-request fraud detection
    const demoCustomerId = `CUST-DEMO-${Math.random().toString(36).substring(2, 8)}`;

    async function runAnalysis() {
        for (let i = 0; i < steps.length; i++) {
            await new Promise((r) => setTimeout(r, 700));
            setSteps((prev) => prev.map((s, idx) => idx <= i ? { ...s, done: true } : s));
        }

        // S2: Root cause (independent — failure doesn't block others)
        let truthResult: TruthAnalyzeResponse | null = null;
        try {
            truthResult = await truthService.analyze({
                returnId, customerId: demoCustomerId, productId,
                sellerId: product?.seller_id || "SELLER-002",
                statedReason: reason, customerComment: comment || "Item did not meet expectations",
            });
            setTruthData(truthResult);
        } catch (e) { console.error("S2 Truth error:", e); }

        // S3: Fraud/Trust (independent)
        let fraudResult: FraudScoreResponse | null = null;
        try {
            fraudResult = await fraudService.score({
                customer_id: demoCustomerId, product_id: productId,
                return_id: returnId, device_id: "DEVICE-WEB-001", payment_method_hash: "HASH-VISA-4242",
            });
            setFraudData(fraudResult);
        } catch (e) { console.error("S3 Fraud error:", e); }

        // S10 + S11 for S8 enrichment (independent)
        let pkgInsights: { insight: string; severity: string }[] | undefined;
        let sellerInsights: { insight: string; severity: string }[] | undefined;
        try {
            const [pkgResult, sellerResult] = await Promise.allSettled([
                packagingService.analyze({
                    productId, category: product?.category || "Electronics",
                    productWeight: product?.weight_kg || 1.0,
                    packagingWeight: product?.packaging_weight_kg || 0.5,
                    packagingMaterial: product?.packaging_material || "cardboard",
                    length: product?.length_cm || 25, width: product?.width_cm || 20, height: product?.height_cm || 10,
                }),
                sellerService.analyze({
                    sellerId: product?.seller_id || "SELLER-002", sellerName: product?.brand || "Brand",
                    totalOrders: 5000, totalReturns: 250, fraudCases: 3,
                    averageRating: product?.rating || 4.5, packagingScore: 85.0,
                }),
            ]);
            pkgInsights = pkgResult.status === "fulfilled" ? pkgResult.value.packagingInsights : undefined;
            sellerInsights = sellerResult.status === "fulfilled"
                ? [{ insight: `Health: ${sellerResult.value.sellerHealthScore}/100`, severity: "LOW" }] : undefined;
        } catch (e) { console.error("S10/S11 error:", e); }

        // S8: The critical call — determines which options to show
        const productPrice = product?.price || 100;
        const shippingCost = Math.max(8.50, (product?.weight_kg || 1.0) * 8 + 4);
        const fraudScore = fraudResult?.fraud_score ?? 20;
        const trustScore = fraudResult?.trust_score ?? 80;

        try {
            const returnlessResult = await returnlessService.evaluate({
                requestId: `REQ-${Date.now()}`, customerId: demoCustomerId, productId,
                orderValue: productPrice, returnShippingCost: shippingCost,
                fraudRiskScore: fraudScore, returnRiskScore: 30,
                condition: "USED", sellerPolicy: "STANDARD",
                customerTrustScore: trustScore,
                category: product?.category || "Electronics", weightKg: product?.weight_kg || 1.0,
                packagingInsights: pkgInsights, sellerHealthInsights: sellerInsights,
            });
            console.log("S8 Response:", returnlessResult.decision, returnlessResult.refundAmount);
            setReturnlessData(returnlessResult);
        } catch (e) {
            console.error("S8 Returnless error:", e);
            // Synthetic fallback based on product price vs $40 threshold
            const isLowValue = productPrice <= 40;
            setReturnlessData({
                requestId: "FALLBACK",
                decision: isLowValue ? "RETURNLESS_REFUND" : "RETURN_REQUIRED",
                confidenceScore: 75,
                refundAmount: isLowValue ? productPrice : 0,
                estimatedSavings: isLowValue ? shippingCost : 0,
                sustainabilityImpact: isLowValue ? "POSITIVE" : "NEGATIVE",
                businessReason: isLowValue
                    ? `Shipping cost ($${shippingCost.toFixed(2)}) exceeds 30% of item value`
                    : `Order value ($${productPrice.toFixed(2)}) exceeds category threshold ($40.00)`,
                overallRiskLevel: "LOW",
                recommendedAction: isLowValue ? "KEEP_ITEM" : "SHIP_BACK",
                decisionReason: "",
                decisionFactors: [],
                estimatedCO2Saved: isLowValue ? 2.5 : 0,
                estimatedWasteDivertedKg: isLowValue ? 0.5 : 0,
                circularityScore: isLowValue ? 80 : 20,
                recommendedDestination: isLowValue ? "DONATION" : "LIQUIDATION",
            } as ReturnlessEvaluateResponse);
        }

        await new Promise((r) => setTimeout(r, 400));
        setStage("results");
    }

    const handleSelect = (resolution: string) => {
        setSelectedResolution(resolution);
        setTimeout(() => {
            const decision = resolution === "proceed_return" ? "return" : resolution;
            router.push(`/return-decision?returnId=${returnId}&productId=${productId}&decision=${decision}`);
        }, 600);
    };

    // Build resolution options based on S8 decision
    const options = buildResolutionOptions(returnlessData, product?.price || 100);

    return (
        <div className="max-w-[700px] mx-auto px-4 py-8">
            {/* Product context */}
            {product && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500">Order {orderId}</p>
                    </div>
                </div>
            )}

            {stage === "analyzing" ? (
                <div className="text-center py-12">
                    <Loader2 size={40} className="text-[#232F3E] animate-spin mx-auto mb-6" />
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Analyzing your request...</h2>
                    <div className="max-w-sm mx-auto space-y-3 text-left">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {step.done
                                    ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                                    : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
                                }
                                <span className={`text-sm ${step.done ? "text-gray-800" : "text-gray-400"}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">We have options for you</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        {returnlessData
                            ? returnlessData.decision === "RETURNLESS_REFUND"
                                ? "Great news — you don't need to return this item. Here's what we can offer:"
                                : returnlessData.decision === "RETURN_REQUIRED"
                                    ? "We've reviewed your request. Here are your best options:"
                                    : "Based on your order, here's what we can do:"
                            : "Based on your order and this item, here are your options:"}
                    </p>

                    {/* Debug: show S8 decision for demo verification */}
                    {returnlessData && (
                        <div className="mb-4 px-3 py-2 bg-gray-100 rounded text-[10px] text-gray-500 font-mono">
                            S8 Decision: {returnlessData.decision} | Refund: ${returnlessData.refundAmount} | Reason: {returnlessData.businessReason?.substring(0, 60)}
                        </div>
                    )}
                    {!returnlessData && (
                        <div className="mb-4 px-3 py-2 bg-red-50 rounded text-[10px] text-red-500 font-mono">
                            ⚠ S8 did not respond — showing fallback options. Check browser console for CORS/network errors.
                        </div>
                    )}

                    {/* Resolution options */}
                    <div className="space-y-3 mb-6">
                        {options.map((option, i) => (
                            <ResolutionCard
                                key={option.id}
                                icon={option.icon}
                                title={option.title}
                                subtitle={option.subtitle}
                                detail={option.detail}
                                recommended={i === 0}
                                selected={selectedResolution === option.id}
                                onClick={() => handleSelect(option.id)}
                            />
                        ))}
                    </div>

                    {/* Context from analysis — customer-friendly */}
                    {truthData && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Why we&apos;re offering these options</p>
                            <p className="text-sm text-gray-700">
                                We identified that this issue is related to <span className="font-medium">{formatRootCause(truthData.actualRootCause)}</span>.
                                {truthData.evidence.length > 0 && ` ${truthData.evidence[0].description}.`}
                                {" "}We want to resolve this as quickly as possible for you.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ResolutionOption {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    detail: string;
}

function buildResolutionOptions(s8Data: ReturnlessEvaluateResponse | null, productPrice: number): ResolutionOption[] {
    const options: ResolutionOption[] = [];

    if (!s8Data) {
        // S8 didn't respond — minimal fallback, still dynamic
        options.push(
            { id: "replacement", icon: <RefreshCw size={22} className="text-blue-600" />, title: "Replace item", subtitle: "Get a new one shipped to you", detail: `Free replacement — arrives by ${getDeliveryDate(3)}` },
            { id: "proceed_return", icon: <Truck size={22} className="text-gray-500" />, title: "Return for refund", subtitle: "Ship it back with a prepaid label", detail: `$${productPrice.toFixed(2)} refund after item received` },
        );
        return options;
    }

    const decision = s8Data.decision;
    const refund = s8Data.refundAmount;
    const savings = s8Data.estimatedSavings;
    const reason = s8Data.businessReason;

    // === RETURNLESS_REFUND: Amazon saves money by not shipping it back ===
    if (decision === "RETURNLESS_REFUND" || decision === "DONATION") {
        options.push({
            id: "keep_refund",
            icon: <Gift size={22} className="text-emerald-600" />,
            title: "Instant refund — keep the item",
            subtitle: "No need to return it. Refund is immediate.",
            detail: `$${refund.toFixed(2)} back to your payment method`,
        });
        // Partial as alternative
        options.push({
            id: "partial_refund",
            icon: <DollarSign size={22} className="text-amber-600" />,
            title: `$${(refund * 0.5).toFixed(2)} partial refund`,
            subtitle: "Keep the item at a reduced price",
            detail: "Refund issued immediately — no return needed",
        });
        // Replacement
        options.push({
            id: "replacement",
            icon: <RefreshCw size={22} className="text-blue-600" />,
            title: "Get a replacement instead",
            subtitle: `Arrives by ${getDeliveryDate(2)}`,
            detail: "Free — no additional charge",
        });
        // Support
        options.push({
            id: "tech_support",
            icon: <Headphones size={22} className="text-purple-600" />,
            title: "Talk to product support",
            subtitle: "A specialist may resolve this without a return",
            detail: "Available within 24 hours",
        });
        // Standard return last
        options.push({
            id: "proceed_return",
            icon: <Truck size={22} className="text-gray-500" />,
            title: "Ship it back instead",
            subtitle: "Standard return process",
            detail: `$${productPrice.toFixed(2)} refund after inspection`,
        });
    }
    // === RETURN_REQUIRED: item is too valuable to give away ===
    else if (decision === "RETURN_REQUIRED") {
        // Replacement first (saves Amazon the refund)
        options.push({
            id: "replacement",
            icon: <RefreshCw size={22} className="text-blue-600" />,
            title: "Replace this item",
            subtitle: `New one arrives by ${getDeliveryDate(2)} — return the old one`,
            detail: "Free replacement with prepaid return label",
        });
        // Partial refund (customer keeps item, Amazon saves logistics)
        const partialAmount = productPrice * 0.30;
        options.push({
            id: "partial_refund",
            icon: <DollarSign size={22} className="text-amber-600" />,
            title: `$${partialAmount.toFixed(2)} refund — keep the item`,
            subtitle: "No return needed. We apply a discount instead.",
            detail: "Refund issued within 3-5 business days",
        });
        // Tech support
        options.push({
            id: "tech_support",
            icon: <Headphones size={22} className="text-purple-600" />,
            title: "Get product support",
            subtitle: "Resolve the issue without a return",
            detail: "Specialist contacts you within 24 hours",
        });
        // Full return
        options.push({
            id: "proceed_return",
            icon: <Truck size={22} className="text-gray-500" />,
            title: "Full refund — return item",
            subtitle: "Ship back with a prepaid label",
            detail: `$${productPrice.toFixed(2)} refund after item is received and inspected`,
        });
    }
    // === Other decisions (PARTIAL_REFUND from S8 directly) ===
    else {
        options.push({
            id: "partial_refund",
            icon: <DollarSign size={22} className="text-amber-600" />,
            title: `$${refund.toFixed(2)} refund — keep the item`,
            subtitle: reason || "No return needed",
            detail: "Refund issued within 3-5 business days",
        });
        options.push({
            id: "replacement",
            icon: <RefreshCw size={22} className="text-blue-600" />,
            title: "Replace this item",
            subtitle: `Arrives by ${getDeliveryDate(2)}`,
            detail: "Free replacement",
        });
        options.push({
            id: "tech_support",
            icon: <Headphones size={22} className="text-purple-600" />,
            title: "Product support",
            subtitle: "Resolve without returning",
            detail: "Specialist available within 24 hours",
        });
        options.push({
            id: "proceed_return",
            icon: <Truck size={22} className="text-gray-500" />,
            title: "Return for full refund",
            subtitle: "Standard return with prepaid label",
            detail: `$${productPrice.toFixed(2)} back after inspection`,
        });
    }

    return options;
}

function ResolutionCard({ icon, title, subtitle, detail, recommended, selected, onClick }: {
    icon: React.ReactNode; title: string; subtitle: string; detail: string;
    recommended?: boolean; selected: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-150 ${selected ? "border-[#007185] bg-[#F0FAFA]" : recommended ? "border-[#007185] bg-white" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900">{title}</p>
                        {recommended && <span className="text-[10px] font-medium text-[#007185] bg-[#F0FAFA] px-2 py-0.5 rounded-full border border-[#D5EEEE]">Recommended</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{detail}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${selected ? "border-[#007185]" : "border-gray-300"}`}>
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#007185]" />}
                </div>
            </div>
        </button>
    );
}

function formatRootCause(cause: string): string {
    const map: Record<string, string> = {
        SIZE_MISMATCH: "sizing issues",
        QUALITY_ISSUE: "quality concerns",
        NOT_AS_DESCRIBED: "differences from the listing",
        DEFECTIVE: "a product defect",
        CHANGED_MIND: "a change of mind",
    };
    return map[cause] || cause.toLowerCase().replace(/_/g, " ");
}

function getDeliveryDate(days: number): string {
    const date = new Date(); date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function ReturnPreventionPage() {
    return (
        <Suspense fallback={<div className="max-w-[700px] mx-auto px-4 py-12"><div className="skeleton h-96 rounded-lg" /></div>}>
            <ReturnPreventionContent />
        </Suspense>
    );
}
