"use client";

import React, { useState, useEffect } from "react";
import { Upload, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Award, DollarSign, Activity, FileText, CheckCircle, Scale, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Damage {
  type: string;
  confidence: number;
  boundingBox: number[];
  severity: "Low" | "Medium" | "High" | "Critical";
}

interface Financials {
  originalPrice: number;
  repairCost: number;
  resaleValue: number;
  recoveryRate: number;
  processingCost: number;
  transportationCost: number;
  expectedProfit: number;
  roi: number;
  profitabilityStatus: "Profitable" | "Marginal" | "Not Worth Repair";
}

interface Performance {
  inferenceTimeMs: number;
  device: string;
  modelVersion: string;
  customWeightsLoaded: boolean;
}

interface InspectionReport {
  conditionScore: number;
  overallCondition: string;
  damages: Damage[];
  annotatedImage: string;
  financials: Financials;
  recommendation: {
    primary: string;
    confidence: number;
    reasoning: string;
    options: string[];
  };
  performance: Performance;
}

interface VisualInspectionProps {
  returnId: string;
  productId: string;
  originalPrice: number;
  onInspectionComplete: (score: number, assessment: string, recommendation: string) => void;
}

export default function VisualInspection({
  returnId,
  productId,
  originalPrice,
  onInspectionComplete
}: VisualInspectionProps) {
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  // Images state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [annotatedPreviews, setAnnotatedPreviews] = useState<string[]>([]);

  // Inspections State
  const [buyerInspection, setBuyerInspection] = useState<any | null>(null);
  const [warehouseReport, setWarehouseReport] = useState<InspectionReport | null>(null);
  const [comparisonSummary, setComparisonSummary] = useState<{
    scoreDelta: number;
    newDamages: string[];
    missingDamages: string[];
    alerts: string[];
  } | null>(null);

  // Fetch Digital Twin on mount to check if buyer inspection is available
  useEffect(() => {
    fetch(`/api/proxy/s4/api/v1/products/${productId}`)
      .then((r) => r.json())
      .then((twin) => {
        if (twin && twin.buyerInspection) {
          console.log("Loaded buyer inspection from twin:", twin.buyerInspection);
          setBuyerInspection(twin.buyerInspection);
        }
      })
      .catch((err) => console.error("Failed to load Digital Twin inspection data:", err));
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) {
      setError("Please upload one or more product images.");
      return;
    }
    if (selectedFiles.length > 5) {
      setError("Maximum of 5 images allowed.");
      return;
    }

    // Validate size and format
    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are supported.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be under 10MB.");
        return;
      }
    }

    setError(null);
    setWarehouseReport(null);
    setComparisonSummary(null);
    setDbStatus(null);
    setAnnotatedPreviews([]);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Trigger analysis
    analyzeWarehouseImages(selectedFiles);
  };

  const analyzeWarehouseImages = async (files: File[]) => {
    setLoading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("originalPrice", originalPrice.toString());

        const response = await fetch("/api/damage-detection", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Inference failed on image: ${file.name}`);
        }
        return response.json();
      });

      const results: InspectionReport[] = await Promise.all(uploadPromises);

      // Aggregate multiple images
      const scores = results.map((r) => r.conditionScore);
      const finalScore = Math.min(...scores);

      const allDamages: Damage[] = [];
      const annotated: string[] = [];
      let totalRepairCost = 0;
      let totalInferenceTime = 0;

      results.forEach((r) => {
        if (r.damages) {
          allDamages.push(...r.damages);
        }
        if (r.annotatedImage) {
          annotated.push(r.annotatedImage);
        }
        if (r.financials && r.financials.repairCost) {
          totalRepairCost += r.financials.repairCost;
        }
        if (r.performance && r.performance.inferenceTimeMs) {
          totalInferenceTime += r.performance.inferenceTimeMs;
        }
      });

      // Filter duplicate damage types
      const uniqueDamages = allDamages.filter(
        (v, i, a) => a.findIndex((t) => t.type === v.type) === i
      );

      // Financials recalculation
      const recoveryRate = Math.max(10, finalScore - 3);
      const resaleValue = Math.round(originalPrice * (recoveryRate / 100.0));
      const processingCost = 500.0;
      const transportationCost = 350.0;
      const totalCost = totalRepairCost + processingCost + transportationCost;
      const expectedProfit = resaleValue - totalCost;
      const roi = Math.round((expectedProfit / totalCost) * 100.0);
      
      const overallCondition = finalScore >= 90 ? "Excellent" : finalScore >= 70 ? "Good" : finalScore >= 50 ? "Fair" : "Poor";

      const aggReport: InspectionReport = {
        conditionScore: finalScore,
        overallCondition,
        damages: uniqueDamages,
        annotatedImage: annotated[0] || "",
        financials: {
          originalPrice,
          repairCost: totalRepairCost,
          resaleValue,
          recoveryRate,
          processingCost,
          transportationCost,
          expectedProfit,
          roi,
          profitabilityStatus: expectedProfit < 0 ? "Not Worth Repair" : expectedProfit < 3000 ? "Marginal" : "Profitable",
        },
        recommendation: results[0].recommendation, // use top level decision ranges
        performance: {
          inferenceTimeMs: totalInferenceTime,
          device: results[0].performance.device,
          modelVersion: results[0].performance.modelVersion,
          customWeightsLoaded: results[0].performance.customWeightsLoaded,
        },
      };

      // Perform comparison if buyer inspection exists
      if (buyerInspection) {
        const buyerScore = buyerInspection.conditionScore;
        const buyerDamages: string[] = (buyerInspection.damages || []).map((d: any) => d.type);
        const warehouseDamages = uniqueDamages.map((d) => d.type);

        const newDamages = warehouseDamages.filter((d) => !buyerDamages.includes(d));
        const missingDamages = buyerDamages.filter((d) => !warehouseDamages.includes(d));

        const alerts: string[] = [];
        if (finalScore < buyerScore - 10) {
          alerts.push(`Transit Damage Sustained: Condition score dropped significantly from ${buyerScore} (Buyer) to ${finalScore} (Warehouse).`);
        }
        if (missingDamages.length > 0) {
          alerts.push(`Possible Return Fraud/Swap: Blemish reported by buyer (${missingDamages.join(", ")}) was not found in warehouse scan.`);
        }
        if (newDamages.length > 0 && finalScore < 60) {
          alerts.push(`Transit Defect Escalation: New physical damage (${newDamages.join(", ")}) occurred in shipping.`);
        }

        setComparisonSummary({
          scoreDelta: finalScore - buyerScore,
          newDamages,
          missingDamages,
          alerts,
        });
      }

      setWarehouseReport(aggReport);
      setAnnotatedPreviews(annotated);

      // Save results to S4 Digital Twin
      setDbStatus("Syncing...");
      await fetch(`/api/proxy/s4/api/v1/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionScore: finalScore,
          currentStatus: "RETURNED",
          warehouseInspection: {
            timestamp: new Date().toISOString(),
            imagesCount: files.length,
            damages: uniqueDamages,
            conditionScore: finalScore,
            overallCondition,
            estimatedRepairCost: totalRepairCost,
            operator: "WH-BLR-04 Operator"
          }
        })
      });
      setDbStatus("Digital Twin Updated Successfully");

      const assessmentText = uniqueDamages.map((d) => `${d.type} (${(d.confidence * 100).toFixed(0)}%)`).join(", ");
      const triageAssessment = `[YOLOv8 WH Inspection] Scanned: ${assessmentText || "No visible damages"}. Score: ${finalScore}/100. Grade: ${overallCondition}. Recommendation: ${aggReport.recommendation.primary}`;
      
      onInspectionComplete(finalScore, triageAssessment, aggReport.recommendation.primary);
    } catch (err: any) {
      console.error(err);
      setError("AI model inference failed or timed out. YOLO service may be offline.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50";
      case "High":
        return "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950/40 dark:border-orange-900/50";
      case "Medium":
        return "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50";
      default:
        return "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50";
    }
  };

  const getProfitabilityBadge = (status: string) => {
    switch (status) {
      case "Profitable":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1">PROFITABLE</Badge>;
      case "Marginal":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1">MARGINAL</Badge>;
      default:
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1">NOT WORTH REPAIR</Badge>;
    }
  };

  return (
    <Card className="border-indigo-150 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-slate-50 to-indigo-50/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-indigo-600 animate-pulse" size={20} />
            <CardTitle className="text-lg font-bold text-slate-900">AI Visual Inspection System</CardTitle>
          </div>
          <Badge className="bg-indigo-600 text-white font-semibold">YOLOv8 Active Scanner</Badge>
        </div>
        <CardDescription>
          Upload fresh warehouse inspection photos (1 to 5) to audit condition history, evaluate shipping degradation, and execute circular routing optimizations.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Upload Zone */}
        <div className="relative group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            loading 
              ? "border-indigo-300 bg-indigo-50/20" 
              : "border-slate-200 group-hover:border-indigo-400 group-hover:bg-slate-50/50"
          }`}>
            <Upload className={`mx-auto mb-3 text-slate-400 transition-transform ${loading ? "animate-bounce text-indigo-500" : "group-hover:scale-110"}`} size={32} />
            <p className="text-sm font-semibold text-slate-700">
              {loading ? "Analyzing Image..." : "Upload Fresh Return Photos (1-5)"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPG, PNG, WEBP (Max 10MB per image)
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Previews Grid */}
        {imagePreviews.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse Scan Previews ({imagePreviews.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                  <img
                    src={annotatedPreviews[idx] || preview}
                    alt={`Scan preview ${idx + 1}`}
                    className="object-contain max-h-28 w-full"
                  />
                  {loading && !annotatedPreviews[idx] && (
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                      <RefreshCw className="animate-spin text-white" size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Summary Card */}
        {buyerInspection && (
          <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
              <Scale size={14} />
              <span>Prior Buyer Inspection Context Found</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-50">
                <span className="text-slate-500 block">Stated Condition Score:</span>
                <span className="font-bold text-slate-800">{buyerInspection.conditionScore}/100 ({buyerInspection.overallCondition})</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-50">
                <span className="text-slate-500 block">Stated Blemishes:</span>
                <span className="font-bold text-slate-800">
                  {buyerInspection.damages && buyerInspection.damages.length > 0 
                    ? buyerInspection.damages.map((d: any) => d.type).join(", ") 
                    : "None"}
                </span>
              </div>
            </div>
            
            {comparisonSummary && (
              <div className="pt-2 border-t border-indigo-100/50 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Condition Score Delta:</span>
                  <span className={`font-mono font-bold ${comparisonSummary.scoreDelta < 0 ? "text-rose-600" : comparisonSummary.scoreDelta > 0 ? "text-emerald-600" : "text-slate-600"}`}>
                    {comparisonSummary.scoreDelta > 0 ? `+${comparisonSummary.scoreDelta}` : comparisonSummary.scoreDelta}
                  </span>
                </div>

                {comparisonSummary.alerts.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {comparisonSummary.alerts.map((alert, idx) => (
                      <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                        <ShieldAlert size={14} className="text-rose-600 shrink-0" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Inspection Match: Warehouse scan aligns with buyer return claim. Zero transit discrepancies.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Database Status Success Banner */}
        {dbStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle size={14} />
              <span>{dbStatus}</span>
            </span>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] uppercase font-mono px-2 py-0.5">DB Connected</Badge>
          </div>
        )}

        {/* AI Results breakdown */}
        {warehouseReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Score card */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Final Condition Score</span>
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-200 fill-none" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className={`fill-none transition-all duration-1000 ${
                        warehouseReport.conditionScore >= 90 ? "stroke-emerald-500" :
                        warehouseReport.conditionScore >= 70 ? "stroke-blue-500" :
                        warehouseReport.conditionScore >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                      }`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - warehouseReport.conditionScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-900">{warehouseReport.conditionScore}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{warehouseReport.overallCondition}</span>
                  </div>
                </div>
              </div>

              {/* Financials card */}
              <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Financial Yield Breakdown</span>
                  {getProfitabilityBadge(warehouseReport.financials.profitabilityStatus)}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block mb-0.5">EST. REPAIR</span>
                    <span className="text-sm font-black text-rose-600 font-mono">₹{warehouseReport.financials.repairCost}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block mb-0.5">RESALE VALUE</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">₹{warehouseReport.financials.resaleValue}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block mb-0.5">ROI YIELD</span>
                    <span className="text-sm font-black text-indigo-600 font-mono">{warehouseReport.financials.roi}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
                  <div className="flex justify-between">
                    <span>Original MSRP:</span>
                    <span className="font-bold text-slate-700 font-mono">₹{warehouseReport.financials.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recovery Rate:</span>
                    <span className="font-bold text-slate-700 font-mono">{warehouseReport.financials.recoveryRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blemishes and AI Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={12} className="text-slate-400" />
                  <span>Damages Discovered ({warehouseReport.damages.length})</span>
                </p>
                {warehouseReport.damages.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold p-2 bg-emerald-50 rounded-lg">
                    <ShieldCheck size={14} />
                    <span>No blemishes found. Original packaging intact.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {warehouseReport.damages.map((dmg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between border px-2.5 py-1.5 rounded-lg text-xs font-semibold ${getSeverityColor(dmg.severity)}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={12} />
                          <span>{dmg.type} ({(dmg.confidence * 100).toFixed(0)}%)</span>
                        </div>
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.5 bg-white/60 rounded">
                          {dmg.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 space-y-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={12} className="text-slate-400" />
                  <span>AI Recovery Recommendation</span>
                </p>
                <div className="text-xs text-slate-600 space-y-2">
                  <div className="bg-white rounded-lg p-2.5 border border-slate-100 italic">
                    &ldquo;{warehouseReport.recommendation.reasoning}&rdquo;
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span>Recommended Action: <strong>{warehouseReport.recommendation.primary}</strong></span>
                    </span>
                    <span className="font-bold text-indigo-600">Confidence: {warehouseReport.recommendation.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance telemetry */}
            <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-4">
                <span>Model: <strong className="text-slate-500">{warehouseReport.performance.modelVersion}</strong></span>
                <span>Device: <strong className="text-slate-500">{warehouseReport.performance.device}</strong></span>
                <span>Inference: <strong className="text-slate-500">{warehouseReport.performance.inferenceTimeMs}ms</strong></span>
              </div>
              <span>Weights: <strong className={warehouseReport.performance.customWeightsLoaded ? "text-emerald-600" : "text-amber-500"}>
                {warehouseReport.performance.customWeightsLoaded ? "Custom best.pt" : "Default yolov8n.pt"}
              </strong></span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
