"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  MapPinned,
  Sparkles,
  Stethoscope,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";

const roles = [
  { label: "Patient", href: "/dashboard/patient", icon: UserRound },
  { label: "Staff", href: "/dashboard/staff", icon: Users },
  { label: "Doctor", href: "/dashboard/doctor", icon: Stethoscope },
  { label: "Admin", href: "/dashboard/admin", icon: UserCog },
];

const tourSteps = [
  {
    title: "1. Patient queue",
    detail: "Watch the patient dashboard queue card update with live tokens and priority badges.",
    href: "/dashboard/patient",
    icon: ClipboardList,
  },
  {
    title: "2. Emergency SOS",
    detail: "Trigger the emergency flow, select symptoms, and show the dispatch state.",
    href: "/dashboard/patient/emergency",
    icon: Bell,
  },
  {
    title: "3. Staff command desk",
    detail: "Call patients, complete ward tasks, and use frontend-only quick actions.",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    title: "4. Admin operations",
    detail: "Review system metrics, queue state, alerts, and mock control actions.",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "5. Hospital map",
    detail: "Use the patient dashboard map to explain department routing and room status.",
    href: "/dashboard/patient",
    icon: MapPinned,
  },
];

function isDashboard(pathname: string) {
  return pathname.startsWith("/dashboard");
}

export function DemoCommandCenter() {
  const pathname = usePathname();
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [tourOpen, setTourOpen] = React.useState(false);

  if (!isDashboard(pathname)) return null;

  const notifications = [
    ...toastQueue.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.message ?? "Realtime notification.",
      tone: item.tone ?? "cyan",
    })),
    ...feedItems.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      tone: item.tone ?? "cyan",
    })),
  ].slice(0, 8);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[120] flex w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 items-center justify-between gap-2 rounded-[22px] border border-white/10 bg-black/75 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:bottom-5">
        <div className="hidden items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 sm:flex">
          <Sparkles size={14} />
          Frontend demo
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = pathname === role.href;
            return (
              <Link
                key={role.href}
                href={role.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {role.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setTourOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15"
        >
          <Sparkles size={14} />
          Tour
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/15"
        >
          <Bell size={14} />
          Alerts
          {notifications.length ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
              {notifications.length}
            </span>
          ) : null}
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[140] bg-black/55 backdrop-blur-sm">
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-[#050812] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Notification drawer</div>
                <h2 className="mt-1 text-2xl font-black text-white">Live hospital events</h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
                aria-label="Close notification drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {notifications.length ? (
                notifications.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-white/60">{item.detail}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Waiting for simulated events.
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      {tourOpen ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#050812] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Guided demo mode</div>
                <h2 className="mt-1 text-2xl font-black text-white">Presentation flow</h2>
              </div>
              <button
                type="button"
                onClick={() => setTourOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
                aria-label="Close demo tour"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {tourSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.title}
                    href={step.href}
                    onClick={() => setTourOpen(false)}
                    className="group rounded-[22px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/25 hover:bg-cyan-400/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white">{step.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-white/60">{step.detail}</span>
                      </span>
                      <ChevronRight size={17} className="mt-2 text-white/35 transition group-hover:text-cyan-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
