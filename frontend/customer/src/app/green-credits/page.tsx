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
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Leaf className="text-emerald-400" /> Amazon Green Passport</h1>
                    <p className="text-gray-300 text-sm">Your lifetime sustainability impact and rewards for supporting the circular economy.</p>
                </div>
            </div>

            <div className="max-w-[900px] mx-auto px-4 py-8">
                {/* Balance & Impact Scorecard */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sm:p-6 mb-8 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Your Sustainability Tier</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-emerald-700 uppercase tracking-wide">Earth Champion</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Reward Balance</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-3xl font-bold text-gray-900">{greenCredits}</span>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pts</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="bg-white p-3 rounded border border-gray-100">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Products Saved</p>
                            <p className="text-lg font-bold text-gray-900">14 <span className="text-xs font-normal text-gray-500">items</span></p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-100">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">CO₂ Offset</p>
                            <p className="text-lg font-bold text-emerald-600">82.4 <span className="text-xs font-normal text-emerald-600/70">kg</span></p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-100">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">E-Waste Diverted</p>
                            <p className="text-lg font-bold text-blue-600">4.2 <span className="text-xs font-normal text-blue-600/70">kg</span></p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-100">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Logistics Avoided</p>
                            <p className="text-lg font-bold text-amber-600">6 <span className="text-xs font-normal text-amber-600/70">trips</span></p>
                        </div>
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
