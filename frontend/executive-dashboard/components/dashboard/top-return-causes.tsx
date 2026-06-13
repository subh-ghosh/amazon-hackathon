import { ArrowDownRight, ArrowUpRight, RotateCcw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TopReturnCause } from "@/lib/api/service12";

interface TopReturnCausesProps {
  causes: TopReturnCause[];
}

export function TopReturnCauses({ causes }: TopReturnCausesProps) {
  const largestValue = Math.max(...causes.map((cause) => cause.returns), 1);
  const totalReturns = causes.reduce((sum, cause) => sum + cause.returns, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
          <RotateCcw className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Top return causes</CardTitle>
        <CardDescription>
          Live Service #12 intelligence across{" "}
          {totalReturns.toLocaleString("en-US")} returns.
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
                  <span className="font-semibold text-slate-900">
                    {cause.returns.toLocaleString("en-US")}
                  </span>
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
                  className="h-full rounded-full bg-rose-600"
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
