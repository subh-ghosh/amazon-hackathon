import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SustainabilityMetrics } from "@/types/executive-impact";
import { Leaf, Recycle, Heart, Globe } from "lucide-react";

export function SustainabilityImpact({ data }: { data: SustainabilityMetrics }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sustainability Impact</CardTitle>
        <CardDescription>Environmental and social footprint of the Circular OS.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <Leaf className="size-5 text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">CO₂ Saved (Tonnes)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{data.co2SavedTonnes.toLocaleString()}</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Recycle className="size-5 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Waste Diverted (Tons)</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{data.wasteDivertedTonnes.toLocaleString()}</p>
          </div>
          
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
            <Heart className="size-5 text-violet-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Items Donated</p>
            <p className="text-2xl font-bold text-violet-700 mt-1">{data.itemsDonated.toLocaleString()}</p>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <Globe className="size-5 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Circular Recovery Rate</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{data.circularRecoveryRate.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
