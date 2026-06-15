"use client";

import Link from "next/link";
import { Star, Check, ShieldCheck, Leaf, Award } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/hooks/useStore";

export default function RenewedPage() {
    const { addToCart, earnCredits } = useStore();

    // All products available as renewed (30% off)
    const renewedProducts = PRODUCTS.map((p) => ({
        ...p,
        renewedPrice: Math.round(p.price * 0.70 * 100) / 100,
        savings: Math.round(p.price * 0.30 * 100) / 100,
        grade: p.rating >= 4.6 ? "Excellent" : p.rating >= 4.3 ? "Very Good" : "Good",
        warranty: "90-day Amazon Renewed Guarantee",
        previousLives: Math.floor(Math.random() * 2) + 1,
    }));

    const handleAddRenewed = (product: typeof PRODUCTS[0], renewedPrice: number) => {
        addToCart({ ...product, price: renewedPrice }, 1);
        earnCredits("Added Renewed item to cart", 50);
    };

    return (
        <div className="bg-[#F0FAF0] min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-b from-emerald-900 to-emerald-700 text-white">
                <div className="max-w-[1500px] mx-auto px-4 py-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">♻️</span>
                        <h1 className="text-3xl font-bold">Amazon Renewed</h1>
                    </div>
                    <p className="text-emerald-100 text-lg max-w-2xl mb-4">
                        Certified refurbished products — tested, graded, and guaranteed by Amazon AI.
                        Every purchase gives a product its second life.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-emerald-800/50 px-3 py-2 rounded-lg">
                            <ShieldCheck size={16} /> 90-day guarantee
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-800/50 px-3 py-2 rounded-lg">
                            <Award size={16} /> AI quality graded
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-800/50 px-3 py-2 rounded-lg">
                            <Leaf size={16} /> +50 Green Credits per item
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust bar */}
            <div className="bg-white border-b border-emerald-200">
                <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Professionally inspected</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Like-new condition</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Full warranty included</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Free returns</span>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        🌱 Earn 50 Green Credits with every Renewed purchase
                    </span>
                </div>
            </div>

            {/* Products grid */}
            <div className="max-w-[1500px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {renewedProducts.map((product) => (
                        <div key={product.product_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Image + badge */}
                            <div className="relative">
                                <Link href={`/product/${product.product_id}`}>
                                    <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
                                </Link>
                                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    Save ${product.savings.toFixed(0)}
                                </div>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-700 px-2 py-1 rounded border border-gray-200">
                                    Grade: {product.grade}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <Link href={`/product/${product.product_id}`}>
                                    <h3 className="text-sm text-gray-900 line-clamp-2 hover:text-[#C7511F] mb-2">{product.title}</h3>
                                </Link>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[#007185]">{product.reviews_count.toLocaleString()}</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xl font-bold text-gray-900">${product.renewedPrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">-{Math.round((product.savings / product.price) * 100)}%</span>
                                </div>

                                {/* Renewed info */}
                                <div className="space-y-1 mb-3">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-emerald-500" /> {product.warranty}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Leaf size={10} className="text-emerald-500" /> +50 Green Credits
                                    </p>
                                </div>

                                {/* Add to cart */}
                                <button
                                    onClick={() => handleAddRenewed(product, product.renewedPrice)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
                                >
                                    Add Renewed to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
