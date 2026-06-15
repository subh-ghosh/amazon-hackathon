import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActionRecommendation } from "@/types/seller-analytics";

export function ActionCenter({ recommendations }: { recommendations: ActionRecommendation[] }) {
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-blue-600" />
          <CardTitle>Recommended Actions</CardTitle>
        </div>
        <CardDescription>Prioritized tasks to reduce your return rate and increase profitability.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {recommendations.map((rec) => (
            <li key={rec.id} className="flex flex-col p-5 hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                  <Badge
                    className={
                      rec.priority === "HIGH"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : rec.priority === "MEDIUM"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {rec.priority} PRIORITY
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{rec.description}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <AlertCircle className="size-3.5" />
                  Estimated Impact: {rec.impact}
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 flex items-center gap-1.5 rounded-md bg-white border px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Review Task
                <ArrowRight className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
