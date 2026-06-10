"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileImage,
  Pill,
  AlertCircle,
  Clock,
  XCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ImageIcon,
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PrescriptionOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        description: "Maximum file size is 10MB. Please compress your image.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    setSelectedFile(file);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please upload a prescription image first.",
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await api.post("/api/records/ocr-prescription", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      toast.success("Prescription parsed successfully!", {
        description: "AI has extracted medication details from your prescription.",
        className: "border border-emerald-500/20 bg-black/90 text-emerald-300",
      });
    } catch (err: any) {
      console.error("OCR failed", err);
      const msg =
        err?.response?.data?.detail || "Failed to process prescription. Please try again.";
      toast.error("Processing failed", {
        description: msg,
        className: "border border-rose-500/20 bg-black/90 text-rose-300",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(121,40,202,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          {/* Header */}
          <MotionStaggerItem className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/dashboard/patient"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles size={14} />
              TrOCR + Gemini AI
            </div>
          </MotionStaggerItem>

          {/* Title */}
          <MotionStaggerItem className="mb-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                  <Pill size={24} className="text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Prescription{" "}
                    <span className="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                      OCR Scanner
                    </span>
                  </h1>
                  <p className="text-sm text-white/55">
                    Upload a prescription image and let AI extract medication details
                  </p>
                </div>
              </div>
            </div>
          </MotionStaggerItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upload area */}
            <MotionStaggerItem>
              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col">
                <div className="flex items-center gap-2 text-lg font-semibold mb-5">
                  <Upload size={18} className="text-cyan-300" />
                  Upload Prescription
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
                    dragOver
                      ? "border-cyan-400/60 bg-cyan-400/10"
                      : "border-white/15 bg-black/20 hover:border-cyan-400/30 hover:bg-cyan-400/5"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative w-full">
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="mx-auto max-h-[200px] rounded-xl object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
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
                        Drop your prescription here
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        or click to browse · JPG, PNG, WebP · Max 10MB
                      </div>
                    </>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className="mt-5 w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Scan Prescription
                    </>
                  )}
                </button>
              </MotionCard>
            </MotionStaggerItem>

            {/* Results area */}
            <MotionStaggerItem>
              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col min-h-[400px]">
                <div className="flex items-center gap-2 text-lg font-semibold mb-5">
                  <FileImage size={18} className="text-emerald-300" />
                  Parsed Results
                </div>

                {loading && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-2 border-cyan-400/20" />
                      <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
                    </div>
                    <div className="text-sm text-white/60">
                      AI is reading your prescription...
                    </div>
                    <div className="text-xs text-white/35">
                      TrOCR extracting text · Gemini parsing medications
                    </div>
                  </div>
                )}

                {!loading && !result && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/30">
                    <Pill size={40} />
                    <div className="text-sm">Upload a prescription to see parsed results</div>
                  </div>
                )}

                {!loading && result && (
                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                    {/* Extracted text */}
                    {result.extracted_text && (
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                          <FileImage size={13} />
                          Extracted Text
                        </div>
                        <p className="text-sm leading-6 text-white/70 whitespace-pre-wrap">
                          {result.extracted_text}
                        </p>
                      </div>
                    )}

                    {/* Medications */}
                    {result.medications && result.medications.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                          <Pill size={13} />
                          Medications ({result.medications.length})
                        </div>
                        {result.medications.map((med: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4"
                          >
                            <div className="text-sm font-semibold text-white">
                              {med.name || med.medication || `Medication ${i + 1}`}
                            </div>
                            {(med.dosage || med.dose) && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 size={12} className="text-emerald-300" />
                                Dosage: {med.dosage || med.dose}
                              </div>
                            )}
                            {(med.frequency || med.schedule) && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                                <Clock size={12} className="text-cyan-300" />
                                Frequency: {med.frequency || med.schedule}
                              </div>
                            )}
                            {med.instructions && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                                <AlertCircle size={12} className="text-amber-300" />
                                {med.instructions}
                              </div>
                            )}
                            {med.duration && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                                <Clock size={12} className="text-violet-300" />
                                Duration: {med.duration}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warnings / Notes */}
                    {result.warnings && result.warnings.length > 0 && (
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300 mb-2">
                          <AlertCircle size={13} />
                          Warnings
                        </div>
                        <ul className="space-y-1">
                          {result.warnings.map((w: string, i: number) => (
                            <li key={i} className="text-sm text-amber-200/70 flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/60 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.notes && (
                      <div className="rounded-2xl border border-violet-400/15 bg-violet-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300 mb-2">
                          <Sparkles size={13} />
                          Notes
                        </div>
                        <p className="text-sm leading-6 text-white/65">{result.notes}</p>
                      </div>
                    )}

                    {/* Fallback: raw JSON display for any other fields */}
                    {result.raw_text && !result.extracted_text && (
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">
                          Raw OCR Output
                        </div>
                        <p className="text-sm leading-6 text-white/60 whitespace-pre-wrap">
                          {result.raw_text}
                        </p>
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
