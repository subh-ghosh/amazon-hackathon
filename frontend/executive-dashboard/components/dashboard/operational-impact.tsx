import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationalMetrics } from "@/types/executive-impact";
import { ArrowRight, Clock, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";

export function OperationalImpact({ data }: { data: OperationalMetrics }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Operational Impact</CardTitle>
        <CardDescription>Service levels, processing throughput, and facility health across the returns network.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border text-center">
            <Clock className="size-5 text-slate-500 mb-2" />
            <p className="text-xs font-medium text-slate-500">Avg Processing Time</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{data.avgProcessingTime}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <ShieldCheck className="size-5 text-emerald-600 mb-2" />
            <p className="text-xs font-medium text-emerald-700">Recovery Success Rate</p>
            <p className="text-xl font-bold text-emerald-800 mt-1">{data.recoverySuccessRate.toFixed(1)}%</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <HeartHandshake className="size-5 text-amber-600 mb-2" />
            <p className="text-xs font-medium text-amber-700">Social Impact</p>
            <p className="text-xl font-bold text-amber-800 mt-1">{data.donationImpact}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Facility Performance</h4>
          <ul className="space-y-2 mb-6">
            {data.facilityPerformance.map((facility) => (
              <li key={facility.name} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                <span className="font-medium text-slate-700">{facility.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${facility.status === "Optimal" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {facility.status}
                  </span>
                  <span className="font-bold text-slate-900">{facility.score}/100</span>
                </div>
              </li>
            ))}
          </ul>

          <Link href="https://amazon-hackathon-udpw.vercel.app/" target="_blank" className="flex items-center justify-center w-full gap-2 rounded-lg bg-cyan-950 text-white px-4 py-2.5 text-sm font-semibold hover:bg-cyan-900 transition-colors">
            Open Returns Operations
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
