"use client";

import { use, useState, useEffect } from "react";
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, Clock, Info, ExternalLink, 
  Leaf, PackageSearch, Activity, HeartHandshake, Box, MapPin, Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { operationsData } from "@/data/operations-data";
import type { TriageItemDetails, TriageRecoveryOption } from "@/types/operations";

export default function TriageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // Use either the provided ID or fallback to our demo item.
  const data: TriageItemDetails = operationsData.triageDetails[id] || operationsData.triageDetails["RET-9921-A"];
  
  const recommendedOption = data.recoveryOptions.find(o => o.isRecommended);
  const [selectedOption, setSelectedOption] = useState<TriageRecoveryOption | null>(recommendedOption || null);
  const [isRouting, setIsRouting] = useState(false);

  // If the component mounts and we didn't match the ID perfectly, let's at least ensure we have the fallback
  useEffect(() => {
    if (!selectedOption && data.recoveryOptions.length > 0) {
      setSelectedOption(data.recoveryOptions.find(o => o.isRecommended) || data.recoveryOptions[0]);
    }
  }, [data, selectedOption]);

  const handleConfirmRouting = () => {
    setIsRouting(true);
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 pb-32">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Intelligent Triage</p>
              <Badge className={data.riskLevel === "Low" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"}>
                {data.riskLevel} Risk
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-950 mt-1">{data.productName}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">Return ID: {data.returnId}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: CONTEXT (Sections 3, 4, 5) */}
        <div className="space-y-6 lg:col-span-5">
          
          {/* SECTION 3: TRIAGE VIEW */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Box size={18} className="text-slate-400" />
                Condition Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="rounded-md border border-slate-200 overflow-hidden bg-slate-100 h-48 flex items-center justify-center">
                <img src={data.productImage} alt={data.productName} className="h-full w-full object-cover mix-blend-multiply" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer Stated Reason</p>
                <div className="bg-amber-50 border border-amber-100 text-amber-900 text-sm p-3 rounded-lg italic">
                  "{data.customerStatedReason}"
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Visual Inspection</p>
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm p-3 rounded-lg">
                  {data.conditionAssessment}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5: FRAUD & TRUST */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert size={18} className="text-slate-400" />
                Fraud & Trust Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data.fraudSignals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="mt-0.5">
                    {signal.status === "Safe" ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <Info size={16} className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{signal.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{signal.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SECTION 4: DIGITAL TWIN */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                Digital Twin Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pl-4">
              <div className="relative border-l-2 border-slate-200 pl-6 pb-2 space-y-6">
                {data.twinEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[31px] rounded-full size-4 border-2 border-white ${event.type === 'purchase' ? 'bg-blue-500' : event.type === 'return' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <p className="text-xs text-slate-400 font-mono mb-1">{event.date}</p>
                    <p className="text-sm font-bold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{event.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: ACTION & ROUTING (Sections 6, 7, 8, 9) */}
        <div className="space-y-6 lg:col-span-7 flex flex-col h-full">
          
          {/* SECTION 6: RECOVERY RECOMMENDATION */}
          <Card className="border-indigo-200 shadow-sm flex-1">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
              <CardTitle className="text-xl text-indigo-950 flex items-center gap-2">
                <Search className="text-indigo-600" size={22} />
                Recovery Engine Proposal
              </CardTitle>
              <CardDescription className="text-indigo-700/80 mt-1">
                AI evaluation of all possible outcomes based on condition, market demand, and logistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="grid gap-4">
                {data.recoveryOptions.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedOption(option)}
                    className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${selectedOption?.type === option.type ? "border-indigo-600 bg-indigo-50/40 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                  >
                    {option.isRecommended && (
                      <div className="absolute top-0 right-0 rounded-bl-xl rounded-tr-[9px] bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> AI RECOMMENDED
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                          <div className={`size-3 rounded-full ${selectedOption?.type === option.type ? "bg-indigo-600" : "bg-slate-300"}`} />
                          {option.label}
                        </h4>
                        
                        {/* Selected Option Expanded Details (Sections 7, 8, 9) */}
                        {selectedOption?.type === option.type && (
                          <div className="mt-4 grid gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* SECTION 7: RESELL INTELLIGENCE */}
                            {option.details.resaleDemand && (
                              <div className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <PackageSearch className="text-emerald-600 shrink-0" size={18} />
                                <div>
                                  <span className="font-semibold text-slate-900">Resale Intelligence:</span> Demand is <span className="text-emerald-700 font-bold">{option.details.resaleDemand}</span> on <span className="font-medium">{option.details.resaleChannel}</span>.
                                </div>
                              </div>
                            )}

                            {/* SECTION 8: DONATION INTELLIGENCE */}
                            {option.details.ngoName && (
                              <div className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <HeartHandshake className="text-amber-600 shrink-0" size={18} />
                                <div>
                                  <span className="font-semibold text-slate-900">Charity Match:</span> Pre-approved for <span className="font-bold">{option.details.ngoName}</span>. Generates {option.details.carbonBenefit} carbon offset and {option.details.socialImpact}.
                                </div>
                              </div>
                            )}

                            {/* SECTION 9: CIRCULAR ROUTING */}
                            {option.details.facilityName && (
                              <div className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <MapPin className="text-blue-600 shrink-0" size={18} />
                                <div>
                                  <span className="font-semibold text-slate-900">Routing:</span> {option.details.facilityName}. 
                                  {option.details.etaDays && ` ETA: ${option.details.etaDays} day(s).`}
                                  {option.details.processingCost && ` Cost: ${formatCurrency(option.details.processingCost)}.`}
                                  {option.details.carbonImpact && ` ${option.details.carbonImpact}.`}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expected Value & Metrics */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Expected Value</p>
                          <p className="text-xl font-bold text-slate-900">{formatCurrency(option.expectedValue)}</p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {option.confidence}% Conf.
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 flex items-center gap-1">
                            <Clock size={10} /> {option.timeRequiredHours}h
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECTION 11: OPERATOR ACTION CENTER (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-xl p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            {selectedOption?.isRecommended ? (
              <span className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                <CheckCircle2 size={16} /> Standard operating procedure
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                <ShieldAlert size={16} /> AI Override Selected
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button 
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              disabled={isRouting}
            >
              Escalate to Manager
            </button>
            <button 
              onClick={handleConfirmRouting}
              disabled={isRouting || !selectedOption}
              className="flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isRouting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Routing...
                </>
              ) : (
                <>Execute: {selectedOption?.label}</>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Success Toast Overlay */}
      {isRouting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Routing Confirmed</h2>
            <p className="text-sm text-slate-500 text-center">
              Item {data.returnId} has been successfully routed to: <br/>
              <span className="font-semibold text-slate-900">{selectedOption?.label}</span>.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
