"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Leaf, RefreshCw, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ProductDigitalTwin,
  RecoveryProjection,
} from "@/types/product-twin";

interface RecoverySimulatorProps {
  twin: ProductDigitalTwin;
}

function createProjection(
  twin: ProductDigitalTwin,
  months: number,
  careLevel: number,
): RecoveryProjection {
  const monthlyDepreciation = careLevel >= 80 ? 0.009 : careLevel >= 60 ? 0.014 : 0.02;
  const retainedUtility = Math.max(
    18,
    Math.round(twin.utilityScore * (1 - monthlyDepreciation * months)),
  );
  const projectedValue = Math.max(
    18,
    Math.round(249 * (retainedUtility / 100) * (twin.conditionScore / 100)),
  );

  return {
    projectedValue,
    retainedUtility,
    carbonAvoidedKg: Number((6.2 + retainedUtility * 0.07).toFixed(1)),
    recommendedPath:
      retainedUtility >= 78
        ? "Resell"
        : retainedUtility >= 48
          ? "Refurbish"
          : "Recycle",
  };
}

export function RecoverySimulator({ twin }: RecoverySimulatorProps) {
  const [months, setMonths] = useState(12);
  const [careLevel, setCareLevel] = useState(85);
  const projection = useMemo(
    () => createProjection(twin, months, careLevel),
    [twin, months, careLevel],
  );

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div>
          <CardHeader className="pb-4">
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <RefreshCw className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">Future recovery simulator</CardTitle>
            <CardDescription className="max-w-lg text-slate-400">
              Model the product&apos;s likely circular path based on when you
              return it and how well it is maintained.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <label className="block">
              <span className="flex justify-between text-sm">
                <span className="font-medium">Recovery timeframe</span>
                <span className="text-emerald-400">{months} months</span>
              </span>
              <input
                type="range"
                min="1"
                max="48"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
                className="mt-4 h-1.5 w-full cursor-pointer accent-emerald-400"
              />
              <span className="mt-2 flex justify-between text-xs text-slate-500">
                <span>1 month</span>
                <span>48 months</span>
              </span>
            </label>

            <label className="block">
              <span className="flex justify-between text-sm">
                <span className="font-medium">Expected care level</span>
                <span className="text-emerald-400">{careLevel}%</span>
              </span>
              <input
                type="range"
                min="30"
                max="100"
                value={careLevel}
                onChange={(event) => setCareLevel(Number(event.target.value))}
                className="mt-4 h-1.5 w-full cursor-pointer accent-emerald-400"
              />
              <span className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Heavy use</span>
                <span>Like new</span>
              </span>
            </label>
          </CardContent>
        </div>

        <div className="border-t border-slate-800 bg-slate-900/70 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Projected outcome
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProjectionMetric
              label="Recovery value"
              value={`$${projection.projectedValue}`}
              icon={TrendingUp}
            />
            <ProjectionMetric
              label="Utility retained"
              value={`${projection.retainedUtility}%`}
              icon={RefreshCw}
            />
            <ProjectionMetric
              label="CO2e avoided"
              value={`${projection.carbonAvoidedKg} kg`}
              icon={Leaf}
            />
          </div>
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <p className="text-xs text-emerald-300">Recommended recovery path</p>
            <div className="mt-1 flex items-center justify-between gap-4">
              <p className="text-2xl font-bold">{projection.recommendedPath}</p>
              <Button size="sm" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                Plan recovery
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Estimates use the current twin state and mock depreciation data.
            Final recovery value is confirmed after inspection.
          </p>
        </div>
      </div>
    </Card>
  );
}

interface ProjectionMetricProps {
  label: string;
  value: string;
  icon: typeof TrendingUp;
}

function ProjectionMetric({ label, value, icon: Icon }: ProjectionMetricProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <Icon className="size-4 text-emerald-400" aria-hidden="true" />
      <p className="mt-5 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
