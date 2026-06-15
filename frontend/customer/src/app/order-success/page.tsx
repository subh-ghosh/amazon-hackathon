"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Leaf, Truck, Package } from "lucide-react";

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("id") || "ORD-DEMO";

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    return (
        <div className="max-w-[800px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-green-700 mb-2">
                    Order Placed Successfully!
                </h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your order. We&apos;ll send a confirmation email shortly.
                </p>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Order Number</p>
                            <p className="font-bold text-blue-600">{orderId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Estimated Delivery</p>
                            <p className="font-bold">
                                {deliveryDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sustainability Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-3">
                        <Leaf className="text-green-600" size={20} />
                        <p className="font-bold text-green-800">Your Sustainability Contribution</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-700">2.3 kg</p>
                            <p className="text-xs text-green-600">CO₂ Saved</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">100%</p>
                            <p className="text-xs text-green-600">Recyclable Packaging</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">Optimal</p>
                            <p className="text-xs text-green-600">Route Selected</p>
                        </div>
                    </div>
                </div>

                {/* AI Confidence Summary */}
                <div className="ai-panel text-left mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🤖</span>
                        <p className="font-bold text-sm text-blue-900">AI Confidence Summary</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Package size={14} className="text-blue-600" />
                            <span className="text-xs text-gray-600">Purchase Confidence: <span className="font-bold text-green-700">High</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Truck size={14} className="text-blue-600" />
                            <span className="text-xs text-gray-600">Delivery Reliability: <span className="font-bold text-green-700">99%</span></span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => router.push("/orders")}
                        className="btn-amazon"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => router.push("/products")}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="max-w-[800px] mx-auto px-4 py-12"><div className="skeleton h-96 rounded-xl" /></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
