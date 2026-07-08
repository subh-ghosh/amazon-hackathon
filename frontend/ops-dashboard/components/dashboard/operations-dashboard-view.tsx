"use client";

import { useEffect, useState } from "react";
import { ReturnsKpis } from "@/components/dashboard/returns-kpis";
import { RecoveryPipeline } from "@/components/dashboard/recovery-pipeline";
import { InspectionTable } from "@/components/dashboard/inspection-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsData as defaultData } from "@/data/operations-data";
import type { OperationsData } from "@/types/operations";

export function OperationsDashboardView() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/operations", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Operations snapshot failed with status ${response.status}`);
        }
        return response.json() as Promise<OperationsData>;
      }),
      fetch("/api/proxy/s9/api/v1/logistics/analytics").then(r => r.json()).catch(() => null),
      fetch("/api/proxy/s5/api/v1/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: "RET-OPS-LIVE",
          productId: "P-88421",
          category: "Smart Home",
          conditionScore: 92,
          utilityScore: 88,
          fraudScore: 12,
          estimatedValue: 249.99,
          returnReason: "DAMAGED_IN_TRANSIT",
          sellerTrustScore: 0.92,
        }),
      }).then(r => r.json()).catch(() => null),
    ]).then(([snapshot, analyticsData, simData]) => {
      const merged = structuredClone(snapshot);

      // Enrich pipeline with live S9 data
      if (analyticsData && analyticsData.totalOptimizations) {
        merged.returns = {
          ...merged.returns,
          processedToday: analyticsData.totalOptimizations + merged.returns.processedToday,
          recoveryValueGenerated: Math.round(analyticsData.averageCostSavings * analyticsData.totalOptimizations) + merged.returns.recoveryValueGenerated,
        };
      }

      // Enrich triage recovery options with live S5 scenarios
      if (simData && simData.simulations && merged.triageDetails["RET-9921-A"]) {
        merged.triageDetails["RET-9921-A"].recoveryOptions = simData.simulations.map((sim: { scenario: string; recoveryValue: number; confidence: number; processingTimeDays: number; carbonImpact: number }, i: number) => ({
          type: sim.scenario.toUpperCase().replace(/\s+/g, "_"),
          label: sim.scenario,
          expectedValue: sim.recoveryValue,
          confidence: Math.round(sim.confidence * 100),
          timeRequiredHours: sim.processingTimeDays * 24,
          isRecommended: i === 0,
          details: {
            processingCost: Math.round(sim.recoveryValue * 0.05 * 100) / 100,
            carbonImpact: `${sim.carbonImpact} kg CO₂`,
            facilityName: "BLR Center 04",
          },
        }));
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
    return <StatusCard title="Loading facility operations..." />;
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1: TOP KPI ROW */}
      <section>
        <ReturnsKpis data={data.returns} />
      </section>

      {/* SECTION 10: RECOVERY PIPELINE */}
      <section>
        <RecoveryPipeline stages={data.pipeline} />
      </section>

      {/* SECTION 2: INSPECTION QUEUE */}
      <section>
        <InspectionTable products={data.inspections} />
      </section>
    </div>
  );
}

function StatusCard({ title, detail }: { title: string; detail?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{detail ?? "Connecting to facility live feed..."}</p>
      </CardContent>
    </Card>
  );
}
