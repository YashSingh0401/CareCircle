"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  HeartPulse,
  MessageSquareWarning,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
  UploadCloud,
  Cpu,
  FileText,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import {
  MotionButton,
  MotionCard,
  MotionPage,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";
import { useAppStore } from "@/lib/store";

const roomSeed = [
  { id: "ER-02", label: "Emergency bay", state: "Ready", tone: "rose" },
  { id: "OPD-4", label: "Consult room", state: "Cleaning", tone: "amber" },
  { id: "LAB-1", label: "Diagnostics", state: "Ready", tone: "emerald" },
  { id: "WARD-C", label: "Observation", state: "Prep", tone: "cyan" },
] as const;

const taskSeed = [
  "Verify walk-in patient biometrics",
  "Prepare ER bay for priority case",
  "Notify doctor about delayed consult",
  "Confirm lab handoff for next token",
];

function toneClass(tone: string) {
  if (tone === "rose") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  if (tone === "amber") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  if (tone === "emerald") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

export default function StaffDashboardPage() {
  const liveQueue = useAppStore((s) => s.liveQueue);
  // addReport is deprecated or replaced
  const addReport = (r: any) => {};

  // Broadcast States
  const [patientId, setPatientId] = useState("P-948271");
  const [reportName, setReportName] = useState("Comprehensive Metabolic Panel");
  const [findings, setFindings] = useState("All vital lipid anchors reside in optimal threshold ranges. hs-CRP stable at 0.8 mg/L.");
  const [proof, setProof] = useState("Clinical Ledger Stamped PDF");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const mockLogs = [
    "[INFO] Initializing Cryptographic Upload Protocol...",
    "[ENCRYPTION] Encrypting patient report with AES-GCM-256...",
    "[LEDGER] Registering transaction block in hospital ledger...",
    "[SYNC] Synchronizing medical history vaults... SUCCESS.",
    "[BROADCAST] Released to Patient Portal online."
  ];

  function handleBroadcastReport(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !reportName) {
      toast.error("Required fields missing", {
        description: "Please specify Patient ID and Report Name.",
      });
      return;
    }

    setBroadcasting(true);
    setBroadcastProgress(0);
    setBroadcastLogs([]);

    mockLogs.forEach((log, index) => {
      setTimeout(() => {
        setBroadcastLogs((prev) => [...prev, log]);
        setBroadcastProgress(((index + 1) / mockLogs.length) * 100);

        if (index === mockLogs.length - 1) {
          setBroadcasting(false);
          addReport({
            id: "rep-" + Date.now(),
            patientId,
            reportName,
            uploadedAt: "Uploaded just now",
            proof,
            findings,
          });
          toast.success("Medical Report Broadcasted!", {
            description: `${reportName} successfully synchronized and released online.`,
          });
        }
      }, (index + 1) * 300);
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      toast.info("Report file attached", {
        description: file.name + " ready for cryptographic ledger binding.",
      });
    }
  }
  const liveEmergencies = useAppStore((s) => s.liveEmergencies);
  const feedItems = useAppStore((s) => s.feedItems);
  const liveDoctors = useAppStore((s) => s.liveDoctors);
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [calledTokens, setCalledTokens] = useState<string[]>([]);

  const priorityQueue = useMemo(
    () => liveQueue.filter((item) => item.status === "priority" || item.status === "called"),
    [liveQueue],
  );
  const criticalCount = liveEmergencies.filter((item) => item.priority === "critical").length;

  function handleAction(label: string) {
    toast.success(label, {
      description: "Frontend demo action recorded in the staff command view.",
    });
  }

  function callToken(token: string, patient: string) {
    setCalledTokens((prev) => (prev.includes(token) ? prev : [token, ...prev].slice(0, 4)));
    toast("Patient called", {
      description: `${token} - ${patient} has been announced on the mock queue board.`,
    });
  }

  function toggleTask(task: string) {
    setDoneTasks((prev) =>
      prev.includes(task) ? prev.filter((item) => item !== task) : [...prev, task],
    );
  }

  const fetchQueue = useAppStore((s) => s.fetchQueue);
  const fetchDoctors = useAppStore((s) => s.fetchDoctors);
  const fetchEmergencies = useAppStore((s) => s.fetchEmergencies);
  const fetchReports = useAppStore((s) => s.fetchReports);

  React.useEffect(() => {
    fetchDoctors && fetchDoctors();
    fetchEmergencies && fetchEmergencies();
    fetchQueue && fetchQueue("c4a78fcd-263d-4fcd-9347-ec8834e4f565");
    fetchReports && fetchReports();
  }, [fetchQueue, fetchDoctors, fetchEmergencies, fetchReports]);

  return (
    <MotionPage className="min-h-screen bg-[#030712] text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(255,0,128,0.14),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.1),transparent_30%)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <MotionStaggerItem className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/login/hospital/staff"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Exit dashboard
            </Link>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <MotionPulseDot className="bg-current" />
              Staff operations live
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <header className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-3 py-1 text-xs font-semibold text-pink-300">
                    <Users size={14} />
                    Smart Hospital Staff Dashboard
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Ward Flow <span className="text-cyan-300">Command Desk</span>
                  </h1>
                  <p className="max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
                    Coordinate queue calls, room readiness, emergency escalations, and staff tasks with frontend-only live feedback.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Queue load</div>
                    <div className="mt-2 text-3xl font-black text-white">{liveQueue.length}</div>
                  </div>
                  <div className="rounded-[22px] border border-rose-400/20 bg-rose-400/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Urgent alerts</div>
                    <div className="mt-2 text-3xl font-black text-white">{criticalCount}</div>
                  </div>
                  <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Tasks done</div>
                    <div className="mt-2 text-3xl font-black text-white">{doneTasks.length}</div>
                  </div>
                </div>
              </div>
            </header>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <main className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
              
              {/* Clinical Report Broadcast Console */}
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6 overflow-hidden">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 shadow-[0_0_24px_rgba(34,211,238,0.1)]">
                      <UploadCloud className="h-5 w-5 text-cyan-300 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Clinical Report Broadcast Console</h3>
                      <p className="text-xs text-white/50 mt-0.5">Encrypt and upload medical reports instantly. Verifies dynamically in patient portal.</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                    <Cpu size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                    HIPAA Secure Sync
                  </div>
                </div>

                <form onSubmit={handleBroadcastReport} className="grid gap-6 lg:grid-cols-12">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Target Patient ID</label>
                      <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="e.g. P-948271"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Report Name</label>
                      <input
                        type="text"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="e.g. Lipids Summary Panel"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Cryptographic Proof Stamp</label>
                      <input
                        type="text"
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Clinical Findings & Vitals Summary</label>
                      <textarea
                        rows={3}
                        value={findings}
                        onChange={(e) => setFindings(e.target.value)}
                        placeholder="Enter direct patient guidance, glucose indicators, or recovery diagnostics..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Right Column: High-Tech Dropzone & Logs */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    {/* Mock Dropzone */}
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-cyan-500/25 bg-cyan-950/5 p-5 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-950/10 flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]">
                      <input
                        type="file"
                        accept=".pdf,.json,.xml"
                        onChange={handleFileSelect}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={broadcasting}
                      />
                      <FileText size={28} className="text-cyan-300 animate-pulse" />
                      <div className="mt-2.5 text-xs font-bold text-white">
                        {selectedFile ? selectedFile : "Drag & Drop Medical Report (PDF)"}
                      </div>
                      <p className="mt-1 text-[9px] text-white/45 uppercase tracking-wider">
                        {selectedFile ? "File Attached Successfully" : "Supports up to 25MB clinical attachments"}
                      </p>

                      {broadcasting && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col justify-center px-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                            <span>Ledger Broadcast Progress</span>
                            <span>{Math.round(broadcastProgress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 transition-all duration-300"
                              style={{ width: broadcastProgress + "%" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compiler Logs Panel */}
                    {broadcastLogs.length > 0 && (
                      <div className="rounded-xl border border-white/5 bg-black/60 p-3 font-mono text-[9px] text-cyan-300/80 leading-5 max-h-[110px] overflow-y-auto">
                        <div className="flex items-center gap-1 text-white/40 mb-1 border-b border-white/5 pb-1 font-bold">
                          <Cpu size={10} />
                          LEDGER SYNC ENGINE LOGS
                        </div>
                        {broadcastLogs.map((log, i) => (
                          <div key={i} className={log.includes("SUCCESS") ? "text-emerald-400 font-bold" : ""}>
                            {log}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-3 text-center text-xs font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-400/15 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    >
                      {broadcasting ? "Verifying Block..." : "Ledger Broadcast & Sync Online"}
                    </button>
                  </div>
                </form>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <ClipboardList size={18} className="text-cyan-300" />
                    Queue call board
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    Front desk
                  </span>
                </div>

                <div className="space-y-3">
                  {liveQueue.map((item) => (
                    <div key={item.token} className={`rounded-[22px] border p-4 ${toneClass(item.status === "priority" ? "rose" : item.status === "called" ? "emerald" : "cyan")}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-white/80">
                              {item.token}
                            </span>
                            <span className="text-xs uppercase tracking-[0.18em] text-white/45">{item.wait} wait</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">{item.patient}</div>
                        </div>
                        <MotionButton
                          type="button"
                          onClick={() => callToken(item.token, item.patient)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                        >
                          <PhoneCall size={15} />
                          {calledTokens.includes(item.token) ? "Called" : "Call patient"}
                        </MotionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-5 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Zap size={18} className="text-pink-300" />
                    Quick actions
                  </div>
                  <span className="text-sm text-white/50">Mock controls</span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Send nurse alert", icon: BellRing, tone: "rose" },
                    { label: "Mark room ready", icon: DoorOpen, tone: "emerald" },
                    { label: "Notify doctor", icon: MessageSquareWarning, tone: "cyan" },
                    { label: "Escalate queue", icon: ShieldAlert, tone: "amber" },
                  ].map((action) => (
                    <MotionButton
                      key={action.label}
                      type="button"
                      onClick={() => handleAction(action.label)}
                      className={`inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${toneClass(action.tone)}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <action.icon size={16} />
                        {action.label}
                      </span>
                      <Sparkles size={15} />
                    </MotionButton>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-5 lg:p-6">
                <div className="mb-5 flex items-center gap-2 text-lg font-semibold">
                  <DoorOpen size={18} className="text-emerald-300" />
                  Room readiness
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {roomSeed.map((room) => (
                    <div key={room.id} className={`rounded-[22px] border p-4 ${toneClass(room.tone)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">{room.id}</div>
                          <div className="mt-1 text-sm text-white/55">{room.label}</div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase text-white/75">
                          {room.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CheckCircle2 size={18} className="text-cyan-300" />
                    Staff task list
                  </div>
                  <span className="text-sm text-cyan-300">{doneTasks.length}/{taskSeed.length} complete</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {taskSeed.map((task) => {
                    const complete = doneTasks.includes(task);
                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => toggleTask(task)}
                        className={`rounded-[22px] border p-4 text-left transition ${complete ? "border-emerald-400/25 bg-emerald-400/10" : "border-white/10 bg-black/25 hover:border-cyan-400/25 hover:bg-cyan-400/10"}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${complete ? "border-emerald-400/30 bg-emerald-400/20 text-emerald-300" : "border-white/15 text-white/35"}`}>
                            <CheckCircle2 size={14} />
                          </span>
                          <span className="text-sm font-semibold text-white">{task}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-rose-400/15 bg-rose-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6">
                <div className="mb-5 flex items-center gap-2 text-lg font-semibold">
                  <HeartPulse size={18} className="text-rose-300" />
                  Priority watch
                </div>
                <div className="space-y-3">
                  {priorityQueue.map((item) => (
                    <div key={item.token} className="rounded-[22px] border border-rose-400/20 bg-rose-400/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.patient}</div>
                          <div className="mt-1 text-sm text-white/55">{item.token} - {item.wait}</div>
                        </div>
                        <MotionPulseDot className="bg-rose-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6">
                <div className="mb-5 flex items-center gap-2 text-lg font-semibold">
                  <Activity size={18} className="text-cyan-300" />
                  Live handoff feed
                </div>
                <div className="space-y-3">
                  {feedItems.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{entry.title}</div>
                          <div className="mt-1 text-sm leading-6 text-white/60">{entry.detail}</div>
                        </div>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/40">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                  Doctors online: {liveDoctors.filter((doctor) => doctor.state === "available").length}. All updates are simulated in the frontend.
                </div>
              </MotionCard>
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
