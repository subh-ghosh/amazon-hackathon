"use client";

import { Leaf, Gift, TrendingUp, ShoppingBag, Heart, Recycle } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";

export default function GreenCreditsPage() {
    const { greenCredits, greenHistory } = useStore();

    const earnMethods = [
        { icon: <ShoppingBag size={20} />, action: "Buy a Renewed product", credits: "+50", color: "bg-emerald-100 text-emerald-700" },
        { icon: <Gift size={20} />, action: "Choose 'Keep item' refund", credits: "+30", color: "bg-blue-100 text-blue-700" },
        { icon: <Heart size={20} />, action: "Choose 'Donate' option", credits: "+40", color: "bg-purple-100 text-purple-700" },
        { icon: <Recycle size={20} />, action: "Trade in old item", credits: "+60", color: "bg-amber-100 text-amber-700" },
        { icon: <Leaf size={20} />, action: "Sustainable packaging order", credits: "+10", color: "bg-green-100 text-green-700" },
    ];

    const rewards = [
        { title: "$5 off next order", cost: 200, available: greenCredits >= 200 },
        { title: "$10 off Renewed products", cost: 300, available: greenCredits >= 300 },
        { title: "Free expedited shipping", cost: 150, available: greenCredits >= 150 },
        { title: "Plant a tree in your name", cost: 100, available: greenCredits >= 100 },
        { title: "Donate to NGO partner", cost: 50, available: greenCredits >= 50 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <div className="max-w-[900px] mx-auto px-4 py-8">
                {/* Balance card */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Leaf size={28} />
                        <h1 className="text-2xl font-bold">Green Credits</h1>
                    </div>
                    <p className="text-emerald-100 text-sm mb-6">Make sustainable choices. Earn rewards. Give products a second life.</p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold">{greenCredits}</span>
                        <span className="text-lg text-emerald-200 pb-1">credits</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-200">
                        <TrendingUp size={14} />
                        <span>You&apos;ve helped keep 6 items out of landfills</span>
                    </div>
                </div>

                {/* How to earn */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">How to earn credits</h2>
                    <div className="space-y-3">
                        {earnMethods.map((method, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                                <div className={`p-2.5 rounded-lg ${method.color}`}>{method.icon}</div>
                                <span className="flex-1 text-sm text-gray-700">{method.action}</span>
                                <span className="text-sm font-bold text-emerald-700">{method.credits}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rewards */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Redeem your credits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rewards.map((reward, i) => (
                            <div key={i} className={`p-4 rounded-lg border-2 ${reward.available ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                                <p className="text-sm font-medium text-gray-900">{reward.title}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">{reward.cost} credits</span>
                                    {reward.available && (
                                        <button className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                                            Redeem
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Credit history</h2>
                    <div className="space-y-2">
                        {greenHistory.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="text-sm text-gray-700">{entry.action}</p>
                                    <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-sm font-bold ${entry.credits > 0 ? "text-emerald-600" : "text-gray-500"}`}>
                                    {entry.credits > 0 ? "+" : ""}{entry.credits}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center py-4">
                    <Link href="/renewed" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-full transition-colors">
                        Shop Renewed & Earn Credits
                    </Link>
                </div>
            </div>
        </div>
    );
}
