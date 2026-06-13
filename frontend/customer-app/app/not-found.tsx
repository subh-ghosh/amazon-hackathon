import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-emerald-700">404</p>
      <h1 className="mt-3 text-3xl font-bold">Product twin not found</h1>
      <p className="mt-3 text-slate-500">
        This product does not have a digital twin yet.
      </p>
      <Button asChild className="mt-6">
        <Link href="/product-twin/P123">View sample product</Link>
      </Button>
    </main>
  );
}
