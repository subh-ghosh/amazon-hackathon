import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Building2, Leaf } from "lucide-react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Executive Network Insights | Amazon",
  description:
    "Network-wide intelligence for recovery performance, sustainability, and financial impact.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <span>
                Amazon <span className="text-emerald-700">Returns Intelligence</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <Building2 className="size-4" aria-hidden="true" />
                Executive Network Insights
              </span>
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                EX
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
