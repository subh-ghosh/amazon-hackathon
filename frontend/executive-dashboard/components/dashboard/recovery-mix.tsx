import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecoveryChannel } from "@/types/executive-impact";

export function RecoveryMix({ channels }: { channels: RecoveryChannel[] }) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(val);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recovery Mix</CardTitle>
        <CardDescription>Volume and value breakdown by recovery destination.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar Visualization */}
        <div className="mb-6 h-6 w-full overflow-hidden rounded-full flex">
          {channels.map((channel) => (
            <div
              key={channel.label}
              className={`h-full ${channel.color}`}
              style={{ width: `${channel.percentage}%` }}
              title={`${channel.label}: ${channel.percentage}%`}
            />
          ))}
        </div>

        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.label} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${channel.color}`} />
                <div>
                  <p className="font-semibold text-slate-900">{channel.label}</p>
                  <p className="text-xs text-slate-500">{channel.units.toLocaleString()} units ({channel.percentage}%)</p>
                </div>
              </div>
              <p className="font-bold text-slate-900">{formatCurrency(channel.recoveredValue)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
