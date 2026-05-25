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
