"use client";

export type MedicalReport = {
  id: string;
  patientId: string;
  reportName: string;
  uploadedAt: string;
  proof: string;
  findings?: string;
};

import { create } from "zustand";
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, Fingerprint, HeartPulse, Layers3 } from "lucide-react";

// Note: RealtimeSimulatorDriver mutates portions of state with functional setState updates.


export type QueueStatus = "waiting" | "priority" | "called";

export type QueueItem = {
  token: string;
  patient: string;
  wait: string; // e.g. "04m"
  status: QueueStatus;
};

export type EmergencyPriority = "critical" | "high" | "stable";

export type EmergencyCase = {
  title: string;
  room: string;
  priority: EmergencyPriority;
  status: string;
};

export type DoctorState = "available" | "busy" | "delayed";

export type DoctorRow = {
  name: string;
  specialty: string;
  state: DoctorState;
  consults: number;
  activeConsult?: {
    patient: string;
    elapsedSec: number;
  };
};

export type FeedItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  icon?: LucideIcon;
  tone?: "cyan" | "emerald" | "rose" | "amber";
};

export type ToastEvent = {
  id: string;
  title: string;
  message?: string;
  tone?: "cyan" | "emerald" | "rose" | "amber";
};

type SimulatorConfig = {
  tickMs: number;
};

