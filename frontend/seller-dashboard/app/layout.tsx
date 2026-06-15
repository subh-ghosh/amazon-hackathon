import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Leaf } from "lucide-react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Seller Central Returns | Amazon",
  description: "Return intelligence, product quality signals, and recovery performance for Amazon sellers.",
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
                Amazon <span className="text-blue-700">Seller Central</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:block">
                Returns Performance
              </span>
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                NE
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
