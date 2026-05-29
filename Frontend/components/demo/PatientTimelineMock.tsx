"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  FileText,
  HeartPulse,
  Pill,
  ChevronDown,
  ShieldCheck,
  Award,
  Clock,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const timelineData = [
  {
    id: "event-1",
    title: "Emergency incident",
    date: "Today, 10:24 AM",
    detail: "Priority triage event linked to emergency queue escalation. Rapid response dispatched.",
    icon: HeartPulse,
    tone: "rose",
    status: "Critical Triage",
    doctor: "Dr. Robert Chen, ER Lead",
    stats: { bp: "142/90 mmHg", pulse: "98 bpm", temp: "37.2 °C", o2: "94%" },
    hash: "0x8F9C...A2D1",
  },
  {
    id: "event-2",
    title: "Lab report bundle",
    date: "May 18, 2026",
    detail: "CBC, metabolic panel, and arterial blood gas index verified and cryptographically stamped.",
    icon: FileText,
    tone: "cyan",
    status: "Monitoring",
    doctor: "Dr. Sarah Jenkins, Pathology Desk",
    stats: { hemoglobin: "14.2 g/dL", crp: "0.8 mg/L", wbc: "6.4 k/uL", sodium: "139 mEq/L" },
    hash: "0x3B8E...F4A9",
  },
  {
    id: "event-3",
    title: "Prescription update",
    date: "May 12, 2026",
    detail: "Medication schedule re-aligned after stable cardiac consultation. Core therapy adjusted.",
    icon: Pill,
    tone: "emerald",
    status: "Recovered",
    doctor: "Dr. Marcus Vance, Cardiology Office",
    stats: { medication: "Core-beta blocker 5mg", dosage: "Once daily (Morning)", duration: "30 days" },
    hash: "0x7E2A...9C3D",
  },
  {
    id: "event-4",
    title: "Follow-up appointment",
    date: "May 02, 2026",
    detail: "Cardiology review marked stable with custom recovery guidelines. Auto-sync parameters loaded.",
    icon: CalendarClock,
    tone: "amber",
    status: "Recovered",
    doctor: "Dr. Marcus Vance, Cardiology Office",
    stats: { status: "Cardiac rhythm: Sinus", hrv: "65 ms", tolerance: "High (tested)" },
    hash: "0x1D4F...5B8E",
  },
];

function toneClass(tone: string) {
  if (tone === "rose") return "border-rose-500/20 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
  if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
  return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
}

function badgeClass(status: string) {
  if (status === "Critical Triage") return "border-rose-400/20 bg-rose-500/10 text-rose-300";
  if (status === "Monitoring") return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";
  return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
}

export function PatientTimelineMock() {
  const [expandedId, setExpandedId] = useState<string | null>("event-1");

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6">
      
      {/* Background radial highlight */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <CalendarClock size={18} className="text-emerald-300" />
          Interactive Medical History
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <ShieldCheck size={12} />
          Ledger Verified
        </span>
      </div>

      <div className="relative pl-6 space-y-4">
        {/* Timeline connecting vertical trace line */}
        <div className="absolute bottom-6 left-2.5 top-6 w-px bg-gradient-to-b from-rose-500 via-cyan-500/60 to-emerald-500/10" />

        {timelineData.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;
          
          return (
            <div
              key={item.id}
              className="relative transition-all duration-300 group"
            >
              {/* Outer timeline indicator dot */}
              <span className={`absolute -left-[27px] top-4 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-black ${toneClass(item.tone)}`}>
                <Icon size={12} className={item.tone === "rose" ? "animate-pulse" : ""} />
              </span>

              {/* Collapsible Card Body */}
              <div 
                onClick={() => toggleExpand(item.id)}
                className={`cursor-pointer rounded-[22px] border transition-all duration-300 p-4 ${
                  isExpanded
                    ? "border-cyan-400/25 bg-cyan-950/5 shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition duration-200">{item.title}</h4>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${badgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/40 font-mono">
                      <Clock size={10} />
                      {item.date}
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/40 group-hover:text-white/70"
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>

                <p className="mt-2 text-xs leading-5 text-white/60">{item.detail}</p>

                {/* Expanded accordion clinical specifications */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                        {/* Diagnosed Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-3 border border-white/5">
                          {Object.entries(item.stats).map(([key, val]) => (
                            <div key={key} className="text-left font-mono">
                              <span className="block text-[9px] uppercase tracking-wider text-white/30">{key.replace("_", " ")}</span>
                              <span className="text-xs font-bold text-white">{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Sign-off Clinical Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] bg-cyan-950/10 rounded-xl p-2.5 border border-cyan-500/10">
                          <div className="flex items-center gap-2 text-white/60">
                            <User size={12} className="text-cyan-300" />
                            <span>Sign-off: <strong className="text-white">{item.doctor}</strong></span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-300">
                            <Award size={12} />
                            <span>BLOCK_HASH: {item.hash}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
