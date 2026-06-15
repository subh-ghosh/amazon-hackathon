import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AiInsights } from "@/types/seller-analytics";

export function AiInsightsBanner({ insights }: { insights: AiInsights }) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Return Insights</h2>
            <p className="mt-1 text-sm text-slate-600">
              Amazon has analyzed recent returns, product signals, and recovery outcomes to surface the patterns below:
            </p>
            <ul className="mt-4 space-y-2">
              {insights.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
