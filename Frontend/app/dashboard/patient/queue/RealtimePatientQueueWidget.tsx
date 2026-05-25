"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

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
        badgeBase:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        badgeGlow: "shadow-[0_0_22px_rgba(52,211,153,0.22)]",
        indicator: "bg-emerald-300",
        priorityBar: "from-emerald-300/70 to-emerald-300/10",
      };
    case "priority":
      return {
        badgeBase:
          "border-rose-400/20 bg-rose-400/10 text-rose-300",
        badgeGlow:
          "shadow-[0_0_28px_rgba(255,77,109,0.35),0_0_10px_rgba(255,77,109,0.18)]",
        indicator: "bg-rose-300",
        priorityBar: "from-rose-300/80 to-rose-300/10",
      };
    default:
      return {
        badgeBase: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        badgeGlow: "shadow-[0_0_22px_rgba(34,211,238,0.18)]",
        indicator: "bg-cyan-300",
        priorityBar: "from-cyan-300/70 to-cyan-300/10",
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

function RealtimePulseDot({ className }: { className?: string }) {
  return <MotionPulseDot className={cn("", className)} />;
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
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden",
        "rounded-xl border backdrop-blur-xl",
        "bg-black/30",
        "p-3 sm:p-4 transition-all duration-300",
        "hover:border-white/20 hover:bg-black/40"
      )}
      style={{ borderColor: "rgba(148, 163, 184, 0.18)" }}
    >
      {/* Status glow overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0",
          "transition-opacity duration-300",
          item.status === "priority" ? "opacity-100" : "group-hover:opacity-50",
          item.status === "priority"
            ? "shadow-[inset_0_0_30px_rgba(255,77,109,0.15)]"
            : "shadow-[inset_0_0_22px_rgba(34,211,238,0.10)]",
          isLive ? "opacity-100" : ""
        )}
      />

      {/* Left status indicator bar */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl",
          "bg-gradient-to-b",
          vis.priorityBar,
          item.status === "priority" ? "opacity-100" : "opacity-70"
        )}
      />

      {/* Horizontal card layout */}
      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Token Badge */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl",
                "border border-white/10 bg-black/40",
                "shadow-[0_0_20px_rgba(34,211,238,0.12)]",
                "flex items-center justify-center",
                "transition-all duration-300",
                "group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.20)]"
              )}
            >
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                {formatToken(item.token)}
              </span>
            </div>

            {isFirst ? (
              <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-[9px] font-extrabold text-emerald-300">
                <RealtimePulseDot className={vis.indicator} />
              </span>
            ) : null}
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                {item.patient}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {minutes <= 1 ? "<2m" : `${minutes}m`} wait
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="hidden sm:inline text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Live ETA
                </span>
              </div>
            </div>

            {/* Status Chips */}
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <div
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 sm:px-3 sm:py-1",
                  "text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em]",
                  vis.badgeBase,
                  vis.badgeGlow
                )}
              >
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    vis.indicator
                  )}
                >
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
              {priorityLabel ? (
                <div className="hidden sm:flex items-center">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
                      "border-rose-400/30 bg-rose-400/8 text-rose-200",
                      "shadow-[0_0_20px_rgba(255,77,109,0.20)]"
                    )}
                  >
                    <Zap size={12} className="text-rose-200" />
                    <span className="text-[10px] font-black tracking-[0.16em]">{priorityLabel}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5">
        <div className="h-full w-full overflow-hidden bg-white/5">
          <div
            className={cn(
              "h-full w-full origin-left",
              "bg-gradient-to-r",
              "animate-[cc-queue-timer_2s_ease-in-out_infinite]"
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
  const now = useLiveClockTick();

  const calledToken = useMemo(
    () => liveQueue?.find((q) => q.status === "called"),
    [liveQueue],
  );

  const totalWaiting = useMemo(
    () => liveQueue.filter((q) => q.status === "waiting").length,
    [liveQueue],
  );

  const priorityCount = useMemo(
    () => liveQueue.filter((q) => q.status === "priority").length,
    [liveQueue],
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
      `}</style>

      {/* header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 shadow-[0_0_24px_rgba(34,211,238,0.10)]">
            <MotionPulseDot className="bg-cyan-300" />
          </div>

          <div>
            <div className="text-sm font-extrabold tracking-[0.24em] uppercase text-white/45">
              QUEUE OPERATIONS
            </div>
            <div className="mt-1 text-xl font-black text-white">
              Realtime patient queue
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              {queueLabel}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <RealtimePulseDot className="bg-emerald-300" />
            {priorityCount} priority
          </div>
        </div>
      </div>

      {/* active summary */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-white/40">Total waiting</div>
          <div className="mt-2 text-4xl font-black text-white">{totalWaiting}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
            live snapshot
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-white/40">Next token</div>
          <div className="mt-2 text-4xl font-black text-cyan-300">
            {first ? formatToken(first.token) : "--"}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
            {first?.status === "called" ? "called" : "queued"}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-white/40">System clock</div>
          <div className="mt-2 text-3xl font-black text-white">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
            realtime sync
          </div>
        </div>
      </div>

      {/* list */}
      <div ref={listRef} className="relative">
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {liveQueue.map((item, idx) => (
              <QueueCard key={item.token} item={item as QueueItem} isFirst={idx === 0} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* small realtime hint */}
      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-white">
            Live queue animation
          </div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/40 flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
            updates every {Math.max(1000, Math.round(useRealtimeSimulatorStore.getState().config.tickMs / 1))}ms
          </div>
          <div className="text-sm text-white/60">
            {lastSignature ? "Telemetry converging" : "Warming up"}
          </div>
        </div>
      </div>
    </div>
  );
}

