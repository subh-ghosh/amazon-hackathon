"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, MessageCircle, Info, MapPin, Truck, Leaf, ShieldAlert } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useProduct } from "@/lib/catalog";

export default function P2PListingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { addToCart } = useStore();
    const { product, loading, error } = useProduct(params.id);

    const [offerPrice, setOfferPrice] = useState("");
    const [showOfferSent, setShowOfferSent] = useState(false);

    if (loading) return <div className="max-w-[1200px] mx-auto px-4 py-12 text-center text-sm">Loading P2P Listing...</div>;
    if (error || !product) return <div className="max-w-[1200px] mx-auto px-4 py-12 text-center text-red-600">Listing not found.</div>;

    // Simulate P2P specific pricing for this particular ID
    const condition = parseInt(params.id.slice(-1)) % 2 === 0 ? "Very Good" : "Like New";
    const discount = condition === "Like New" ? 0.8 : 0.65;
    const baseP2PPrice = product.price * discount;
    const amazonFee = baseP2PPrice * 0.05;
    const totalBuyerPrice = baseP2PPrice + amazonFee;

    const inrPrice = Math.round(totalBuyerPrice * 83);
    const originalPrice = Math.round(product.price * 83);
    
    const handleMakeOffer = () => {
        if (!offerPrice) return;
        setShowOfferSent(true);
        setTimeout(() => setShowOfferSent(false), 3000);
    };

    return (
        <div className="bg-[#f2f4f8] min-h-screen pb-12 pt-6">
            <div className="max-w-[1200px] mx-auto px-4">
                
                {/* Amazon Escrow Trust Banner */}
                <div className="bg-[#131A22] text-white rounded-t-xl p-3 flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="text-emerald-400" size={20} />
                    <span>Amazon Guaranteed Escrow: Your money is held safely until you receive the item and confirm its condition.</span>
                </div>

                <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                    
                    {/* Left: Images */}
                    <div className="md:w-1/2 p-6 border-r border-gray-200">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square flex items-center justify-center">
                            <img src={product.image} alt={product.title} className="w-[80%] h-[80%] object-contain" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow text-xs font-bold text-gray-900 border border-gray-200 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${condition === 'Like New' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                {condition} Condition
                            </div>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Seller's Description</h3>
                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg italic">
                                "Selling my {product.title} because I recently upgraded. It's in {condition.toLowerCase()} condition. I've taken great care of it. Comes with all original accessories. Purchased originally directly from Amazon 8 months ago."
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Technical Specs (Auto-filled by Amazon)</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex"><span className="w-32 font-medium">Brand:</span> <span>{product.brand}</span></li>
                                <li className="flex"><span className="w-32 font-medium">Category:</span> <span>{product.category}</span></li>
                                <li className="flex"><span className="w-32 font-medium">Original Price:</span> <span>₹{originalPrice.toLocaleString("en-IN")}</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Buy Box & Seller Info */}
                    <div className="md:w-1/2 bg-white flex flex-col">
                        <div className="p-6 flex-1">
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.title}
                            </h1>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                                <span className="flex items-center gap-1"><MapPin size={14} /> Bengaluru, Karnataka</span>
                                <span>Posted 2 days ago</span>
                            </div>

                            <div className="mb-6">
                                <p className="text-[36px] font-bold text-gray-900 leading-none mb-1">
                                    ₹{inrPrice.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-gray-500">
                                    (Original Amazon Price: ₹{originalPrice.toLocaleString("en-IN")})
                                </p>
                            </div>

                            {/* Transparent Fee Breakdown */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 space-y-1.5 text-xs">
                                <div className="flex justify-between text-gray-700">
                                    <span>Seller's Asking Price</span>
                                    <span>₹{Math.round(baseP2PPrice * 83).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-blue-800 font-medium">
                                    <span className="flex items-center gap-1">Amazon Inspection & Escrow Fee (5%) <Info size={12}/></span>
                                    <span>₹{Math.round(amazonFee * 83).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="border-t border-blue-200 mt-1 pt-1 flex justify-between font-bold text-gray-900">
                                    <span>Total Final Price</span>
                                    <span>₹{inrPrice.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <button onClick={() => {
                                    addToCart({ ...product, price: totalBuyerPrice }, 1);
                                    router.push("/cart");
                                }} className="btn-amazon w-full py-3.5 text-base font-bold shadow flex justify-center items-center gap-2">
                                    <ShieldCheck size={18} /> Buy Safely via Amazon
                                </button>
                                
                                <div className="flex gap-3">
                                    <button className="flex-1 btn-secondary py-3 text-sm font-bold flex justify-center items-center gap-2 border-gray-300">
                                        <MessageCircle size={16} /> Chat
                                    </button>
                                    <div className="flex-1 relative">
                                        <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-full focus-within:border-[#007185] focus-within:ring-1 focus-within:ring-[#007185]">
                                            <span className="pl-3 py-3 text-gray-500 text-sm font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={offerPrice}
                                                onChange={(e) => setOfferPrice(e.target.value)}
                                                placeholder="Offer amount" 
                                                className="w-full px-2 py-3 outline-none text-sm font-bold"
                                            />
                                            <button onClick={handleMakeOffer} className="bg-gray-100 hover:bg-gray-200 px-4 text-sm font-bold text-gray-700 border-l border-gray-300">
                                                Send
                                            </button>
                                        </div>
                                        {showOfferSent && (
                                            <span className="absolute -bottom-6 left-0 right-0 text-center text-xs font-bold text-emerald-600 animate-fade-in">Offer Sent!</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Seller Profile */}
                            <div className="border border-gray-200 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">About the Seller</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-lg font-bold text-indigo-800">
                                        RS
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-gray-900">Rahul S.</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded"><ShieldCheck size={12} /> Verified Identity</span>
                                            <span>•</span>
                                            <span>Member since 2019</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-sm">
                                    <div>
                                        <p className="font-bold text-gray-900">4.8 / 5</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Seller Rating</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">12</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Items Sold</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-t border-gray-200 text-xs text-gray-500 space-y-2">
                            <p className="flex items-start gap-1.5"><Truck size={14} className="mt-0.5 flex-shrink-0" /> Shipping is handled securely via Amazon Logistics. The seller never sees your address.</p>
                            <p className="flex items-start gap-1.5"><ShieldAlert size={14} className="mt-0.5 flex-shrink-0" /> All items pass through Amazon S4 AI Physical Inspection before final delivery.</p>
                            <p className="flex items-start gap-1.5"><Leaf size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" /> Buying used saves approximately 14kg of CO2 emissions.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
