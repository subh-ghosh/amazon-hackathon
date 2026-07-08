"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RufusActionPlan() {
  const [isUpdatingSizing, setIsUpdatingSizing] = useState(false);
  const [sizingUpdated, setSizingUpdated] = useState(false);

  const [isUpdatingPackaging, setIsUpdatingPackaging] = useState(false);
  const [packagingUpdated, setPackagingUpdated] = useState(false);

  const handleUpdateSizing = () => {
    setIsUpdatingSizing(true);
    setTimeout(() => {
      setIsUpdatingSizing(false);
      setSizingUpdated(true);
    }, 2000);
  };

  const handleUpdatePackaging = () => {
    setIsUpdatingPackaging(true);
    setTimeout(() => {
      setIsUpdatingPackaging(false);
      setPackagingUpdated(true);
    }, 2000);
  };

  return (
    <Card className="border-t-4 border-t-blue-600 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden relative">
      {/* Decorative Rufus Sparkle */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} className="text-blue-600" />
      </div>

      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Sparkles size={16} />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-900">Rufus AI Action Plan</CardTitle>
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Generative Insights</p>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-slate-700 leading-relaxed mb-5 max-w-3xl">
          Based on an analysis of your last 5,000 orders and 340 returns across the Indian network, S2 Truth Discovery has identified two high-impact actions to improve your EBITDA and Seller Tier status.
        </p>

        <div className="space-y-4 relative z-10">
          {/* Insight 1 */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Listing Specification Gap for Fire TV Stick 4K</h4>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">High Priority</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Finding:</strong> 18% of your Fire TV Stick 4K returns are tagged as 'Ordered by mistake' or 'Item not as described', primarily due to WiFi incompatibility. 
                </p>
                <div className="rounded-lg bg-slate-50 p-3 mt-2 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-slate-800">
                      <strong>Rufus Recommendation:</strong> Update your product listing to explicitly state "Requires 5GHz WiFi for 4K streaming" and add a compatibility checker. Predicted to reduce these return reasons by 40%.
                    </p>
                  </div>
                  {!sizingUpdated ? (
                    <button 
                      onClick={handleUpdateSizing}
                      disabled={isUpdatingSizing}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-70"
                    >
                      {isUpdatingSizing ? (
                        <><Loader2 size={14} className="animate-spin" /> Executing S12 Knowledge Graph Update...</>
                      ) : (
                        <>Auto-Update Catalog Details via S12 <ArrowRight size={14} /></>
                      )}
                    </button>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md w-fit">
                      <CheckCircle2 size={14} /> Catalog Successfully Updated
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <TrendingUp size={16} />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Packaging Upgrade Opportunity for Echo Show 10</h4>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Cost Savings</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Finding:</strong> 40.4% of your returns for the Echo Show 10 are due to 'Damaged in transit' caused by insufficient internal cushioning.
                </p>
                <div className="rounded-lg bg-slate-50 p-3 mt-2 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-slate-800">
                      <strong>Rufus Recommendation:</strong> Switch to reinforced corner packaging and add bubble wrap. This will save approximately ₹42,000 annually by reducing transit damage by 45%.
                    </p>
                  </div>
                  {!packagingUpdated ? (
                    <button 
                      onClick={handleUpdatePackaging}
                      disabled={isUpdatingPackaging}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-70"
                    >
                      {isUpdatingPackaging ? (
                        <><Loader2 size={14} className="animate-spin" /> Pushing Override to Fulfillment Network...</>
                      ) : (
                        <>Apply FBA Packaging Override <ArrowRight size={14} /></>
                      )}
                    </button>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md w-fit">
                      <CheckCircle2 size={14} /> FBA Requirements Updated
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
