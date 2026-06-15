import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Leaf, Warehouse } from "lucide-react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Operations Command Center | Circular OS",
  description: "Reverse logistics, inspection throughput, and recovery operations management.",
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
                Circular <span className="text-emerald-700">OS</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <Warehouse className="size-4" aria-hidden="true" />
                Operations Command Center
              </span>
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                RK
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
