"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ClipboardList,
  FileImage,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReturnOrder, ReturnProduct, ReturnReason } from "@/types/return-portal";

interface ReturnPortalViewProps {
  orders: ReturnOrder[];
  reasons: ReturnReason[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ReturnPortalView({ orders, reasons }: ReturnPortalViewProps) {
  const [orderId, setOrderId] = useState(orders[0]?.orderId ?? "");
  const [selectedProductId, setSelectedProductId] = useState(
    orders[0]?.products[0]?.id ?? "",
  );
  const [reason, setReason] = useState<ReturnReason>(reasons[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const matchedOrder = useMemo(() => {
    const normalizedOrderId = orderId.trim().toLowerCase();

    return (
      orders.find((order) => order.orderId.toLowerCase() === normalizedOrderId) ??
      orders.find((order) =>
        order.orderId.toLowerCase().includes(normalizedOrderId),
      )
    );
  }, [orderId, orders]);

  const selectedProduct =
    matchedOrder?.products.find((product) => product.id === selectedProductId) ??
    matchedOrder?.products[0];

  function updateOrderId(value: string) {
    setOrderId(value);
    setSubmitted(false);

    const nextOrder = orders.find((order) =>
      order.orderId.toLowerCase().includes(value.trim().toLowerCase()),
    );

    if (nextOrder?.products[0]) {
      setSelectedProductId(nextOrder.products[0].id);
    }
  }

  function updatePhotos(fileList: FileList | null) {
    setSubmitted(false);
    setPhotos(fileList ? Array.from(fileList).map((file) => file.name) : []);
  }

  function submitReturn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matchedOrder && selectedProduct) {
      setSubmitted(true);
    }
  }

  return (
    <form onSubmit={submitReturn} className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b pb-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Step 1
                  </p>
                  <CardTitle className="mt-2 text-xl">Find your order</CardTitle>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Search className="size-5" aria-hidden="true" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <label className="block" htmlFor="order-id">
                <span className="text-sm font-semibold text-slate-800">Order ID</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Try 114-7852146-9035421, 113-2471938-6612059, or 112-6084419-1748302.
                </span>
                <input
                  id="order-id"
                  value={orderId}
                  onChange={(event) => updateOrderId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  placeholder="Enter Amazon order ID"
                />
              </label>
              <div
                className={cn(
                  "rounded-lg border p-4",
                  matchedOrder
                    ? "border-emerald-100 bg-emerald-50/70"
                    : "border-amber-100 bg-amber-50/70",
                )}
              >
                <div className="flex items-center gap-3">
                  <PackageCheck
                    className={cn(
                      "size-5",
                      matchedOrder ? "text-emerald-700" : "text-amber-700",
                    )}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {matchedOrder ? "Order located" : "Order not found"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {matchedOrder
                        ? `${matchedOrder.products.length} eligible product(s) from ${matchedOrder.purchaseDate}`
                        : "Enter a mock order ID to load eligible products."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Step 2
                  </p>
                  <CardTitle className="mt-2 text-xl">Return details</CardTitle>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <ClipboardList className="size-5" aria-hidden="true" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
              <label className="block" htmlFor="product-selection">
                <span className="text-sm font-semibold text-slate-800">
                  Product selection
                </span>
                <select
                  id="product-selection"
                  value={selectedProduct?.id ?? ""}
                  onChange={(event) => {
                    setSelectedProductId(event.target.value);
                    setSubmitted(false);
                  }}
                  disabled={!matchedOrder}
                  className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition disabled:bg-slate-100 disabled:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                >
                  {matchedOrder?.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block" htmlFor="return-reason">
                <span className="text-sm font-semibold text-slate-800">
                  Return reason
                </span>
                <select
                  id="return-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value as ReturnReason);
                    setSubmitted(false);
                  }}
                  className="mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                >
                  {reasons.map((returnReason) => (
                    <option key={returnReason} value={returnReason}>
                      {returnReason}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2" htmlFor="return-notes">
                <span className="text-sm font-semibold text-slate-800">
                  Customer notes
                </span>
                <textarea
                  id="return-notes"
                  value={notes}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setSubmitted(false);
                  }}
                  rows={4}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  placeholder="Add detail that helps ReLife route the product correctly."
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Step 3
                  </p>
                  <CardTitle className="mt-2 text-xl">Photo upload</CardTitle>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Camera className="size-5" aria-hidden="true" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <label
                htmlFor="return-photos"
                className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <Upload className="size-6" aria-hidden="true" />
                </span>
                <span className="mt-4 text-sm font-semibold text-slate-900">
                  Upload product photos
                </span>
                <span className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Add images of product condition, packaging, serial labels, or damaged
                  areas. This mock portal stores filenames only.
                </span>
                <input
                  id="return-photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => updatePhotos(event.target.files)}
                  className="sr-only"
                />
              </label>
              {photos.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {photos.map((photo) => (
                    <div
                      key={photo}
                      className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <FileImage className="size-4 text-emerald-700" aria-hidden="true" />
                      <span className="truncate">{photo}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <ReturnSummary
          matchedOrder={matchedOrder}
          selectedProduct={selectedProduct}
          reason={reason}
          notes={notes}
          photos={photos}
          submitted={submitted}
        />
      </section>
    </form>
  );
}

function ReturnSummary({
  matchedOrder,
  selectedProduct,
  reason,
  notes,
  photos,
  submitted,
}: {
  matchedOrder: ReturnOrder | undefined;
  selectedProduct: ReturnProduct | undefined;
  reason: ReturnReason;
  notes: string;
  photos: string[];
  submitted: boolean;
}) {
  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-24">
      <CardHeader className="border-b bg-slate-950 pb-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Return summary
            </p>
            <CardTitle className="mt-2 text-xl">Ready for ReLife</CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
            <RotateCcw className="size-5" aria-hidden="true" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {submitted ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Return submitted
            </div>
            <p className="mt-1 text-xs leading-5 text-emerald-900/70">
              Mock return request created for intake and routing.
            </p>
          </div>
        ) : null}

        <SummaryRow label="Order ID" value={matchedOrder?.orderId ?? "No order selected"} />
        <SummaryRow
          label="Product"
          value={selectedProduct ? selectedProduct.name : "Select an eligible item"}
        />
        <SummaryRow label="Return reason" value={reason} />
        <SummaryRow label="Photos attached" value={`${photos.length} file(s)`} />

        {selectedProduct ? (
          <div className="rounded-xl border bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Estimated refund
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {currencyFormatter.format(selectedProduct.price)}
                </p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                {selectedProduct.relifePath}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 border-t pt-4 text-xs sm:grid-cols-2 lg:grid-cols-1">
              <SummaryDetail label="Condition" value={selectedProduct.condition} />
              <SummaryDetail
                label="Return window"
                value={`Ends ${selectedProduct.returnWindowEnds}`}
              />
              <SummaryDetail label="Category" value={selectedProduct.category} />
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
            <Sparkles className="size-4" aria-hidden="true" />
            ReLife routing signal
          </div>
          <p className="mt-2 text-xs leading-5 text-blue-900/70">
            {selectedProduct
              ? `${selectedProduct.name} will be routed to ${selectedProduct.relifePath.toLowerCase()} after intake review.`
              : "Select a product to preview its recovery path."}
          </p>
        </div>

        {notes.trim().length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-slate-500">Notes</p>
            <p className="mt-1 rounded-lg border bg-white p-3 text-sm leading-6 text-slate-700">
              {notes}
            </p>
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={!matchedOrder || !selectedProduct}
        >
          <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
          Submit Return
        </Button>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="max-w-48 text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function SummaryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
