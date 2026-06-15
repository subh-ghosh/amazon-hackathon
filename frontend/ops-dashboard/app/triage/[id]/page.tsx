"use client";

import { useState, use } from "react";
import { ArrowLeft, CheckCircle2, Box, Camera, Truck, MapPin, Search, Recycle, HeartHandshake, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TriageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [decision, setDecision] = useState<"RESTOCK" | "DONATE" | "RECYCLE" | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const handleConfirmRouting = () => {
    setIsRouting(true);
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-sm font-semibold text-blue-700">INTELLIGENT TRIAGE</p>
          <h1 className="text-2xl font-bold text-slate-950">Return {id}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Customer Intelligence */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Intelligence</CardTitle>
              <CardDescription>Data gathered directly from the customer portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><Camera size={16}/> Customer Photo</p>
                <div className="h-48 w-full bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={id === "PROD-001" ? "https://m.media-amazon.com/images/I/71QK1Jm6kLS._AC_SL1500_.jpg" : "https://m.media-amazon.com/images/I/71QK1Jm6kLS._AC_SL1500_.jpg"} 
                    alt="Customer Uploaded Photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Box size={12}/> Packaging</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">Available</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> Drop-off</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">Whole Foods</p>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Stated Reason</p>
                <p className="text-sm text-blue-900 mt-1">&quot;Item is defective, won't turn on.&quot;</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Grading & S9 Routing Engine */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* S2 Computer Vision Analysis */}
          <Card className="border-emerald-200">
            <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                    <Search className="text-emerald-500" size={20} />
                    S2 Computer Vision Analysis
                  </CardTitle>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Analysis Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 bg-white">
                  <span className="text-2xl font-bold text-emerald-700">92%</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900">Condition: Like New</h3>
                  <p className="text-sm text-slate-600">The customer stated it was defective, but our AI detects no external damage and seals appear intact. Product can likely be tested and restocked.</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="text-emerald-700 border-emerald-200 bg-emerald-50">No Scratches</Badge>
                    <Badge className="text-emerald-700 border-emerald-200 bg-emerald-50">Box Integrity: 95%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* S9 Circular Routing Engine */}
          <Card className="border-indigo-200">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
                    <Truck className="text-indigo-500" size={20} />
                    S9 Routing Engine Proposal
                  </CardTitle>
                  <CardDescription className="text-indigo-700/70 mt-1">Based on condition, packaging, and real-time logistics costs.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Option A: Recommended */}
                <div 
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-4 transition-all ${decision === "RESTOCK" || decision === null ? "border-indigo-500 bg-indigo-50/30 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                  onClick={() => setDecision("RESTOCK")}
                >
                  {(decision === "RESTOCK" || decision === null) && (
                    <div className="absolute top-0 right-0 rounded-bl-lg bg-indigo-500 px-3 py-1 text-xs font-bold text-white">
                      AI RECOMMENDED
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><CheckCircle2 className={decision === "RESTOCK" || decision === null ? "text-indigo-600" : "text-slate-400"} /></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Route to Fulfillment Center (Restock)</h4>
                      <p className="mt-1 text-sm text-slate-600">Item is in pristine condition with original packaging. Routing it to the nearest FC yields the highest financial recovery.</p>
                      <div className="mt-3 flex gap-4 text-xs font-medium">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+$125.00 Expected Yield</span>
                        <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">Freight: $3.50</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option B: Donate */}
                <div 
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-4 transition-all ${decision === "DONATE" ? "border-amber-500 bg-amber-50/30 shadow-sm" : "border-slate-200 bg-white hover:border-amber-300"}`}
                  onClick={() => setDecision("DONATE")}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><HeartHandshake className={decision === "DONATE" ? "text-amber-600" : "text-slate-400"} /></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Donate to Charity Partner</h4>
                      <p className="mt-1 text-sm text-slate-600">Local charity partner needs this category. Claim a tax write-off and avoid cross-country shipping emissions.</p>
                      <div className="mt-3 flex gap-4 text-xs font-medium">
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded">+$35.00 Tax Write-off</span>
                        <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">-12.5kg CO₂</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option C: Recycle */}
                <div 
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-4 transition-all ${decision === "RECYCLE" ? "border-slate-500 bg-slate-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  onClick={() => setDecision("RECYCLE")}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><Recycle className={decision === "RECYCLE" ? "text-slate-600" : "text-slate-400"} /></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Local Recycling / Liquidation</h4>
                      <p className="mt-1 text-sm text-slate-600">Sell in bulk to a local liquidator. Lowest financial recovery.</p>
                      <div className="mt-3 flex gap-4 text-xs font-medium">
                        <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded">+$5.00 Bulk Rate</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-6 border-t border-indigo-100 pt-6 flex justify-end gap-3">
                <button 
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                  disabled={isRouting}
                >
                  Flag for Manual Inspection
                </button>
                <button 
                  onClick={handleConfirmRouting}
                  disabled={isRouting}
                  className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all"
                >
                  {isRouting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Routing Item...
                    </>
                  ) : "Confirm Routing"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Success Toast Overlay */}
      {isRouting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 text-center mb-2">Routing Confirmed!</h2>
            <p className="text-sm text-slate-500 text-center">
              Item {id} has been physically routed to the {decision === "DONATE" ? "Charity Partner" : decision === "RECYCLE" ? "Local Liquidator" : "Fulfillment Center"}.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
