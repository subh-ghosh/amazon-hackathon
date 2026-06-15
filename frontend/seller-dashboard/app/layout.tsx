import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Store } from "lucide-react";

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
            <div className="flex items-center gap-3 font-bold tracking-tight">
              <span className="text-[22px] font-bold text-[#131921]">amazon</span>
              <span className="text-sm font-normal text-slate-400">|</span>
              <span className="text-sm font-medium text-blue-700">Seller Central</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <Store className="size-4" aria-hidden="true" />
                Returns & Quality
              </span>
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
