"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, MapPin } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { getCartCount } = useStore();
    const cartCount = getCartCount();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-[#131921] text-white">
                <div className="max-w-[1500px] mx-auto px-4 flex items-center h-[60px] gap-3">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <span className="text-[22px] font-bold tracking-tight">amazon</span>
                    </Link>

                    {/* Deliver to */}
                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer">
                        <MapPin size={16} className="text-white" />
                        <div>
                            <p className="text-[10px] text-gray-300 leading-none">Deliver to</p>
                            <p className="text-sm font-bold leading-tight">New York 10001</p>
                        </div>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 flex">
                        <div className="flex w-full rounded-md overflow-hidden">
                            <select className="bg-gray-100 text-gray-700 text-xs px-2 border-r border-gray-300 hidden md:block" aria-label="Category">
                                <option>All</option>
                            </select>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Amazon"
                                className="flex-1 px-4 py-2.5 text-gray-900 text-sm focus:outline-none"
                                aria-label="Search"
                            />
                            <button type="submit" className="bg-[#FEBD69] hover:bg-[#F3A847] px-4" aria-label="Search">
                                <Search size={20} className="text-gray-800" />
                            </button>
                        </div>
                    </form>

                    {/* Account */}
                    <Link href="/orders" className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <p className="text-[10px] text-gray-300 leading-none">Hello, Customer</p>
                        <p className="text-sm font-bold leading-tight">Account & Lists</p>
                    </Link>

                    {/* Returns & Orders */}
                    <Link href="/orders" className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <p className="text-[10px] text-gray-300 leading-none">Returns</p>
                        <p className="text-sm font-bold leading-tight">& Orders</p>
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className="flex items-end gap-0.5 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <div className="relative">
                            <ShoppingCart size={28} />
                            <span className="absolute -top-1 left-3 text-[#F08804] text-[16px] font-bold">
                                {cartCount > 0 ? cartCount : ""}
                            </span>
                        </div>
                        <span className="text-sm font-bold pb-0.5">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Sub-nav */}
            <div className="bg-[#232F3E] text-white text-sm">
                <div className="max-w-[1500px] mx-auto px-4 flex items-center h-[39px] gap-1 overflow-x-auto">
                    <Link href="/products" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Today&apos;s Deals</Link>
                    <Link href="/products?category=Electronics" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Electronics</Link>
                    <Link href="/products?category=Clothing" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Fashion</Link>
                    <Link href="/products?category=Kitchen" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Home & Kitchen</Link>
                    <Link href="/products?category=Furniture" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Furniture</Link>
                </div>
            </div>
        </header>
    );
}
