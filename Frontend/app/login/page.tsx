import React from "react";
import Link from "next/link";
import { Activity, Building2, ChevronRight, Database, Fingerprint, ShieldAlert, Sparkles, Users } from "lucide-react";
import { MotionCard, MotionPage, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";

const portals = [
  {
    href: "/login/patient",
    title: "Patient Login",
    description:
      "Access your medical history, check lab results, and interact with your personal AI health assistant securely.",
    features: [
      { icon: Database, label: "Medical records access" },
      { icon: Activity, label: "AI assistant preview" },
      { icon: Fingerprint, label: "Biometric authentication" },
    ],
    toneClass: "cc-login-patient",
    accent: "Patient-first secure access",
    icon: Fingerprint,
  },
  {
    href: "/login/hospital",
    title: "Hospital Portal",
    description:
      "Centralized command center for medical staff, doctors, and hospital administrators.",
    features: [
      { icon: Building2, label: "Hospital dashboard" },
      { icon: Users, label: "Staff & resource management" },
      { icon: ShieldAlert, label: "Emergency system preview" },
    ],
    toneClass: "cc-login-hospital",
    accent: "Operations control center",
    icon: Building2,
  },
] as const;

export default function LoginPage() {
  return (
    <MotionPage className="cc-login-container">
      <div className="cc-login-bg" aria-hidden="true">
        <div className="cc-orb cc-orb-blue" />
        <div className="cc-orb cc-orb-red" />
      </div>

      <MotionStagger className="relative z-10 w-full">
        <div className="cc-container flex min-h-screen flex-col justify-center py-12">
          <MotionStaggerItem className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300 backdrop-blur-xl">
              <Sparkles size={14} />
              Smart Hospital Access Gateway
            </div>

            <h1 className="cc-h1">
              Choose Your <span className="cc-text-gradient-accent">Portal</span>
            </h1>

            <p className="cc-subtitle mt-5 max-w-2xl">
              Select your destination to access the CareCircle ecosystem with futuristic healthcare-grade security and realtime intelligence.
            </p>
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 place-items-stretch max-w-5xl mx-auto w-full">
            {portals.map((portal) => {
              const Icon = portal.icon;

              return (
                <MotionCard key={portal.href} className={`cc-login-card ${portal.toneClass}`}>
                  <Link href={portal.href} className="flex h-full flex-col gap-5 text-left no-underline">
                    <div className="flex items-start justify-between gap-4">
                      <div className="cc-login-icon-box">
                        <Icon size={32} />
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                        {portal.accent}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-black tracking-tight text-white sm:text-[1.85rem]">{portal.title}</h2>
                      <p className="text-sm leading-6 text-white/62 sm:text-[0.98rem]">{portal.description}</p>
                    </div>

                    <ul className="cc-login-features">
                      {portal.features.map((feature) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <li key={feature.label}>
                            <FeatureIcon size={16} />
                            <span>{feature.label}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold">
                      <span className={portal.toneClass === "cc-login-hospital" ? "text-rose-300" : "text-cyan-300"}>
                        Enter Portal
                      </span>
                      <ChevronRight size={18} className={portal.toneClass === "cc-login-hospital" ? "text-rose-300" : "text-cyan-300"} />
                    </div>
                  </Link>
                </MotionCard>
              );
            })}
          </MotionStaggerItem>

          <MotionStaggerItem className="mx-auto mt-8 max-w-2xl">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-center text-sm leading-6 text-white/62 backdrop-blur-2xl sm:p-6">
              Built for a premium healthcare startup experience with glassmorphism, live telemetry styling, and mobile-first interaction targets.
            </div>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
