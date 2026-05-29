"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  ShieldAlert,
  Zap,
  Clock,
  Sparkles,
  HeartPulse,
  Info,
  Trash2,
  Calendar,
} from "lucide-react";
import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";
import { cn } from "@/lib/utils";

interface SmartNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartNotificationCenter({ isOpen, onClose }: SmartNotificationCenterProps) {
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);

  // Derive urgent emergency cases
  const emergencies = useMemo(() => {
    return liveEmergencies.map((e) => ({
      id: `emergency-${e.title}`,
      title: e.title,
      description: `${e.status} • Location: ${e.room}`,
      category: "emergency" as const,
      timestamp: "Live",
      priority: e.priority,
    }));
  }, [liveEmergencies]);

  // Derive normal toast/simulation updates
  const simulatedToasts = useMemo(() => {
    return toastQueue.slice(0, 8).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.message || "Activity synchronization complete.",
      category: "simulation" as const,
      timestamp: "Realtime",
      tone: t.tone,
    }));
  }, [toastQueue]);

  // Static futuristic AI tips based on live state
  const aiTips = useMemo(() => {
    const tips = [
      {
        id: "ai-1",
        title: "Clinician sync available",
        description: "Dr. Sarah Chen (Cardiology Wing) is currently Available with low wait latencies.",
        category: "ai" as const,
        timestamp: "AI Recommendation",
      },
      {
        id: "ai-2",
        title: "Metabolic tracking warning",
        description: "Your morning glucose metrics suggest minor fluctuations. Review metabolic bars under Advanced Analytics.",
        category: "ai" as const,
        timestamp: "Diagnostic AI",
      },
    ];

    if (liveQueue.length > 0 && liveQueue[0].status === "called") {
      tips.unshift({
        id: "ai-queue-alert",
        title: "Active consultation alert",
        description: `Current Token called: ${liveQueue[0].token}. Keep your biometric credentials armed at the door.`,
        category: "ai" as const,
        timestamp: "Queue Dispatch",
      });
    }

    return tips;
  }, [liveQueue]);

  // Combine alerts into a single unified stream ordered by importance
  const allNotifications = useMemo(() => {
    return [...emergencies, ...aiTips, ...simulatedToasts];
  }, [emergencies, aiTips, simulatedToasts]);

  // Stats
  const urgentCount = emergencies.length;
  const totalCount = allNotifications.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px]"
          />

          {/* OS-Style Drawer Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 h-full w-[360px] sm:w-[420px]",
              "border-l border-white/10 bg-slate-950/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.85)]",
              "flex flex-col text-white select-none overflow-hidden"
            )}
          >
            {/* Ambient glowing radial light */}
            <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4.5 bg-black/35">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    <Bell size={18} className="text-cyan-300 animate-pulse" />
                  </div>
                  {urgentCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border border-slate-950">
                      {urgentCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">CareCircle OS</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Smart Alerts Stream ({totalCount})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:border-white/20 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Notification List Scroll Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
              <AnimatePresence initial={false}>
                {allNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                  >
                    <div className="rounded-full border border-white/10 bg-white/5 p-4 text-white/30">
                      <Bell size={32} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">All Clear</h4>
                      <p className="text-xs text-white/40 mt-1 max-w-[200px]">
                        No active diagnostics or emergency signals pending verification.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  allNotifications.map((notif, index) => {
                    // Visual styling based on category
                    let icon = <Info size={14} />;
                    let borderClass = "border-white/5 hover:border-cyan-400/25";
                    let bgClass = "bg-white/5";
                    let tagClass = "bg-white/10 text-white/70";
                    let glowEffect = "";

                    if (notif.category === "emergency") {
                      icon = <ShieldAlert size={14} className="text-rose-400 animate-pulse" />;
                      borderClass = "border-rose-500/30 hover:border-rose-400/60";
                      bgClass = "bg-rose-950/20";
                      tagClass = "bg-rose-500/20 text-rose-300 border border-rose-500/30";
                      glowEffect = "shadow-[0_0_20px_rgba(244,63,94,0.1)]";
                    } else if (notif.category === "ai") {
                      icon = <Sparkles size={14} className="text-cyan-300" />;
                      borderClass = "border-cyan-500/30 hover:border-cyan-400/60";
                      bgClass = "bg-cyan-950/15";
                      tagClass = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
                      glowEffect = "shadow-[0_0_20px_rgba(6,182,212,0.08)]";
                    } else if (notif.category === "simulation") {
                      if (notif.tone === "rose") {
                        icon = <ShieldAlert size={14} className="text-rose-400" />;
                        borderClass = "border-rose-400/20 hover:border-rose-400/40";
                        bgClass = "bg-rose-500/5";
                        tagClass = "bg-rose-400/10 text-rose-300";
                      } else if (notif.tone === "emerald") {
                        icon = <HeartPulse size={14} className="text-emerald-400" />;
                        borderClass = "border-emerald-400/20 hover:border-emerald-400/40";
                        bgClass = "bg-emerald-500/5";
                        tagClass = "bg-emerald-400/10 text-emerald-300";
                      } else if (notif.tone === "amber") {
                        icon = <Clock size={14} className="text-amber-400" />;
                        borderClass = "border-amber-400/20 hover:border-amber-400/40";
                        bgClass = "bg-amber-500/5";
                        tagClass = "bg-amber-400/10 text-amber-300";
                      } else {
                        icon = <Zap size={14} className="text-cyan-300" />;
                        borderClass = "border-cyan-400/20 hover:border-cyan-400/40";
                        bgClass = "bg-cyan-500/5";
                        tagClass = "bg-cyan-400/10 text-cyan-300";
                      }
                    }

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className={cn(
                          "group relative overflow-hidden rounded-[20px] border p-4.5 transition-all duration-300 cursor-pointer",
                          borderClass,
                          bgClass,
                          glowEffect
                        )}
                      >
                        {/* Hover Background Accent */}
                        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="flex items-start gap-3">
                          <span className="rounded-xl border border-white/10 bg-black/40 p-2 shrink-0">
                            {icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn("text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full", tagClass)}>
                                {notif.timestamp}
                              </span>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">
                                Active
                              </span>
                            </div>

                            <h4 className="mt-2 text-xs sm:text-sm font-extrabold text-white leading-snug">
                              {notif.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/60 leading-relaxed font-medium">
                              {notif.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions Footer Panel */}
            <div className="border-t border-white/10 p-5 bg-black/45 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white/50 uppercase tracking-wider">System Integration</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Live Sync (Telemetry Connected)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Close Console
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Visual feedback
                  }}
                  className="w-full rounded-xl border border-cyan-400/25 bg-cyan-400/10 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-400/15 transition cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                >
                  Verify Audits
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
