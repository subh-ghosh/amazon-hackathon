"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ruler, AlertTriangle, Repeat, Eye, HelpCircle } from "lucide-react";
import { getProductById } from "@/data/products";
import type { ReturnReason } from "@/api/types";

const REASONS: { value: ReturnReason; label: string; icon: React.ReactNode }[] = [
    { value: "wrong_size", label: "Wrong size or fit", icon: <Ruler size={24} /> },
    { value: "defective", label: "Item damaged or defective", icon: <AlertTriangle size={24} /> },
    { value: "not_as_expected", label: "Not as described", icon: <Eye size={24} /> },
    { value: "changed_mind", label: "Changed my mind", icon: <Repeat size={24} /> },
    { value: "other", label: "Other reason", icon: <HelpCircle size={24} /> },
];

export default function ReturnRequestPage({ params }: { params: { orderId: string, productId: string } }) {
    const router = useRouter();
    const orderId = params.orderId;
    const productId = params.productId;
    const product = getProductById(productId);

    const [selected, setSelected] = useState<ReturnReason | null>(null);
    const [comment, setComment] = useState("");

    if (!product) {
        return <div className="max-w-[600px] mx-auto px-4 py-12 text-center"><p className="text-gray-500">Product not found</p></div>;
    }

    const handleContinue = () => {
        if (!selected) return;
        const returnId = `RET-${Date.now()}`;
        router.push(`/return-prevention?returnId=${returnId}&orderId=${orderId}&productId=${productId}&reason=${selected}&comment=${encodeURIComponent(comment)}`);
    };

    return (
        <div className="max-w-[600px] mx-auto px-4 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Why are you returning this item?</h1>

            {/* Product */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                <img src={product.image} alt={product.title} className="w-14 h-14 object-cover rounded" />
                <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                    <p className="text-xs text-gray-500">₹{Math.round(product.price * 83).toLocaleString("en-IN")}</p>
                </div>
            </div>

            {/* Reason cards */}
            <div className="space-y-2 mb-6">
                {REASONS.map((reason) => (
                    <button
                        key={reason.value}
                        onClick={() => setSelected(reason.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${selected === reason.value
                            ? "border-[#007185] bg-[#F0FAFA]"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                    >
                        <div className={`${selected === reason.value ? "text-[#007185]" : "text-gray-400"}`}>
                            {reason.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === reason.value ? "border-[#007185]" : "border-gray-300"}`}>
                            {selected === reason.value && <div className="w-2.5 h-2.5 rounded-full bg-[#007185]" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Comment */}
            {selected && (
                <div className="mb-6 animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anything else we should know? (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us more..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none h-20 focus:border-[#007185] focus:ring-1 focus:ring-[#007185] focus:outline-none"
                    />
                </div>
            )}

            <button
                onClick={handleContinue}
                disabled={!selected}
                className="btn-amazon w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Continue
            </button>
        </div>
    );
}
