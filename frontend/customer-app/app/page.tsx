import type { Metadata } from "next";
import { PackageSearch, ShieldCheck } from "lucide-react";

import { CustomerSearchView } from "@/components/customer-search/customer-search-view";
import { customerSearchProducts } from "@/data/customer-search-products";

export const metadata: Metadata = {
  title: "Customer Search | Amazon ReLife",
  description:
    "Search ReLife-ready products with return risk and purchase success signals.",
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              CUSTOMER MARKETPLACE
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              ReLife signals active
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Search ReLife products
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Find products with clear condition details, return risk, and purchase
            success scoring before checkout.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 self-start rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm lg:self-auto">
          <PackageSearch className="size-4 text-slate-400" aria-hidden="true" />
          Mock customer catalog
        </div>
      </div>
      <CustomerSearchView products={customerSearchProducts} />
      <p className="mt-6 text-right text-xs text-slate-400">
        Mock product data for Amazon ReLife customer search
      </p>
    </main>
  );
}
