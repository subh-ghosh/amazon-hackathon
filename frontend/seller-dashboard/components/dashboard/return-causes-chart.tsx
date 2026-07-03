import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReturnCause } from "@/types/seller-analytics";

interface ReturnCausesChartProps {
  causes: ReturnCause[];
}

export function ReturnCausesChart({ causes }: ReturnCausesChartProps) {
  const largestValue = Math.max(...causes.map((cause) => cause.returns));
  const total = causes.reduce((sum, c) => sum + c.returns, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Top return causes</CardTitle>
            <CardDescription>
              Return reasons across {total.toLocaleString("en-IN")} units this period.
            </CardDescription>
          </div>
          <span className="text-xs font-medium text-slate-400 tabular-nums">
            {causes.length} causes
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {causes.map((cause) => {
          const TrendIcon = cause.change > 0 ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={cause.cause}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{cause.cause}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-slate-900">{cause.returns}</span>
                  <span className="text-xs text-slate-400 tabular-nums w-8 text-right">{cause.percentage.toFixed(1)}%</span>
                  <span
                    className={cn(
                      "flex w-14 items-center justify-end text-xs font-medium",
                      cause.change > 0 ? "text-rose-600" : "text-emerald-700",
                    )}
                  >
                    <TrendIcon className="mr-0.5 size-3.5" aria-hidden="true" />
                    {Math.abs(cause.change)}%
                  </span>
                </div>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`${cause.cause}: ${cause.returns} returns, ${cause.percentage}% of total`}
              >
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{ width: `${(cause.returns / largestValue) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
