"use client";

import React, { useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, HeartPulse, ShieldAlert, UserCheck, Stethoscope } from "lucide-react";

import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";
import { cn } from "@/lib/utils";
import { MotionPulseDot } from "@/components/motion/carecircle-motion";

type QueueStatus = "waiting" | "priority" | "called";

type QueueItem = {
  token: string;
  patient: string;
  wait: string; // e.g. "04m"
  status: QueueStatus;
};

function formatToken(token?: string) {
  if (!token) return "--";
  const parts = token.split("-");
  return parts.length > 1 ? parts[1] : token;
}

function statusVisual(status: QueueStatus) {
  switch (status) {
    case "called":
      return {
        badgeBase: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        badgeGlow: "shadow-[0_0_22px_rgba(52,211,153,0.22)]",
        indicator: "bg-emerald-300",
        priorityBar: "from-emerald-300/70 to-emerald-300/10",
        ecgColor: "#34d399",
      };
    case "priority":
      return {
        badgeBase: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        badgeGlow: "shadow-[0_0_28px_rgba(255,77,109,0.35),0_0_10px_rgba(255,77,109,0.18)]",
        indicator: "bg-rose-300",
        priorityBar: "from-rose-300/80 to-rose-300/10",
        ecgColor: "#f43f5e",
      };
    default:
      return {
        badgeBase: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        badgeGlow: "shadow-[0_0_22px_rgba(34,211,238,0.18)]",
        indicator: "bg-cyan-300",
        priorityBar: "from-cyan-300/70 to-cyan-300/10",
        ecgColor: "#22d3ee",
      };
  }
}

function parseWaitMinutes(wait?: string) {
  if (!wait) return 0;
  const m = parseInt(wait.replace("m", ""), 10);
  return Number.isFinite(m) ? m : 0;
}

function useLiveClockTick() {
  const now = useRealtimeSimulatorStore((s) => s.now);
  return now;
}

function formatClockTime(now: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(now);
}

