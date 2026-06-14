"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Consumer Electronics", confidence: 5 },
  { name: "Home & Kitchen", confidence: 3 },
  { name: "Apparel", confidence: -3 },
  { name: "Beauty & Personal Care", confidence: 7 },
  { name: "Books", confidence: 6 },
] as const;

type ProductCategory = (typeof categories)[number]["name"];

interface EngineInputs {
  productValue: number;
  shippingCost: number;
  handlingCost: number;
  category: ProductCategory;
}

const initialInputs: EngineInputs = {
  productValue: 39.99,
  shippingCost: 13.85,
  handlingCost: 31.4,
  category: "Consumer Electronics",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getDecision(inputs: EngineInputs) {
  const returnCost = inputs.shippingCost + inputs.handlingCost;
  const keepItem = returnCost > inputs.productValue;
  const savings = Math.abs(returnCost - inputs.productValue);
  const costDifference = Math.abs(returnCost - inputs.productValue);
  const separation = (costDifference / Math.max(returnCost, inputs.productValue, 1)) * 100;
  const categoryAdjustment =
    categories.find((category) => category.name === inputs.category)?.confidence ?? 0;
  const confidence = Math.round(
    Math.min(98, Math.max(62, 72 + separation * 0.75 + categoryAdjustment)),
  );

  return { returnCost, keepItem, savings, confidence };
}

export function ReturnlessRefundEngine() {
  const [inputs, setInputs] = useState<EngineInputs>(initialInputs);
  const [loading, setLoading] = useState(false);
  const decision = useMemo(() => getDecision(inputs), [inputs]);
  const empty = inputs.productValue === 0 && inputs.shippingCost === 0 && inputs.handlingCost === 0;
  const comparisonMax = Math.max(decision.returnCost, inputs.productValue, 1);
  const productBarWidth = (inputs.productValue / comparisonMax) * 100;
  const returnBarWidth = (decision.returnCost / comparisonMax) * 100;

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), 220);

    return () => window.clearTimeout(timeout);
  }, [inputs]);

  function updateNumber(field: keyof Omit<EngineInputs, "category">, value: string) {
    setInputs((current) => ({
      ...current,
      [field]: Math.max(0, Number(value) || 0),
    }));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader className="border-b pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Decision inputs
                </p>
                <CardTitle className="mt-2 text-xl">Return economics</CardTitle>
              </div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                Order #114-7852146
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <MoneyInput
              id="product-value"
              label="Product value"
              hint="Current refund amount"
              value={inputs.productValue}
              onChange={(value) => updateNumber("productValue", value)}
            />
            <MoneyInput
              id="shipping-cost"
              label="Return shipping cost"
              hint="Carrier and handling estimate"
              value={inputs.shippingCost}
              onChange={(value) => updateNumber("shippingCost", value)}
            />
            <MoneyInput
              id="handling-cost"
              label="Handling cost"
              hint="Inspection, processing, and disposition"
              value={inputs.handlingCost}
              onChange={(value) => updateNumber("handlingCost", value)}
            />
            <label className="block" htmlFor="product-category">
              <span className="text-sm font-semibold text-slate-800">
                Product category
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Used to calibrate decision confidence
              </span>
              <select
                id="product-category"
                value={inputs.category}
                onChange={(event) =>
                  setInputs((current) => ({
                    ...current,
                    category: event.target.value as ProductCategory,
                  }))
                }
                className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              >
                {categories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                    <PackageCheck className="size-4.5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Echo Dot (5th Gen)
                    </p>
                    <p className="text-xs text-slate-500">Charcoal · Open box</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Qty 1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white">
          <CardContent className="p-0">
            <div className="grid min-h-full lg:grid-cols-[1fr_0.78fr]">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="size-4" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Engine recommendation
                  </p>
                </div>
                {loading ? (
                  <ResultState title="Evaluating refund path..." detail="Comparing product value with shipping and handling cost." />
                ) : empty ? (
                  <ResultState title="No refund inputs yet" detail="Enter product value, return shipping cost, and handling cost to generate a decision." />
                ) : (
                  <>
                    <div
                      className={cn(
                        "mt-6 flex size-14 items-center justify-center rounded-2xl",
                        decision.keepItem
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-blue-400/10 text-blue-400",
                      )}
                    >
                      {decision.keepItem ? (
                        <WalletCards className="size-7" aria-hidden="true" />
                      ) : (
                        <RotateCcw className="size-7" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                      {decision.keepItem ? "Refund & Keep Item" : "Process Return"}
                    </p>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                      {decision.keepItem
                        ? `Return shipping plus handling is ${currencyFormatter.format(decision.returnCost)}, which is greater than the ${currencyFormatter.format(inputs.productValue)} product value.`
                        : `Return shipping plus handling is ${currencyFormatter.format(decision.returnCost)}, which is less than or equal to the ${currencyFormatter.format(inputs.productValue)} product value.`}
                    </p>
                  </>
                )}
                <div className="mt-8 flex items-center gap-2 border-t border-slate-800 pt-5 text-sm text-slate-300">
                  <CheckCircle2
                    className={cn(
                      "size-4",
                      decision.keepItem ? "text-emerald-400" : "text-blue-400",
                    )}
                    aria-hidden="true"
                  />
                  Decision rule evaluated successfully
                </div>
              </div>
              <div className="border-t border-slate-800 bg-slate-900/60 p-6 lg:border-l lg:border-t-0 lg:p-8">
                <ConfidenceGauge value={decision.confidence} />
                <div className="mt-7 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Primary decision signal
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Return cost is{" "}
                    <span className="text-emerald-400">
                      {currencyFormatter.format(decision.savings)}
                    </span>{" "}
                    {decision.keepItem ? "above" : "below"} item value
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Cost comparison</CardTitle>
            <p className="text-sm text-slate-500">
              Total return cost combines shipping and downstream recovery.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <CostBar
              label="Product value"
              value={inputs.productValue}
              width={productBarWidth}
              color="bg-blue-500"
              icon={CircleDollarSign}
            />
            <CostBar
              label="Total return cost"
              value={decision.returnCost}
              width={returnBarWidth}
              color="bg-emerald-600"
              icon={Truck}
            />
            <div className="grid gap-3 border-t pt-5 sm:grid-cols-3">
              <CostDetail label="Return shipping" value={inputs.shippingCost} />
              <CostDetail label="Handling cost" value={inputs.handlingCost} />
              <CostDetail label="Total return cost" value={decision.returnCost} strong />
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "overflow-hidden",
            decision.keepItem
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-blue-200 bg-blue-50/60",
          )}
        >
          <CardContent className="flex h-full flex-col p-6">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                decision.keepItem
                  ? "bg-emerald-700 text-white"
                  : "bg-blue-700 text-white",
              )}
            >
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-600">
              Savings generated
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">
              {currencyFormatter.format(decision.savings)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {decision.keepItem
                ? "Avoided logistics and recovery spend on this refund."
                : "Expected value preserved by recovering the product."}
            </p>
            <div className="mt-auto pt-8">
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs">
                <span className="font-medium text-slate-500">Recommended action</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  {decision.keepItem ? "Auto-approve refund" : "Generate return label"}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface MoneyInputProps {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (value: string) => void;
}

function MoneyInput({ id, label, hint, value, onChange }: MoneyInputProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-slate-400">
          $
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border bg-white pl-7 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
        />
      </div>
    </label>
  );
}

function ResultState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xl font-bold tracking-tight text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

interface CostBarProps {
  label: string;
  value: number;
  width: number;
  color: string;
  icon: typeof Truck;
}

function CostBar({ label, value, width, color, icon: Icon }: CostBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Icon className="size-4 text-slate-400" aria-hidden="true" />
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900">
          {currencyFormatter.format(value)}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CostDetail({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("mt-1 text-sm text-slate-800", strong ? "font-bold" : "font-semibold")}>
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Decision confidence
      </p>
      <div className="relative mx-auto mt-5 size-32">
        <svg className="size-32 -rotate-90" viewBox="0 0 104 104" aria-hidden="true">
          <circle
            cx="52"
            cy="52"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
          />
          <circle
            cx="52"
            cy="52"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-emerald-400 transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{value}%</span>
          <span className="mt-0.5 text-xs text-slate-500">High</span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Based on cost separation and category recovery patterns.
      </p>
    </div>
  );
}
