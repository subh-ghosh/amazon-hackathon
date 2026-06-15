"use client";

import { use, useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, ShieldAlert, Clock, Info, Leaf,
  PackageSearch, Activity, HeartHandshake, Box, MapPin, Search,
  TrendingUp, Loader2, Zap, BarChart3, Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { operationsData } from "@/data/operations-data";
import type { TriageItemDetails, TriageRecoveryOption } from "@/types/operations";

interface LiveIntelligence {
  fraudScore: number;
  trustScore: number;
  riskLevel: string;
  simulations: Array<{ scenario: string; recoveryValue: number; carbonImpact: number; processingTimeDays: number; confidence: number }>;
  bestScenario: string;
  recoveryDecision: string;
  expectedProfit: number;
  carbonSavings: number;
  processingDays: number;
  reasoning: string[];
  recommendedWarehouse: string;
  recommendedRoute: string;
  logisticsCost: number;
  logisticsDays: number;
  carbonScore: number;
  circularFacility: string;
  circularType: string;
  optimizationScore: number;
  co2Saved: number;
  wasteDiverted: number;
  circularityScore: number;
}

interface DemandSignal {
  warehouse: string;
  city: string;
  searchVolume: number;
  demandMultiplier: number;
  capacityAvailable: number;
  distanceKm: number;
  matchReason: string;
}

export default function TriageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const data: TriageItemDetails = operationsData.triageDetails[id] || operationsData.triageDetails["RET-9921-A"];

  const [intel, setIntel] = useState<LiveIntelligence | null>(null);
  const [demandSignals, setDemandSignals] = useState<DemandSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<TriageRecoveryOption | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => { runLiveIntelligence(); }, []);

  // Item-specific parameters for varied recovery decisions
  const itemConfig = getItemConfig(data.returnId);

  async function runLiveIntelligence() {
    setLoading(true);
    const result: Partial<LiveIntelligence> = {};

    // S3: Fraud Assessment
    try {
      const fraud = await fetch("/api/proxy/s3/api/v1/fraud/score", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: `CUST-OPS-${data.returnId}`, product_id: itemConfig.productId,
          return_id: data.returnId, device_id: "DEVICE-OPS-01", payment_method_hash: "HASH-OPS-001",
        }),
      }).then(r => r.json());
      result.fraudScore = fraud.fraud_score;
      result.trustScore = fraud.trust_score;
      result.riskLevel = fraud.risk_level;
    } catch { result.fraudScore = itemConfig.fraudScore; result.trustScore = 100 - itemConfig.fraudScore; result.riskLevel = itemConfig.fraudScore > 50 ? "HIGH" : "LOW"; }

    // S5: Future Simulation — uses item-specific condition and value
    try {
      const sim = await fetch("/api/proxy/s5/api/v1/simulation/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: data.returnId, productId: itemConfig.productId,
          category: itemConfig.category, conditionScore: itemConfig.conditionScore,
          utilityScore: itemConfig.utilityScore, fraudScore: result.fraudScore || itemConfig.fraudScore,
          estimatedValue: itemConfig.estimatedValue, returnReason: itemConfig.returnReason, sellerTrustScore: itemConfig.sellerTrust,
        }),
      }).then(r => r.json());
      result.simulations = sim.simulations;
      result.bestScenario = sim.bestScenario;
    } catch { result.simulations = []; result.bestScenario = itemConfig.expectedDecision; }

    // S6: Recovery Optimizer (uses S5 output)
    try {
      const recovery = await fetch("/api/proxy/s6/api/v1/recovery/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: data.returnId, productId: itemConfig.productId,
          fraudScore: result.fraudScore || itemConfig.fraudScore, sellerTrustScore: itemConfig.sellerTrust,
          simulations: result.simulations || [
            { scenario: "Refurbish", recoveryValue: itemConfig.estimatedValue * 0.7, carbonImpact: 15.4, processingTimeDays: 5, confidence: 0.91 },
            { scenario: "Resell", recoveryValue: itemConfig.estimatedValue * 0.85, carbonImpact: 5, processingTimeDays: 2, confidence: 0.84 },
          ],
        }),
      }).then(r => r.json());
      result.recoveryDecision = recovery.recommendedDecision;
      result.expectedProfit = recovery.expectedProfit;
      result.carbonSavings = recovery.carbonSavings;
      result.processingDays = recovery.processingDays;
      result.reasoning = recovery.reasoning;
    } catch { result.recoveryDecision = itemConfig.expectedDecision; result.expectedProfit = itemConfig.estimatedValue * 0.7; result.reasoning = ["Optimal path selected"]; }

    // S7: Logistics Routing (uses S6 output)
    try {
      const logistics = await fetch("/api/proxy/s7/api/v1/logistics/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: data.returnId, productId: itemConfig.productId,
          recommendedDecision: result.recoveryDecision || itemConfig.expectedDecision,
          customerLocation: "Bangalore", expectedProfit: result.expectedProfit || itemConfig.estimatedValue * 0.7,
          carbonSavings: result.carbonSavings || 5, processingDays: result.processingDays || 3,
          confidence: 0.9, reasoning: result.reasoning || ["Optimal"],
          warehouses: [
            { warehouseId: "WH-BLR-04", city: "Bangalore", capacity: 82, distanceKm: 18 },
            { warehouseId: "WH-HYD-02", city: "Hyderabad", capacity: 64, distanceKm: 575 },
            { warehouseId: "WH-MAA-01", city: "Chennai", capacity: 71, distanceKm: 346 },
          ],
        }),
      }).then(r => r.json());
      result.recommendedWarehouse = logistics.recommendedWarehouse;
      result.recommendedRoute = logistics.recommendedRoute;
      result.logisticsCost = logistics.estimatedCost;
      result.logisticsDays = logistics.estimatedDays;
      result.carbonScore = logistics.carbonScore;
    } catch { result.recommendedWarehouse = "WH-BLR-04"; result.logisticsCost = 14.75; }

    // S9: Circular Routing (uses S7 output)
    try {
      const circular = await fetch("/api/proxy/s9/api/v1/logistics/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: `CIR-${Date.now()}`, returnId: data.returnId, productId: itemConfig.productId,
          category: itemConfig.category, condition: itemConfig.conditionEnum,
          estimatedValue: itemConfig.estimatedValue, weightKg: itemConfig.weightKg,
          customerLatitude: 12.9716, customerLongitude: 77.5946,
          recommendedWarehouse: result.recommendedWarehouse || "WH-BLR-04",
          estimatedCost: result.logisticsCost || 50, estimatedDays: result.logisticsDays || 1,
          carbonScore: result.carbonScore || 90, reasoning: result.reasoning || [],
          facilityOptions: [
            { facilityId: "FAC-REFURB-BLR", facilityType: "REFURBISHMENT", distanceKm: 18, capacityAvailable: true },
            { facilityId: "FAC-RESELL-BLR", facilityType: "LIQUIDATION", distanceKm: 22, capacityAvailable: true },
            { facilityId: "FAC-DONATE-BLR", facilityType: "DONATION", distanceKm: 8, capacityAvailable: true },
            { facilityId: "FAC-RECYCLE-HYD", facilityType: "RECYCLING", distanceKm: 575, capacityAvailable: true },
          ],
        }),
      }).then(r => r.json());
      result.circularFacility = circular.selectedFacilityId;
      result.circularType = circular.selectedFacilityType;
      result.optimizationScore = circular.optimizationScore;
      result.co2Saved = circular.sustainabilityMetrics?.estimatedCO2Saved || 0;
      result.wasteDiverted = circular.sustainabilityMetrics?.estimatedWasteDivertedKg || 0;
      result.circularityScore = circular.sustainabilityMetrics?.circularityScore || 0;
    } catch { result.circularFacility = "FAC-REFURB-BLR"; result.circularType = "REFURBISHMENT"; result.optimizationScore = 95; }

    // Use static triage data for options (correctly varied per item)
    // Live API enriches metrics only, does not replace decisions
    const recommendedOpt = data.recoveryOptions.find(o => o.isRecommended);
    setDemandSignals(generateDemandSignals(recommendedOpt?.type || "RESELL", itemConfig.category));
    result.recoveryDecision = (data.recoveryOptions.find(o => o.isRecommended) || data.recoveryOptions[0]).label.toUpperCase();
    setIntel(result as LiveIntelligence);
    setLoading(false);
    setSelectedOption(recommendedOpt || data.recoveryOptions[0]);
  }

  const handleConfirmRouting = () => {
    setIsRouting(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

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
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Live</Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-950 mt-1">{data.productName}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">Return ID: {data.returnId}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
          <p className="text-sm text-slate-600 mb-2">Analyzing return...</p>
          <p className="text-xs text-slate-400">Fraud → Simulation → Recovery → Logistics → Routing</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Context */}
          <div className="space-y-6 lg:col-span-5">
            {/* Condition */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2"><Box size={18} className="text-slate-400" />Condition Assessment</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="rounded-md border border-slate-200 overflow-hidden bg-slate-100 h-48 flex items-center justify-center">
                  <img src={data.productImage} alt={data.productName} className="h-full w-full object-cover mix-blend-multiply" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Customer Reason</p>
                  <div className="bg-amber-50 border border-amber-100 text-amber-900 text-sm p-3 rounded-lg italic">&ldquo;{data.customerStatedReason}&rdquo;</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Visual Inspection</p>
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm p-3 rounded-lg">{data.conditionAssessment}</div>
                </div>
              </CardContent>
            </Card>

            {/* Fraud from live S3 */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-slate-400" />Trust Verification</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{intel?.fraudScore || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Fraud Score</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{intel?.trustScore || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Trust Score</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-slate-900">{intel?.riskLevel || "LOW"}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Risk Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Digital Twin */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2"><Activity size={18} className="text-slate-400" />Digital Twin Lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pl-4">
                <div className="relative border-l-2 border-slate-200 pl-6 space-y-5">
                  {data.twinEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] rounded-full size-4 border-2 border-white ${event.type === 'purchase' ? 'bg-blue-500' : event.type === 'return' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <p className="text-xs text-slate-400 font-mono mb-0.5">{event.date}</p>
                      <p className="text-sm font-bold text-slate-900">{event.title}</p>
                      <p className="text-xs text-slate-600">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: AI Decision + Demand Routing */}
          <div className="space-y-6 lg:col-span-7">

            {/* AI Decision Summary */}
            <Card className="border-indigo-200">
              <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
                <CardTitle className="text-xl text-indigo-950 flex items-center gap-2">
                  <Zap className="text-indigo-600" size={22} />
                  Recovery Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-lg font-bold text-indigo-900">{intel?.recoveryDecision}</p>
                    <p className="text-[10px] text-indigo-600 uppercase">Decision</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-lg font-bold text-emerald-700">${intel?.expectedProfit?.toFixed(0) || 0}</p>
                    <p className="text-[10px] text-emerald-600 uppercase">Recovery Value</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-lg font-bold text-green-700">{intel?.co2Saved?.toFixed(1) || 0}kg</p>
                    <p className="text-[10px] text-green-600 uppercase">CO₂ Saved</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-lg font-bold text-blue-700">{intel?.circularityScore || 0}/100</p>
                    <p className="text-[10px] text-blue-600 uppercase">Circularity</p>
                  </div>
                </div>

                {/* Reasoning */}
                {intel?.reasoning && intel.reasoning.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Decision factors:</p>
                    <ul className="space-y-0.5">
                      {intel.reasoning.map((r, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 size={11} className="text-indigo-500 mt-0.5 flex-shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Simulation scenarios from S5 */}
                {intel?.simulations && intel.simulations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recovery Scenarios</p>
                    <div className="space-y-2">
                      {intel.simulations.map((sim, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${sim.scenario.toUpperCase() === intel.recoveryDecision ? "border-indigo-300 bg-indigo-50" : "border-slate-100 bg-white"}`}>
                          <div className="flex items-center gap-2">
                            {sim.scenario.toUpperCase() === intel.recoveryDecision && <CheckCircle2 size={14} className="text-indigo-600" />}
                            <span className="text-sm font-medium text-slate-900">{sim.scenario}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-600">
                            <span>${sim.recoveryValue.toFixed(0)}</span>
                            <span>{(sim.confidence * 100).toFixed(0)}%</span>
                            <span>{sim.processingTimeDays}d</span>
                            <span>{sim.carbonImpact}kg CO₂</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demand-Based Routing Intelligence */}
            <Card className="border-emerald-200">
              <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
                <CardTitle className="text-xl text-emerald-950 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" size={22} />
                  Optimal Routing
                </CardTitle>
                <CardDescription className="text-emerald-700/80 mt-1">
                  Routing to warehouse with highest customer demand for this product category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                {/* Optimal route from S7 */}
                <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Optimal Route: {intel?.recommendedRoute || "Processing..."}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Warehouse: <strong>{intel?.recommendedWarehouse}</strong> •
                        Cost: <strong>${intel?.logisticsCost?.toFixed(2)}</strong> •
                        ETA: <strong>{intel?.logisticsDays} day(s)</strong> •
                        Carbon Score: <strong>{intel?.carbonScore?.toFixed(0)}/100</strong>
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Circular Facility: <strong>{intel?.circularFacility}</strong> ({intel?.circularType}) •
                        Optimization: <strong>{intel?.optimizationScore?.toFixed(0)}%</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demand signals per warehouse */}
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Demand Signals by Region</p>
                <div className="space-y-2">
                  {demandSignals.map((signal, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"}`}>
                      <BarChart3 size={16} className={i === 0 ? "text-emerald-600" : "text-slate-400"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{signal.warehouse} — {signal.city}</p>
                          {i === 0 && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Best Match</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{signal.matchReason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">{signal.demandMultiplier}x</p>
                        <p className="text-[10px] text-slate-500">{signal.searchVolume} searches/wk</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-600">{signal.distanceKm}km</p>
                        <p className="text-[10px] text-slate-500">{signal.capacityAvailable}% cap</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sustainability summary */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Leaf className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-green-900">Circular Economy Impact</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      This routing saves <strong>{intel?.co2Saved?.toFixed(1)}kg CO₂</strong>, diverts <strong>{intel?.wasteDiverted?.toFixed(1)}kg waste</strong> from landfill, and matches this item with <strong>{demandSignals[0]?.searchVolume || 0} active buyers</strong> in the target region.
                    </p>
                  </div>
                </div>

                {/* Direct Buyer Match — Peer-to-Peer Economics */}
                <div className="mt-4 border-2 border-indigo-200 rounded-xl p-5 bg-indigo-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="text-indigo-600" size={20} />
                    <div>
                      <p className="text-sm font-bold text-indigo-900">Direct Buyer Match Available</p>
                      <p className="text-[10px] text-indigo-600">Skip warehouse — fulfill directly to matched buyer</p>
                    </div>
                  </div>

                  {/* Matched buyers */}
                  <div className="bg-white rounded-lg border border-indigo-100 p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Matched Buyers (by proximity)</p>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">{demandSignals[0]?.searchVolume || 47} potential</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: "B-8821", distance: 4.2, city: "Indiranagar", willPay: 0.72 },
                        { id: "B-9103", distance: 8.7, city: "Koramangala", willPay: 0.68 },
                        { id: "B-7294", distance: 15.3, city: "Whitefield", willPay: 0.65 },
                      ].map((buyer, i) => {
                        const itemPrice = 249.99;
                        const buyerPays = Math.round(itemPrice * buyer.willPay * 100) / 100;
                        const deliveryCost = Math.round((buyer.distance * 0.8 + 3) * 100) / 100;
                        const inspectionFee = 8.00;
                        const amazonMargin = Math.round((buyerPays - deliveryCost - inspectionFee) * 100) / 100;
                        return (
                          <div key={buyer.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${i === 0 ? "border-indigo-200 bg-indigo-50" : "border-slate-100"}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{buyer.id.slice(-2)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-900">{buyer.city} • {buyer.distance}km away</p>
                              <p className="text-[10px] text-slate-500">Searched for this product {Math.floor(Math.random() * 3 + 1)} times this week</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-indigo-700">${buyerPays.toFixed(2)}</p>
                              <p className="text-[10px] text-slate-500">buyer pays</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Economics breakdown */}
                  <div className="bg-white rounded-lg border border-indigo-100 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Direct Fulfillment Economics (Best Match)</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-600">Buyer pays (Renewed price)</span><span className="font-medium text-slate-900">$179.99</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Local delivery (4.2km)</span><span className="text-red-600">-$6.36</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Inspection & certification</span><span className="text-red-600">-$8.00</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Platform fee</span><span className="text-red-600">-$5.00</span></div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-100"><span className="font-semibold text-slate-900">Amazon net recovery</span><span className="font-bold text-emerald-700">$160.63</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500">vs. Traditional warehouse routing</p>
                        <p className="text-xs text-emerald-700 font-medium">Saves $22.40 in logistics + 3 days faster</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-bold">+14% margin</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Sticky Action Footer */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-xl p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
              <CheckCircle2 size={16} /> Decision: {selectedOption?.label || intel?.recoveryDecision} → {intel?.circularFacility}
            </span>
            <button onClick={handleConfirmRouting} disabled={isRouting} className="px-8 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-md flex items-center gap-2">
              {isRouting ? <><Loader2 size={16} className="animate-spin" />Routing...</> : <>Execute Route</>}
            </button>
          </div>
        </div>
      )}

      {isRouting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Routing Confirmed</h2>
            <p className="text-sm text-slate-500 text-center">
              {data.returnId} routed to <strong>{intel?.circularFacility}</strong> for <strong>{intel?.recoveryDecision?.toLowerCase()}</strong>.
              Matched with {demandSignals[0]?.searchVolume || 0} potential buyers.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function generateDemandSignals(decision: string, category: string): DemandSignal[] {
  const baseSearches = Math.floor(150 + Math.random() * 200);
  return [
    {
      warehouse: "WH-BLR-04", city: "Bangalore",
      searchVolume: baseSearches, demandMultiplier: 3.2,
      capacityAvailable: 82, distanceKm: 18,
      matchReason: `${category} demand 3.2x above average — ${decision.toLowerCase()} inventory depleted`,
    },
    {
      warehouse: "WH-HYD-02", city: "Hyderabad",
      searchVolume: Math.floor(baseSearches * 0.6), demandMultiplier: 1.8,
      capacityAvailable: 64, distanceKm: 575,
      matchReason: `Moderate demand, good capacity for ${decision.toLowerCase()} pipeline`,
    },
    {
      warehouse: "WH-MAA-01", city: "Chennai",
      searchVolume: Math.floor(baseSearches * 0.4), demandMultiplier: 1.1,
      capacityAvailable: 71, distanceKm: 346,
      matchReason: `Standard demand levels — backup routing option`,
    },
  ];
}

interface ItemConfig {
  productId: string;
  category: string;
  conditionScore: number;
  utilityScore: number;
  fraudScore: number;
  estimatedValue: number;
  returnReason: string;
  sellerTrust: number;
  weightKg: number;
  conditionEnum: string;
  expectedDecision: string;
}

function getItemConfig(returnId: string): ItemConfig {
  // Each item has different parameters to produce varied recovery decisions
  const configs: Record<string, ItemConfig> = {
    // Echo Show - high condition, high value → RESELL (outlet sale)
    "RET-9921-A": {
      productId: "P-88421", category: "Smart Home", conditionScore: 92, utilityScore: 88,
      fraudScore: 12, estimatedValue: 249.99, returnReason: "DAMAGED_IN_TRANSIT",
      sellerTrust: 0.92, weightKg: 2.5, conditionEnum: "LIKE_NEW", expectedDecision: "RESELL",
    },
    // Fire TV Stick - medium condition → REFURBISH
    "RET-9922-B": {
      productId: "P-88417", category: "Streaming", conditionScore: 74, utilityScore: 65,
      fraudScore: 8, estimatedValue: 54.99, returnReason: "DEFECTIVE",
      sellerTrust: 0.88, weightKg: 0.3, conditionEnum: "USED", expectedDecision: "REFURBISH",
    },
    // Kindle - good condition, medium value → RESELL
    "RET-9923-C": {
      productId: "P-88409", category: "E-readers", conditionScore: 88, utilityScore: 82,
      fraudScore: 5, estimatedValue: 139.99, returnReason: "CHANGED_MIND",
      sellerTrust: 0.95, weightKg: 0.2, conditionEnum: "LIKE_NEW", expectedDecision: "RESELL",
    },
    // Nike shoes - poor condition, worn → RECYCLE
    "RET-9924-D": {
      productId: "P-91204", category: "Footwear", conditionScore: 45, utilityScore: 30,
      fraudScore: 25, estimatedValue: 150.00, returnReason: "WRONG_ITEM",
      sellerTrust: 0.70, weightKg: 0.8, conditionEnum: "DAMAGED", expectedDecision: "RECYCLE",
    },
    // Samsung phone - very poor condition, high fraud → RECYCLE (possible fraud)
    "RET-9925-E": {
      productId: "P-73892", category: "Electronics", conditionScore: 30, utilityScore: 20,
      fraudScore: 75, estimatedValue: 1299.99, returnReason: "DEFECTIVE",
      sellerTrust: 0.40, weightKg: 0.23, conditionEnum: "BROKEN", expectedDecision: "RECYCLE",
    },
    // Dyson vacuum - fair condition → REFURBISH
    "RET-9926-F": {
      productId: "P-55210", category: "Home Appliance", conditionScore: 62, utilityScore: 55,
      fraudScore: 10, estimatedValue: 749.99, returnReason: "NOT_AS_DESCRIBED",
      sellerTrust: 0.85, weightKg: 3.1, conditionEnum: "REFURBISHABLE", expectedDecision: "REFURBISH",
    },
  };

  return configs[returnId] || configs["RET-9921-A"];
}
