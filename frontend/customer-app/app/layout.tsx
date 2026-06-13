import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Product Digital Twin | Amazon ReLife",
  description: "Track product condition, utility, repair, and recovery potential.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <span>Amazon <span className="text-emerald-700">ReLife</span></span>
            </Link>
            <nav aria-label="Primary navigation" className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/product-twin/P123" className="text-slate-950">
                My products
              </Link>
              <span className="hidden sm:inline">Recovery center</span>
              <span className="hidden sm:inline">Impact</span>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
