"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Leaf, Truck } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import type { Address } from "@/api/types";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getCartTotal, placeOrder } = useStore();
    const total = getCartTotal();

    const [address, setAddress] = useState<Address>({
        name: "Rahul Sharma",
        street: "42 MG Road, Indiranagar",
        city: "Bangalore",
        state: "KA",
        zip: "560038",
        country: "India",
    });

    const [processing, setProcessing] = useState(false);

    if (cart.length === 0) {
        if (typeof window !== "undefined") {
            router.push("/cart");
        }
        return null;
    }

    const handlePlaceOrder = async () => {
        setProcessing(true);
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const order = placeOrder(address);
        router.push(`/order-success?id=${order.order_id}`);
    };

    const tax = total * 0.08;
    const grandTotal = total + tax;

    return (
        <div className="max-w-[1000px] mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Checkout Form */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">1. Shipping Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={address.name}
                                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    defaultValue="(555) 123-4567"
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                                    <input
                                        type="text"
                                        value={address.zip}
                                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amazon-yellow focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">2. Payment Method</h2>
                        <div className="border rounded-lg p-4 flex items-center gap-3 bg-gray-50">
                            <input type="radio" checked readOnly name="payment" id="card" className="accent-amazon-yellow" />
                            <label htmlFor="card" className="flex-1">
                                <p className="font-medium text-sm">Visa ending in 4242</p>
                                <p className="text-xs text-gray-500">Rahul Sharma</p>
                            </label>
                            <Lock size={16} className="text-gray-400" />
                        </div>
                    </div>

                    {/* Delivery */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">3. Delivery Options</h2>
                        <div className="border rounded-lg p-4 flex items-center gap-3 bg-green-50 border-green-200">
                            <input type="radio" checked readOnly name="delivery" id="prime" className="accent-amazon-yellow" />
                            <label htmlFor="prime" className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Truck size={16} className="text-green-600" />
                                    <p className="font-medium text-sm">FREE Prime Delivery</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Estimated delivery: {getDeliveryDate(3)}
                                </p>
                            </label>
                        </div>
                    </div>

                    {/* Environmental Impact */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="text-green-600" size={18} />
                            <p className="font-bold text-sm text-green-800">Environmental Impact</p>
                        </div>
                        <p className="text-xs text-green-700">
                            This order uses optimized packaging and carbon-neutral delivery routes.
                            Estimated carbon savings: <span className="font-bold">2.3 kg CO₂</span>
                        </p>
                    </div>
                </div>

                {/* Right - Order Summary */}
                <div>
                    <div className="bg-white rounded-xl p-4 shadow-sm lg:sticky lg:top-[120px]">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={processing}
                            className="btn-amazon w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                        >
                            {processing ? "Processing..." : "Place your order"}
                        </button>
                        <p className="text-xs text-gray-500 text-center mb-4">
                            By placing your order, you agree to Amazon&apos;s privacy notice and conditions of use.
                        </p>
                        <hr className="mb-4" />
                        <h3 className="font-bold text-sm mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Items ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                                <span>₹{Math.round(total * 83).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping:</span>
                                <span className="text-green-700">FREE</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">GST (18%):</span>
                                <span>₹{Math.round(tax * 83).toLocaleString("en-IN")}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-bold text-lg text-red-700">
                                <span>Order total:</span>
                                <span>₹{Math.round(grandTotal * 83).toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
