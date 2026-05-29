"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Cpu,
  Fingerprint,
  HeartPulse,
  Layers3,
  MessageSquareWarning,
  MonitorSmartphone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  UsersRound,
  Zap,
} from "lucide-react";
import {
  MotionBadge,
  MotionButton,
  MotionCard,
  MotionPage,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";
import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";

function statusTone(tone: "cyan" | "emerald" | "rose" | "amber") {
  return tone === "cyan"
    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
    : tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : tone === "rose"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
        : "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function queueTone(status: string) {
  if (status === "called") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (status === "priority") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

function doctorTone(state: string) {
  if (state === "available") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (state === "busy") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function notificationTone(tone?: string) {
  if (tone === "rose") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  if (tone === "amber") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  if (tone === "emerald") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionCard
      className={`rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Icon size={18} className="text-cyan-300" />
            {title}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </MotionCard>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "rose" | "amber";
}) {
  return (
    <MotionCard className={`rounded-[22px] border p-4 ${statusTone(tone)} bg-black/20`}>
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </MotionCard>
  );
}

function QueueRow({
  token,
  patient,
  wait,
  status,
}: {
  token: string;
  patient: string;
  wait: string;
  status: string;
}) {
  return (
    <MotionCard className={`flex items-center justify-between gap-4 rounded-[22px] border p-4 ${queueTone(status)}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70">
            {token}
          </span>
          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${queueTone(status)}`}>
            {status.toUpperCase()}
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{patient}</div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-white">{wait}</div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">wait</div>
      </div>
    </MotionCard>
  );
}

export default function AdminDashboardPage() {
  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);
  const liveDoctors = useRealtimeSimulatorStore((s) => s.liveDoctors);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);

  const criticalEmergencies = useMemo(
    () => liveEmergencies.filter((emergency) => emergency.priority === "critical"),
    [liveEmergencies],
  );
  const activeDoctors = useMemo(
    () => liveDoctors.filter((doctor) => doctor.state !== "available"),
    [liveDoctors],
  );
  const liveQueueHead = liveQueue[0];
  const liveQueueTail = liveQueue.at(-1);
  const recentFeed = feedItems.slice(0, 6);
  const recentNotifications = toastQueue.slice(0, 4);

  return (
    <MotionPage className="min-h-screen bg-[#04070c] text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.13),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.09),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_32%,rgba(255,255,255,0.02))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <MotionStaggerItem className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/login/hospital/admin"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Exit dashboard
            </Link>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              <Activity size={14} className="animate-pulse" />
              Live hospital status online
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <header className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Building2 size={14} />
                    Smart AI-Powered Healthcare Management System
                  </div>

                  <div className="space-y-3">
                    <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Hospital Admin{" "}
                      <span className="text-cyan-300">Operations Center</span>
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
                      Command view for queue health, emergency escalation, doctor availability,
                      notifications, and live hospital telemetry.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <MotionBadge className={statusTone("emerald") + " inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"}>
                      <MotionPulseDot className="bg-current" />
                      Hospital status stable
                    </MotionBadge>
                    <MotionBadge className={statusTone("cyan") + " inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"}>
                      <MotionPulseDot className="bg-current" />
                      Live queue sync active
                    </MotionBadge>
                    <MotionBadge className={statusTone("amber") + " inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"}>
                      <MotionPulseDot className="bg-current" />
                      Shift handoff pending
                    </MotionBadge>
                    <MotionBadge className={statusTone("rose") + " inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"}>
                      <MotionPulseDot className="bg-current" />
                      Critical alerts monitored
                    </MotionBadge>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-white/10 bg-black/25 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/40">Control profile</div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                        <UsersRound size={18} />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">Operations Admin</div>
                        <div className="text-sm text-white/55">Enterprise control panel</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-black/25 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/40">System mode</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <Zap size={18} className="text-emerald-300" />
                      Realtime sync
                    </div>
                    <div className="mt-2 text-sm text-white/55">Simulator is updating queue, doctors, and emergency telemetry.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatChip label="Current queue" value={String(liveQueue.length)} tone="cyan" />
                <StatChip label="Emergency cases" value={String(criticalEmergencies.length)} tone="rose" />
                <StatChip label="Doctors active" value={String(activeDoctors.length)} tone="emerald" />
                <StatChip label="Notifications live" value={String(recentNotifications.length)} tone="amber" />
              </div>
            </header>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <main className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">

              {/* Real-Time Healthcare Operations Control Center */}
              <SectionCard
                title="Real-Time Healthcare Operations Control Center"
                subtitle="Immersive SVG patient flow diagnostics, wing occupancy allocation, and queue wait latencies"
                icon={Activity}
                className="lg:col-span-12"
              >
                <div className="grid gap-6 lg:grid-cols-12 mt-2">
                  {/* Left: Hourly Patient Flow SVG Line Graph */}
                  <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-4.5 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">Live Patient Flow Rate</span>
                      <span className="text-[9px] text-white/40 uppercase font-bold">Hourly Outpatient Sync</span>
                    </div>

                    <div className="w-full aspect-[2.2] relative">
                      <svg className="h-full w-full" viewBox="0 0 600 240" fill="none">
                        <defs>
                          <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="240">
                            <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
                            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                          </linearGradient>
                        </defs>

                        {/* grids */}
                        <line x1="40" y1="40" x2="560" y2="40" stroke="rgba(255,255,255,0.03)" strokeDasharray="4,4" />
                        <line x1="40" y1="100" x2="560" y2="100" stroke="rgba(255,255,255,0.03)" strokeDasharray="4,4" />
                        <line x1="40" y1="160" x2="560" y2="160" stroke="rgba(255,255,255,0.03)" strokeDasharray="4,4" />

                        {/* values */}
                        <text x="25" y="45" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontWeight="bold">150</text>
                        <text x="25" y="105" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontWeight="bold">100</text>
                        <text x="25" y="165" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontWeight="bold">50</text>

                        {/* area */}
                        <path
                          d="M 40 240 L 40 180 L 120 150 L 200 190 L 280 120 L 360 80 L 440 110 L 520 60 L 560 90 L 560 240 Z"
                          fill="url(#adminChartGrad)"
                        />

                        {/* line */}
                        <path
                          d="M 40 180 L 120 150 L 200 190 L 280 120 L 360 80 L 440 110 L 520 60 L 560 90"
                          stroke="#22d3ee"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                        />

                        {/* dots */}
                        {[
                          { x: 40, y: 180, time: "08:00" },
                          { x: 120, y: 150, time: "10:00" },
                          { x: 200, y: 190, time: "12:00" },
                          { x: 280, y: 120, time: "14:00" },
                          { x: 360, y: 80, time: "16:00" },
                          { x: 440, y: 110, time: "18:00" },
                          { x: 520, y: 60, time: "20:00" }
                        ].map((pt, i) => (
                          <g key={i}>
                            <circle cx={pt.x} cy={pt.y} r="4.5" fill="#22d3ee" stroke="#04070c" strokeWidth="1.5" />
                            <text x={pt.x} y="215" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="bold">{pt.time}</text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Center: Wing Occupancy Allocation Bars */}
                  <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/40 p-4.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">Wing Occupancy Status</span>
                        <span className="text-[9px] text-white/40 uppercase font-bold">Capacity Limits</span>
                      </div>

                      <div className="space-y-3.5">
                        {[
                          { name: "Emergency Ward", pct: 95, color: "from-rose-500 to-rose-400" },
                          { name: "Cardiology Unit", pct: 88, color: "from-cyan-500 to-cyan-400" },
                          { name: "Neurology Wing", pct: 65, color: "from-amber-500 to-amber-400" },
                          { name: "Pediatrics Clinic", pct: 42, color: "from-emerald-500 to-emerald-400" },
                        ].map((wing) => (
                          <div key={wing.name} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-white/70">{wing.name}</span>
                              <span className={wing.pct >= 90 ? "text-rose-400" : "text-white"}>{wing.pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                              <div
                                  className={"h-full bg-gradient-to-r " + wing.color + " rounded-full"}
                                  style={{ width: wing.pct + "%" }}
                                />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-white/5 border border-white/5 p-2 text-center text-[9px] text-white/40 font-bold uppercase tracking-wider">
                      Dynamic Bed Redistribution Calibrated
                    </div>
                  </div>

                  {/* Right: Queue Latency Histograms */}
                  <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/40 p-4.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">Queue Latency Histogram</span>
                        <span className="text-[9px] text-white/40 uppercase font-bold">Wait Brackets</span>
                      </div>

                      <div className="w-full aspect-[1.1] relative mt-2">
                        <svg className="h-full w-full" viewBox="0 0 200 160" fill="none">
                          <line x1="20" y1="130" x2="190" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                          {[
                            { label: "<5m", val: 45, max: 100, x: 30, color: "#10b981" },
                            { label: "5-10m", val: 78, max: 100, x: 70, color: "#22d3ee" },
                            { label: "10-20m", val: 92, max: 100, x: 110, color: "#f59e0b" },
                            { label: "20m+", val: 28, max: 100, x: 150, color: "#ef4444" }
                          ].map((bar, i) => {
                            const barHeight = (bar.val / bar.max) * 100;
                            const y = 130 - barHeight;
                            return (
                              <g key={i} className="group">
                                <rect
                                  x={bar.x}
                                  y={y}
                                  width="24"
                                  height={barHeight}
                                  fill={bar.color}
                                  rx="4"
                                  className="opacity-75 group-hover:opacity-100 transition-all duration-300 shadow-md"
                                  style={{ filter: "drop-shadow(0 0 4px " + bar.color + ")" }}
                                />
                                <text
                                  x={bar.x + 12}
                                  y={y - 5}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize="8"
                                  fontWeight="black"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {bar.val}p
                                </text>
                                <text x={bar.x + 12} y="143" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontWeight="bold">
                                  {bar.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-white/5 border border-white/5 p-2 text-center text-[9px] text-white/40 font-bold uppercase tracking-wider">
                      Current Waiting Index: Optimal Range
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Live Queue Management Panel */}
              <SectionCard
                title="Live Queue Management Panel"
                subtitle="Current tokens, wait-time updates, and queue control visibility"
                icon={Layers3}
                className="lg:col-span-7"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {liveQueue.map((item) => (
                    <QueueRow
                      key={item.token}
                      token={item.token}
                      patient={item.patient}
                      wait={item.wait}
                      status={item.status}
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Avg waiting time", value: "11m", tone: "cyan" as const },
                    { label: "Priority queue", value: String(liveQueue.filter((item) => item.status === "priority").length), tone: "rose" as const },
                    { label: "Doctors online", value: String(liveDoctors.filter((item) => item.state === "available").length), tone: "emerald" as const },
                  ].map((chip) => (
                    <div key={chip.label} className={`rounded-[22px] border p-4 ${statusTone(chip.tone)} bg-black/20`}>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/35">{chip.label}</div>
                      <div className="mt-2 text-3xl font-black text-white">{chip.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                    Open queue controls
                  </button>
                  <button className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/5">
                    Token manager
                  </button>
                  <button className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15">
                    Call next patient
                  </button>
                </div>
              </SectionCard>

              <SectionCard
                title="Quick Actions Sidebar"
                subtitle="Fast-response shortcuts for staff operations"
                icon={Zap}
                className="lg:col-span-5 lg:sticky lg:top-4 lg:self-start"
              >
                <div className="space-y-3">
                  {[
                    { label: "Update Queue", icon: ClipboardList, tone: "cyan" as const },
                    { label: "Send Alert", icon: Bell, tone: "rose" as const },
                    { label: "Call Patient", icon: PhoneCall, tone: "cyan" as const },
                    { label: "Emergency Override", icon: Zap, tone: "rose" as const },
                    { label: "Notify Doctor", icon: MessageSquareWarning, tone: "emerald" as const },
                  ].map((action) => (
                    <MotionButton
                      key={action.label}
                      type="button"
                      className={`inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,240,255,0.14)] ${statusTone(action.tone)}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <action.icon size={16} />
                        {action.label}
                      </span>
                      <ChevronRight size={16} className="opacity-70" />
                    </MotionButton>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Cpu size={16} className="text-cyan-300" />
                    AI dispatch assistant
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Automated queue nudges, patient recall, doctor notifications, and escalation summaries are live.
                  </p>
                </div>
              </SectionCard>

              <SectionCard
                title="Emergency Alerts Section"
                subtitle="Active cases and escalation status"
                icon={AlertTriangle}
                className="lg:col-span-6"
              >
                <div className="space-y-3">
                  {liveEmergencies.map((item) => {
                    const tone = item.priority === "critical" ? "rose" : item.priority === "high" ? "amber" : "emerald";
                    return (
                      <div key={item.title} className={`rounded-[22px] border p-4 ${statusTone(tone)}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            <div className="mt-1 text-sm text-white/55">{item.room}</div>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(tone)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-white/65">{item.status}</div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                title="Patient Check-In Panel"
                subtitle="Arrival updates, biometric verification, and waiting room status"
                icon={Fingerprint}
                className="lg:col-span-6"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <UserCheck size={16} className="text-emerald-300" />
                      Biometric verification
                    </div>
                    <div className="mt-3 text-3xl font-black text-white">98%</div>
                    <div className="mt-2 text-sm text-white/60">Fingerprint and face scan matched.</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <HeartPulse size={16} className="text-cyan-300" />
                      Waiting room status
                    </div>
                    <div className="mt-3 text-3xl font-black text-white">Stable</div>
                    <div className="mt-2 text-sm text-white/60">Queue flow is within target thresholds.</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {liveQueue.slice(0, 3).map((patient) => (
                    <div key={patient.token} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{patient.patient}</div>
                          <div className="mt-1 text-sm text-white/55">{patient.token}</div>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${queueTone(patient.status)}`}>
                          CHECK-IN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Doctor Availability Tracker"
                subtitle="Available doctors, busy doctors, delayed schedules, active consultations"
                icon={Stethoscope}
                className="lg:col-span-7"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {liveDoctors.map((doctor) => (
                    <div key={doctor.name} className={`rounded-[22px] border border-white/10 bg-black/25 p-4 ${doctorTone(doctor.state)}`}>
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
                        <span>Active consultations</span>
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
              </SectionCard>

              <SectionCard
                title="Hospital Activity Feed"
                subtitle="Live updates, queue changes, emergency logs, patient movement notifications"
                icon={Activity}
                className="lg:col-span-5"
              >
                <div className="space-y-3">
                  {recentFeed.map((entry) => (
                    <div key={entry.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-2xl border p-2 ${statusTone(entry.tone ?? "cyan")}`}>
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
              </SectionCard>

              <SectionCard
                title="Notification Stream"
                subtitle="Popup alerts, toast events, and live status summaries"
                icon={Bell}
                className="lg:col-span-12"
              >
                <div className="grid gap-3 md:grid-cols-4">
                  {recentNotifications.length ? (
                    recentNotifications.map((notification) => (
                      <div key={notification.id} className={`rounded-[22px] border p-4 ${notificationTone(notification.tone)}`}>
                        <div className="text-sm font-semibold text-white">{notification.title}</div>
                        <div className="mt-1 text-sm leading-6 text-white/65">
                          {notification.message ?? "Realtime notification."}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                      No pending notifications at the moment.
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Shift Summary"
                subtitle="Smooth realtime indicators and enterprise-grade visibility for staff"
                icon={MonitorSmartphone}
                className="lg:col-span-12"
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Active patients", value: "142", tone: "cyan" as const },
                    { label: "Pending alerts", value: String(criticalEmergencies.length), tone: "rose" as const },
                    { label: "Biometric passes", value: "98%", tone: "emerald" as const },
                    { label: "Consult rooms active", value: String(activeDoctors.length), tone: "amber" as const },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-[22px] border p-4 ${statusTone(item.tone)} bg-black/20`}>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/35">{item.label}</div>
                      <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-cyan-400/15 bg-cyan-400/5 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Live control summary</div>
                      <div className="mt-1 text-sm text-white/55">
                        Queue, doctors, emergency signals, notifications, and activity feed are updating through the realtime simulator.
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <MotionPulseDot className="bg-emerald-300" />
                      {liveQueue.length} queue / {criticalEmergencies.length} critical
                    </div>
                  </div>
                </div>

                {liveQueueHead && liveQueueTail ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/35">Queue head</div>
                      <div className="mt-2 text-lg font-semibold text-white">{liveQueueHead.patient}</div>
                      <div className="mt-1 text-sm text-white/55">
                        {liveQueueHead.token} · {liveQueueHead.wait}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/35">Queue tail</div>
                      <div className="mt-2 text-lg font-semibold text-white">{liveQueueTail.patient}</div>
                      <div className="mt-1 text-sm text-white/55">
                        {liveQueueTail.token} · {liveQueueTail.wait}
                      </div>
                    </div>
                  </div>
                ) : null}
              </SectionCard>
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
