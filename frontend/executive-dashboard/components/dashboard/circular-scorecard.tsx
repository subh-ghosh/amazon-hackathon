import { Card, CardContent } from "@/components/ui/card";
import type { ScorecardMetrics } from "@/types/executive-impact";
import { CircleDollarSign, Leaf, PackageSearch, HeartHandshake } from "lucide-react";

export function CircularScorecard({ data }: { data: ScorecardMetrics }) {
  const cards = [
    { label: "Money Saved", value: data.moneySaved, icon: CircleDollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Carbon Saved", value: data.carbonSaved, icon: Leaf, color: "text-emerald-700", bg: "bg-emerald-100" },
    { label: "Inventory Recovered", value: data.inventoryRecovered, icon: PackageSearch, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Social Impact", value: data.socialImpact, icon: HeartHandshake, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
        <Leaf className="w-96 h-96" />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="mb-8">
          <p className="text-cyan-300 font-bold tracking-widest text-sm uppercase mb-2">Network Summary</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Returns Performance Scorecard</h2>
          <p className="mt-2 text-slate-400 max-w-2xl">A consolidated view of financial recovery, inventory recirculation, and sustainability performance across the Amazon returns network.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className={`size-12 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="size-6" />
              </div>
              <p className="text-slate-300 font-medium text-sm">{card.label}</p>
              <p className="text-3xl font-bold mt-1 text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
