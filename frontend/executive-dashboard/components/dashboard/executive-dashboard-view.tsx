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
import { LiveEventTicker } from "@/components/dashboard/live-event-ticker";
import { VisualInspectionAnalytics } from "@/components/dashboard/visual-inspection-analytics";
import { FraudAnalytics } from "@/components/dashboard/fraud-analytics";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executiveDashboardData as defaultData } from "@/data/executive-impact";
import type { ExecutiveDashboardData } from "@/types/executive-impact";

export function ExecutiveDashboardView() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/executive", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Executive snapshot failed with status ${response.status}`);
        }
        return response.json() as Promise<ExecutiveDashboardData>;
      }),
      fetch("/api/proxy/s9/api/v1/logistics/analytics").then(r => r.json()).catch(() => null),
      fetch("/api/proxy/s12/api/v1/intelligence/analytics/top-return-causes").then(r => r.json()).catch(() => null),
      fetch("/api/proxy/s12/api/v1/intelligence/analytics/recovery-effectiveness").then(r => r.json()).catch(() => null),
    ]).then(([snapshot, s9Analytics, s12Causes, s12Recovery]) => {
      const merged = structuredClone(snapshot);

      // Enrich with live S9 analytics
      if (s9Analytics && s9Analytics.totalOptimizations) {
        merged.kpis = merged.kpis.map((kpi) => {
          if (kpi.label === "CO₂ Saved (Tons)") {
            return { ...kpi, value: `${(s9Analytics.averageCO2Saved * s9Analytics.totalOptimizations).toLocaleString()}` };
          }
          return kpi;
        });
        merged.sustainability = {
          ...merged.sustainability,
          circularRecoveryRate: Math.min(100, s9Analytics.circularityImpact || merged.sustainability.circularRecoveryRate),
        };
      }

      // Enrich with live S12 top causes
      if (s12Causes && s12Causes.data) {
        const causes = s12Causes.data.slice(0, 3);
        merged.intelligence = {
          ...merged.intelligence,
          topReasons: causes.map((c: { category?: string; cause_id?: string; frequency?: number }) => ({
            name: c.category || c.cause_id || "Unknown",
            value: `${(c.frequency || 0).toLocaleString()}`,
            percentage: Math.round(((c.frequency || 0) / Math.max(1, causes.reduce((s: number, x: { frequency?: number }) => s + (x.frequency || 0), 0))) * 100),
          })),
        };
      }

      // Enrich with live S12 recovery effectiveness
      if (s12Recovery && s12Recovery.data) {
        merged.aiSummary = {
          ...merged.aiSummary,
          biggestOpportunity: `Recovery data shows ${s12Recovery.data.length} active paths. Top: ${s12Recovery.data[0]?.action_type || "Refurbish"} with avg ₹${Math.round((s12Recovery.data[0]?.avg_value_recovered || 120) * 83).toLocaleString("en-IN")} recovered.`,
        };
      }

      setData(merged);
      setLoading(false);
    }).catch(() => {
      // Fallback to static data if DynamoDB fails
      setData(defaultData);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return <StatusCard title="Loading executive intelligence..." />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* PAGE HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Returns & Recovery
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Network-wide recovery performance, sustainability impact, and financial outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
            {data.reportingPeriod}
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-md border bg-[#232F3E] px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#37475A]"
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
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OperationalImpact data={data.operational} />
          </div>
          <div className="lg:col-span-1">
            <LiveEventTicker />
          </div>
        </section>

        {/* SECTION 8: AI VISUAL INSPECTION INTELLIGENCE */}
        <section>
          <VisualInspectionAnalytics />
        </section>

        {/* SECTION 9: PRE-ORDER FRAUD DETECTION ENGINE */}
        <section>
          <FraudAnalytics />
        </section>
      </div>
    </main>
  );
}

function StatusCard({ title, detail }: { title: string; detail?: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{detail ?? "Connecting to global intelligence stream..."}</p>
        </CardContent>
      </Card>
    </main>
  );
}
