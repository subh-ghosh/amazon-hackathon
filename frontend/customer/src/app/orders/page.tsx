"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { PRODUCTS } from "@/data/products";

export default function OrdersPage() {
    const router = useRouter();
    const { orders } = useStore();

    const displayOrders = [...orders, ...getDemoOrders()];

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
                            <div className="bg-[#F0F2F2] px-5 py-3 border-b border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
                                <div>
                                    <p className="uppercase text-[10px] text-gray-500">Order placed</p>
                                    <p className="text-gray-900">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                    <p className="uppercase text-[10px] text-gray-500">Total</p>
                                    <p className="text-gray-900">₹{Math.round(order.total * 83).toLocaleString("en-IN")}</p>
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

                            <div className="p-5">
                                <div className="mb-4">
                                    {order.status === "delivered" ? (
                                        <p className="text-base font-bold text-gray-900">Delivered {formatDate(order.delivery_date)}</p>
                                    ) : order.status === "shipped" ? (
                                        <p className="text-base font-bold text-[#007185]">Arriving {formatDate(order.delivery_date)}</p>
                                    ) : (
                                        <p className="text-base font-bold text-gray-900">Order confirmed</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${order.status === "delivered" ? "bg-emerald-500 w-full" : order.status === "shipped" ? "bg-[#007185] w-3/4" : "bg-[#007185] w-1/4"}`} />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                                        <span>Ordered</span><span>Shipped</span><span>Delivered</span>
                                    </div>
                                </div>

                                {order.items.map((item) => (
                                    <div key={item.product.product_id} className="flex gap-4 pt-3 border-t border-gray-100">
                                        <img src={item.product.image} alt={item.product.title}
                                            className="w-[80px] h-[80px] object-cover rounded cursor-pointer"
                                            onClick={() => router.push(`/product/${item.product.product_id}`)} />
                                        <div className="flex-1">
                                            <p className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer line-clamp-2"
                                                onClick={() => router.push(`/product/${item.product.product_id}`)}>
                                                {item.product.title}
                                            </p>
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
    return [
        // Electronics - LOW risk, high seller trust (safe buy demo)
        {
            order_id: "113-4958271-8473625",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[0], quantity: 1 }], // Sony headphones $348
            total: PRODUCTS[0].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 2 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Footwear - HIGH risk, $150 → RETURN_REQUIRED
        {
            order_id: "113-7823491-3847561",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[1], quantity: 1 }], // Nike shoes $150
            total: PRODUCTS[1].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Clothing - $69.50, above $40 threshold → RETURN_REQUIRED
        {
            order_id: "113-9912847-1928374",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[4], quantity: 1 }], // Levi's jeans $69.50
            total: PRODUCTS[4].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Clothing - $230, HIGH risk → RETURN_REQUIRED
        {
            order_id: "113-5567382-4738291",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[7], quantity: 1 }], // North Face jacket $230
            total: PRODUCTS[7].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 3 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // LOW VALUE - $24.99, below $40 → RETURNLESS_REFUND (keep item)
        {
            order_id: "113-2291038-9182746",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[12], quantity: 1 }], // Amazon Essentials T-Shirt $24.99
            total: PRODUCTS[12].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 4 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // VERY LOW VALUE - $12.99 → RETURNLESS_REFUND (definite keep)
        {
            order_id: "113-4428173-7291038",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[13], quantity: 1 }], // Hanes Socks $12.99
            total: PRODUCTS[13].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Kitchen - LOW risk (safe buy, for comparison)
        {
            order_id: "113-6618294-3847291",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[2], quantity: 1 }], // Instant Pot $89.95
            total: PRODUCTS[2].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 5 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // In transit (shows delivery progress bar)
        {
            order_id: "113-8834729-5829104",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[5], quantity: 1 }], // Kindle $139.99
            total: PRODUCTS[5].price,
            status: "shipped" as const,
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Very high value electronics $1299 → RETURN_REQUIRED
        {
            order_id: "113-3347281-9283746",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[3], quantity: 1 }], // Samsung Galaxy S24 $1299
            total: PRODUCTS[3].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 6 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // High value home $749 → RETURN_REQUIRED
        {
            order_id: "113-7712938-4829103",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[6], quantity: 1 }], // Dyson Vacuum $749
            total: PRODUCTS[6].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 9 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Mid electronics $249 → RETURN_REQUIRED
        {
            order_id: "113-1192847-5738201",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[8], quantity: 1 }], // AirPods Pro $249
            total: PRODUCTS[8].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 8 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Furniture $1395 → RETURN_REQUIRED (very high value)
        {
            order_id: "113-9928374-1029384",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[9], quantity: 1 }], // Herman Miller Chair $1395
            total: PRODUCTS[9].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Clothing $139 → RETURN_REQUIRED
        {
            order_id: "113-4482019-8372910",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[10], quantity: 1 }], // Patagonia Sweater $139
            total: PRODUCTS[10].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 10 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
        // Electronics $329 → RETURN_REQUIRED
        {
            order_id: "113-5519283-7461029",
            customer_id: "CUST-DEMO-001",
            items: [{ product: PRODUCTS[11], quantity: 1 }], // Bose Speaker $329
            total: PRODUCTS[11].price,
            status: "delivered" as const,
            created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            delivery_date: new Date(Date.now() - 12 * 86400000).toISOString(),
            address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038", country: "IN" },
        },
    ];
}
