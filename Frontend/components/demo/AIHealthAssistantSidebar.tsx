"use client";

import React, { useState } from "react";
import { Sparkles, X, MessageSquare, ShieldCheck, Heart, AlertCircle, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AIHealthAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [queryResponse, setQueryResponse] = useState<string | null>(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

  const suggestionChips = [
    { label: "Explain low hemoglobin", response: "Your Hemoglobin is at 13.8 g/dL, which is slightly below the target optimal range of 14.0-16.0 g/dL for your profile. This represents minor iron binding depletion, typically addressed by adjusting dietary intake (spinach, iron-rich meals) or routine clinical follow-ups." },
    { label: "Review hydration schedule", response: "You have consumed 2.4L out of your 3.0L target. To stabilize electrolyte levels during the current shift, we recommend drinking 300ml of fluids within the next 45 minutes to keep vital syncs at 90%+ efficiency." },
    { label: "Get floor directory", response: "CareCircle Smart Hospital Floor Directory:\n\n• Floor 1 (Ground Floor):\n  - Main Reception & Information Lobby (Direct ground entry)\n  - Emergency Room (ER) (High priority triage wing)\n  - Hospital Pharmacy (Near lobby exit for prescription pick-up)\n\n• Floor 2 (Second Floor):\n  - Outpatient Desk (OPD) / Main Clinics (Suites 201-205)\n  - Diagnostic Pathology Lab (Fast results portal)\n  - Radiology & MRI Imaging Bay (Eastern corridor)\n  - Transit: Accessible via central LIFT Core A or eastern STAIRS B.\n\n• Floor 3 (Third Floor - Restricted Access):\n  - Patient Ward C (Inpatient monitoring suites)\n  - Cardiothoracic ICU (Restricted ICU airlock)\n  - Surgical Prep Room 3B (Sterile zone)\n  - Transit: Central LIFT Core A recommended. STAIRS B requires biometric clearance." },
    { label: "Find OPD & Clinics", response: "The Outpatient Department (OPD) is located on Floor 2. To get there from the Main Reception on Floor 1:\n\n1. Walk down the central corridor toward the LIFT CORE A intersection (about 15 meters).\n2. Take either LIFT Core A or STAIRS B (directly to your right at the eastern hallway) up to Floor 2.\n3. Turn left when exiting the lift/stairs to reach the OPD desks. The clinics are grouped by specialty (Cardiology is immediate right, general medicine straight ahead)." },
    { label: "Where are Lifts & Stairs?", response: "We have two primary vertical transport cores connecting the hospital floors:\n\n• LIFT CORE A (Central Elevators):\n  - Located exactly at the center of the main horizontal corridor.\n  - Connects Floor 1 (Ground), Floor 2 (Diagnostics/OPD), and Floor 3 (Wards/ICU).\n  - Best option for wheelchairs, patients, and ward transitions.\n\n• STAIRS CORE B (Alternative Stairwells):\n  - Located at the right-side wing intersection (eastern corridor).\n  - Provides quick access between Floor 1 and Floor 2.\n  - Floor 3 access via Stairs B is restricted to emergency personnel and credentials only." },
  ];

  function handleQuery(chip: { label: string; response: string }) {
    setActiveQuery(chip.label);
    setLoadingResponse(true);
    setQueryResponse(null);
    
    setTimeout(() => {
      setLoadingResponse(false);
      setQueryResponse(chip.response);
    }, 900);
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/30 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.55)] cursor-pointer"
        >
          {/* Pulsing glow ring */}
          <span className="absolute inset-0 rounded-full border-2 border-cyan-300/40 animate-ping opacity-60" />
          <Bot className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </motion.button>
      </div>

      {/* Sidebar Panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop dark blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed right-0 top-0 z-[150] h-full w-full max-w-md border-l border-white/10 bg-[#050812]/85 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-y-auto flex flex-col justify-between text-white"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">Healthcare Copilot</div>
                      <h2 className="text-lg font-black text-white">CareCircle AI Assistant</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white transition duration-200"
                    aria-label="Close assistant sidebar"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* AI Status summary */}
                <div className="mt-5 rounded-2xl border border-cyan-500/15 bg-cyan-950/10 p-4 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
                    <ShieldCheck size={14} />
                    Biometrics verified
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Hi Alex, I am active and continuously indexing your hospital telemetry. {"I've"} analyzed your latest clinic records and laboratory reports.
                  </p>
                </div>

                {/* Copilot Insights Feed */}
                <div className="mt-6 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Personal Quick Insights</div>
                  
                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-white/5 bg-white/5 p-4 flex gap-3">
                      <Heart className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">Cardiac Activity</div>
                        <p className="mt-1 text-xs leading-5 text-white/60">
                          Autonomic balance HRV is excellent. Resting rate stabilized at 72 bpm.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/5 bg-white/5 p-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">Vitals Anomaly</div>
                        <p className="mt-1 text-xs leading-5 text-white/60">
                          Hemoglobin is slightly lower than normal ranges. Track dietary iron.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestion Chips */}
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Ask AI Assistant</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestionChips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleQuery(chip)}
                        className={`text-left rounded-xl border px-3 py-2 text-xs font-medium transition duration-200 cursor-pointer ${
                          activeQuery === chip.label
                            ? "border-violet-400 bg-violet-500/10 text-violet-200"
                            : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Micro conversational dialog box */}
                <div className="mt-5">
                  <AnimatePresence mode="wait">
                    {activeQuery && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider">
                          <MessageSquare size={13} />
                          Query: {activeQuery}
                        </div>
                        <div className="mt-2.5 text-xs leading-6 text-white/80 min-h-12 flex items-center">
                          {loadingResponse ? (
                            <span className="flex items-center gap-2 text-white/45">
                              <Loader2 size={14} className="animate-spin text-violet-400" />
                              Compiling clinical database...
                            </span>
                          ) : (
                            queryResponse
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Secure lock metadata footer */}
              <div className="mt-6 border-t border-white/5 pt-4 text-center">
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  HIPAA Secured & Cryptographically Shielded
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
