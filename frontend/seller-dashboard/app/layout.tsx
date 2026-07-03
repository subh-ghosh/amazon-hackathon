import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Store, Medal } from "lucide-react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Returns & Quality | Amazon Seller Central",
  description: "Monitor return drivers, protect margin, and improve product quality.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Brand */}
            <div className="flex items-center gap-3 font-bold tracking-tight">
              <span className="text-[22px] font-bold text-[#131921]">amazon</span>
              <span className="text-sm font-normal text-slate-300">|</span>
              <span className="text-sm font-medium text-blue-700">Seller Central</span>
            </div>

            {/* Right: Context + Seller identity */}
            <div className="flex items-center gap-4">
              {/* Reporting period */}
              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                May 1 – May 31, 2026
              </span>

              {/* Seller Tier badge */}
              <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 sm:flex">
                <Medal className="size-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700">GOLD SELLER</span>
              </div>

              {/* Section label */}
              <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <Store className="size-4" aria-hidden="true" />
                Returns &amp; Quality
              </span>

              {/* Avatar */}
              <div className="flex size-9 items-center justify-center rounded-full bg-[#232F3E] text-xs font-bold text-white">
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
