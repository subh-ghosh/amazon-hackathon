"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle, UploadCloud, Info } from "lucide-react";
import { useProduct } from "@/lib/catalog";
import { useStore } from "@/hooks/useStore";

function ResellListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get("productId");
    const orderId = searchParams.get("orderId");
    
    const { product, loading, error } = useProduct(productId || "");
    const { orders } = useStore();
    
    // Find original purchase data
    const order = orders.find(o => o.order_id === orderId);
    const purchaseDate = order ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown";

    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("very_good");
    const [step, setStep] = useState(1);
    
    if (loading) return <div className="max-w-[800px] mx-auto px-4 py-12">Loading...</div>;
    if (error || !product) return <div className="max-w-[800px] mx-auto px-4 py-12">Product not found.</div>;

    const originalPrice = product.price;
    const suggestedPrice = Math.round(originalPrice * 0.65);
    const amazonFee = Math.round((parseFloat(price) || suggestedPrice) * 0.05); // 5% fee
    const sellerEarnings = (parseFloat(price) || suggestedPrice) - amazonFee;

    const handleList = () => {
        setStep(2);
        setTimeout(() => {
            router.push("/p2p");
        }, 3000);
    };

    if (step === 2) {
        return (
            <div className="max-w-[600px] mx-auto px-4 py-24 text-center">
                <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Listed on Amazon P2P!</h1>
                <p className="text-gray-600 mb-8">Your product is now live on the Amazon Peer-to-Peer marketplace with the Verified Purchase badge.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left text-sm mb-8">
                    <p className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ShieldCheck size={16} className="text-[#007185]" /> What happens next?</p>
                    <ul className="space-y-2 text-gray-600">
                        <li>1. When a buyer purchases, we will send you a prepaid shipping label.</li>
                        <li>2. Ship the item to the nearest Amazon Quality Check Center.</li>
                        <li>3. Upon S4 AI condition verification, funds are released to your bank.</li>
                    </ul>
                </div>
                <button onClick={() => router.push("/p2p")} className="btn-amazon px-8 py-3">View P2P Marketplace</button>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">List item on Amazon P2P</h1>
            <p className="text-sm text-gray-500 mb-8">Sell directly to other Amazon customers with our Authenticity & Condition Guarantee.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col - Product Info */}
                <div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
                            <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded" />
                            <div>
                                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{product.title}</h3>
                                <div className="inline-flex items-center gap-1 bg-[#F0FAFA] text-[#007185] px-2 py-1 rounded text-[10px] font-bold mb-2">
                                    <ShieldCheck size={12} /> AMAZON VERIFIED PURCHASE
                                </div>
                                <p className="text-xs text-gray-500">Bought on: {purchaseDate}</p>
                                <p className="text-xs text-gray-500">Original Price: ₹{Math.round(originalPrice * 83).toLocaleString("en-IN")}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Item Condition</label>
                            <select 
                                value={condition} 
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2.5 text-sm"
                            >
                                <option value="like_new">Like New (No signs of wear)</option>
                                <option value="very_good">Very Good (Minor wear, fully functional)</option>
                                <option value="good">Good (Visible wear, fully functional)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Current Photo (Required for listing)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                                <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">Click to upload photo</p>
                                <p className="text-xs text-gray-500 mt-1">S4 AI will auto-verify condition</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col - Pricing */}
                <div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Set your price</h3>
                        
                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded mb-4 flex gap-2 items-start">
                            <Info size={14} className="mt-0.5 shrink-0" />
                            <p>Based on current market data, the suggested P2P price for this item in '{condition.replace("_", " ")}' condition is <strong>₹{Math.round(suggestedPrice * 83).toLocaleString("en-IN")}</strong>.</p>
                        </div>

                        <div className="mb-6 relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input 
                                type="number" 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder={Math.round(suggestedPrice * 83).toString()}
                                className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-lg font-bold text-gray-900 focus:border-[#007185] focus:ring-1 focus:ring-[#007185] outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Buyer pays</span>
                                <span>₹{Math.round((parseFloat(price) || suggestedPrice) * 83).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Amazon Inspection & Escrow Fee (5%)</span>
                                <span>- ₹{Math.round(amazonFee * 83).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>You earn</span>
                                <span>₹{Math.round(sellerEarnings * 83).toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <button onClick={handleList} className="w-full btn-amazon py-3 text-base font-bold flex items-center justify-center gap-2">
                            List on Amazon P2P
                        </button>
                        <p className="text-[10px] text-gray-400 text-center mt-3">
                            By listing, you agree to Amazon's Peer-to-Peer terms. Items failing S4 condition inspection at the warehouse will be returned at seller's expense.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResellListPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResellListContent />
        </Suspense>
    );
}
