"use client";

import { useEffect, useState } from "react";

import { AiExecutiveSummary } from "@/components/dashboard/ai-executive-summary";
import { ImpactOverview } from "@/components/dashboard/impact-overview";
import { RecoveryPerformance } from "@/components/dashboard/recovery-performance";
import { RevenueOverview } from "@/components/dashboard/revenue-overview";
import { TopReturnCauses } from "@/components/dashboard/top-return-causes";
import { executiveDashboardData } from "@/data/executive-impact";
import {
  getTopReturnCauses,
  type TopReturnCause,
} from "@/lib/api/service12";

export function ExecutiveDashboardView() {
  const [topReturnCauses, setTopReturnCauses] = useState<TopReturnCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const data = await getTopReturnCauses();

        if (isMounted) {
          setTopReturnCauses(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("API Error"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to load data</div>;
  }

  return (
    <div className="space-y-6">
      <RevenueOverview data={executiveDashboardData.recoveredRevenue} />
      <ImpactOverview
        refundSavings={executiveDashboardData.refundSavings}
        sustainability={executiveDashboardData.sustainability}
        donation={executiveDashboardData.donation}
      />
      <div className="grid gap-6">
        <TopReturnCauses causes={topReturnCauses} />
        <RecoveryPerformance channels={executiveDashboardData.recoveryPerformance} />
        <AiExecutiveSummary summary={executiveDashboardData.aiSummary} />
      </div>
    </div>
  );
}