const statusTones = {
  cyan: "cyan" as const,
  emerald: "emerald" as const,
  rose: "rose" as const,
  amber: "amber" as const,
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatFullTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function parseMinutes(wait: string) {
  const m = parseInt(wait.replace("m", ""), 10);
  return Number.isFinite(m) ? m : 0;
}

function rndId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const doctorNamesSeed: DoctorRow[] = [
  { name: "Dr. Sarah Chen", specialty: "Cardiology", state: "available", consults: 6 },
  { name: "Dr. Arjun Mehta", specialty: "Neurology", state: "busy", consults: 11 },
  { name: "Dr. Lina Gomez", specialty: "Pediatrics", state: "available", consults: 4 },
  { name: "Dr. Omar Khan", specialty: "Emergency", state: "delayed", consults: 8 },
];

const queueSeed: QueueItem[] = [
  { token: "A-204", patient: "Maya Patel", wait: "04m", status: "priority" },
  { token: "A-205", patient: "John Kim", wait: "09m", status: "waiting" },
  { token: "A-206", patient: "Leah Ortiz", wait: "12m", status: "waiting" },
  { token: "A-207", patient: "Ahmed Khan", wait: "00m", status: "called" },
];

const emergencySeed: EmergencyCase[] = [
  {
    title: "ER surge detected",
    room: "Emergency Bay 02",
    priority: "critical",
    status: "Rapid response en route",
  },
  {
    title: "Chest pain triage",
    room: "Triage Desk 01",
    priority: "high",
    status: "Doctor assigned, awaiting room",
  },
  {
    title: "Fall alert",
    room: "Ward 4C",
    priority: "stable",
    status: "Nurse check in progress",
  },
];

const feedIconPool: Array<{ icon?: LucideIcon; tone: "cyan" | "emerald" | "rose" | "amber" }> = [
  { icon: Layers3, tone: "cyan" },
  { icon: Fingerprint, tone: "emerald" },
  { icon: HeartPulse, tone: "rose" },
  { icon: Activity, tone: "amber" },
  { icon: AlertTriangle, tone: "rose" },
];

export type RealtimeSimulatorState = {
  // Clock
  now: Date;

  // Queue
  liveQueue: QueueItem[];

  // Doctors
  liveDoctors: DoctorRow[];

  // Emergencies
  liveEmergencies: EmergencyCase[];

  // Activity feed + toast queue
  feedItems: FeedItem[];
  toastQueue: ToastEvent[];

  // Derived
  emergencyPulseOn: boolean;

  // Control
  isRunning: boolean;
  start: () => void;
  stop: () => void;

  // Config
  config: SimulatorConfig;

  // Medical Reports
  reports: MedicalReport[];
  addReport: (report: MedicalReport) => void;

};

export const useRealtimeSimulatorStore = create<RealtimeSimulatorState>((set, get) => {
  return {
    now: new Date(),
    liveQueue: queueSeed,
    liveDoctors: doctorNamesSeed,
    liveEmergencies: emergencySeed,
    feedItems: [],
    toastQueue: [],
    emergencyPulseOn: false,
    isRunning: true,
    config: { tickMs: 2500 },

    start: () => set({ isRunning: true }),
    stop: () => set({ isRunning: false }),

    reports: [
      {
        id: "rep-1",
        patientId: "P-948271",
        reportName: "Discharge summary",
        uploadedAt: "Uploaded today",
        proof: "Medical certificate verified",
      },
      {
        id: "rep-2",
        patientId: "P-948271",
        reportName: "Lab report bundle",
        uploadedAt: "Uploaded May 18, 2026",
        proof: "Hospital stamped PDF attached",
      },
      {
        id: "rep-3",
        patientId: "P-948271",
        reportName: "Previous surgery notes",
        uploadedAt: "Uploaded May 02, 2026",
        proof: "Doctor-signed certificate attached",
      },
    ],
    addReport: (report) => set((s) => {
      const newToast = {
        id: "toast-" + Date.now(),
        title: "New Report Released",
        message: report.reportName + " has been compiled and secured under ledger.",
        tone: "emerald" as const,
      };
      const newFeed = {
        id: "feed-" + Date.now(),
        time: "Just now",
        title: "Report ledger synced",
        detail: report.reportName + " released for Patient ID " + report.patientId + ".",
        tone: "emerald" as const,
      };
      return {
        reports: [report, ...s.reports],
        toastQueue: [newToast, ...s.toastQueue],
        feedItems: [newFeed, ...s.feedItems],
      };
    }),
  };
});

// Simulation loop is attached in a separate client component hook
// to avoid multiple intervals per page.

export function createRealtimeTick(now: Date) {
  const hhmm = formatTime(now);

  const queueActions = [
    {
      title: "Queue updated",
      detail: "Token routing recalibrated by AI dispatch model.",
      tone: statusTones.cyan,
      icon: Layers3,
    },
    {
      title: "Patient moved",
      detail: "Transfer completed after triage clearance.",
      tone: statusTones.emerald,
      icon: HeartPulse,
    },
    {
      title: "Biometric check",
      detail: "Identity verification completed for new arrival.",
      tone: statusTones.emerald,
      icon: Fingerprint,
    },
    {
      title: "Doctor status",
      detail: "Consult load redistributed across active rooms.",
      tone: statusTones.amber,
      icon: Activity,
    },
  ];

  const emergencyActions = [
    {
      title: "Emergency escalation",
      detail: "Priority escalation propagated to ER lanes and on-call team.",
      tone: statusTones.rose,
      icon: AlertTriangle,
    },
    {
      title: "Nurse response",
      detail: "Nurse acknowledgment received. Response path recalculated.",
      tone: statusTones.emerald,
      icon: HeartPulse,
    },
    {
      title: "Rapid response updating",
      detail: "Triage plan refreshing with live vitals context.",
      tone: statusTones.rose,
      icon: AlertTriangle,
    },
  ];

  const systemActions = [
    {
      title: "Hospital system update",
      detail: "Shift health telemetry synchronized with control center.",
      tone: statusTones.cyan,
      icon: Layers3,
    },
    {
      title: "Doctor schedule delayed",
      detail: "One consultation stream delayed. Reassignment queued.",
      tone: statusTones.amber,
      icon: Activity,
    },
  ];

  return { hhmm, queueActions, emergencyActions, systemActions };
}

export function useRealtimeSimulatorDriver() {
  // This is implemented as a hook in a component-level driver.
  // Kept exported for convenience.
  return null;
}

