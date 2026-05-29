"use client";

import React, { useMemo } from "react";
import { Activity, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";

function feedCategory(title: string) {
  const lowercase = title.toLowerCase();
  if (lowercase.includes("doctor") || lowercase.includes("consult")) return { label: "Doctor", tone: "cyan" };
  if (lowercase.includes("queue") || lowercase.includes("token")) return { label: "Queue", tone: "violet" };
  if (lowercase.includes("sos") || lowercase.includes("emergency") || lowercase.includes("alert")) return { label: "Emergency", tone: "rose" };
  if (lowercase.includes("report") || lowercase.includes("file")) return { label: "Report", tone: "emerald" };
  return { label: "System", tone: "amber" };
}

function toneStyles(tone: string) {
  if (tone === "rose") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  if (tone === "violet") return "border-violet-400/20 bg-violet-400/10 text-violet-300";
  if (tone === "emerald") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (tone === "amber") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

export function HospitalActivityFeed() {
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const recentFeed = useMemo(() => feedItems.slice(0, 6), [feedItems]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6 flex flex-col min-h-[360px]">
      
      {/* Feed header controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <Database size={18} className="text-cyan-300" />
          Dashboard Activity Feed
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-300" />
          Live Hospital Telemetry
        </div>
      </div>

      {/* Ticker scrolling items container */}
      <div className="relative flex-1 overflow-hidden">
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {recentFeed.map((entry) => {
              const cat = feedCategory(entry.title);
              
              return (
                <motion.div
                  key={`${entry.id}-${entry.time}`}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="rounded-[22px] border border-white/5 bg-black/25 p-4 shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:border-cyan-400/15 hover:bg-white/5"
                >
                  <div className="flex items-start gap-3">
                    {/* Glowing active category indicator */}
                    <div className={`rounded-xl border p-2 shrink-0 ${toneStyles(cat.tone)}`}>
                      <Activity size={16} className={cat.tone === "rose" ? "animate-pulse" : ""} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-sm font-bold text-white">{entry.title}</span>
                          <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase shrink-0 ${toneStyles(cat.tone)}`}>
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 font-mono shrink-0">
                          {entry.time}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{entry.detail}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
