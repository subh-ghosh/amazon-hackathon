"use client";

import Link from "next/link";
import { ShieldCheck, Check, Search, TrendingUp } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useCatalog } from "@/lib/catalog";

export default function P2PPage() {
    const { products, loading, error } = useCatalog();
    const { addToCart } = useStore();

    if (loading) return <div className="min-h-screen px-4 py-12 text-sm text-slate-600">Loading P2P Market...</div>;
    if (error) return <div className="min-h-screen px-4 py-12 text-sm text-red-700">{error}</div>;

    // We'll mock the P2P listings using our products, discounting them randomly
    const p2pListings = products.map((p, index) => {
        const condition = index % 3 === 0 ? "Like New" : index % 2 === 0 ? "Very Good" : "Good";
        const discount = condition === "Like New" ? 0.8 : condition === "Very Good" ? 0.65 : 0.5;
        const p2pPrice = p.price * discount;
        const amazonFee = p2pPrice * 0.05; // Amazon charges 5% fee to buyer for inspection
        const totalBuyerPrice = p2pPrice + amazonFee;

        return {
            ...p,
            condition,
            p2pPrice,
            amazonFee,
            totalBuyerPrice,
            sellerScore: 4.5 + Math.random() * 0.5,
            monthsOld: Math.floor(Math.random() * 12) + 1
        };
    });

    return (
        <div className="bg-[#EAEDED] min-h-screen pb-12">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#232F3E] to-[#131A22] text-white">
                <div className="max-w-[1500px] mx-auto px-4 py-10">
                    <div className="inline-flex items-center gap-2 bg-[#007185]/20 text-[#79C8C8] px-3 py-1 rounded-full text-xs font-bold mb-4 border border-[#007185]/30">
                        <ShieldCheck size={14} /> AMAZON CERTIFIED ESCROW
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Amazon Peer-to-Peer</h1>
                    <p className="text-gray-300 max-w-2xl mb-6 text-sm leading-relaxed">
                        The safest way to buy used. Every item here was originally purchased on Amazon. When you buy, the seller ships it to an Amazon Quality Center for an S4 AI physical inspection before it ever reaches your door.
                    </p>
                    
                    {/* Search bar simulation */}
                    <div className="flex max-w-2xl">
                        <input type="text" placeholder="Search Amazon P2P verified listings..." className="flex-1 px-4 py-3 rounded-l-md text-black outline-none" />
                        <button className="bg-[#FEBD69] hover:bg-[#F3A847] px-6 rounded-r-md text-gray-900 transition-colors">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Trust Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#007185]" /> Verified Original Purchase</span>
                    <span className="flex items-center gap-1.5"><Check size={14} className="text-[#007185]" /> S4 AI Middleman Inspection</span>
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-[#007185]" /> No Haggling, Transparent Fees</span>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1500px] mx-auto px-4 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Trending Verified Resales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {p2pListings.map((listing) => (
                        <div key={listing.product_id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 flex flex-col">
                            <div className="relative group">
                                <Link href={`/product/${listing.product_id}?variant=p2p`}>
                                    <img src={listing.image} alt={listing.title} className="w-full aspect-square object-cover" />
                                </Link>
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-emerald-400" /> VERIFIED
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <Link href={`/product/${listing.product_id}?variant=p2p`}>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#C7511F] mb-2">{listing.title}</h3>
                                </Link>

                                <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className={`px-2 py-0.5 rounded font-medium ${
                                        listing.condition === 'Like New' ? 'bg-emerald-50 text-emerald-700' :
                                        listing.condition === 'Very Good' ? 'bg-blue-50 text-blue-700' :
                                        'bg-amber-50 text-amber-700'
                                    }`}>
                                        {listing.condition}
                                    </span>
                                    <span className="text-gray-500">{listing.monthsOld} months old</span>
                                </div>

                                <div className="mt-auto pt-3 border-t border-gray-100">
                                    <div className="flex items-end justify-between mb-1">
                                        <div>
                                            <span className="text-xs text-gray-500 line-through">₹{Math.round(listing.price * 83).toLocaleString("en-IN")} new</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-gray-900">₹{Math.round(listing.totalBuyerPrice * 83).toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1">
                                        Includes ₹{Math.round(listing.amazonFee * 83).toLocaleString("en-IN")} Amazon Escrow Fee
                                    </p>
                                    
                                    <button 
                                        onClick={() => addToCart({ ...listing, price: listing.totalBuyerPrice }, 1)}
                                        className="w-full btn-amazon text-sm py-2 shadow-sm rounded-lg"
                                    >
                                        Buy Safely via Amazon
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
