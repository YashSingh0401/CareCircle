"use client";

import React, { useState, useMemo } from "react";
import { MapPinned, Navigation, Compass, Clock, Layers, ArrowUpDown, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Dept {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  tone: string;
  eta: string;
  floor: number;
  levelInstructions: string;
  traffic: string;
  pathX: number[];
  pathY: number[];
}

const departments: Dept[] = [
  { 
    id: "ER", 
    label: "Emergency Room", 
    x: 15, 
    y: 20, 
    tone: "rose", 
    eta: "45 sec", 
    floor: 1,
    levelInstructions: "Level 1 Direct Access (No lift/stairs transition required)",
    traffic: "High Priority Triage Active",
    pathX: [50, 50, 15, 15], 
    pathY: [90, 50, 50, 20] 
  },
  { 
    id: "OPD", 
    label: "Outpatient Desk (OPD)", 
    x: 35, 
    y: 30, 
    tone: "cyan", 
    eta: "2 mins", 
    floor: 2,
    levelInstructions: "Take central LIFT Core A or STAIRS B to Floor 2 (Cardiology Wing)",
    traffic: "Normal traffic",
    pathX: [50, 50, 35, 35], 
    pathY: [90, 50, 50, 30] 
  },
  { 
    id: "LAB", 
    label: "Diagnostic Lab", 
    x: 75, 
    y: 22, 
    tone: "emerald", 
    eta: "3 mins", 
    floor: 2,
    levelInstructions: "Take central LIFT Core A or STAIRS B to Floor 2 (Pathology corridor)",
    traffic: "Results uploading live",
    pathX: [50, 50, 75, 75], 
    pathY: [90, 50, 50, 22] 
  },
  { 
    id: "PHR", 
    label: "Hospital Pharmacy", 
    x: 82, 
    y: 72, 
    tone: "amber", 
    eta: "4 mins", 
    floor: 1,
    levelInstructions: "Level 1 Direct Access (Near Lobby exit)",
    traffic: "Orders cleared",
    pathX: [50, 50, 82, 82], 
    pathY: [90, 72, 72, 72] 
  },
  { 
    id: "WRD", 
    label: "Patient Ward C", 
    x: 22, 
    y: 76, 
    tone: "violet", 
    eta: "5 mins", 
    floor: 3,
    levelInstructions: "Take central LIFT Core A to Floor 3 (ICU & Wards boundary)",
    traffic: "Shift handoff complete",
    pathX: [50, 50, 22, 22], 
    pathY: [90, 76, 76, 76] 
  },
  { 
    id: "ICU", 
    label: "Cardiothoracic ICU", 
    x: 12, 
    y: 68, 
    tone: "violet", 
    eta: "5 mins", 
    floor: 3,
    levelInstructions: "Take central LIFT Core A to Floor 3, turn left at ICU Security Lock B",
    traffic: "Restricted Access Only",
    pathX: [50, 50, 22, 12], 
    pathY: [90, 76, 76, 68] 
  },
  { 
    id: "SURG", 
    label: "Surgical Prep Room 3B", 
    x: 28, 
    y: 82, 
    tone: "violet", 
    eta: "6 mins", 
    floor: 3,
    levelInstructions: "Take central LIFT Core A to Floor 3, follow neon line to Prep Block 3B",
    traffic: "Sterile protocols active",
    pathX: [50, 50, 22, 28], 
    pathY: [90, 76, 76, 82] 
  },
  { 
    id: "RAD", 
    label: "Radiology / MRI Bay", 
    x: 68, 
    y: 16, 
    tone: "emerald", 
    eta: "3 mins", 
    floor: 2,
    levelInstructions: "Take STAIRS B to Floor 2, enter Radiology Suite on the eastern wing",
    traffic: "MRI scanning active",
    pathX: [50, 50, 75, 68], 
    pathY: [90, 50, 50, 16] 
  },
  { 
    id: "RCP", 
    label: "Reception / Lobby", 
    x: 50, 
    y: 90, 
    tone: "cyan", 
    eta: "0 sec", 
    floor: 1,
    levelInstructions: "Located on Ground Floor (Floor 1) directly in front of you",
    traffic: "Front Desk staff available",
    pathX: [50, 50], 
    pathY: [90, 90] 
  }
];

const floorDirectory = [
  {
    floor: 3,
    name: "Floor 3 - Intensive Care & Wards",
    items: [
      { label: "Patient Ward C", deptId: "WRD" },
      { label: "Cardiothoracic ICU", deptId: "ICU" },
      { label: "Surgical Prep Room 3B", deptId: "SURG" }
    ]
  },
  {
    floor: 2,
    name: "Floor 2 - Consultations & Diagnostics",
    items: [
      { label: "Outpatient Desk (OPD)", deptId: "OPD" },
      { label: "Diagnostic Pathology Lab", deptId: "LAB" },
      { label: "Radiology / MRI Bay", deptId: "RAD" }
    ]
  },
  {
    floor: 1,
    name: "Floor 1 (Ground) - Emergency & Pharmacy",
    items: [
      { label: "Reception / Lobby", deptId: "RCP" },
      { label: "Emergency Room (ER)", deptId: "ER" },
      { label: "Hospital Pharmacy", deptId: "PHR" }
    ]
  }
];

export function HospitalMapMock() {
  const [active, setActive] = useState<Dept>(departments[0]);
  const [selectedFloorTab, setSelectedFloorTab] = useState<number>(1);

  // Translate percentages to SVG viewBox coordinates (800x500 grid)
  const svgPathData = useMemo(() => {
    const coords = active.pathX.map((x, i) => {
      const px = (x / 100) * 800;
      const py = (active.pathY[i] / 100) * 500;
      return `${i === 0 ? "M" : "L"} ${px} ${py}`;
    });
    return coords.join(" ");
  }, [active]);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6">
      
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <MapPinned size={18} className="text-cyan-300 animate-pulse" />
            Holographic Hospital Map & Directory
          </div>
          <p className="mt-1 text-sm text-white/55">
            Real-time interactive navigation detailing floor maps, lifts, stairs, and clinical OPD rooms.
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Navigation size={13} className="animate-spin" style={{ animationDuration: "3s" }} />
          Holo-Nav Active
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        
        {/* Holographic SVG floor map grid */}
        <div className="relative w-full aspect-[1.6] overflow-hidden rounded-[24px] border border-white/10 bg-[#040915] shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
          
          {/* Neon grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Schematic hallways/rooms in SVG coordinate system */}
            <g opacity="0.35">
              <rect x="50" y="50" width="120" height="120" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
              <rect x="220" y="50" width="140" height="120" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
              <rect x="520" y="50" width="220" height="140" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
              <rect x="580" y="280" width="160" height="160" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
              <rect x="80" y="320" width="160" height="130" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.01)" />

              {/* Central corridor paths */}
              <line x1="400" y1="450" x2="400" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="120" y1="250" x2="680" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="120" y1="110" x2="120" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="280" y1="110" x2="280" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="600" y1="110" x2="600" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="656" y1="360" x2="656" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
              <line x1="176" y1="380" x2="176" y2="250" stroke="rgba(6,182,212,0.15)" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* Glowing CENTRAL LIFT CORE A at center x=400, y=250 */}
            <g>
              <rect x="365" y="220" width="70" height="60" rx="8" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" style={{ filter: "url(#glow)" }} />
              <circle cx="400" cy="250" r="13" fill="rgba(0,0,0,0.75)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
              {/* Elevator Up/Down triangles */}
              <polygon points="400,242 395,248 405,248" fill="#a78bfa" />
              <polygon points="400,258 395,252 405,252" fill="#a78bfa" />
              
              <rect x="350" y="195" width="100" height="15" rx="4" fill="rgba(0,0,0,0.85)" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
              <text x="400" y="206" textAnchor="middle" fill="#c084fc" fontSize="7.5" fontWeight="black" letterSpacing="0.8" fontFamily="sans-serif">
                LIFT CORE A
              </text>
            </g>

            {/* Glowing STAIRS CORE B at right-side intersection x=600, y=250 */}
            <g>
              <rect x="575" y="220" width="50" height="60" rx="8" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" style={{ filter: "url(#glow)" }} />
              <circle cx="600" cy="250" r="13" fill="rgba(0,0,0,0.75)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
              {/* Stairs symbol: stepped diagonal lines */}
              <path d="M 593 256 L 597 256 L 597 252 L 601 252 L 601 248 L 605 248 L 605 244 L 608 244" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              <rect x="560" y="195" width="80" height="15" rx="4" fill="rgba(0,0,0,0.85)" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
              <text x="600" y="206" textAnchor="middle" fill="#22d3ee" fontSize="7.5" fontWeight="black" letterSpacing="0.8" fontFamily="sans-serif">
                STAIRS B
              </text>
            </g>

            {/* Glowing route lines */}
            <motion.path
              d={svgPathData}
              stroke="url(#routeGlow)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="drop-shadow-[0_0_12px_rgba(6,182,212,0.85)]"
            />
            <path
              d={svgPathData}
              stroke="#22d3ee"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="15, 30"
              className="opacity-70"
              style={{
                animation: "cc-dash-flow 2s linear infinite",
              }}
            />

            {/* Looping tracking blue coordinate locator dot */}
            <motion.circle
              key={active.id}
              animate={{
                cx: active.pathX.map((x) => (x / 100) * 800),
                cy: active.pathY.map((y) => (y / 100) * 500),
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              r="7"
              fill="#22d3ee"
              stroke="#fff"
              strokeWidth="2"
              style={{ filter: "url(#glow)" }}
            />

            {/* Pulse "YOU ARE HERE" reception anchor */}
            <g>
              <circle cx="400" cy="450" r="6" fill="#22d3ee" stroke="#fff" strokeWidth="1.5" />
              <circle cx="400" cy="450" r="14" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: "400px 450px" }} />
              <rect x="340" y="470" width="120" height="18" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x="400" y="482" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="black" letterSpacing="1" fontFamily="sans-serif">
                RECEPTION (YOU)
              </text>
            </g>

            {/* Interactive Department Indicator circles + labels inside SVG (exclude static reception) */}
            {departments.filter(dept => dept.id !== "RCP").map((dept) => {
              const isSelected = active.id === dept.id;
              const px = (dept.x / 100) * 800;
              const py = (dept.y / 100) * 500;
              
              return (
                <g
                  key={dept.id}
                  onClick={() => {
                    setActive(dept);
                    setSelectedFloorTab(dept.floor);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Outer selection glow ring */}
                  {isSelected && (
                    <circle
                      cx={px}
                      cy={py}
                      r="14"
                      fill="transparent"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      className="animate-ping"
                      style={{ transformOrigin: `${px}px ${py}px` }}
                    />
                  )}
                  {/* Main Node Dot */}
                  <circle
                    cx={px}
                    cy={py}
                    r="8.5"
                    className={`transition-all duration-300 ${
                      isSelected
                        ? "fill-cyan-400 stroke-cyan-100"
                        : dept.tone === "rose"
                          ? "fill-rose-500 stroke-rose-300 hover:fill-rose-400"
                          : dept.tone === "emerald"
                            ? "fill-emerald-500 stroke-emerald-300 hover:fill-emerald-400"
                            : dept.tone === "amber"
                              ? "fill-amber-500 stroke-amber-300 hover:fill-amber-400"
                              : dept.tone === "violet"
                                ? "fill-violet-500 stroke-violet-300 hover:fill-violet-400"
                                : "fill-cyan-500 stroke-cyan-300 hover:fill-cyan-400"
                    }`}
                    strokeWidth="1.5"
                    style={{ filter: isSelected ? "url(#glow)" : undefined }}
                  />
                  {/* Pill label Background */}
                  <rect
                    x={px - 22}
                    y={py + 13}
                    width="44"
                    height="18"
                    rx="9"
                    fill="rgba(0,0,0,0.8)"
                    stroke={isSelected ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.15)"}
                    strokeWidth="1"
                  />
                  {/* Pill text */}
                  <text
                    x={px}
                    y={py + 25}
                    textAnchor="middle"
                    fill={isSelected ? "#22d3ee" : "#ffffff"}
                    fontSize="9.5"
                    fontWeight="black"
                    fontFamily="sans-serif"
                    letterSpacing="0.5"
                  >
                    {dept.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right side: Navigation telemetry cards */}
        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Compass size={16} className="text-cyan-300" />
              Navigation Telemetry
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Target Destination</div>
              <h3 className="text-2xl font-black text-white mt-1">{active.label}</h3>
              <p className="mt-1.5 text-xs text-white/50">{active.traffic}</p>
            </div>

            {/* Custom high-tech ETA display - Responsive stack */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                  <Clock size={11} className="text-cyan-300" />
                  Est. walking
                </div>
                <div className="mt-1.5 text-xl font-black text-cyan-200">{active.eta}</div>
              </div>

              <div className="flex-1 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                  <Layers size={11} className="text-violet-300" />
                  Location Level
                </div>
                <div className="mt-1.5 text-xl font-black text-violet-200">Floor {active.floor}</div>
              </div>
            </div>

            {/* Lift & Stairs Live Status Panels */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-purple-500/15 bg-purple-950/10 p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-purple-300">LIFT CORE A</div>
                  <div className="text-xs font-black text-white mt-0.5">Floor 1 ↔ 3</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/15 bg-cyan-950/10 p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-cyan-300">STAIRS B</div>
                  <div className="text-xs font-black text-white mt-0.5">All Floors</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase text-cyan-400">CLEAR</span>
                </div>
              </div>
            </div>

            {/* Lift and floor transition detail panel */}
            <div className="mt-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
                <ArrowUpDown size={12} className="animate-bounce" />
                Transit Guidance
              </div>
              <p className="mt-2 text-xs leading-5 text-purple-200/80">
                {active.levelInstructions}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/5 bg-black/35 p-3 text-xs leading-5 text-white/60">
            Holographic router selects optimized indoor routing vectors based on live elevator occupancy and stairs traffic.
          </div>
        </div>
      </div>

      {/* Directory & Floors collapsing section */}
      <div className="mt-5 border-t border-white/5 pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Layers size={15} className="text-violet-300" />
          Smart Hospital Floor Directory (Click to Navigate)
        </div>
        
        {/* Floor selector tabs */}
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/25 p-1 max-w-sm">
          {[1, 2, 3].map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setSelectedFloorTab(fl)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                selectedFloorTab === fl
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        {/* Directory information display */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {floorDirectory.map((dir) => {
            const isTabActive = selectedFloorTab === dir.floor;
            return (
              <div
                key={dir.floor}
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isTabActive
                    ? "border-violet-500/30 bg-violet-500/5 shadow-[0_10px_30px_rgba(139,92,246,0.05)]"
                    : "border-white/5 bg-white/5 opacity-40"
                }`}
              >
                <div className="text-xs font-bold text-white mb-2">{dir.name}</div>
                <ul className="space-y-1.5">
                  {dir.items.map((item) => {
                    const isDeptActive = active.id === item.deptId;
                    return (
                      <li key={item.deptId}>
                        <button
                          type="button"
                          onClick={() => {
                            const targetDept = departments.find((d) => d.id === item.deptId);
                            if (targetDept) {
                              setActive(targetDept);
                              setSelectedFloorTab(targetDept.floor);
                            }
                          }}
                          className={`w-full flex items-center gap-1.5 text-left text-xs transition duration-200 ${
                            isDeptActive
                              ? "text-cyan-300 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                              : "text-white/60 hover:text-white/95"
                          }`}
                        >
                          <ChevronRight 
                            size={10} 
                            className={`transition-colors duration-200 ${
                              isDeptActive ? "text-cyan-300" : "text-violet-400"
                            }`} 
                          />
                          <span>{item.label}</span>
                          {isDeptActive && (
                            <Sparkles size={8} className="text-cyan-300 animate-pulse ml-auto" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

