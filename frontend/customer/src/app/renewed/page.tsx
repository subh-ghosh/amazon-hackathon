"use client";

import Link from "next/link";
import { Star, Check, ShieldCheck, Leaf } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/hooks/useStore";

export default function RenewedPage() {
    const { addToCart, earnCredits } = useStore();

    const renewedProducts = PRODUCTS.map((p) => ({
        ...p,
        renewedPrice: Math.round(p.price * 0.70 * 100) / 100,
        savings: Math.round(p.price * 0.30 * 100) / 100,
        inrPrice: Math.round(p.price * 83),
        inrRenewed: Math.round(p.price * 0.70 * 83),
        inrSavings: Math.round(p.price * 0.30 * 83),
        grade: p.rating >= 4.6 ? "Excellent" : p.rating >= 4.3 ? "Very Good" : "Good",
    }));

    const handleAddRenewed = (product: typeof PRODUCTS[0], renewedPrice: number) => {
        addToCart({ ...product, price: renewedPrice }, 1);
        earnCredits("Purchased Renewed item", 50);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <div className="bg-[#232F3E] text-white">
                <div className="max-w-[1500px] mx-auto px-4 py-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Amazon Renewed</h1>
                    <p className="text-gray-300 max-w-xl mb-4">
                        Like-new products at great prices. Every item has been professionally inspected, tested, and certified to work like new.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-300">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> 90-day guarantee</span>
                        <span className="flex items-center gap-1.5"><Check size={14} /> Professionally inspected</span>
                        <span className="flex items-center gap-1.5"><Leaf size={14} /> Sustainable choice</span>
                    </div>
                </div>
            </div>

            {/* Trust */}
            <div className="border-b border-gray-200">
                <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center gap-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Tested & certified</span>
                    <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Looks and works like new</span>
                    <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Free returns</span>
                    <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Up to 30% off</span>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1500px] mx-auto px-4 py-6">
                <p className="text-sm text-gray-500 mb-4">{renewedProducts.length} results</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {renewedProducts.map((product) => (
                        <div key={product.product_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                            <div className="relative">
                                <Link href={`/product/${product.product_id}?variant=renewed`}>
                                    <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
                                </Link>
                                <div className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                                    {Math.round((product.inrSavings / product.inrPrice) * 100)}% off
                                </div>
                            </div>

                            <div className="p-4">
                                <Link href={`/product/${product.product_id}?variant=renewed`}>
                                    <h3 className="text-sm text-gray-900 line-clamp-2 hover:text-[#C7511F] mb-1">{product.title}</h3>
                                </Link>

                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[#007185]">{product.reviews_count.toLocaleString()}</span>
                                </div>

                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-lg font-bold">₹{product.inrRenewed.toLocaleString("en-IN")}</span>
                                    <span className="text-sm text-gray-400 line-through">₹{product.inrPrice.toLocaleString("en-IN")}</span>
                                </div>

                                <p className="text-xs text-gray-500 mb-1">Condition: <span className="text-gray-700 font-medium">{product.grade}</span></p>
                                <p className="text-xs text-emerald-700 font-medium mb-1">You save ₹{product.inrSavings.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-gray-500 mb-3">FREE delivery</p>

                                <button onClick={() => handleAddRenewed(product, product.renewedPrice)}
                                    className="w-full btn-amazon text-sm">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
