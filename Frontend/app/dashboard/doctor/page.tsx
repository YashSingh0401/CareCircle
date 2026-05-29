"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarClock,
  Clock3,
  FileText,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Waves,
  Zap,
  Search,
  Fingerprint,
  Unlock,
  Lock,
  Shield,
  Database,
} from "lucide-react";
import { MotionCard, MotionPage, MotionPulseDot, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";
import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";

function statusTone(state: string) {
  if (state === "available") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (state === "busy") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function queueTone(status: string) {
  if (status === "called") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (status === "priority") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

function feedTone(tone?: string) {
  if (tone === "emerald") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (tone === "rose") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  if (tone === "amber") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

export default function DoctorDashboardPage() {
  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);
  const liveDoctors = useRealtimeSimulatorStore((s) => s.liveDoctors);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);
  const reports = useRealtimeSimulatorStore((s) => s.reports);

  // Patient clinical ledger states
  const [searchId, setSearchId] = useState("P-948271");
  const [searchedId, setSearchedId] = useState("P-948271");
  const [isScanning, setIsScanning] = useState(false);
  const [decryptedReports, setDecryptedReports] = useState<string[]>([]);

  function handleSearchLedger(e: React.FormEvent) {
    e.preventDefault();
    if (!searchId) return;
    setIsScanning(true);
    setTimeout(() => {
      setSearchedId(searchId);
      setIsScanning(false);
    }, 700);
  }

  function toggleDecryptReport(reportId: string) {
    setDecryptedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  }

  const matchingReports = useMemo(() => {
    if (!searchedId) return [];
    return reports.filter(
      (r) => r.patientId.trim().toUpperCase() === searchedId.trim().toUpperCase()
    );
  }, [reports, searchedId]);

  const activeDoctor = useMemo(() => liveDoctors.find((doctor) => doctor.state === "busy"), [liveDoctors]);
  const delayedDoctor = useMemo(() => liveDoctors.find((doctor) => doctor.state === "delayed"), [liveDoctors]);
  const activeConsultCount = useMemo(
    () => liveDoctors.filter((doctor) => doctor.state !== "available").length,
    [liveDoctors],
  );
  const criticalCount = useMemo(
    () => liveEmergencies.filter((emergency) => emergency.priority === "critical").length,
    [liveEmergencies],
  );
  const liveToastCount = toastQueue.length;
  const recentFeed = feedItems.slice(0, 5);

  const scrollHintRef = useRef<HTMLDivElement | null>(null);

  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.15),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(121,40,202,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,0,128,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <MotionStaggerItem className="mb-4 flex items-center justify-between gap-4">
            <Link
              href="/login/hospital/doctor"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Exit dashboard
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles size={14} />
              Clinical OS online
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <header className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Stethoscope size={14} />
                    Smart Hospital Doctor Dashboard
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Dr. <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">Sarah Chen</span>
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                    Monitor the live queue, answer incoming consults, review emergency telemetry, and stay aligned with the hospital control center.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-black/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Shift status</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <ShieldCheck size={18} className="text-emerald-300" />
                      On duty
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Team load</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <Users size={18} className="text-cyan-300" />
                      {activeConsultCount} active
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <main className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Waves size={18} className="text-cyan-300" />
                    Patient queue
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <MotionPulseDot className="bg-cyan-300" />
                    Live stream
                  </div>
                </div>

                <div className="space-y-3">
                  {liveQueue.map((item, index) => (
                    <div
                      key={item.token}
                      className={`grid grid-cols-1 gap-3 rounded-[22px] border p-4 sm:grid-cols-[1.2fr_0.6fr_0.8fr_1fr] ${queueTone(item.status)}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold text-white/75">
                            {item.token}
                          </span>
                          {index === 0 ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold text-white/75">
                              <MotionPulseDot className="bg-current" />
                              Next
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">{item.patient}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/35">Wait</div>
                        <div className="mt-1 text-sm font-semibold text-white">{item.wait}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/35">Priority</div>
                        <div className="mt-1 text-sm font-semibold text-white">{item.status.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/35">Consult state</div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          {item.status === "called" ? "In consultation" : "Queued"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-rose-400/15 bg-rose-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-5 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <AlertTriangle size={18} className="text-rose-300" />
                    Emergency alerts
                  </div>
                  <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                    {criticalCount} urgent
                  </span>
                </div>

                <div className="space-y-3">
                  {liveEmergencies.map((alert) => {
                    const tone = alert.priority === "critical" ? "rose" : alert.priority === "high" ? "amber" : "emerald";
                    return (
                      <div key={alert.title} className={`rounded-[22px] border p-4 ${feedTone(tone)}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{alert.title}</div>
                            <div className="mt-1 text-sm text-white/55">{alert.room}</div>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                            <MotionPulseDot className="bg-current" />
                            {alert.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-white/65">{alert.status}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Bell size={16} className="text-cyan-300" />
                    Live notification channel
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Emergency updates are mirrored to the nursing desk, operations staff, and patient dashboard in real time.
                  </p>
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6 overflow-hidden">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                      <Database className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Secure Clinical Ledger Search</h3>
                      <p className="text-xs text-white/55 mt-0.5">Decrypt and review patient-specific history blocks.</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Fingerprint size={12} className="animate-pulse" />
                    HIPAA Secure Decryptor
                  </div>
                </div>

                {/* Ledger Search Form */}
                <form onSubmit={handleSearchLedger} className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="Enter Patient ID (e.g. P-948271)"
                      className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-400/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.1)] cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <Shield className="h-3.5 w-3.5 animate-spin" />
                        Scanning Ledger...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-3.5 w-3.5" />
                        Scan Patient Ledger
                      </>
                    )}
                  </button>
                </form>

                {/* Secure Decrypting/Scanning HUD */}
                {isScanning && (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/10 p-6 flex flex-col items-center justify-center text-center space-y-3 mb-6 animate-pulse">
                    <Fingerprint className="h-10 w-10 text-cyan-400 animate-bounce" />
                    <div className="text-sm font-bold text-white uppercase tracking-widest">Biometric Decryption Protocol Active</div>
                    <div className="h-1.5 w-48 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-full animate-[shimmer_1.5s_infinite]" style={{
                        backgroundImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
                        backgroundSize: '200% 100%'
                      }} />
                    </div>
                    <p className="text-[10px] text-cyan-300/60 font-mono tracking-widest">[ESTABLISHING SECURE END-TO-END LEDGER CHANNEL]</p>
                  </div>
                )}

                {/* Searched Results View */}
                {!isScanning && searchedId && (
                  <div className="space-y-4">
                    {/* Patient Demographic Card */}
                    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {searchedId === "P-948271" ? "Alex Morgan" : `Verified Patient (${searchedId})`}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <ShieldCheck size={10} />
                            Biometric Checked
                          </span>
                        </div>
                        <p className="text-xs text-white/50">Patient ID: {searchedId} · Age: 29</p>
                      </div>

                      {/* Vitals HUD */}
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-cyan-300/60">BP</div>
                          <div className="text-xs font-bold text-white">118/76</div>
                        </div>
                        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-cyan-300/60">Pulse</div>
                          <div className="text-xs font-bold text-white">72 bpm</div>
                        </div>
                        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-cyan-300/60">SpO2</div>
                          <div className="text-xs font-bold text-white">99%</div>
                        </div>
                      </div>
                    </div>

                    {/* Medical Reports Ledger Stream */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
                        Decrypted Clinical History Blocks ({matchingReports.length})
                      </div>

                      {matchingReports.length > 0 ? (
                        matchingReports.map((report) => {
                          const isDecrypted = decryptedReports.includes(report.id);
                          return (
                            <div
                              key={report.id}
                              className="rounded-[22px] border border-white/5 bg-black/30 p-4 transition hover:border-white/10 duration-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-cyan-300" />
                                    {report.reportName}
                                    {report.uploadedAt.includes("now") && (
                                      <span className="rounded bg-emerald-400/15 border border-emerald-400/25 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300 uppercase tracking-widest animate-pulse">
                                        Recent
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 text-xs text-white/55">{report.uploadedAt}</div>
                                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-300/60 font-mono">
                                    <Lock size={10} />
                                    <span>Proof: {report.proof}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleDecryptReport(report.id)}
                                  className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                                    isDecrypted
                                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                      : "border-white/10 bg-white/5 text-white/80 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                                  }`}
                                >
                                  {isDecrypted ? (
                                    <>
                                      <Unlock size={11} />
                                      Hide Findings
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={11} />
                                      Decrypt Findings
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Decrypted Findings Console */}
                              {isDecrypted && (
                                <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-950/5 p-3.5 font-mono text-xs text-emerald-300/90 leading-relaxed shadow-[inset_0_0_12px_rgba(16,185,129,0.04)] animate-fadeIn">
                                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/60 font-bold mb-1.5 border-b border-emerald-400/10 pb-1">
                                    <Database size={10} />
                                    SECURE DIAGNOSTIC PAYLOAD DECRYPTED
                                  </div>
                                  {report.findings ? report.findings : "Ledger synchronization block active. No further findings summarized."}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-white/5 bg-black/20 p-6 flex flex-col items-center justify-center text-center">
                          <Database className="h-8 w-8 text-white/20 mb-2" />
                          <p className="text-sm font-semibold text-white/70">No distributed ledger blocks found</p>
                          <p className="text-xs text-white/45 mt-1 max-w-sm">
                            No medical reports are registered for Patient ID "{searchedId}". Add new reports via the Staff Operations Dashboard to test live synchronization.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-5 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock3 size={18} className="text-cyan-300" />
                    Doctor status
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    {activeConsultCount} active
                  </span>
                </div>

                <div className="space-y-3">
                  {liveDoctors.map((doctor) => (
                    <div key={doctor.name} className={`rounded-[22px] border p-4 ${statusTone(doctor.state)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{doctor.name}</div>
                          <div className="mt-1 text-sm text-white/55">{doctor.specialty}</div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                          {doctor.state.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                        <span>Consults</span>
                        <span className="inline-flex items-center gap-2 font-semibold text-white">
                          <MotionPulseDot className="bg-cyan-300" />
                          {doctor.consults}
                        </span>
                      </div>

                      {doctor.activeConsult ? (
                        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white/70">
                          <div className="flex items-center justify-between gap-3">
                            <span>Consulting</span>
                            <span className="text-white">{doctor.activeConsult.patient}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                            <MotionPulseDot className="bg-emerald-300" />
                            Active for {doctor.activeConsult.elapsedSec}s
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Activity size={18} className="text-cyan-300" />
                    Hospital activity feed
                  </div>
                  <span className="text-sm text-cyan-300">Live telemetry</span>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {recentFeed.map((entry) => (
                    <div key={`${entry.id}-${entry.time}`} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
                          {entry.icon ? <entry.icon size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-white">{entry.title}</div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">{entry.time}</div>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-white/60">{entry.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Microscope size={18} className="text-cyan-300" />
                    AI report analysis
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    Preview
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    "ECG rhythm appears regular with transient irregularity during exertion.",
                    "Inflammation markers are within safe range.",
                    "Recommend follow-up after the current queue clears.",
                  ].map((line) => (
                    <div key={line} className="rounded-[22px] border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/70">
                      {line}
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarClock size={18} className="text-cyan-300" />
                    Consultation schedule
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    Updated live
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {liveQueue.slice(0, 3).map((item, index) => (
                    <div key={item.token} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.patient}</div>
                          <div className="mt-1 text-sm text-white/55">{item.token}</div>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${queueTone(item.status)}`}>
                          {index === 0 ? "Now" : item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-white/60">
                        {item.status === "called" ? "Consultation in progress." : "Awaiting assignment."}
                      </div>
                    </div>
                  ))}
                </div>

                <div ref={scrollHintRef} className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Zap size={16} className="text-cyan-300" />
                    Realtime summary
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Queue movement, doctor state changes, emergency escalation, and toast notifications are currently streaming into the hospital control plane.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">Queue items</div>
                    <div className="mt-2 text-3xl font-black text-white">{liveQueue.length}</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">Toasts live</div>
                    <div className="mt-2 text-3xl font-black text-white">{liveToastCount}</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">Critical events</div>
                    <div className="mt-2 text-3xl font-black text-white">{criticalCount}</div>
                  </div>
                </div>
              </MotionCard>
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
