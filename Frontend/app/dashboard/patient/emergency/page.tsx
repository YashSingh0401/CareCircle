"use client";

import React from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BellRing,
  Flame,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  Siren,
  Skull,
  SquareCheckBig,
  TriangleAlert,
  UserRound,
  Waves,
} from "lucide-react";
import {
  MotionCard,
  MotionPage,
  MotionStagger,
  MotionStaggerItem,
  MotionPulseDot,
  emergencyMotion,
} from "@/components/motion/carecircle-motion";


const symptoms = [
  "Chest pain",
  "Breathing difficulty",
  "Fainting",
  "Severe bleeding",
];

const emergencyStatuses = [
  {
    label: "Nurse alert status",
    value: "Nurse alerted",
    detail: "Emergency team is acknowledging your request right now.",
    tone: "emerald",
  },
  {
    label: "Queue priority",
    value: "Priority #1",
    detail: "You have been moved to the front of the emergency queue.",
    tone: "rose",
  },
  {
    label: "Contact notification",
    value: "Contacts notified",
    detail: "Emergency contacts received your alert and location context.",
    tone: "amber",
  },
];

export default function EmergencyAssistancePage() {
  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,51,0.26),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(255,60,92,0.22),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(120,0,20,0.35),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <MotionStaggerItem className="mb-4 flex items-center justify-between">
            <Link
              href="/dashboard/patient"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 backdrop-blur-xl transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">
              <Siren size={14} />
              Emergency mode
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <header className="rounded-[30px] border border-rose-400/15 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                  <TriangleAlert size={14} />
                  Smart Emergency Assistance
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-6xl">
                    Emergency{" "}
                    <span className="bg-gradient-to-r from-rose-300 to-red-500 bg-clip-text text-transparent">
                      Response
                    </span>
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                    Send a critical alert, mark symptoms, and trigger the fastest response path available in the hospital network.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <SquareCheckBig size={13} />
                    Nurse standing by
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    <Flame size={13} />
                    Queue escalated
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/20 blur-3xl" />
                <button
                  className="relative flex h-52 w-52 items-center justify-center rounded-full border-4 border-rose-400/45 bg-[radial-gradient(circle,#ff4d6d_0%,#bb102d_55%,#5d0716_100%)] text-white shadow-[0_0_50px_rgba(255,0,51,0.65)] transition hover:scale-105 active:scale-95 sm:h-60 sm:w-60"
                  style={{ borderColor: "rgba(255,59,95,0.8)" }}
                  aria-label="Emergency SOS"
                >
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: "0 0 28px rgba(255,59,95,0.35)",
                    }}
                  />

                  {/* Pulse halo */}
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: "cc-sos-pulse 1.2s ease-in-out infinite",
                    }}
                  />

                  <span className="absolute inset-0 rounded-full border border-rose-300/35" style={{ animation: "cc-sos-blink 1.05s ease-in-out infinite" }} />
                  <span className="absolute inset-3 rounded-full border border-white/10" />

                  <span className="relative flex flex-col items-center gap-3 text-center">
                    <Siren size={44} />
                    <span className="text-2xl font-black uppercase tracking-[0.35em] sm:text-3xl">SOS</span>
                <span className="max-w-[11rem] text-[11px] uppercase tracking-[0.22em] text-white/80">
                      Hold for 3 seconds to dispatch help
                    </span>
                  </span>
                </button>




              </div>
            </div>
            </header>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <main className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:col-span-7 lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <HeartPulse size={18} className="text-rose-300" />
                  Symptom selector
                </div>
                <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                  Urgent triage
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-black/25 px-4 py-4 text-left transition hover:border-rose-400/35 hover:bg-rose-400/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
                        <TriangleAlert size={18} />
                      </span>
                      <span className="text-sm font-semibold text-white">{symptom}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 transition group-hover:text-rose-300">
                      Select
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-rose-400/15 bg-rose-400/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                  <BellRing size={15} />
                  Live emergency status
                </div>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Your alert is being streamed to the nursing desk, triage station, and rapid response coordinator.
                </p>
              </div>
            </section>

            <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:col-span-5 lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <ShieldAlert size={18} className="text-amber-300" />
                  Emergency telemetry
                </div>
                <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                  Critical
                </span>
              </div>

              <div className="space-y-3">
                {emergencyStatuses.map((status) => {
                  const toneStyles =
                    status.tone === "emerald"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : status.tone === "amber"
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : "border-rose-400/20 bg-rose-400/10 text-rose-300";

                  return (
                    <div key={status.label} className={`rounded-[22px] border p-4 ${toneStyles}`}>
                      <div className="text-sm font-semibold uppercase tracking-[0.16em]">{status.label}</div>
                      <div className="mt-1 text-xl font-black text-white">{status.value}</div>
                      <div className="mt-2 text-sm leading-6 text-white/65">{status.detail}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:col-span-8 lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Waves size={18} className="text-rose-300" />
                  Emergency queue priority
                </div>
                <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                  Front of line
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
                  <div className="text-sm text-white/55">Queue position</div>
                  <div className="mt-2 text-4xl font-black text-rose-300">01</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">Highest priority</div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
                  <div className="text-sm text-white/55">Dispatch ETA</div>
                  <div className="mt-2 text-4xl font-black text-white">90s</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">Nurse en route</div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
                  <div className="text-sm text-white/55">Response state</div>
                  <div className="mt-2 text-2xl font-bold text-emerald-300">Active</div>
                  <div className="mt-2 text-sm text-white/60">Rapid response team notified</div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:col-span-4 lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <PhoneCall size={18} className="text-amber-300" />
                  Contacts notified
                </div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                  Sent
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="text-sm font-semibold text-emerald-300">Primary contact</div>
                  <div className="mt-1 text-base font-bold text-white">Notified successfully</div>
                  <div className="mt-1 text-sm text-white/65">SMS, app alert, and phone fallback enabled.</div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <UserRound size={14} className="text-amber-300" />
                    Secondary contact
                  </div>
                  <div className="mt-1 text-sm text-white/65">Notification queued with live location context.</div>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-rose-400/15 bg-rose-400/5 p-4 text-sm leading-6 text-white/70">
                In a real deployment, this screen would trigger emergency workflows, dispatch location data, and preserve an audit trail of every action.
              </div>
            </section>
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
