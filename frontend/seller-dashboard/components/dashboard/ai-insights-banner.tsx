import { Sparkles, Lightbulb, TrendingUp, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AiInsights } from "@/types/seller-analytics";

const insightIcons = [Lightbulb, TrendingUp, Leaf];

export function AiInsightsBanner({ insights }: { insights: AiInsights }) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">AI Return Insights</h2>
            <p className="mt-1 text-sm text-slate-500">
              Patterns detected from recent returns, product signals, and recovery outcomes.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {insights.highlights.map((highlight, index) => {
                const Icon = insightIcons[index % insightIcons.length];
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-white/80 p-3 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <Icon className="size-4 shrink-0 mt-0.5 text-blue-500" />
                    <span className="leading-snug">{highlight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
