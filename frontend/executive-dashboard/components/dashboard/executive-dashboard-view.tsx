"use client";

import { useEffect, useState } from "react";
import { Download, CalendarDays } from "lucide-react";

import { CircularScorecard } from "@/components/dashboard/circular-scorecard";
import { ExecutiveKpiRow } from "@/components/dashboard/executive-kpi-row";
import { RecoveryMix } from "@/components/dashboard/recovery-mix";
import { FinancialImpact } from "@/components/dashboard/financial-impact";
import { SustainabilityImpact } from "@/components/dashboard/sustainability-impact";
import { ReturnIntelligence } from "@/components/dashboard/return-intelligence";
import { AiExecutiveSummary } from "@/components/dashboard/ai-executive-summary";
import { OperationalImpact } from "@/components/dashboard/operational-impact";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executiveDashboardData as defaultData } from "@/data/executive-impact";
import type { ExecutiveDashboardData } from "@/types/executive-impact";

export function ExecutiveDashboardView() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData(defaultData);
      setLoading(false);
    }, 600);
  }, []);

  if (loading || !data) {
    return <StatusCard title="Loading executive intelligence..." />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* PAGE HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-800 uppercase tracking-wider">
            Amazon
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Executive Network Insights
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            A consolidated view of recovery value, operational performance, sustainability, and trust risk across the Amazon returns network.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
            {data.reportingPeriod}
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-md border bg-cyan-950 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-cyan-900"
          >
            <Download className="size-4" aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>

      <div className="space-y-8 pb-12">
        <section>
          <CircularScorecard data={data.scorecard} />
        </section>

        {/* SECTION 1: TOP KPI ROW */}
        <section>
          <ExecutiveKpiRow kpis={data.kpis} />
        </section>

        {/* SECTIONS 3 & 6: FINANCIAL IMPACT & AI SUMMARY */}
        <section className="grid gap-6 lg:grid-cols-2">
          <FinancialImpact data={data.financial} />
          <AiExecutiveSummary summary={data.aiSummary} />
        </section>

        {/* SECTIONS 2 & 4: RECOVERY MIX & SUSTAINABILITY */}
        <section className="grid gap-6 lg:grid-cols-2">
          <RecoveryMix channels={data.recoveryMix} />
          <SustainabilityImpact data={data.sustainability} />
        </section>

        {/* SECTION 5: RETURN INTELLIGENCE */}
        <section>
          <ReturnIntelligence data={data.intelligence} />
        </section>

        {/* SECTION 7: OPERATIONAL IMPACT */}
        <section>
          <OperationalImpact data={data.operational} />
        </section>
      </div>
    </main>
  );
}

function StatusCard({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Connecting to global intelligence stream...</p>
        </CardContent>
      </Card>
    </main>
  );
}
