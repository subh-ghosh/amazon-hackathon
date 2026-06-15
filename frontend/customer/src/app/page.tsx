"use client";

import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
    const featured = PRODUCTS.slice(0, 4);
    const trending = PRODUCTS.slice(4, 8);
    const recommended = PRODUCTS.slice(8, 12);

    return (
        <div className="bg-[#EAEDED]">
            {/* Hero */}
            <div className="relative">
                <div className="bg-gradient-to-b from-[#232F3E] to-[#EAEDED] h-[300px] md:h-[400px]">
                    <div className="max-w-[1500px] mx-auto px-4 pt-8 md:pt-12">
                        <div className="bg-white rounded-lg shadow-sm p-6 md:p-10 max-w-2xl">
                            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-2">Second Life Commerce</p>
                            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-2">
                                Every product deserves a meaningful life
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base mb-5">
                                Shop with confidence. Our AI helps you find the right product — and gives every return a second chance through resale, refurbishment, or donation.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/products" className="btn-amazon-primary inline-block">
                                    Shop New
                                </Link>
                                <Link href="/products" className="inline-block px-6 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors">
                                    ♻️ Shop Renewed
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-[1500px] mx-auto px-4 -mt-16 relative z-10 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat}
                            href={`/products?category=${encodeURIComponent(cat)}`}
                            className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <p className="font-medium text-sm text-gray-900">{cat}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Featured */}
            <Section title="Recommended for you" products={featured} />

            {/* Second Life Marketplace */}
            <div className="max-w-[1500px] mx-auto px-4 mb-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">♻️</span>
                                <h2 className="text-xl font-bold text-gray-900">Amazon Renewed</h2>
                                <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Second Life</span>
                            </div>
                            <p className="text-sm text-gray-600">Certified refurbished products — tested, graded, and guaranteed by Amazon AI</p>
                        </div>
                        <Link href="/products" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
                            Shop all Renewed
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PRODUCTS.slice(0, 4).map((product) => (
                            <div key={`renewed-${product.product_id}`} className="bg-white rounded-lg border border-gray-200 p-4 relative">
                                <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Save {Math.round(20 + Math.random() * 15)}%
                                </div>
                                <Link href={`/product/${product.product_id}`}>
                                    <img src={product.image} alt={product.title} className="w-full aspect-square object-cover rounded mb-2" />
                                    <p className="text-xs text-gray-900 line-clamp-2 mb-1">{product.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-bold text-gray-900">${(product.price * 0.72).toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                        <span>✓</span> AI Quality Grade: Excellent
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between">
                        <p className="text-xs text-emerald-700">Every Renewed purchase gives a product a second life and earns you Green Credits</p>
                        <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-medium">🌱 +50 Green Credits per item</span>
                    </div>
                </div>
            </div>

            {/* Trending */}
            <Section title="Trending now" products={trending} />

            {/* More to explore */}
            <Section title="More to explore" products={recommended} />

            <div className="h-8" />
        </div>
    );
}

function Section({ title, products }: { title: string; products: typeof PRODUCTS }) {
    return (
        <div className="max-w-[1500px] mx-auto px-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <Link href="/products" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
                        See all
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
