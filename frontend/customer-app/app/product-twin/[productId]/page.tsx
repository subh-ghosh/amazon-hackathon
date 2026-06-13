import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { ProductTwinView } from "@/components/product-twin/product-twin-view";
import { getProductTwin, productTwins } from "@/data/product-twins";

interface ProductTwinPageProps {
  params: Promise<{ productId: string }>;
}

export function generateStaticParams() {
  return productTwins.map((twin) => ({ productId: twin.productId }));
}

export async function generateMetadata({
  params,
}: ProductTwinPageProps): Promise<Metadata> {
  const { productId } = await params;
  const twin = getProductTwin(productId);
  return {
    title: twin
      ? `${twin.product.name} | Amazon ReLife`
      : "Product not found | Amazon ReLife",
  };
}

export default async function ProductTwinPage({
  params,
}: ProductTwinPageProps) {
  const { productId } = await params;
  const twin = getProductTwin(productId);

  if (!twin) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All products
      </Link>
      <div className="mb-8">
        <p className="text-sm font-semibold text-emerald-700">PRODUCT DIGITAL TWIN</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Product lifecycle
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A living record of this product&apos;s health, history, and next best life.
        </p>
      </div>
      <ProductTwinView twin={twin} />
    </main>
  );
}
