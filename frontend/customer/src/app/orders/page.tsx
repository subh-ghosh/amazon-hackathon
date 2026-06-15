"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { PRODUCTS } from "@/data/products";

export default function OrdersPage() {
    const router = useRouter();
    const { orders } = useStore();

    // Merge real orders with demo orders for complete demo coverage
    const demoOrders = getDemoOrders();
    const displayOrders = [...orders, ...demoOrders];

    return (
        <div className="max-w-[1000px] mx-auto px-4 py-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h1>

            {displayOrders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                    <Package size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <button onClick={() => router.push("/products")} className="btn-amazon">Start Shopping</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayOrders.map((order) => (
                        <div key={order.order_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-[#F0F2F2] px-5 py-3 border-b border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
                                <div>
                                    <p className="uppercase text-[10px] text-gray-500">Order placed</p>
                                    <p className="text-gray-900">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                    <p className="uppercase text-[10px] text-gray-500">Total</p>
                                    <p className="text-gray-900">${order.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="uppercase text-[10px] text-gray-500">Ship to</p>
                                    <p className="text-[#007185]">{order.address.name}</p>
                                </div>
                                <div className="ml-auto">
                                    <p className="uppercase text-[10px] text-gray-500">Order #</p>
                                    <p className="text-gray-900">{order.order_id}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                {/* Status */}
                                <div className="mb-4">
                                    {order.status === "delivered" ? (
                                        <p className="text-base font-bold text-gray-900">Delivered {formatDate(order.delivery_date)}</p>
                                    ) : order.status === "shipped" ? (
                                        <p className="text-base font-bold text-[#007185]">Arriving {formatDate(order.delivery_date)}</p>
                                    ) : (
                                        <p className="text-base font-bold text-gray-900">Order confirmed</p>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${order.status === "delivered" ? "bg-emerald-500 w-full" : order.status === "shipped" ? "bg-[#007185] w-3/4" : "bg-[#007185] w-1/4"}`} />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                                        <span>Ordered</span><span>Shipped</span><span>Delivered</span>
                                    </div>
                                </div>

                                {/* Items */}
                                {order.items.map((item) => (
                                    <div key={item.product.product_id} className="flex gap-4 pt-3 border-t border-gray-100">
                                        <img
                                            src={item.product.image} alt={item.product.title}
                                            className="w-[80px] h-[80px] object-cover rounded cursor-pointer"
                                            onClick={() => router.push(`/product/${item.product.product_id}`)}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer line-clamp-2"
                                                onClick={() => router.push(`/product/${item.product.product_id}`)}>
                                                {item.product.title}
                                            </p>
                                            {/* Demo hint for presenters */}
                                            {item.product.product_id === "PROD-002" && (
                                                <p className="text-[10px] text-amber-600 mt-0.5">High-value return → RETURN_REQUIRED flow</p>
                                            )}
                                            {item.product.product_id === "PROD-005" && (
                                                <p className="text-[10px] text-amber-600 mt-0.5">$69.50 clothing → RETURN_REQUIRED (above $40 threshold)</p>
                                            )}
                                            {item.product.product_id === "PROD-013" && (
                                                <p className="text-[10px] text-emerald-600 mt-0.5">$24.99 item → RETURNLESS_REFUND (below $40 threshold)</p>
                                            )}
                                            {item.product.product_id === "PROD-014" && (
                                                <p className="text-[10px] text-emerald-600 mt-0.5">$12.99 item → RETURNLESS_REFUND (very cheap, keep item)</p>
                                            )}
                                            {item.product.product_id === "PROD-001" && (
                                                <p className="text-[10px] text-blue-600 mt-0.5">Electronics → Low risk, high seller trust</p>
                                            )}
                                            {item.product.product_id === "PROD-008" && (
                                                <p className="text-[10px] text-purple-600 mt-0.5">$230 clothing → RETURN_REQUIRED + SIZE_MISMATCH root cause</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button onClick={() => router.push(`/product/${item.product.product_id}`)} className="btn-secondary text-xs px-3 py-1.5">
                                                    Buy it again
                                                </button>
                                                <button onClick={() => router.push(`/return/${order.order_id}/${item.product.product_id}`)} className="btn-secondary text-xs px-3 py-1.5">
                                                    Return or replace
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Demo guide for presenters */}
            <div className="mt-8 bg-[#F0F2F2] border border-gray-300 rounded-lg p-5">
                <p className="text-sm font-bold text-gray-900 mb-3">🎯 Demo Scenarios Guide</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-amber-700 mb-1">Scenario A: High-Value Return</p>
                        <p>Return the <span className="font-medium">Nike shoes ($150)</span></p>
                        <p className="text-gray-500">S8 → RETURN_REQUIRED (too expensive to give away)</p>
                        <p className="text-gray-500">Options: Replace, Partial refund ($45), Full return</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-emerald-700 mb-1">Scenario B: Low-Value Return (RETURNLESS)</p>
                        <p>Return the <span className="font-medium">Amazon Essentials T-Shirt ($24.99)</span></p>
                        <p className="text-gray-500">S8 → RETURNLESS_REFUND (below $40 category threshold)</p>
                        <p className="text-gray-500">Options: Keep item + instant $24.99 refund</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-blue-700 mb-1">Scenario C: Electronics (Safe Buy)</p>
                        <p>View <span className="font-medium">Sony headphones ($348)</span> PDP</p>
                        <p className="text-gray-500">S1 → LOW risk, green checkmarks</p>
                        <p className="text-gray-500">Shows: &quot;Customers who bought this rarely return it&quot;</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-purple-700 mb-1">Scenario D: Clothing (Risky Buy)</p>
                        <p>View <span className="font-medium">North Face jacket ($230)</span> PDP</p>
                        <p className="text-gray-500">S1 → MEDIUM/HIGH risk, yellow warning</p>
                        <p className="text-gray-500">Shows: &quot;Before you buy&quot; prevention messaging</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-gray-700 mb-1">Scenario E: Return Journey</p>
                        <p>After returning any item, click <span className="font-medium">&quot;Track Return&quot;</span></p>
                        <p className="text-gray-500">Live S3→S5→S6→S7→S9 chain execution</p>
                        <p className="text-gray-500">Shows intelligent routing with real API data</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="font-bold text-gray-700 mb-1">Scenario F: Browse Prevention</p>
                        <p>Go to <span className="font-medium">Product Listing</span></p>
                        <p className="text-gray-500">Footwear/Clothing → ⚠️ &quot;Check fit&quot; / &quot;Size varies&quot;</p>
                        <p className="text-gray-500">Electronics/Kitchen → ✓ &quot;Frequently Kept&quot;</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDemoOrders() {
    // Cover all important demo scenarios
    return [
        {
            order_id: "113-4958271-8473625",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[0], quantity: 1 }], // Sony headphones - Electronics, LOW risk
            total: PRODUCTS[0].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 2 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-7823491-3847561",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[1], quantity: 1 }], // Nike shoes $150 - RETURN_REQUIRED
            total: PRODUCTS[1].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-9912847-1928374",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[4], quantity: 1 }], // Levi's jeans $69.50 - RETURNLESS_REFUND
            total: PRODUCTS[4].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-5567382-4738291",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[7], quantity: 1 }], // North Face jacket $230 - Clothing HIGH risk
            total: PRODUCTS[7].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 3 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-8834729-5829104",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[5], quantity: 1 }], // Kindle $139.99 - Electronics safe
            total: PRODUCTS[5].price,
            status: "shipped" as const,
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-2291038-9182746",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[12], quantity: 1 }], // Amazon Essentials T-Shirt $24.99 - RETURNLESS_REFUND
            total: PRODUCTS[12].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 4 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-4428173-7291038",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[13], quantity: 1 }], // Hanes Socks $12.99 - RETURNLESS_REFUND (very cheap)
            total: PRODUCTS[13].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
    ];
}
