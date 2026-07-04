"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function OrdersPage() {
    const router = useRouter();
    const { orders } = useStore();

    return (
        <div className="max-w-[1000px] mx-auto px-4 py-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                    <Package size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <button onClick={() => router.push("/products")} className="btn-amazon">Start Shopping</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
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
