"use client";

import { useEffect, useState } from "react";

import { AiExecutiveSummary } from "@/components/dashboard/ai-executive-summary";
import { ImpactOverview } from "@/components/dashboard/impact-overview";
import { RecoveryPerformance } from "@/components/dashboard/recovery-performance";
import { RevenueOverview } from "@/components/dashboard/revenue-overview";
import { TopReturnCauses } from "@/components/dashboard/top-return-causes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { executiveDashboardData } from "@/data/executive-impact";
import {
  adaptGraphStats,
  adaptRecoveryEffectiveness,
  adaptTopReturnCauses,
  type GraphStatsView,
  type RecoveryChannelView,
  type TopReturnCauseView,
} from "../../../shared/api/adapters";
import {
  getGraphStats,
  getRecoveryEffectiveness,
  getTopReturnCauses,
} from "../../../shared/api/service12";
import {
  circularDemoRecoveryMix,
  circularDemoReturnCauses,
  circularDemoSeller,
} from "../../../shared/demo/circular-demo-data";

type Resource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function ExecutiveDashboardView() {
  const [topReturnCauses, setTopReturnCauses] = useState<
    Resource<TopReturnCauseView[]>
  >({
    data: null,
    loading: true,
    error: null,
  });
  const [recoveryEffectiveness, setRecoveryEffectiveness] = useState<
    Resource<RecoveryChannelView[]>
  >({
    data: null,
    loading: true,
    error: null,
  });
  const [graphStats, setGraphStats] = useState<Resource<GraphStatsView>>({
    data: null,
    loading: true,
    error: null,
  });

  function loadTopReturnCauses() {
    setTopReturnCauses((current) => ({ ...current, loading: true, error: null }));

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setTopReturnCauses({
        data: [...circularDemoReturnCauses],
        loading: false,
        error: null,
      });
      return;
    }

    getTopReturnCauses()
      .then((payload) => {
        setTopReturnCauses({
          data: adaptTopReturnCauses(payload),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        setTopReturnCauses({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  function loadRecoveryEffectiveness() {
    setRecoveryEffectiveness((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setRecoveryEffectiveness({
        data: circularDemoRecoveryMix.map((channel) => ({ ...channel })),
        loading: false,
        error: null,
      });
      return;
    }

    getRecoveryEffectiveness()
      .then((payload) => {
        setRecoveryEffectiveness({
          data: adaptRecoveryEffectiveness(payload),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        setRecoveryEffectiveness({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  function loadGraphStats() {
    setGraphStats((current) => ({ ...current, loading: true, error: null }));

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setGraphStats({
        data: {
          totalCustomers: 1,
          totalProducts: 1,
          totalSellers: 1,
          totalOrders: circularDemoSeller.totalOrders,
          totalReturns: circularDemoSeller.totalReturns,
          totalFraudCases: circularDemoSeller.fraudCases,
          totalRootCauses: circularDemoReturnCauses.length,
          totalRecoveryActions: circularDemoRecoveryMix.reduce(
            (total, channel) => total + channel.units,
            0,
          ),
        },
        loading: false,
        error: null,
      });
      return;
    }

    getGraphStats()
      .then((payload) => {
        setGraphStats({
          data: adaptGraphStats(payload),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        setGraphStats({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  useEffect(() => {
    loadTopReturnCauses();
    loadRecoveryEffectiveness();
    loadGraphStats();
  }, []);

  const executiveData = graphStats.data
    ? withGraphStats(graphStats.data)
    : executiveDashboardData;

  return (
    <div className="space-y-6">
      <ResourceState
        resource={graphStats}
        empty={!graphStats.data || graphStats.data.totalReturns === 0}
        loadingLabel="Loading graph statistics..."
        emptyLabel="No graph statistics available."
        onRetry={loadGraphStats}
      >
        <RevenueOverview data={executiveData.recoveredRevenue} />
        <ImpactOverview
          refundSavings={executiveData.refundSavings}
          sustainability={executiveData.sustainability}
          donation={executiveData.donation}
        />
      </ResourceState>
      <div className="grid gap-6">
        <ResourceState
          resource={topReturnCauses}
          empty={(topReturnCauses.data ?? []).length === 0}
          loadingLabel="Loading top return causes..."
          emptyLabel="No return causes found."
          onRetry={loadTopReturnCauses}
        >
          <TopReturnCauses causes={topReturnCauses.data ?? []} />
        </ResourceState>
        <ResourceState
          resource={recoveryEffectiveness}
          empty={(recoveryEffectiveness.data ?? []).length === 0}
          loadingLabel="Loading recovery effectiveness..."
          emptyLabel="No recovery effectiveness data found."
          onRetry={loadRecoveryEffectiveness}
        >
          <RecoveryPerformance channels={recoveryEffectiveness.data ?? []} />
        </ResourceState>
        <AiExecutiveSummary summary={executiveDashboardData.aiSummary} />
      </div>
    </div>
  );
}

function ResourceState<T>({
  resource,
  empty,
  loadingLabel,
  emptyLabel,
  onRetry,
  children,
}: {
  resource: Resource<T>;
  empty: boolean;
  loadingLabel: string;
  emptyLabel: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (resource.loading) {
    return <StatusCard title={loadingLabel} />;
  }

  if (resource.error) {
    return (
      <StatusCard
        title="Unable to load Service #12 data"
        detail={resource.error}
        onRetry={onRetry}
      />
    );
  }

  if (empty) {
    return <StatusCard title={emptyLabel} onRetry={onRetry} />;
  }

  return <>{children}</>;
}

function StatusCard({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{detail ?? "Service #12 live data"}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="h-9 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function withGraphStats(stats: GraphStatsView) {
  const returns = stats.totalReturns;
  const products = stats.totalProducts;
  const fraudCases = stats.totalFraudCases;
  const recoveryActions = stats.totalRecoveryActions;

  return {
    ...executiveDashboardData,
    recoveredRevenue: {
      total: recoveryActions * 38,
      growthPercent: 0,
      targetProgress: Math.min(100, Math.round((recoveryActions / Math.max(returns, 1)) * 100)),
      monthlyTrend: executiveDashboardData.recoveredRevenue.monthlyTrend.map(
        (point, index) => ({
          ...point,
          value: Number(((recoveryActions * (0.12 + index * 0.02)) / 1_000_000).toFixed(2)),
        }),
      ),
    },
    refundSavings: {
      costAvoided: Math.round(returns * 6.5),
      shippingSavings: Math.round(returns * 2.1),
      refundEfficiency: Math.min(100, Math.round((recoveryActions / Math.max(returns, 1)) * 100)),
      eligibleRefunds: returns,
    },
    sustainability: {
      carbonPreventedTonnes: Math.round(recoveryActions * 0.015),
      productsDiverted: recoveryActions,
      recyclingSuccessRate: Math.min(100, Math.round((recoveryActions / Math.max(products, 1)) * 100)),
      landfillDiversionRate: Math.min(100, Math.round((recoveryActions / Math.max(returns, 1)) * 100)),
    },
    donation: {
      productsDonated: Math.round(recoveryActions * 0.12),
      ngosSupported: Math.max(1, Math.round(recoveryActions / 500)),
      beneficiariesReached: Math.round(recoveryActions * 2.8),
      yearOverYearGrowth: fraudCases,
    },
  };
}
