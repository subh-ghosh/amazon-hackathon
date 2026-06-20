"use client";

import Link from "next/link";
import { ShieldCheck, Leaf, Truck, RotateCcw } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
    const featured = PRODUCTS.slice(0, 4);
    const trending = PRODUCTS.slice(4, 8);
    const recommended = PRODUCTS.slice(8, 12);

    return (
        <div className="bg-[#EAEDED]">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-b from-[#232F3E] via-[#37475A] to-[#EAEDED]">
                <div className="max-w-[1500px] mx-auto px-4 pt-6 pb-24 md:pt-10 md:pb-32">
                    <div className="max-w-xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Shop with confidence
                        </h1>
                        <p className="text-gray-300 text-base mb-6">
                            AI-powered purchase guidance helps you find the right product the first time. Free returns, sustainability rewards, and certified renewed options.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/products" className="btn-amazon-primary inline-block">
                                Shop All Products
                            </Link>
                            <Link href="/renewed" className="inline-block px-6 py-3 text-sm font-medium text-white bg-transparent border border-gray-400 rounded-full hover:bg-white/10 transition-colors">
                                Certified Renewed →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Bar */}
            <div className="max-w-[1500px] mx-auto px-4 -mt-16 relative z-10 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Purchase Guidance</p>
                            <p className="text-xs text-gray-500">AI-powered fit & match</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Truck size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                            <p className="text-xs text-gray-500">On eligible orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <RotateCcw size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                            <p className="text-xs text-gray-500">Hassle-free process</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Leaf size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Green Rewards</p>
                            <p className="text-xs text-gray-500">Earn for sustainable choices</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-[1500px] mx-auto px-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Shop by Category</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat}
                                href={`/products?category=${encodeURIComponent(cat)}`}
                                className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 hover:shadow-sm transition-all border border-gray-100"
                            >
                                <p className="font-medium text-sm text-gray-900">{cat}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured */}
            <Section title="Recommended for you" products={featured} />

            {/* Trending */}
            <Section title="Trending now" products={trending} />

            {/* More to explore */}
            <Section title="More to explore" products={recommended} />

            {/* Footer */}
            <footer className="bg-[#232F3E] text-white mt-8">
                <div className="max-w-[1500px] mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <h4 className="font-bold mb-3">Get to Know Us</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>About Amazon</li>
                                <li>Careers</li>
                                <li>Sustainability</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Make Money with Us</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>Sell on Amazon</li>
                                <li>Fulfilled by Amazon</li>
                                <li>Advertise Your Products</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Amazon Programs</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>Amazon Renewed</li>
                                <li>Green Credits</li>
                                <li>Circular Commerce</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Help</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>Your Account</li>
                                <li>Returns Centre</li>
                                <li>Customer Service</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-600 mt-6 pt-4 text-center text-xs text-gray-400">
                        © 2026 Amazon Second Life Commerce — HackOn with Amazon
                    </div>
                </div>
            </footer>
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
