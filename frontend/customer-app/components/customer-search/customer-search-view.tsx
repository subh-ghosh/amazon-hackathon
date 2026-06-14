"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CheckCircle2,
  Filter,
  Leaf,
  PackageSearch,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  CustomerSearchProduct,
  ProductCategory,
  ProductCondition,
} from "@/types/customer-search";

const categories: Array<ProductCategory | "All"> = [
  "All",
  "Smart Home",
  "Electronics",
  "Home & Kitchen",
  "Apparel",
  "Books",
];

const conditions: Array<ProductCondition | "All"> = [
  "All",
  "New",
  "Like new",
  "Open box",
  "Refurbished",
];

type SortMode = "recommended" | "success" | "risk" | "price";

interface CustomerSearchViewProps {
  products: CustomerSearchProduct[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const fallbackNumberFormatter = {
  format(value: number) {
    return String(value);
  },
};

export function CustomerSearchView({ products }: CustomerSearchViewProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [condition, setCondition] = useState<ProductCondition | "All">("All");
  const [maxRisk, setMaxRisk] = useState(50);
  const [relifeOnly, setRelifeOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("recommended");
  const numberFormatter = mounted
    ? new Intl.NumberFormat("en-US")
    : fallbackNumberFormatter;

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [product.name, product.brand, product.category, product.summary]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory = category === "All" || product.category === category;
        const matchesCondition = condition === "All" || product.condition === condition;
        const matchesRisk = product.returnRisk <= maxRisk;
        const matchesCertification = !relifeOnly || product.relifeCertified;

        return (
          matchesQuery &&
          matchesCategory &&
          matchesCondition &&
          matchesRisk &&
          matchesCertification
        );
      })
      .sort((first, second) => {
        if (sort === "success") {
          return second.purchaseSuccessScore - first.purchaseSuccessScore;
        }

        if (sort === "risk") {
          return first.returnRisk - second.returnRisk;
        }

        if (sort === "price") {
          return first.price - second.price;
        }

        return (
          second.purchaseSuccessScore -
          second.returnRisk -
          (first.purchaseSuccessScore - first.returnRisk)
        );
      });
  }, [category, condition, maxRisk, products, query, relifeOnly, sort]);

  const averageSuccess =
    filteredProducts.length > 0
      ? Math.round(
          filteredProducts.reduce(
            (total, product) => total + product.purchaseSuccessScore,
            0,
          ) / filteredProducts.length,
        )
      : 0;
  const lowRiskCount = filteredProducts.filter(
    (product) => product.returnRisk <= 20,
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="product-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product, brand, category, or ReLife signal"
                className="h-12 w-full rounded-lg border bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <SearchStat
            label="Matching products"
            value={filteredProducts.length.toString()}
            icon={PackageSearch}
          />
          <SearchStat
            label="Avg. success score"
            value={`${averageSuccess}%`}
            icon={Sparkles}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Filters
                </p>
                <CardTitle className="mt-2 text-lg">Refine results</CardTitle>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <SelectFilter
              id="category-filter"
              label="Category"
              value={category}
              options={categories}
              onChange={(value) => setCategory(value as ProductCategory | "All")}
            />
            <SelectFilter
              id="condition-filter"
              label="Condition"
              value={condition}
              options={conditions}
              onChange={(value) => setCondition(value as ProductCondition | "All")}
            />
            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="risk-filter"
                  className="text-sm font-semibold text-slate-800"
                >
                  Max return risk
                </label>
                <span className="text-sm font-bold text-slate-950">{maxRisk}%</span>
              </div>
              <input
                id="risk-filter"
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxRisk}
                onChange={(event) => setMaxRisk(Number(event.target.value))}
                className="mt-3 w-full accent-emerald-700"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>Lower</span>
                <span>Broader</span>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-lg border bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={relifeOnly}
                onChange={(event) => setRelifeOnly(event.target.checked)}
                className="mt-1 size-4 rounded border-slate-300 accent-emerald-700"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  ReLife certified only
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Show products inspected by Amazon ReLife recovery centers.
                </span>
              </span>
            </label>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Filter className="size-4" aria-hidden="true" />
                {lowRiskCount} low-risk matches
              </div>
              <p className="mt-1 text-xs leading-5 text-emerald-900/70">
                Products at or below 20% return risk based on fit, defect, and history
                signals.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 shadow-card sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {filteredProducts.length} products found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ranked with return risk, purchase success, and ReLife recovery signals.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <ArrowUpDown className="size-4 text-slate-400" aria-hidden="true" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="h-10 rounded-lg border bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              >
                <option value="recommended">Recommended</option>
                <option value="success">Highest success score</option>
                <option value="risk">Lowest return risk</option>
                <option value="price">Lowest price</option>
              </select>
            </label>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  numberFormatter={numberFormatter}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <PackageSearch className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-4 text-lg font-semibold text-slate-950">
                  No matching products
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try a broader category, a higher return risk threshold, or a different
                  search term.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  numberFormatter,
}: {
  product: CustomerSearchProduct;
  numberFormatter: { format(value: number): string };
}) {
  const savings = product.listPrice - product.price;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid min-h-full sm:grid-cols-[150px_1fr]">
          <div
            className={cn(
              "flex min-h-40 flex-col justify-between border-b p-4 sm:border-b-0 sm:border-r",
              product.color === "emerald" && "bg-emerald-50 text-emerald-800",
              product.color === "blue" && "bg-blue-50 text-blue-800",
              product.color === "amber" && "bg-amber-50 text-amber-800",
              product.color === "slate" && "bg-slate-100 text-slate-700",
              product.color === "rose" && "bg-rose-50 text-rose-800",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/85 shadow-sm">
                <PackageSearch className="size-5" aria-hidden="true" />
              </span>
              {product.relifeCertified ? (
                <CheckCircle2 className="size-5" aria-label="ReLife certified" />
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
                {product.category}
              </p>
              <p className="mt-1 text-sm font-bold">{product.condition}</p>
            </div>
          </div>

          <div className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">{product.brand}</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                  {product.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-950">
                  {currencyFormatter.format(product.price)}
                </p>
                <p className="text-xs font-medium text-slate-400 line-through">
                  {currencyFormatter.format(product.listPrice)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{product.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <Badge
                  key={badge}
                  className="border-slate-200 bg-slate-50 text-slate-600"
                >
                  {badge}
                </Badge>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ScoreIndicator
                label="Return Risk"
                value={product.returnRisk}
                icon={ShieldAlert}
                tone={getRiskTone(product.returnRisk)}
                lowerIsBetter
              />
              <ScoreIndicator
                label="Purchase Success"
                value={product.purchaseSuccessScore}
                icon={Sparkles}
                tone={getSuccessTone(product.purchaseSuccessScore)}
              />
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {product.rating} ({numberFormatter.format(product.reviewCount)})
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="size-3.5 text-slate-400" aria-hidden="true" />
                  {product.deliveryPromise}
                </span>
                <span className="flex items-center gap-1.5">
                  <Leaf className="size-3.5 text-emerald-600" aria-hidden="true" />
                  {product.carbonSavedKg} kg CO2e
                </span>
              </div>
              <Button asChild size="sm">
                <Link href={`/product-twin/${product.id}`}>
                  View twin
                </Link>
              </Button>
            </div>

            <p className="mt-3 text-xs font-medium text-emerald-700">
              Save {currencyFormatter.format(savings)} with verified ReLife inventory
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreIndicator({
  label,
  value,
  icon: Icon,
  tone,
  lowerIsBetter = false,
}: {
  label: string;
  value: number;
  icon: typeof Sparkles;
  tone: "emerald" | "amber" | "rose" | "blue";
  lowerIsBetter?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Icon
            className={cn(
              "size-4",
              tone === "emerald" && "text-emerald-600",
              tone === "amber" && "text-amber-600",
              tone === "rose" && "text-rose-600",
              tone === "blue" && "text-blue-600",
            )}
            aria-hidden="true"
          />
          {label}
        </span>
        <span className="text-sm font-bold text-slate-950">{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "emerald" && "bg-emerald-600",
            tone === "amber" && "bg-amber-500",
            tone === "rose" && "bg-rose-500",
            tone === "blue" && "bg-blue-600",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {lowerIsBetter ? "Lower is better" : "Higher is better"}
      </p>
    </div>
  );
}

function SearchStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof PackageSearch;
}) {
  return (
    <Card>
      <CardContent className="flex h-full items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xl font-bold text-slate-950">{value}</p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function getRiskTone(value: number) {
  if (value <= 20) {
    return "emerald";
  }

  if (value <= 35) {
    return "amber";
  }

  return "rose";
}

function getSuccessTone(value: number) {
  if (value >= 92) {
    return "emerald";
  }

  if (value >= 84) {
    return "blue";
  }

  return "amber";
}
