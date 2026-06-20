"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, MapPin, Leaf } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import type { PersonaType } from "@/hooks/useStore";

export function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const { getCartCount, greenCredits, persona, setPersona, getCartTotal } = useStore();
    const cartCount = getCartCount();
    const cartTotal = getCartTotal();

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
                    <Link href="/" className="flex-shrink-0 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded flex items-baseline gap-0.5">
                        <span className="text-[22px] font-bold tracking-tight">amazon</span>
                        <span className="text-[11px] text-gray-300">.in</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer">
                        <MapPin size={16} className="text-white" />
                        <div>
                            <p className="text-[10px] text-gray-300 leading-none">Deliver to</p>
                            <p className="text-sm font-bold leading-tight">Bangalore 560001</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 flex">
                        <div className="flex w-full rounded-md overflow-hidden">
                            <select className="bg-gray-100 text-gray-700 text-xs px-2 border-r border-gray-300 hidden md:block" aria-label="Category">
                                <option>All</option>
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Home & Kitchen</option>
                            </select>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Amazon.in" className="flex-1 px-4 py-2.5 text-gray-900 text-sm focus:outline-none" aria-label="Search" />
                            <button type="submit" className="bg-[#FEBD69] hover:bg-[#F3A847] px-4" aria-label="Search">
                                <Search size={20} className="text-gray-800" />
                            </button>
                        </div>
                    </form>

                    {/* Language */}
                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 text-sm">
                        <span className="text-xs">🇮🇳</span>
                        <span className="font-bold text-sm">EN</span>
                    </div>

                    {/* Account */}
                    <Link href="/orders" className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <p className="text-[10px] text-gray-300 leading-none">Hello, Customer</p>
                        <p className="text-sm font-bold leading-tight">Account & Lists</p>
                    </Link>

                    <Link href="/orders" className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <p className="text-[10px] text-gray-300 leading-none">Returns</p>
                        <p className="text-sm font-bold leading-tight">& Orders</p>
                    </Link>

                    {/* Cart with subtotal */}
                    <Link href="/cart" className="flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                        <div className="relative">
                            <ShoppingCart size={28} />
                            <span className="absolute -top-1 left-3 text-[#F08804] text-[16px] font-bold">{cartCount > 0 ? cartCount : "0"}</span>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-[10px] text-gray-300 leading-none">Subtotal</p>
                            <p className="text-sm font-bold leading-tight">₹{Math.round(cartTotal * 83).toLocaleString("en-IN")}</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="bg-[#232F3E] text-white text-sm">
                <div className="max-w-[1500px] mx-auto px-4 flex items-center h-[39px] gap-1 overflow-x-auto">
                    <Link href="/" className={`px-3 py-1.5 rounded whitespace-nowrap ${pathname === "/" ? "bg-[#3a4a5c] font-bold" : "hover:outline hover:outline-1 hover:outline-white"}`}>
                        All
                    </Link>
                    <Link href="/renewed" className={`px-3 py-1.5 rounded whitespace-nowrap ${pathname === "/renewed" ? "bg-[#3a4a5c] font-bold" : "hover:outline hover:outline-1 hover:outline-white"}`}>
                        Amazon Renewed
                    </Link>
                    <Link href="/green-credits" className={`px-3 py-1.5 rounded whitespace-nowrap flex items-center gap-1 ${pathname === "/green-credits" ? "bg-[#3a4a5c] font-bold" : "hover:outline hover:outline-1 hover:outline-white"}`}>
                        <Leaf size={12} className="text-emerald-400" />{greenCredits} Credits
                    </Link>
                    <div className="w-px h-5 bg-gray-500 mx-1" />
                    <Link href="/products?category=Electronics" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Mobiles</Link>
                    <Link href="/products?category=Electronics" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Electronics</Link>
                    <Link href="/products?category=Clothing" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Fashion</Link>
                    <Link href="/products?category=Kitchen" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Home & Kitchen</Link>
                    <Link href="/products?category=Footwear" className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">Footwear</Link>
                    <span className="px-2.5 py-1 whitespace-nowrap text-gray-300">Amazon Pay</span>
                    <span className="px-2.5 py-1 whitespace-nowrap text-gray-300">Buy Again</span>
                </div>
            </div>

            {/* Demo persona toggle — subtle bottom-left */}
            <div className="fixed bottom-3 left-3 z-50">
                <div className="bg-white/90 backdrop-blur border border-gray-200 shadow-sm rounded-full p-1 flex items-center gap-1">
                    <button
                        onClick={() => setPersona("TRUSTED")}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${persona === "TRUSTED" ? "bg-emerald-100 text-emerald-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Regular
                    </button>
                    <button
                        onClick={() => setPersona("SUSPICIOUS")}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${persona === "SUSPICIOUS" ? "bg-amber-100 text-amber-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Returner
                    </button>
                </div>
            </div>
        </header>
    );
}
