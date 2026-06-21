import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import type { AiSummary } from "@/types/executive-impact";

export function AiExecutiveSummary({ summary }: { summary: AiSummary }) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-sm h-full">
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Executive AI Summary</h3>
          </div>
          <p className="text-lg font-medium text-slate-800 leading-snug mb-6">
            "{summary.headline}"
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                <AlertTriangle className="size-4" />
                Biggest Issue
              </div>
              <p className="text-sm text-slate-700">{summary.biggestIssue}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
                <TrendingUp className="size-4" />
                Biggest Opportunity
              </div>
              <p className="text-sm text-slate-700">{summary.biggestOpportunity}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Recovered This Week</p>
            <p className="text-lg font-bold text-slate-900">{summary.stats.recovered}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Returns Prevented</p>
            <p className="text-lg font-bold text-slate-900">{summary.stats.prevented}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">CO₂ Avoided</p>
            <p className="text-lg font-bold text-slate-900">{summary.stats.co2}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
