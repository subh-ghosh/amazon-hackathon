"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Settings2, Sparkles, CheckCircle2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { PRODUCTS } from "@/data/products";

export default function OrdersPage() {
    const router = useRouter();
    const { orders, persona, setPersona } = useStore();

    const demoOrders = getDemoOrders();
    const displayOrders = [...orders, ...demoOrders];

    const [scenario, setScenario] = useState<string>("LOW_VALUE");

    const scenarios = [
        { id: "LOW_VALUE", label: "Low-Value Item (e.g. $15 Phone Case)" },
        { id: "HIGH_VALUE", label: "High-Value Item (e.g. $348 Headphones)" },
        { id: "HEAVY_BULKY", label: "Heavy / Bulky Item (e.g. $120 Furniture)" },
        { id: "HAZARDOUS", label: "Hazardous / Broken (e.g. Shattered Glass)" },
        { id: "MODERATE", label: "Moderate Value (e.g. $45 Apparel)" },
    ];

    const getSimulationDetails = () => {
        const isTrusted = persona === "TRUSTED";
        switch (scenario) {
            case "LOW_VALUE": return { 
                text: "Hanes Socks ($12.99)", orderId: "113-4428173-7291038", productId: "PROD-014", reason: "wrong_size",
                expectedDecision: isTrusted ? "RETURNLESS_REFUND" : "MANUAL_REVIEW",
                expectedOptions: isTrusted 
                    ? ["Instant full refund (keep it)", "Get a replacement", "Talk to product support", "Ship it back instead"]
                    : ["Return for full refund", "Get product support"]
            };
            case "HIGH_VALUE": return { 
                text: "Sony Headphones ($348.00)", orderId: "113-4958271-8473625", productId: "PROD-001", reason: "changed_mind",
                expectedDecision: isTrusted ? "RETURN_REQUIRED" : "MANUAL_REVIEW",
                expectedOptions: isTrusted
                    ? ["Replace this item", "Partial refund — keep the item", "Get product support", "Full refund — return item"]
                    : ["Return for full refund", "Get product support"]
            };
            case "HEAVY_BULKY": return { 
                text: "Iron Dumbbells (Heavy)", orderId: "113-1111111-1111111", productId: "PROD-016", reason: "wrong_size",
                expectedDecision: isTrusted ? "REFUND_AND_DONATE" : "MANUAL_REVIEW",
                expectedOptions: isTrusted
                    ? ["Instant full refund — please donate or keep", "Get a replacement instead", "Talk to product support", "Ship it back instead"]
                    : ["Return for full refund", "Get product support"]
            };
            case "HAZARDOUS": return { 
                text: "Shattered Glass Vase", orderId: "113-2222222-2222222", productId: "PROD-017", reason: "hazardous",
                expectedDecision: isTrusted ? "REFUND_AND_RECYCLE" : "MANUAL_REVIEW_HAZARDOUS",
                expectedOptions: isTrusted
                    ? ["Instant full refund — please safely recycle", "Get a replacement instead"]
                    : ["Contact product support (Required)"]
            };
            case "MODERATE": return { 
                text: "Basic Jeans ($45.00)", orderId: "113-3333333-3333333", productId: "PROD-018", reason: "wrong_size",
                expectedDecision: isTrusted ? "PARTIAL_REFUND" : "MANUAL_REVIEW",
                expectedOptions: isTrusted
                    ? ["Partial refund — keep the item", "Replace this item", "Return for full refund"]
                    : ["Return for full refund", "Get product support"]
            };
            default: return { 
                text: "Hanes Socks ($12.99)", orderId: "113-4428173-7291038", productId: "PROD-014", reason: "wrong_size",
                expectedDecision: "RETURNLESS_REFUND", expectedOptions: []
            };
        }
    };

    const simDetails = getSimulationDetails();

    return (
        <div className="max-w-[1000px] mx-auto px-4 py-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h1>

            {/* Quick Demo Override Selector */}
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <Settings2 size={18} className="text-[#007185]" />
                    <h3 className="font-bold text-gray-900 text-base">Demo Simulation Guide</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Persona Toggle */}
                    <div>
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">1. Select Persona</p>
                        <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-xs">
                            <button 
                                onClick={() => setPersona("TRUSTED")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${persona === "TRUSTED" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                🟢 TRUSTED
                            </button>
                            <button 
                                onClick={() => setPersona("SUSPICIOUS")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${persona === "SUSPICIOUS" ? "bg-white shadow text-red-700" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                🔴 SUSPICIOUS
                            </button>
                        </div>
                    </div>

                    {/* Scenario Radio List */}
                    <div>
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">2. Select Scenario</p>
                        <div className="flex flex-col gap-2">
                            {scenarios.map((s) => (
                                <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input 
                                        type="radio" 
                                        name="scenario" 
                                        value={s.id} 
                                        checked={scenario === s.id}
                                        onChange={() => setScenario(s.id)}
                                        className="accent-[#007185] cursor-pointer w-4 h-4"
                                    />
                                    <span className={scenario === s.id ? "font-bold text-gray-900" : "text-gray-600"}>{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                            To simulate this exact scenario, return the <strong>{simDetails.text}</strong> as a <strong className={persona === 'TRUSTED' ? 'text-emerald-600' : 'text-red-600'}>{persona.toLowerCase()}</strong> user.
                        </p>
                        
                        <div className="bg-[#f0f8ff] border border-[#d6eaf8] rounded-md p-3 text-sm animate-fade-in max-w-2xl">
                            <div className="font-bold text-[#007185] mb-2 flex items-center gap-2">
                                <Settings2 size={16} /> Expected System Outcome: 
                                <span className="bg-white px-2 py-0.5 rounded border border-[#d6eaf8] font-mono text-xs shadow-sm">
                                    {simDetails.expectedDecision}
                                </span>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Expected Options:</div>
                                <ul className="list-none space-y-1">
                                    {simDetails.expectedOptions.map((opt, i) => (
                                        <li key={i} className="flex items-center gap-1.5 text-gray-700">
                                            <CheckCircle2 size={12} className="text-emerald-500" /> {opt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => router.push(`/return-prevention?returnId=RET-${Date.now()}&orderId=${simDetails.orderId}&productId=${simDetails.productId}&reason=${simDetails.reason}&comment=`)} className="bg-[#FF9900] hover:bg-[#FFB84D] text-[#131A22] px-8 py-2.5 rounded-md font-bold shadow-sm transition-colors whitespace-nowrap self-start md:self-end">
                        Simulate
                    </button>
                </div>
            </div>

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
        {
            order_id: "113-1111111-1111111",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[15], quantity: 1 }], // PROD-016 Dumbbells
            total: PRODUCTS[15].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 8 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-2222222-2222222",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[16], quantity: 1 }], // PROD-017 Vase
            total: PRODUCTS[16].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 18 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
        {
            order_id: "113-3333333-3333333",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[17], quantity: 1 }], // PROD-018 Basic Jeans
            total: PRODUCTS[17].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 5 * 86400000).toISOString(),
            address: { name: "John Doe", street: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "US" },
        },
    ];
}
