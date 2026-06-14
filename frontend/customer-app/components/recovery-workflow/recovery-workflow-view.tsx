"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Clock,
  GitBranch,
  ShieldCheck,
  Loader2,
  MapPinned,
  PackageCheck,
  Route,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  adaptLogisticsPlan,
  adaptOptimizedDecision,
  adaptFraudTrust,
  adaptSimulationScenarios,
  runFraudTrust,
  runFutureSimulator,
  runRecoveryOptimizer,
  runReverseLogistics,
  type FraudTrustAssessment,
  type LogisticsPlan,
  type OptimizedDecision,
  type ProductDetailsPayload,
  type SimulationScenario,
} from "../../../shared/api/recovery-workflow";
import { getRecoveryEffectiveness } from "../../../shared/api/service12";

type WorkflowStatus = "idle" | "loading" | "complete" | "error";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function RecoveryWorkflowView() {
  const [product, setProduct] = useState<ProductDetailsPayload>({
    productId: "P123",
    category: "Smart Home",
    condition: "Good",
    originalPrice: 249,
    returnReason: "Customer changed mind",
    daysSincePurchase: 28,
  });
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [decision, setDecision] = useState<OptimizedDecision | null>(null);
  const [logistics, setLogistics] = useState<LogisticsPlan | null>(null);
  const [fraudTrust, setFraudTrust] = useState<FraudTrustAssessment | null>(null);
  const [graphSummary, setGraphSummary] = useState<string | null>(null);
  const [demoMessages, setDemoMessages] = useState<string[]>([]);
  const demoMode = demoMessages.length > 0;

  const finalSummary = useMemo(() => {
    if (!decision || !logistics) return null;

    return {
      value: currencyFormatter.format(decision.expectedValue),
      carbon: scenarios
        .reduce((best, scenario) => Math.max(best, scenario.carbonSavedKg), 0)
        .toFixed(1),
      path: `${decision.decision} via ${logistics.warehouse}`,
    };
  }, [decision, logistics, scenarios]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    setScenarios([]);
    setDecision(null);
    setLogistics(null);
    setFraudTrust(null);
    setGraphSummary(null);
    setDemoMessages([]);

    try {
      const fraudPayload = await runFraudTrust(product);
      addDemoMessage(fraudPayload.message);
      setFraudTrust(adaptFraudTrust(fraudPayload.data));

      const simulationPayload = await runFutureSimulator(product);
      addDemoMessage(simulationPayload.message);
      const liveScenarios = adaptSimulationScenarios(simulationPayload.data);

      if (liveScenarios.length === 0) {
        setStatus("complete");
        setMessage("Service #5 returned no recovery scenarios for this product.");
        return;
      }

      const nextScenarios = liveScenarios;
      setScenarios(nextScenarios);

      const optimizerPayload = await runRecoveryOptimizer(product, nextScenarios);
      addDemoMessage(optimizerPayload.message);
      const nextDecision = adaptOptimizedDecision(optimizerPayload.data);
      setDecision(nextDecision);

      const logisticsPayload = await runReverseLogistics(product, nextDecision);
      addDemoMessage(logisticsPayload.message);
      setLogistics(adaptLogisticsPlan(logisticsPayload.data));

      try {
        const graphPayload = await getRecoveryEffectiveness();
        setGraphSummary(adaptRecoveryGraphSummary(graphPayload, product.productId));
      } catch (error) {
        setGraphSummary("Demo graph handoff ready");
        addDemoMessage(
          error instanceof Error
            ? `Service #12 unavailable. Using demo graph summary. ${error.message}`
            : "Service #12 unavailable. Using demo graph summary.",
        );
      }

      setStatus("complete");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Backend workflow unavailable.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Product intake</CardTitle>
          <CardDescription>
            Submit the product details to run the recovery workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="Product ID"
              value={product.productId}
              onChange={(value) => setProduct({ ...product, productId: value })}
            />
            <Field
              label="Category"
              value={product.category}
              onChange={(value) => setProduct({ ...product, category: value })}
            />
            <Field
              label="Condition"
              value={product.condition}
              onChange={(value) => setProduct({ ...product, condition: value })}
            />
            <Field
              label="Return reason"
              value={product.returnReason}
              onChange={(value) => setProduct({ ...product, returnReason: value })}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field
                label="Original price"
                type="number"
                value={String(product.originalPrice)}
                onChange={(value) => setProduct({ ...product, originalPrice: Number(value) })}
              />
              <Field
                label="Days since purchase"
                type="number"
                value={String(product.daysSincePurchase)}
                onChange={(value) => setProduct({ ...product, daysSincePurchase: Number(value) })}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              Run workflow
            </Button>
          </form>
          {message && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {demoMode && <DemoModeNotice messages={demoMessages} />}
        {status === "complete" && !demoMode && (
          <Toast tone="success" message="Workflow completed with live service responses." />
        )}
        {status === "error" && (
          <Toast tone="error" message={message ?? "Unable to run the workflow."} />
        )}
        <WorkflowSteps status={status} demoMode={demoMode} />
        {status === "error" && (
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm font-medium text-rose-800">
                {message ?? "Unable to run the live workflow."}
              </p>
              <Button type="button" variant="outline" onClick={() => void submitCurrentProduct()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        <ScenarioPanel scenarios={scenarios} loading={status === "loading"} />
        <FraudTrustPanel fraudTrust={fraudTrust} loading={status === "loading"} />
        <section className="grid gap-6 lg:grid-cols-2">
          <DecisionPanel decision={decision} loading={status === "loading"} />
          <LogisticsPanel logistics={logistics} loading={status === "loading"} />
        </section>
        <SummaryPanel
          summary={finalSummary}
          graphSummary={graphSummary}
          loading={status === "loading"}
        />
      </div>
    </div>
  );

  async function submitCurrentProduct() {
    const form = document.querySelector("form");
    form?.requestSubmit();
  }

  function addDemoMessage(nextMessage?: string) {
    if (!nextMessage) {
      return;
    }

    setDemoMessages((current) =>
      current.includes(nextMessage) ? current : [...current, nextMessage],
    );
  }
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function WorkflowSteps({
  status,
  demoMode,
}: {
  status: WorkflowStatus;
  demoMode: boolean;
}) {
  const steps = [
    ["Product", PackageCheck],
    ["Fraud & Trust S3", ShieldCheck],
    ["Future Simulator S5", GitBranch],
    ["Recovery Optimizer S6", Sparkles],
    ["Reverse Logistics S7", Route],
    ["Knowledge Graph S12", Boxes],
  ] as const;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {steps.map(([label, Icon]) => (
            <div key={label} className="rounded-lg border bg-white p-3">
              <Icon className="size-4 text-emerald-700" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-800">{label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {status === "loading" ? "Running" : status === "idle" ? "Ready" : "Complete"}
              </p>
            </div>
          ))}
        </div>
        {status === "error" && (
          <Badge className="mt-4 border-rose-200 bg-rose-50 text-rose-700">
            Live workflow error
          </Badge>
        )}
        {demoMode && (
          <Badge className="mt-4 border-amber-200 bg-amber-50 text-amber-700">
            Demo Mode
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function DemoModeNotice({ messages }: { messages: string[] }) {
  return (
    <Toast
      tone="demo"
      message={
        messages[0] ??
        "Demo Mode is active. The workflow is using realistic fallback data."
      }
    />
  );
}

function Toast({
  tone,
  message,
}: {
  tone: "success" | "error" | "demo";
  message: string;
}) {
  const classes =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-lg border p-3 text-sm font-medium ${classes}`}>
      {tone === "demo" && (
        <Badge className="mr-2 border-amber-300 bg-white text-amber-700">
          Demo Mode
        </Badge>
      )}
      {message}
    </div>
  );
}

function FraudTrustPanel({
  fraudTrust,
  loading,
}: {
  fraudTrust: FraudTrustAssessment | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud & trust</CardTitle>
        <CardDescription>Service #3 risk score used by downstream recovery decisions.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingTile label="Scoring fraud and trust" />
        ) : fraudTrust ? (
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="rounded-lg border bg-white p-4">
              <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-xs font-medium uppercase text-slate-400">
                Fraud risk
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {fraudTrust.fraudScore}%
              </p>
              <Badge className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700">
                {fraudTrust.severity}
              </Badge>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <Metric label="Seller trust" value={`${fraudTrust.trustScore}%`} />
              <div className="mt-4 flex flex-wrap gap-2">
                {fraudTrust.signals.map((signal) => (
                  <Badge
                    key={signal}
                    className="border-slate-200 bg-white text-slate-600"
                  >
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyTile label="Fraud score will appear after S3 completes." />
        )}
      </CardContent>
    </Card>
  );
}

function ScenarioPanel({
  scenarios,
  loading,
}: {
  scenarios: SimulationScenario[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation scenarios</CardTitle>
        <CardDescription>All recovery paths returned by the Future Simulator.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <LoadingTile label="Running S5 scenarios" />
        ) : scenarios.length === 0 ? (
          <EmptyTile label="Run the workflow to see scenarios." />
        ) : (
          scenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">{scenario.name}</p>
              <p className="mt-3 text-2xl font-bold text-emerald-700">
                {currencyFormatter.format(scenario.recoveryValue)}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <Metric label="Success" value={`${scenario.successProbability}%`} />
                <Metric label="CO2e saved" value={`${scenario.carbonSavedKg} kg`} />
                <Metric label="Timeframe" value={`${scenario.timeframeDays} days`} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function DecisionPanel({
  decision,
  loading,
}: {
  decision: OptimizedDecision | null;
  loading: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recommended decision</CardTitle>
        <CardDescription>Best action from the Recovery Optimizer.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingTile label="Optimizing recovery" />
        ) : decision ? (
          <div>
            <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              {decision.decision}
            </Badge>
            <p className="mt-4 text-3xl font-bold text-slate-950">
              {currencyFormatter.format(decision.expectedValue)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Expected recovered value</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{decision.reason}</p>
            <Metric label="Confidence" value={`${decision.confidence}%`} />
          </div>
        ) : (
          <EmptyTile label="Decision will appear after S6 completes." />
        )}
      </CardContent>
    </Card>
  );
}

function LogisticsPanel({
  logistics,
  loading,
}: {
  logistics: LogisticsPlan | null;
  loading: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Reverse logistics</CardTitle>
        <CardDescription>Warehouse assignment, route, cost, and ETA.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingTile label="Planning logistics" />
        ) : logistics ? (
          <div className="space-y-4">
            <Info icon={MapPinned} label="Warehouse" value={logistics.warehouse} />
            <Info icon={Route} label="Route" value={logistics.route} />
            <Info icon={Clock} label="ETA" value={logistics.eta} />
            <Metric label="Estimated cost" value={currencyFormatter.format(logistics.cost)} />
          </div>
        ) : (
          <EmptyTile label="Logistics plan will appear after S7 completes." />
        )}
      </CardContent>
    </Card>
  );
}

function SummaryPanel({
  summary,
  graphSummary,
  loading,
}: {
  summary: { value: string; carbon: string; path: string } | null;
  graphSummary: string | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final summary</CardTitle>
        <CardDescription>Workflow output for operational handoff.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingTile label="Compiling summary" />
        ) : summary ? (
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryMetric label="Decision path" value={summary.path} />
            <SummaryMetric label="Recovered value" value={summary.value} />
            <SummaryMetric label="Carbon saved" value={`${summary.carbon} kg`} />
            <SummaryMetric label="Graph state" value={graphSummary ?? "Service #12 checked"} />
          </div>
        ) : (
          <EmptyTile label="Submit product details to create a summary." />
        )}
      </CardContent>
    </Card>
  );
}

type AnyRecord = Record<string, unknown>;

function adaptRecoveryGraphSummary(payload: unknown, productId: string) {
  const actions = asArray(payload, [
    "data",
    "recovery_effectiveness",
    "recovery_actions",
    "recoveryActions",
    "actions",
  ]);
  const matching = actions.filter((action) => {
    return stringFrom(action, ["product_id", "productId", "id", "asin"], "") === productId;
  });

  if (matching.length === 0) {
    return `${actions.length} S12 recovery patterns`;
  }

  return `${matching.length} S12 action${matching.length === 1 ? "" : "s"}`;
}

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

function asArray(payload: unknown, keys: string[] = []): AnyRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
  }

  const record = asRecord(payload);

  for (const key of ["data", "results", "items", ...keys]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
    }
  }

  for (const value of Object.values(record)) {
    const nested = asArray(value, keys);

    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function stringFrom(record: AnyRecord, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPinned;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border bg-white p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
      <div>
        <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function LoadingTile({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-lg border bg-slate-50 p-4 text-sm font-medium text-slate-500 md:col-span-full">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

function EmptyTile({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border bg-slate-50 p-4 text-center text-sm text-slate-500 md:col-span-full">
      {label}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <CheckCircle2 className="size-4 text-emerald-700" aria-hidden="true" />
      <p className="mt-4 text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}
