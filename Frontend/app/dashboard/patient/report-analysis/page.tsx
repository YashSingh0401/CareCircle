"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ImageIcon,
  XCircle,
  Shield,
  Lightbulb,
  Heart,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  MotionCard,
  MotionPage,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RECORD_TYPES = [
  { value: "lab_report", label: "Lab Report" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "radiology", label: "Radiology" },
  { value: "pathology", label: "Pathology" },
  { value: "prescription", label: "Prescription" },
  { value: "clinical_notes", label: "Clinical Notes" },
  { value: "other", label: "Other" },
];

type AnalysisResult = {
  summary?: string;
  key_findings?: string[];
  patient_explanation?: string;
  risk_factors?: string[];
  recommendations?: string[];
};

export default function ReportAnalysisPage() {
  const [mode, setMode] = useState<"text" | "image">("text");

  // Text mode state
  const [reportText, setReportText] = useState("");
  const [recordType, setRecordType] = useState("lab_report");

  // Image mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPG, PNG, or WebP image.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  async function handleTextAnalysis() {
    if (!reportText.trim()) {
      toast.error("No report text", {
        description: "Please paste your medical report text.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/records/analyze", {
        record_id: "temp-" + Date.now(),
        report_text: reportText,
        record_type: recordType,
      });
      setResult(res.data);
      toast.success("Report analyzed!", {
        description: "AI has completed analysis of your medical report.",
        className: "border border-emerald-500/20 bg-black/90 text-emerald-300",
      });
    } catch (err: any) {
      console.error("Text analysis failed", err);
      toast.error("Analysis failed", {
        description: err?.response?.data?.detail || "Please try again.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleImageAnalysis() {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please upload a medical report image.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await api.post("/api/records/analyze-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      toast.success("Image analyzed!", {
        description: "AI has completed analysis of your medical image.",
        className: "border border-emerald-500/20 bg-black/90 text-emerald-300",
      });
    } catch (err: any) {
      console.error("Image analysis failed", err);
      toast.error("Analysis failed", {
        description: err?.response?.data?.detail || "Please try again.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (mode === "text") handleTextAnalysis();
    else handleImageAnalysis();
  }

  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(121,40,202,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          {/* Header */}
          <MotionStaggerItem className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/dashboard/patient"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
              <Brain size={14} />
              Gemini AI Analysis
            </div>
          </MotionStaggerItem>

          {/* Title */}
          <MotionStaggerItem className="mb-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/10">
                  <Brain size={24} className="text-violet-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Medical Report{" "}
                    <span className="bg-gradient-to-r from-violet-300 to-cyan-400 bg-clip-text text-transparent">
                      AI Analysis
                    </span>
                  </h1>
                  <p className="text-sm text-white/55">
                    Paste report text or upload an image for AI-powered analysis
                  </p>
                </div>
              </div>
            </div>
          </MotionStaggerItem>

          {/* Mode toggle */}
          <MotionStaggerItem className="mb-6">
            <div className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit mx-auto backdrop-blur-xl">
              <button
                type="button"
                onClick={() => { setMode("text"); setResult(null); }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                  mode === "text"
                    ? "bg-violet-400/20 text-violet-300 border border-violet-400/30"
                    : "text-white/50 hover:text-white/70 border border-transparent"
                }`}
              >
                <FileText size={16} />
                Text Analysis
              </button>
              <button
                type="button"
                onClick={() => { setMode("image"); setResult(null); }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                  mode === "image"
                    ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                    : "text-white/50 hover:text-white/70 border border-transparent"
                }`}
              >
                <ImageIcon size={16} />
                Image Analysis
              </button>
            </div>
          </MotionStaggerItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input area */}
            <MotionStaggerItem>
              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col">
                <div className="flex items-center gap-2 text-lg font-semibold mb-5">
                  {mode === "text" ? (
                    <>
                      <FileText size={18} className="text-violet-300" />
                      Report Text
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-cyan-300" />
                      Upload Image
                    </>
                  )}
                </div>

                {mode === "text" ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Record type selector */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-2 block">
                        Record Type
                      </label>
                      <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-violet-400/40 focus:outline-none transition appearance-none cursor-pointer"
                      >
                        {RECORD_TYPES.map((rt) => (
                          <option key={rt.value} value={rt.value} className="bg-black text-white">
                            {rt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Text area */}
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Paste your medical report text here...&#10;&#10;Example: CBC results showing WBC 11.2 x10^3/uL, RBC 4.5 x10^6/uL, Hemoglobin 13.2 g/dL..."
                      className="flex-1 min-h-[220px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none transition resize-none"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      className={`relative flex min-h-[260px] flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
                        dragOver
                          ? "border-cyan-400/60 bg-cyan-400/10"
                          : "border-white/15 bg-black/20 hover:border-cyan-400/30 hover:bg-cyan-400/5"
                      }`}
                    >
                      {previewUrl ? (
                        <div className="relative w-full">
                          <img
                            src={previewUrl}
                            alt="Report preview"
                            className="mx-auto max-h-[220px] rounded-xl object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearImage(); }}
                            className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                          >
                            <XCircle size={16} />
                          </button>
                          <div className="mt-3 text-center text-xs text-white/50">
                            {selectedFile?.name} · {((selectedFile?.size || 0) / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <ImageIcon size={28} className="text-cyan-300" />
                          </div>
                          <div className="text-sm font-semibold text-white/80">
                            Drop your report image here
                          </div>
                          <div className="mt-1 text-xs text-white/45">
                            X-ray, scan report, lab result · JPG, PNG, WebP · Max 10MB
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (mode === "text" ? !reportText.trim() : !selectedFile)}
                  className={`mt-5 w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 ${
                    mode === "text"
                      ? "border-violet-400/30 bg-violet-400/15 text-violet-300 hover:bg-violet-400/25"
                      : "border-cyan-400/30 bg-cyan-400/15 text-cyan-300 hover:bg-cyan-400/25"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain size={16} />
                      Analyze Report
                    </>
                  )}
                </button>
              </MotionCard>
            </MotionStaggerItem>

            {/* Results area */}
            <MotionStaggerItem>
              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col min-h-[400px]">
                <div className="flex items-center gap-2 text-lg font-semibold mb-5">
                  <ClipboardList size={18} className="text-emerald-300" />
                  Analysis Results
                </div>

                {loading && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-2 border-violet-400/20" />
                      <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-violet-400" />
                    </div>
                    <div className="text-sm text-white/60">AI is analyzing your report...</div>
                    <div className="text-xs text-white/35">
                      Extracting key findings and recommendations
                    </div>
                  </div>
                )}

                {!loading && !result && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/30">
                    <Brain size={40} />
                    <div className="text-sm">Submit a report to see AI analysis</div>
                  </div>
                )}

                {!loading && result && (
                  <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                    {/* Summary */}
                    {result.summary && (
                      <div className="rounded-2xl border border-violet-400/15 bg-violet-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300 mb-2">
                          <Sparkles size={13} />
                          AI Summary
                        </div>
                        <p className="text-sm leading-6 text-white/75">{result.summary}</p>
                      </div>
                    )}

                    {/* Key Findings */}
                    {result.key_findings && result.key_findings.length > 0 && (
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-3">
                          <CheckCircle2 size={13} />
                          Key Findings
                        </div>
                        <ul className="space-y-2">
                          {result.key_findings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400/50 shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Patient Explanation */}
                    {result.patient_explanation && (
                      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 mb-2">
                          <Heart size={13} />
                          What This Means For You
                        </div>
                        <p className="text-sm leading-6 text-white/75">
                          {result.patient_explanation}
                        </p>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {result.risk_factors && result.risk_factors.length > 0 && (
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300 mb-3">
                          <AlertTriangle size={13} />
                          Risk Factors
                        </div>
                        <ul className="space-y-2">
                          {result.risk_factors.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-amber-200/70">
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400/50 shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 mb-3">
                          <Lightbulb size={13} />
                          Recommendations
                        </div>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-200/70">
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400/50 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </MotionCard>
            </MotionStaggerItem>
          </div>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
