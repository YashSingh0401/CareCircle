"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Loader2,
  Sparkles,
  Heart,
  Moon,
  Flame,
  Droplet,
  TrendingUp,
  BarChart3,
  LineChart,
  Info,
  ShieldAlert,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const findingsData = [
  "Hemoglobin levels are normal at 14.2 g/dL (optimal iron binding).",
  "Inflammation marker hs-CRP is stable at 0.8 mg/L (excellent recovery trend).",
  "Resting heart rate variability indicates strong autonomic nervous balance.",
];

export function AIReportAnalyzerMock() {
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(92);
  const [displayScore, setDisplayScore] = useState(92);
  const [activeTab, setActiveTab] = useState<"summary" | "metabolic" | "trends">("summary");

  // Animated score counter
  useEffect(() => {
    if (analyzing) {
      return;
    }
    let start = 0;
    const end = score;
    if (start === end) return;
    
    const totalDuration = 1200; // ms
    const incrementTime = Math.abs(Math.floor(totalDuration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [score, analyzing]);

  function runAnalysis() {
    setAnalyzing(true);
    setDisplayScore(0);
    toast.info("Connecting to AI diagnostic node...", {
      description: "Decrypting patient medical history bundle.",
      className: "border border-cyan-500/20 bg-black/90 text-cyan-300",
    });

    window.setTimeout(() => {
      setAnalyzing(false);
      const newScore = Math.floor(Math.random() * 15) + 82; // Random score between 82 and 96
      setScore(newScore);
      toast.success("AI clinical analysis synchronized", {
        description: `Vitals verified. Health index stabilized at ${newScore}%.`,
        className: "border border-emerald-500/20 bg-black/90 text-emerald-300",
      });
    }, 2000);
  }

  // Circular progress math
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  const vitals = [
    { label: "Heart Rate", value: analyzing ? "---" : "72 bpm", pct: "Optimal", icon: Heart, color: "text-rose-400 border-rose-400/20 bg-rose-400/5 hover:border-rose-400/40", iconClass: "animate-pulse text-rose-400" },
    { label: "Sleep Cycle", value: analyzing ? "---" : "8.2 hrs", pct: "94% quality", icon: Moon, color: "text-indigo-400 border-indigo-400/20 bg-indigo-400/5 hover:border-indigo-400/40", iconClass: "text-indigo-300" },
    { label: "Daily Energy", value: analyzing ? "---" : "9,420 steps", pct: "82% active", icon: Flame, color: "text-amber-400 border-amber-400/20 bg-amber-400/5 hover:border-amber-400/40", iconClass: "text-amber-300" },
    { label: "Hydration", value: analyzing ? "---" : "2.4 L", pct: "78% balance", icon: Droplet, color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5 hover:border-cyan-400/40", iconClass: "text-cyan-300" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6">
      
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles size={18} className="text-cyan-300 animate-pulse" />
            Advanced Clinical Analytics Portal
          </div>
          <p className="mt-1 text-sm leading-6 text-white/55">
            Futuristic health graphs, metabolic range meters, and predictive AI insights.
          </p>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={analyzing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.1)] cursor-pointer"
        >
          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
          {analyzing ? "Syncing Vitals..." : "Analyze Vitals"}
        </button>
      </div>

      {/* Immersive OS Tabs Selector */}
      <div className="mt-4 flex gap-1.5 rounded-xl border border-white/10 bg-black/35 p-1 max-w-md">
        {[
          { id: "summary", label: "Vitals Summary", icon: Activity },
          { id: "metabolic", label: "Metabolic Profile", icon: BarChart3 },
          { id: "trends", label: "Medical Trends", icon: LineChart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isTabActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold uppercase tracking-wider transition duration-300 cursor-pointer ${
                isTabActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Container */}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {activeTab === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 lg:grid-cols-[1fr_1.20fr]"
            >
              {/* Left Column: Health Score Ring + Vitals Grid */}
              <div className="flex flex-col gap-5 rounded-[24px] border border-cyan-400/15 bg-cyan-400/5 p-5 shadow-[inset_0_0_30px_rgba(6,182,212,0.05)]">
                <div className="flex flex-col items-center justify-center sm:flex-row gap-6 p-2">
                  
                  {/* Circular progress SVG */}
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-black/40 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <svg className="absolute transform -rotate-90" width="130" height="130">
                      <defs>
                        <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <circle cx="65" cy="65" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                      <motion.circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="url(#cyanGlowGrad)"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        fill="transparent"
                        strokeLinecap="round"
                        style={{ filter: "url(#glow)" }}
                      />
                    </svg>
                    
                    <div className="relative flex flex-col items-center">
                      <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {analyzing ? "--" : displayScore}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Index</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">Status Assessment</div>
                    <h3 className="text-2xl font-black text-white">
                      {analyzing ? (
                        <span className="animate-pulse text-cyan-300">Analyzing...</span>
                      ) : score >= 90 ? (
                        <span className="text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">Optimal / Excellent</span>
                      ) : (
                        <span className="text-cyan-300">Stable / Monitoring</span>
                      )}
                    </h3>
                    <p className="text-xs leading-5 text-white/60 max-w-[200px]">
                      {analyzing 
                        ? "Re-aligning telemetry telemetry diagnostic stream..."
                        : "All clinical biomarkers reside within target ranges. Auto-regulatory systems functional."
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {vitals.map((vital) => {
                    const Icon = vital.icon;
                    return (
                      <div
                        key={vital.label}
                        className={`relative flex flex-col rounded-2xl border p-3 backdrop-blur-md transition-all duration-300 cursor-pointer ${vital.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">{vital.label}</span>
                          <Icon size={14} className={vital.iconClass} />
                        </div>
                        <div className="mt-2 text-lg font-black text-white">{vital.value}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{vital.pct}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: AI Analysis Scan & Findings list */}
              <div className="relative flex flex-col justify-between rounded-[24px] border border-white/10 bg-black/25 p-5">
                
                {analyzing && (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: ["0%", "100%", "0%"] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 z-10 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                  />
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    <TrendingUp size={14} className="text-cyan-300" />
                    Verified Biomarkers Summary
                  </div>
                  
                  {findingsData.map((finding, index) => (
                    <div
                      key={finding}
                      className="group relative rounded-[22px] border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/5"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`rounded-xl border p-2 shrink-0 ${index === 0 ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" : "border-violet-400/20 bg-violet-400/10 text-violet-300"}`}>
                          <Sparkles size={14} />
                        </span>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Biomarker {index + 1}</div>
                          <div className="mt-1 text-sm leading-6 text-white/70">
                            {analyzing ? (
                              <span className="inline-block animate-pulse text-cyan-300">Decrypting clinical findings...</span>
                            ) : (
                              finding
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-white/5 bg-black/25 p-3 text-center">
                  <span className="text-[11px] font-medium text-white/40">
                    Diagnostic verification secured via decentralized clinical ledger.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "metabolic" && (
            <motion.div
              key="metabolic"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 lg:grid-cols-2"
            >
              {/* Left Side: Metabolic Meters */}
              <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">Metabolic Index Metrics</h3>
                  <Award size={16} className="text-cyan-300" />
                </div>

                {/* HbA1c */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/70">Blood Sugar (HbA1c)</span>
                    <span className="font-extrabold text-emerald-400">5.4% (Optimal)</span>
                  </div>
                  <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    {/* Optimal Zone */}
                    <div className="absolute left-0 top-0 bottom-0 w-[57%] bg-emerald-500/20" />
                    {/* Elevated Zone */}
                    <div className="absolute left-[57%] top-0 bottom-0 w-[43%] bg-rose-500/20" />
                    {/* Glowing Pointer */}
                    <div className="absolute left-[54%] top-0 bottom-0 w-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] border border-white" />
                  </div>
                  <div className="flex justify-between text-[9px] text-white/30 font-bold uppercase tracking-wider">
                    <span>4.0% Optimal</span>
                    <span>5.7% Borderline</span>
                    <span>7.0%+ Diabetic</span>
                  </div>
                </div>

                {/* Fasting Glucose */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/70">Fasting Glucose</span>
                    <span className="font-extrabold text-amber-400">102 mg/dL (Abnormal Highlight)</span>
                  </div>
                  <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    {/* Normal Zone */}
                    <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-emerald-500/20" />
                    {/* Pre-diabetic Zone */}
                    <div className="absolute left-[60%] top-0 bottom-0 w-[40%] bg-amber-500/25" />
                    {/* Glowing Pointer */}
                    <div className="absolute left-[65%] top-0 bottom-0 w-2.5 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-white" />
                  </div>
                  <div className="flex justify-between text-[9px] text-white/30 font-bold uppercase tracking-wider">
                    <span>70 Normal</span>
                    <span>100 Pre-diabetic</span>
                    <span>126+ Diabetic</span>
                  </div>
                </div>

                {/* Total Cholesterol */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/70">Total Cholesterol</span>
                    <span className="font-extrabold text-rose-400">210 mg/dL (Borderline High)</span>
                  </div>
                  <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="absolute left-0 top-0 bottom-0 w-[70%] bg-emerald-500/20" />
                    <div className="absolute left-[70%] top-0 bottom-0 w-[30%] bg-rose-500/25" />
                    <div className="absolute left-[74%] top-0 bottom-0 w-2.5 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)] border border-white" />
                  </div>
                  <div className="flex justify-between text-[9px] text-white/30 font-bold uppercase tracking-wider">
                    <span>150 Optimal</span>
                    <span>200 Borderline</span>
                    <span>240+ High</span>
                  </div>
                </div>
              </div>

              {/* Right Side: AI Generated Insight Cards */}
              <div className="flex flex-col justify-between gap-3">
                <div className="rounded-[22px] border border-cyan-500/15 bg-cyan-950/10 p-4.5 flex gap-3 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] border-t border-cyan-400/30">
                  <Sparkles className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">💡 AI Insight: Glucose Management</h4>
                    <p className="mt-2 text-xs leading-5 text-cyan-100/80">
                      Your Fasting Glucose is slightly elevated at **102 mg/dL**. Recommend limiting late-night glycemic loads and balancing dinner carbs with protein vectors to stabilize morning fast cycles.
                    </p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-rose-500/15 bg-rose-950/10 p-4.5 flex gap-3 border-t border-rose-400/30">
                  <ShieldAlert className="h-5 w-5 text-rose-300 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">⚠️ Risk Assessment: Borderline Cholesterol</h4>
                    <p className="mt-2 text-xs leading-5 text-rose-100/80">
                      Lipid summary indexes borderline elevation at **210 mg/dL**. Consider increasing natural Omega-3 lipid anchors (walnuts, omega supplements) and schedule a routine lipid sync with Dr. Sarah within 4 weeks.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-3 flex items-center gap-2">
                  <Info size={14} className="text-white/40 shrink-0" />
                  <span className="text-[10px] leading-4 text-white/50">
                    Range comparison metrics calibrated according to standard Clinical Guidelines (AHA 2026).
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "trends" && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"
            >
              {/* Left: SVG Trends Line Chart */}
              <div className="rounded-[24px] border border-white/10 bg-[#040810] p-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">Biometric Trend Tracker</span>
                  <span className="text-[10px] font-bold text-white/40">Wellness Score Index (Last 7 Days)</span>
                </div>

                {/* Immersive SVG Chart */}
                <div className="relative aspect-[2.1] w-full">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 300" fill="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="300">
                        <stop offset="0%" stopColor="rgba(6,182,212,0.25)" />
                        <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                      </linearGradient>
                    </defs>

                    {/* horizontal grids */}
                    <line x1="50" y1="50" x2="650" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
                    <line x1="50" y1="125" x2="650" y2="125" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
                    <line x1="50" y1="200" x2="650" y2="200" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
                    
                    {/* axis labels */}
                    <text x="35" y="55" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">95%</text>
                    <text x="35" y="130" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">90%</text>
                    <text x="35" y="205" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">85%</text>

                    {/* Gradient area under trend line */}
                    <path
                      d="M 50 300 L 50 160 L 150 145 L 250 115 L 350 130 L 450 100 L 550 85 L 650 100 L 650 300 Z"
                      fill="url(#chartGrad)"
                    />

                    {/* Glowing trend vector path */}
                    <motion.path
                      d="M 50 160 L 150 145 L 250 115 L 350 130 L 450 100 L 550 85 L 650 100"
                      stroke="#22d3ee"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    />

                    {/* Interactive Pulsing Coordinates (Nodes) */}
                    {[
                      { x: 50, y: 160, day: "Mon", score: "88" },
                      { x: 150, y: 145, day: "Tue", score: "89" },
                      { x: 250, y: 115, day: "Wed", score: "91" },
                      { x: 350, y: 130, day: "Thu", score: "90" },
                      { x: 450, y: 100, day: "Fri", score: "92" },
                      { x: 550, y: 85, day: "Sat", score: "93" },
                      { x: 650, y: 100, day: "Sun", score: "92" }
                    ].map((pt) => (
                      <g key={pt.day} className="cursor-pointer group">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#22d3ee" stroke="#fff" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(34,211,238,1)]" />
                        <circle cx={pt.x} cy={pt.y} r="12" fill="rgba(34,211,238,0.15)" className="opacity-0 group-hover:opacity-100 transition-opacity animate-ping" style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} />
                        <text x={pt.x} y="255" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9.5" fontWeight="bold">{pt.day}</text>
                        {/* Hover Score text */}
                        <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="black" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {pt.score}%
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Right: Trend AI generated Insight summary */}
              <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                    <TrendingUp size={14} />
                    Historical Health Velocity
                  </div>
                  <h4 className="text-base font-black text-white leading-snug">Positive Health Trajectory</h4>
                  <p className="mt-2 text-xs leading-5 text-white/60">
                    Your baseline wellness score has successfully elevated from **88%** on Monday to **92%** today.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-white/60">
                    Autonomic balance and resting heart rate indices reflect excellent sleep stabilization and aerobic recovery.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs leading-4 text-white/45">
                  Trends are aggregated hourly via connected diagnostic biometric telemetry.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}
