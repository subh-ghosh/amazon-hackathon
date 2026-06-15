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
    setTimeout(() => {
      setData(defaultData);
      setLoading(false);
    }, 500);
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

function StatusCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Connecting to facility live feed...</p>
      </CardContent>
    </Card>
  );
}
