"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductInsight } from "@/types/seller-analytics";

interface RufusActionPlanProps {
  product: ProductInsight;
}

export function RufusActionPlan({ product }: RufusActionPlanProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const handleUpdate = (id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // removed hardcoded loading states

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
          Based on an analysis of {product.orders.toLocaleString("en-IN")} orders and {product.returns.toLocaleString("en-IN")} returns for <strong>{product.name}</strong>, S2 Truth Discovery has identified {product.recommendations.length} high-impact actions to improve your recovery margin.
        </p>

        <div className="space-y-4 relative z-10">
          {product.recommendations.map((rec) => {
            const isDone = doneIds.has(rec.id);
            const isPriority = rec.priority === "HIGH";
            const Icon = isPriority ? AlertTriangle : TrendingUp;
            const iconBg = isPriority ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
            const badgeClass = isPriority ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div key={rec.id} className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">{rec.title}</h4>
                      <Badge variant="outline" className={`${badgeClass} text-[10px]`}>{rec.priority} Priority</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      <strong className="text-slate-800">Impact:</strong> {rec.impact}
                    </p>
                    <div className="rounded-lg bg-slate-50 p-3 mt-2 border border-slate-100">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-slate-800">
                          <strong>Rufus Recommendation:</strong> {rec.description}
                        </p>
                      </div>
                      {!isDone ? (
                        <button 
                          onClick={() => handleUpdate(rec.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Auto-Remediate via S11 <ArrowRight size={14} />
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md w-fit">
                          <CheckCircle2 size={14} /> Action Successfully Applied
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </CardContent>
    </Card>
  );
}
