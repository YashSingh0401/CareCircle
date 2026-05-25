"use client";

import React from "react";
import { useRealtimeSimulatorStore } from "./realtimeSimulatorStore";

export default function RealtimeSimulatorDriver() {
  const now = useRealtimeSimulatorStore((s) => s.now);
  const isRunning = useRealtimeSimulatorStore((s) => s.isRunning);
  const tickMs = useRealtimeSimulatorStore((s) => s.config.tickMs);

  const [mounted, setMounted] = React.useState(false);

  // Mounted flag used only to ensure interval starts on client.
  React.useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);




  React.useEffect(() => {
    if (!mounted) return;
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      useRealtimeSimulatorStore.setState((prev) => {
        const nextNow = new Date();

        // --- Queue ---
        const liveQueue = prev.liveQueue.map((q) => ({ ...q }));
        if (liveQueue.length > 0) {
          // wait time tick (believable drift)
          liveQueue.forEach((it) => {
            const m = Number.isFinite(parseInt(it.wait.replace("m", ""), 10))
              ? parseInt(it.wait.replace("m", ""), 10)
              : 0;
            const delta = it.status === "priority" ? 0 : 1;
            const bumped = Math.max(0, m + delta);
            it.wait = `${bumped.toString().padStart(2, "0")}m`.replace(/^0(?!$)/, "0");
          });

          const rnd = Math.random();

          // move queue head occasionally
          if (rnd > 0.62) {
            const head = liveQueue.shift()!;
            const canBeCalled = head.status !== "called";
            head.status = canBeCalled ? (head.status === "waiting" ? "called" : "waiting") : "waiting";
            liveQueue.push(head);
          }

          // ensure at most one called token
          const calledIdx = liveQueue.findIndex((x) => x.status === "called");
          if (calledIdx !== -1 && Math.random() > 0.82) {
            // called -> waiting after consultation pulse completes
            liveQueue[calledIdx].status = "waiting";
          } else if (calledIdx === -1 && Math.random() > 0.5) {
            // promote one to called
            const promoteIdx = Math.floor(Math.random() * liveQueue.length);
            liveQueue[promoteIdx].status = "called";
          }
        }

        // --- Doctors ---
        const liveDoctors = prev.liveDoctors.map((d) => ({ ...d }));
        if (liveDoctors.length > 0) {
          const idx = Math.floor(Math.random() * liveDoctors.length);
          const r = Math.random();
          if (r > 0.66) {
            liveDoctors[idx].state =
              liveDoctors[idx].state === "available"
                ? "busy"
                : liveDoctors[idx].state === "busy"
                  ? "delayed"
                  : "available";
          }
          const consultDelta = r > 0.55 ? 1 : r < 0.2 ? -1 : 0;
          liveDoctors[idx].consults = Math.max(0, liveDoctors[idx].consults + consultDelta);

          // active consultation pulse: if busy, set/advance a consult
          liveDoctors.forEach((d) => {
            if (d.state === "busy") {
              if (!d.activeConsult) {
                d.activeConsult = {
                  patient: pickPatientNameFromQueue(prev.liveQueue),
                  elapsedSec: 0,
                };
              }
              if (d.activeConsult) d.activeConsult.elapsedSec += Math.max(1, Math.floor(tickMs / 1000));
            } else {
              d.activeConsult = undefined;
            }
          });
        }

        // --- Emergencies ---
        const liveEmergencies = prev.liveEmergencies.map((e) => ({ ...e }));
        let emergencyPulseOn = prev.emergencyPulseOn;
        if (liveEmergencies.length > 0) {
          // blinking state toggles mostly with critical emergencies
          emergencyPulseOn = liveEmergencies.some((e) => e.priority === "critical");

          const idx = Math.floor(Math.random() * liveEmergencies.length);
          const r = Math.random();
          if (r > 0.65) {
            if (liveEmergencies[idx].priority !== "critical") liveEmergencies[idx].priority = "critical";
            liveEmergencies[idx].status = "Rapid response updating triage plan";
          } else if (r < 0.25) {
            liveEmergencies[idx].status = "Monitoring—no immediate escalation";
            if (liveEmergencies[idx].priority === "critical") liveEmergencies[idx].priority = "high";
          } else {
            // normal status drift
            const statuses = [
              "Nurse response acknowledged",
              "Doctor assigned, awaiting room",
              "Telemetry streaming to triage desk",
              "Nurse check in progress",
            ];
            liveEmergencies[idx].status = statuses[Math.floor(Math.random() * statuses.length)];
          }
        }

        // --- Feed + toast queue ---
        const feedItem = generateFeedItem(nextNow, liveQueue, liveEmergencies, liveDoctors);
        const feedItems = [feedItem, ...prev.feedItems].slice(0, 8);

        // Convert some feed items to toast events
        const shouldToast = Math.random() > 0.35;
        const toastQueue = shouldToast
          ? [{ id: rndId("toast"), title: feedItem.title, message: feedItem.detail, tone: mapTone(feedItem) }, ...prev.toastQueue].slice(0, 5)
          : prev.toastQueue;

        return {
          ...prev,
          now: nextNow,
          liveQueue,
          liveDoctors,
          liveEmergencies,
          emergencyPulseOn,
          feedItems,
          toastQueue,
        };
      });
    }, tickMs);

    return () => window.clearInterval(interval);
  }, [isRunning, mounted, tickMs]);

  return null;
}

function rndId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickPatientNameFromQueue(queue: { patient: string }[]) {
  if (!queue || queue.length === 0) return "Patient";
  return queue[Math.floor(Math.random() * queue.length)].patient;
}

function mapTone(feedItem: { tone?: "cyan" | "emerald" | "rose" | "amber" }) {
  return feedItem.tone ?? "cyan";
}

function generateFeedItem(
  now: Date,
  liveQueue: { patient: string; token: string; status: string }[],
  liveEmergencies: { priority: string; title: string }[],
  liveDoctors: { state: string; name: string; specialty: string; consults: number }[]
) {
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;

  const roll = Math.random();
  if (liveEmergencies.some((e) => e.priority === "critical") && roll > 0.6) {
    const e = pick(liveEmergencies);
    return {
      id: rndId("feed"),
      time,
      title: "Emergency event",
      detail: `${e.title} escalated—nurse response updating triage plan.`,
      tone: "rose" as const,
    };
  }

  if (roll > 0.42 && liveQueue.length) {
    const q = pick(liveQueue);
    const tone = q.status === "called" ? ("emerald" as const) : ("cyan" as const);
    return {
      id: rndId("feed"),
      time,
      title: "Queue movement",
      detail: `Token ${q.token} (${q.patient}) moved. Consultation state changed in real time.`,
      tone,
    };
  }

  const d = pick(liveDoctors);
  const tone = d.state === "delayed" ? ("amber" as const) : d.state === "busy" ? ("rose" as const) : ("emerald" as const);
  return {
    id: rndId("feed"),
    time,
    title: "Hospital system update",
    detail: `Doctor schedule ${d.state}. Active consult load is now ${d.consults} stream(s) on ${d.specialty}.`,
    tone,
  };
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

