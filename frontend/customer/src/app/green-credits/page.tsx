"use client";

import { Leaf, ShoppingBag, Gift, Recycle, Package, ArrowRight } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";

export default function GreenCreditsPage() {
    const { greenCredits, greenHistory } = useStore();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-[#232F3E] text-white">
                <div className="max-w-[900px] mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-1">Amazon Sustainability Rewards</h1>
                    <p className="text-gray-300 text-sm">Earn rewards for making choices that reduce waste and support the circular economy.</p>
                </div>
            </div>

            <div className="max-w-[900px] mx-auto px-4 py-8">
                {/* Balance */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Your balance</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">{greenCredits}</span>
                            <span className="text-sm text-gray-500">reward points</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                        <Leaf size={16} />
                        <span>You&apos;ve helped extend the life of 6 products</span>
                    </div>
                </div>

                {/* How to earn */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">How to earn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <EarnCard icon={<ShoppingBag size={18} />} action="Buy Certified Renewed" points="+50" />
                    <EarnCard icon={<Gift size={18} />} action="Choose keep-item resolution" points="+30" />
                    <EarnCard icon={<Recycle size={18} />} action="Trade in an old device" points="+60" />
                    <EarnCard icon={<Package size={18} />} action="Choose consolidated shipping" points="+10" />
                </div>

                {/* Redeem */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Redeem rewards</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    <RedeemCard title="₹500 off your order" cost={200} available={greenCredits >= 200} />
                    <RedeemCard title="Free next-day delivery" cost={150} available={greenCredits >= 150} />
                    <RedeemCard title="₹1,000 off Renewed" cost={300} available={greenCredits >= 300} />
                </div>

                {/* History */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {greenHistory.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                            <div>
                                <p className="text-sm text-gray-800">{entry.action}</p>
                                <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                            </div>
                            <span className={`text-sm font-medium ${entry.credits > 0 ? "text-emerald-600" : "text-gray-500"}`}>
                                {entry.credits > 0 ? "+" : ""}{entry.credits}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Link href="/renewed" className="inline-flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium">
                        Browse Certified Renewed products <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function EarnCard({ icon, action, points }: { icon: React.ReactNode; action: string; points: string }) {
    return (
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <div className="text-gray-400">{icon}</div>
            <span className="flex-1 text-sm text-gray-700">{action}</span>
            <span className="text-sm font-bold text-emerald-700">{points}</span>
        </div>
    );
}

function RedeemCard({ title, cost, available }: { title: string; cost: number; available: boolean }) {
    return (
        <div className={`p-4 border rounded-lg ${available ? "border-gray-200" : "border-gray-100 opacity-50"}`}>
            <p className="text-sm font-medium text-gray-900 mb-2">{title}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{cost} points</span>
                {available && <button className="text-xs font-medium text-[#007185] hover:underline">Redeem</button>}
            </div>
        </div>
    );
}
