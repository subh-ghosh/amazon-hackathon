import { ArrowUpRight, CircleDollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RecoveredRevenue } from "@/types/executive-impact";

interface RevenueOverviewProps {
  data: RecoveredRevenue;
}

function createChartPoints(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = 8 + (index / (values.length - 1)) * 84;
      const y = 76 - ((value - min) / range) * 52;
      return `${x},${y}`;
    })
    .join(" ");
}

export function RevenueOverview({ data }: RevenueOverviewProps) {
  const chartPoints = createChartPoints(
    data.monthlyTrend.map((point) => point.value),
  );

  return (
    <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-executive">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative p-7 lg:p-9">
          <div className="absolute -left-20 -top-24 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <CircleDollarSign className="size-6" aria-hidden="true" />
              </div>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <ArrowUpRight className="mr-1 size-3.5" aria-hidden="true" />
                {data.growthPercent}% YoY
              </Badge>
            </div>
            <p className="mt-8 text-sm font-medium text-slate-400">
              Total recovered revenue
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              ${(data.total / 1_000_000).toFixed(2)}M
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Value recovered through resale, refurbishment, donation tax benefit,
              and responsible material recovery.
            </p>
            <div className="mt-8">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Annual target progress</span>
                <span className="font-semibold text-emerald-400">
                  {data.targetProgress}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${data.targetProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900/60 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Monthly recovery trend</p>
              <p className="mt-1 text-xs text-slate-500">Revenue in USD millions</p>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              $10.6M June
            </span>
          </div>
          <div className="mt-6">
            <svg
              viewBox="0 0 100 90"
              className="h-56 w-full overflow-visible"
              role="img"
              aria-label="Recovered revenue increased from 6.1 million in January to 10.6 million in June"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[24, 41, 58, 75].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.4"
                  strokeDasharray="2 2"
                />
              ))}
              <polygon
                points={`8,82 ${chartPoints} 92,82`}
                fill="url(#revenue-fill)"
              />
              <polyline
                points={chartPoints}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {data.monthlyTrend.map((point, index) => {
                const [x, y] = chartPoints.split(" ")[index].split(",");
                return (
                  <circle
                    key={point.month}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="#020617"
                    stroke="#6ee7b7"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
            <div className="grid grid-cols-6 text-center text-xs text-slate-500">
              {data.monthlyTrend.map((point) => (
                <span key={point.month}>{point.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
