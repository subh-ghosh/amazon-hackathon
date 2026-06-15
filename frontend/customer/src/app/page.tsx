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
                            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-2">
                                Great deals on top brands
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base mb-5">
                                Free delivery, easy returns, and purchase guidance to help you find exactly what you need.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/products" className="btn-amazon-primary inline-block">
                                    Shop All Deals
                                </Link>
                                <Link href="/renewed" className="inline-block px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                                    Shop Certified Renewed
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
