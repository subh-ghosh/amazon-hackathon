"use client";

import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, Check } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useStore();
    const total = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="max-w-[1000px] mx-auto px-4 py-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <h1 className="text-2xl font-normal text-gray-900 mb-2">Your Amazon Cart is empty</h1>
                    <p className="text-sm text-gray-600 mb-6">Check your Saved for later items below or continue shopping.</p>
                    <button onClick={() => router.push("/products")} className="btn-amazon">Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cart */}
                <div className="lg:col-span-9">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h1 className="text-2xl font-normal text-gray-900 mb-1">Shopping Cart</h1>
                        <p className="text-sm text-gray-500 text-right">Price</p>
                        <hr className="my-3" />

                        {cart.map((item) => (
                            <div key={item.product.product_id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                <img
                                    src={item.product.image} alt={item.product.title}
                                    className="w-[150px] h-[150px] object-cover rounded cursor-pointer"
                                    onClick={() => router.push(`/product/${item.product.product_id}`)}
                                />
                                <div className="flex-1">
                                    <h3 className="text-sm text-gray-900 hover:text-[#C7511F] cursor-pointer line-clamp-2"
                                        onClick={() => router.push(`/product/${item.product.product_id}`)}>
                                        {item.product.title}
                                    </h3>
                                    <p className="text-xs text-emerald-700 mt-1">In Stock</p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                            <button onClick={() => updateQuantity(item.product.product_id, Math.max(1, item.quantity - 1))} className="px-2.5 py-1.5 hover:bg-gray-100" aria-label="Decrease">
                                                <Minus size={12} />
                                            </button>
                                            <span className="px-3 text-sm border-x border-gray-300 bg-[#F0F2F2]">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100" aria-label="Increase">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => removeFromCart(item.product.product_id)} className="text-xs text-[#007185] hover:underline">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="font-bold text-base">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}

                        <div className="text-right mt-4">
                            <p className="text-lg">
                                Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items): <span className="font-bold">${total.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Shopping summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Shopping summary</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Check size={14} className="text-emerald-500" />
                                <span>All items have fast delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Check size={14} className="text-emerald-500" />
                                <span>Free returns on all items</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Check size={14} className="text-emerald-500" />
                                <span>Sustainable packaging available</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-[120px]">
                        <p className="text-lg mb-3">
                            Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items): <span className="font-bold">${total.toFixed(2)}</span>
                        </p>
                        <button onClick={() => router.push("/checkout")} className="btn-amazon w-full">
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
