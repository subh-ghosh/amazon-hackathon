"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, MapPin, Clock, Tag } from "lucide-react";
import { getProductById } from "@/data/products";
import { useState } from "react";

function ReturnDecisionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const returnId = searchParams.get("returnId") || "RET-DEMO";
    const productId = searchParams.get("productId") || "PROD-002";
    const decision = searchParams.get("decision") || "keep_refund";
    const product = getProductById(productId);
    const [dropoffMethod, setDropoffMethod] = useState<"ups" | "wholefoods">("wholefoods");

    const isReturn = decision === "return";
    const refundAmount = product?.price || 150;
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 2);

    return (
        <div className="max-w-[600px] mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-gray-900 mb-1">{getTitle(decision)}</h1>
                <p className="text-sm text-gray-600">{getSubtitle(decision)}</p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-5 mb-6 animate-slide-up">
                <div className="space-y-3">
                    <DetailRow label="Return ID" value={returnId} />
                    <DetailRow label="Refund amount" value={`$${decision === "partial_refund" ? (refundAmount * 0.5).toFixed(2) : refundAmount.toFixed(2)}`} highlight />
                    <DetailRow label="Timeline" value={isReturn ? "5-7 business days after delivery" : "3-5 business days"} />
                </div>
            </div>

            {/* Dynamic Drop-off Incentives (S7/S9 Gamification) */}
            {isReturn && (
                <div className="mb-8 animate-fade-in">
                    <p className="text-sm font-medium text-gray-900 mb-3">Choose Drop-off Method</p>
                    <div className="space-y-3">
                        {/* Option 1: Whole Foods (Optimal routing) */}
                        <button
                            onClick={() => setDropoffMethod("wholefoods")}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${
                                dropoffMethod === "wholefoods" ? "border-[#007185] bg-[#F0FAFA]" : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                RECOMMENDED
                            </div>
                            <MapPin className={`mt-0.5 ${dropoffMethod === "wholefoods" ? "text-[#007185]" : "text-gray-400"}`} size={20} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Whole Foods Market</p>
                                <p className="text-xs text-gray-500 mt-0.5">Box-free, label-free return.</p>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-flex">
                                    <Tag size={12} /> Earn $2 Amazon Promo Credit
                                </div>
                            </div>
                            <div className={`ml-auto mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${dropoffMethod === "wholefoods" ? "border-[#007185]" : "border-gray-300"}`}>
                                {dropoffMethod === "wholefoods" && <div className="w-2.5 h-2.5 rounded-full bg-[#007185]" />}
                            </div>
                        </button>

                        {/* Option 2: UPS (Standard) */}
                        <button
                            onClick={() => setDropoffMethod("ups")}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                                dropoffMethod === "ups" ? "border-[#007185] bg-[#F0FAFA]" : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                            <MapPin className={`mt-0.5 ${dropoffMethod === "ups" ? "text-[#007185]" : "text-gray-400"}`} size={20} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">UPS Store Drop-off</p>
                                <p className="text-xs text-gray-500 mt-0.5">Requires box. We print the label.</p>
                            </div>
                            <div className={`ml-auto mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${dropoffMethod === "ups" ? "border-[#007185]" : "border-gray-300"}`}>
                                {dropoffMethod === "ups" && <div className="w-2.5 h-2.5 rounded-full bg-[#007185]" />}
                            </div>
                        </button>
                    </div>

                    {/* Speed Bounty Banner */}
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                        <Clock className="text-orange-600 mt-0.5 flex-shrink-0" size={18} />
                        <div>
                            <p className="text-sm font-medium text-orange-900">Speed Bonus: Fast Drop-off</p>
                            <p className="text-xs text-orange-800 mt-0.5">Drop this off within <strong>24 hours</strong> to receive your refund instantly. Otherwise, refunds are processed after inspection.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Product */}
            {product && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg mb-6">
                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* What's next */}
            <div className="mb-8">
                <p className="text-sm font-medium text-gray-900 mb-2">What happens next</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                    {getNextSteps(decision).map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            {step}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                {isReturn && (
                    <button onClick={() => router.push(`/return-journey?returnId=${returnId}&productId=${productId}`)} className="btn-amazon w-full flex items-center justify-center gap-2">
                        Track Return <ArrowRight size={16} />
                    </button>
                )}
                <button onClick={() => router.push("/orders")} className="btn-secondary w-full">
                    Back to Your Orders
                </button>
            </div>
        </div>
    );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-medium ${highlight ? "text-emerald-700" : "text-gray-900"}`}>{value}</span>
        </div>
    );
}

function getTitle(decision: string): string {
    switch (decision) {
        case "keep_refund": return "Refund on its way";
        case "partial_refund": return "Partial refund issued";
        case "replacement": return "Replacement is on its way";
        case "tech_support": return "Support request confirmed";
        case "return": return "Return approved";
        default: return "Request confirmed";
    }
}

function getSubtitle(decision: string): string {
    switch (decision) {
        case "keep_refund": return "No need to return the item. Your refund has been initiated.";
        case "replacement": return "A new item will be shipped to you shortly.";
        case "tech_support": return "A specialist will contact you within 24 hours.";
        case "return": return "Use the prepaid label to ship your item back.";
        default: return "We've processed your request.";
    }
}

function getNextSteps(decision: string): string[] {
    switch (decision) {
        case "keep_refund": return ["Refund will appear on your statement in 3-5 business days", "No further action needed", "You may keep or donate the item"];
        case "replacement": return ["Replacement ships within 24 hours", "You'll receive a tracking number by email", "No need to return the original item"];
        case "tech_support": return ["A specialist will call or email you", "Have your order number ready", "Support hours: 8am–10pm"];
        case "return": return ["A prepaid label has been sent to your email", "Pack the item securely and drop off at any carrier location", "Refund processes after inspection (typically 2-3 days)"];
        default: return ["We'll send a confirmation email shortly"];
    }
}

export default function ReturnDecisionPage() {
    return (
        <Suspense fallback={<div className="max-w-[600px] mx-auto px-4 py-12"><div className="skeleton h-64 rounded-lg" /></div>}>
            <ReturnDecisionContent />
        </Suspense>
    );
}
