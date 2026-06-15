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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top return causes</CardTitle>
        <CardDescription>
          Return reasons across 1,284 units during this reporting period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {causes.map((cause) => {
          const TrendIcon = cause.change > 0 ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={cause.cause}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{cause.cause}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-slate-900">{cause.returns}</span>
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
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`${cause.cause}: ${cause.returns} returns, ${cause.percentage}% of total`}
              >
                <div
                  className="h-full rounded-full bg-emerald-600"
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
