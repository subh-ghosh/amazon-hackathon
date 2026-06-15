import {
  Gift,
  Recycle,
  RotateCcw,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecoveryChannel } from "@/types/executive-impact";

interface RecoveryPerformanceProps {
  channels: RecoveryChannel[];
}

const channelIcons: Record<RecoveryChannel["label"], LucideIcon> = {
  Resold: ShoppingBag,
  Refurbished: RotateCcw,
  Donated: Gift,
  Recycled: Recycle,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function RecoveryPerformance({
  channels,
}: RecoveryPerformanceProps) {
  const totalUnits = channels.reduce((sum, channel) => sum + channel.units, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recovery performance</CardTitle>
        <CardDescription>
          Final disposition mix across {totalUnits.toLocaleString("en-US")} recovered products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          {channels.map((channel) => (
            <div
              key={channel.label}
              className={channel.color}
              style={{ width: `${channel.percentage}%` }}
              title={`${channel.label}: ${channel.percentage}%`}
            />
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channelIcons[channel.label];
            return (
              <div key={channel.label} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className={`flex size-8 items-center justify-center rounded-lg text-white ${channel.color}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {channel.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {channel.percentage}%
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      {channel.units.toLocaleString("en-US")}
                    </p>
                    <p className="text-xs text-slate-400">products</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-700">
                      {currencyFormatter.format(channel.recoveredValue)}
                    </p>
                    <p className="text-xs text-slate-400">value</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
