"use client";

import { useEffect, useState } from "react";

import { DonationCandidates } from "@/components/dashboard/donation-candidates";
import { FraudAlerts } from "@/components/dashboard/fraud-alerts";
import { InspectionTable } from "@/components/dashboard/inspection-table";
import { RecoveryPipeline } from "@/components/dashboard/recovery-pipeline";
import { RepairQueue } from "@/components/dashboard/repair-queue";
import { ReturnsKpis } from "@/components/dashboard/returns-kpis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { operationsData } from "@/data/operations-data";
import {
  adaptFraudulentProducts,
  adaptOperationsRecovery,
  type FraudAlertView,
  type OperationsRecoveryViewModel,
} from "../../../shared/api/adapters";
import {
  getFraudulentProducts,
  getRecoveryEffectiveness,
} from "../../../shared/api/service12";

type Resource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function OperationsDashboardView() {
  const [recovery, setRecovery] = useState<Resource<OperationsRecoveryViewModel>>({
    data: null,
    loading: true,
    error: null,
  });
  const [fraudAlerts, setFraudAlerts] = useState<Resource<FraudAlertView[]>>({
    data: null,
    loading: true,
    error: null,
  });

  function loadRecovery() {
    setRecovery((current) => ({ ...current, loading: true, error: null }));

    getRecoveryEffectiveness()
      .then((payload) => {
        setRecovery({
          data: adaptOperationsRecovery(payload),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        setRecovery({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  function loadFraudAlerts() {
    setFraudAlerts((current) => ({ ...current, loading: true, error: null }));

    getFraudulentProducts()
      .then((payload) => {
        setFraudAlerts({
          data: adaptFraudulentProducts(payload),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        setFraudAlerts({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  useEffect(() => {
    loadRecovery();
    loadFraudAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <ResourceState
        resource={recovery}
        empty={!recovery.data || recovery.data.returns.totalReceived === 0}
        loadingLabel="Loading recovery effectiveness..."
        emptyLabel="No recovery effectiveness data found."
        onRetry={loadRecovery}
      >
        <ReturnsKpis data={recovery.data?.returns ?? operationsData.returns} />
        <RecoveryPipeline
          stages={recovery.data?.pipeline ?? []}
          outcomes={recovery.data?.outcomes ?? []}
        />
      </ResourceState>
      <InspectionTable products={operationsData.inspections} />
      <section className="grid gap-6 lg:grid-cols-2">
        <RepairQueue items={operationsData.repairQueue} />
        <DonationCandidates candidates={operationsData.donationCandidates} />
      </section>
      <ResourceState
        resource={fraudAlerts}
        empty={(fraudAlerts.data ?? []).length === 0}
        loadingLabel="Loading fraudulent products..."
        emptyLabel="No fraudulent products found."
        onRetry={loadFraudAlerts}
      >
        <FraudAlerts alerts={fraudAlerts.data ?? []} />
      </ResourceState>
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