function QueueCard({ item, isFirst }: { item: QueueItem; isFirst: boolean }) {
  const vis = statusVisual(item.status);
  const minutes = parseWaitMinutes(item.wait);

  const statusLabel =
    item.status === "called" ? "CALLED" : item.status === "priority" ? "PRIORITY" : "WAITING";

  const priorityLabel = item.status === "priority" ? "P1" : null;
  const isLive = item.status === "called" || isFirst;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 10, filter: "blur(6px)" }}
      whileHover={{ scale: 1.015, x: 4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden",
        "rounded-2xl border backdrop-blur-xl",
        "bg-black/40",
        "p-3 sm:p-4 transition-all duration-300",
        "hover:border-white/20 hover:bg-black/50 hover:shadow-[0_8px_30px_rgba(0,240,255,0.04)]"
      )}
      style={{ borderColor: "rgba(148, 163, 184, 0.18)" }}
    >
      {/* Status glow overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          item.status === "priority" ? "opacity-100" : "group-hover:opacity-60",
          item.status === "priority"
            ? "shadow-[inset_0_0_30px_rgba(255,77,109,0.12)]"
            : "shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]",
          isLive ? "opacity-100" : ""
        )}
      />

      {/* Left status indicator bar */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-gradient-to-b",
          vis.priorityBar,
          item.status === "priority" ? "opacity-100" : "opacity-75"
        )}
      />

      {/* Inline ECG Oscilloscope Wave Background */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-28 opacity-15 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 40" fill="none" preserveAspectRatio="none">
          <path
            d="M 0 20 L 25 20 L 30 10 L 35 30 L 40 5 L 45 35 L 50 20 L 100 20"
            stroke={vis.ecgColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-cc-ecg-wave"
          />
        </svg>
      </div>

      {/* Horizontal card layout */}
      <div className="relative flex items-center gap-3 sm:gap-4 z-10">
        {/* Token Badge */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl border border-white/10 bg-black/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
              )}
            >
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                {formatToken(item.token)}
              </span>
            </div>

            {isFirst && (
              <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-[9px] font-extrabold text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <MotionPulseDot className={vis.indicator} />
              </span>
            )}
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold text-white truncate leading-tight flex items-center gap-1.5">
                {item.patient}
                {isFirst && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                    NEXT IN LINE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/40 font-bold">
                  {minutes <= 1 ? "<2m" : `${minutes}m`} wait
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="hidden sm:inline text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/40 font-bold">
                  Live Vitals Sync active
                </span>
              </div>
            </div>

            {/* Status Chips */}
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <div
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em]",
                  vis.badgeBase,
                  vis.badgeGlow
                )}
              >
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", vis.indicator)}>
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full",
                      isLive ? "opacity-60 animate-ping" : "opacity-45"
                    )}
                    style={{ background: "currentColor" }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
                {statusLabel}
              </div>

              {/* Priority Badge */}
              {priorityLabel && (
                <div className="flex items-center">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 border-rose-400/30 bg-rose-400/10 text-rose-200 shadow-[0_0_20px_rgba(255,77,109,0.15)]"
                    )}
                  >
                    <Zap size={11} className="text-rose-300 animate-pulse" />
                    <span className="text-[9px] font-black tracking-[0.16em]">{priorityLabel}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5">
        <div className="h-full w-full overflow-hidden bg-white/5">
          <div
            className={cn(
              "h-full w-full origin-left bg-gradient-to-r animate-[cc-queue-timer_2s_ease-in-out_infinite]"
            )}
            style={{
              background:
                item.status === "priority"
                  ? "linear-gradient(90deg, rgba(255,77,109,0.95), rgba(255,77,109,0.15))"
                  : item.status === "called"
                    ? "linear-gradient(90deg, rgba(52,211,153,0.95), rgba(52,211,153,0.15))"
                    : "linear-gradient(90deg, rgba(34,211,238,0.95), rgba(34,211,238,0.15))",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function RealtimePatientQueueWidget() {
  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);
  const liveDoctors = useRealtimeSimulatorStore((s) => s.liveDoctors);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const tickMs = useRealtimeSimulatorStore((s) => s.config.tickMs);
  const now = useLiveClockTick();

  const criticalEmergencies = useMemo(
    () => liveEmergencies.filter((e) => e.priority === "critical"),
    [liveEmergencies]
  );

  const calledToken = useMemo(
    () => liveQueue?.find((q) => q.status === "called"),
    [liveQueue]
  );

  const totalWaiting = useMemo(
    () => liveQueue.filter((q) => q.status === "waiting").length,
    [liveQueue]
  );

  const priorityCount = useMemo(
    () => liveQueue.filter((q) => q.status === "priority").length,
    [liveQueue]
  );

  const queueLabel = calledToken ? "Now serving" : "Live queue";
  const first = liveQueue?.[0];
  const listRef = useRef<HTMLDivElement | null>(null);

  const lastSignature = useMemo(() => {
    return JSON.stringify(liveQueue.map((x) => `${x.token}-${x.status}-${x.wait}`));
  }, [liveQueue]);

  return (
    <div className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <style jsx global>{`
        @keyframes cc-queue-timer {
          0% {
            transform: scaleX(0.05);
            opacity: 0.75;
          }
          55% {
            transform: scaleX(1);
            opacity: 1;
          }
          100% {
            transform: scaleX(0.12);
            opacity: 0.6;
          }
        }
        @keyframes cc-ecg-pulse {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-cc-ecg-wave {
          stroke-dasharray: 200;
          animation: cc-ecg-pulse 3s linear infinite;
        }
      `}</style>

      {/* Emergency Override Alert HUD */}
      <AnimatePresence>
        {criticalEmergencies.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
              <div className="absolute inset-0 bg-red-500/5 rounded-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="rounded-xl bg-red-500/20 p-2 border border-red-500/40">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
                    EMERGENCY OVERRIDE IN EFFECT
                  </h4>
                  <p className="mt-0.5 text-xs text-red-300/80 leading-relaxed font-semibold">
                    {criticalEmergencies.length} critical cases active. OPD queues dynamically recalibrating paths.
                  </p>
                </div>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/30 bg-red-900/40 px-2.5 py-1 text-[10px] font-black tracking-wider text-red-300 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                </span>
                CRITICAL SIGNAL
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 shadow-[0_0_24px_rgba(34,211,238,0.1)]">
            <MotionPulseDot className="bg-cyan-300" />
          </div>

          <div>
            <div className="text-[10px] sm:text-xs font-extrabold tracking-[0.24em] uppercase text-white/45">
              QUEUE & OPERATIONS CONTROL
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-black text-white tracking-tight">
              Realtime Patient Queue Status
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {queueLabel}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            <MotionPulseDot className="bg-emerald-300" />
            {priorityCount} priority
          </div>
        </div>
      </div>

      {/* Active Summary Grid */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4.5 transition-colors duration-300 hover:border-cyan-400/20">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Total Waiting</div>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-white">{totalWaiting}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Live Queue Load
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4.5 transition-colors duration-300 hover:border-cyan-400/20">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Next Token</div>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-cyan-300">
            {first ? formatToken(first.token) : "--"}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            {first?.status === "called" ? "called" : "queued status"}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4.5 transition-colors duration-300 hover:border-cyan-400/20">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Telemetry Clock</div>
          <div className="mt-1 text-2xl sm:text-3xl font-black text-white" suppressHydrationWarning>
            {formatClockTime(now)}
          </div>
          <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Live Central Sync
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div ref={listRef} className="relative">
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {liveQueue.map((item, idx) => (
              <QueueCard key={item.token} item={item as QueueItem} isFirst={idx === 0} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Doctor Availability Wing Roster */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope size={14} className="text-cyan-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
            OPD PHYSICIAN WING STATUS
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {liveDoctors.map((doc) => {
            const isAvail = doc.state === "available";
            const isBusy = doc.state === "busy";
            const statusColor = isAvail
              ? "border-emerald-500/20 bg-emerald-950/10 text-emerald-300"
              : isBusy
                ? "border-rose-500/20 bg-rose-950/10 text-rose-300"
                : "border-amber-500/20 bg-amber-950/10 text-amber-300";

            return (
              <div
                key={doc.name}
                className={cn(
                  "rounded-xl border p-2.5 flex flex-col justify-between backdrop-blur-md transition-all duration-300",
                  statusColor
                )}
              >
                <div>
                  <div className="text-[11px] font-extrabold text-white leading-tight truncate">
                    {doc.name}
                  </div>
                  <div className="text-[9px] text-white/50 font-semibold tracking-wider mt-0.5">
                    {doc.specialty}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
                    {doc.state}
                  </span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full rounded-full opacity-75",
                        isAvail ? "bg-emerald-400 animate-ping" : isBusy ? "bg-rose-400" : "bg-amber-400 animate-pulse"
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex h-1.5 w-1.5 rounded-full",
                        isAvail ? "bg-emerald-400" : isBusy ? "bg-rose-400" : "bg-amber-400"
                      )}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Small Realtime Telemetry Hint */}
      <div className="mt-4 rounded-[22px] border border-white/5 bg-white/5 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
            <UserCheck size={14} className="text-cyan-300" />
            Active Clinical Telemetry
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 flex items-center gap-2 font-bold">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
            Sync intervals: {Math.max(1000, Math.round(tickMs))}ms
          </div>
          <div className="text-white/60 font-medium">
            {lastSignature ? "Dynamic scheduling aligned" : "Waiting for simulator..."}
          </div>
        </div>
      </div>
    </div>
  );
}
