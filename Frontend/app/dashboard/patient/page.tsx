"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Brain,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Lock,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Siren,
  Stethoscope,
  UserRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  MotionCard,
  MotionPage,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
  emergencyMotion,
} from "@/components/motion/carecircle-motion";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import { RealtimePatientQueueWidget } from "@/app/dashboard/patient/queue/RealtimePatientQueueWidget";
import { AIReportAnalyzerMock } from "@/components/demo/AIReportAnalyzerMock";
import { HospitalMapMock } from "@/components/demo/HospitalMapMock";
import { PatientTimelineMock } from "@/components/demo/PatientTimelineMock";
import { AIHealthcareChatbot } from "@/components/demo/AIHealthcareChatbot";
import { SmartNotificationCenter } from "@/components/demo/SmartNotificationCenter";
import { HospitalActivityFeed } from "@/components/dashboard/HospitalActivityFeed";

const permanentHistoryItems = [
  {
    title: "Discharge summary",
    date: "Uploaded today",
    proof: "Medical certificate verified",
  },
  {
    title: "Lab report bundle",
    date: "Uploaded May 18, 2026",
    proof: "Hospital stamped PDF attached",
  },
  {
    title: "Previous surgery notes",
    date: "Uploaded May 02, 2026",
    proof: "Doctor-signed certificate attached",
  },
];

const careLabels = [
  "Biometric verified",
  "Queue synced live",
  "Emergency channel armed",
  "Doctor status streaming",
];

function doctorTone(state: string) {
  if (state === "busy") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  if (state === "available") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

export default function PatientDashboard() {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [homeStats, setHomeStats] = useState<{
    upcoming_appointments: number;
    total_records: number;
    active_queue_entry: any | null;
  } | null>(null);
  const liveDoctors = useAppStore((s) => s.liveDoctors);
  const reports = useAppStore((s) => s.reports);
  const patientReports = useMemo(() => reports.filter((r) => r.patientId === "P-948271"), [reports]);
  const liveEmergencies = useAppStore((s) => s.liveEmergencies);
  const toastQueue = useAppStore((s) => s.toastQueue);
  const liveQueue = useAppStore((s) => s.liveQueue);

  const criticalEmergencies = useMemo(
    () => liveEmergencies.filter((e) => e.priority === "critical"),
    [liveEmergencies],
  );
  const topDoctors = useMemo(() => liveDoctors.slice(0, 4), [liveDoctors]);
  const latestToasts = useMemo(() => toastQueue.slice(0, 4), [toastQueue]);

  const lastToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const latest = toastQueue[0];
    if (!latest || latest.id === lastToastIdRef.current) return;

    lastToastIdRef.current = latest.id;
    toast(latest.title, {
      description: latest.message,
      className: "border border-white/10 bg-black/90 text-white",
    });
  }, [toastQueue]);

  const emergencyCount = criticalEmergencies.length;
  const activeDoctorCount = liveDoctors.filter((doctor) => doctor.state !== "available").length;
  const queueCount = liveQueue.length;

  const fetchQueue = useAppStore((s) => s.fetchQueue);
  const fetchDoctors = useAppStore((s) => s.fetchDoctors);
  const fetchEmergencies = useAppStore((s) => s.fetchEmergencies);
  const fetchReports = useAppStore((s) => s.fetchReports);

  React.useEffect(() => {
    fetchDoctors && fetchDoctors();
    fetchEmergencies && fetchEmergencies();
    fetchQueue && fetchQueue("c4a78fcd-263d-4fcd-9347-ec8834e4f565");
    fetchReports && fetchReports();
  }, [fetchQueue, fetchDoctors, fetchEmergencies, fetchReports]);

  // ── Symptom Checker state ──
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState<{
    severity_score: number;
    predicted_conditions: string[];
    recommended_specialization: string;
    advice: string;
    seek_emergency: boolean;
  } | null>(null);

  async function handleSymptomCheck() {
    const parts = symptomInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      toast.error("Please enter at least one symptom");
      return;
    }
    setSymptomLoading(true);
    try {
      const userId = useAuthStore.getState().user?.id || "anonymous";
      const res = await api.post("/api/assistant/symptoms", {
        symptoms: parts,
        user_id: userId,
      });
      setSymptomResult(res.data);
    } catch (err) {
      console.error("Symptom check failed", err);
      toast.error("Symptom check failed. Please try again.");
    } finally {
      setSymptomLoading(false);
    }
  }

  // ── Find Doctors state ──
  const [doctorQuery, setDoctorQuery] = useState("");
  const [doctorSearchLoading, setDoctorSearchLoading] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<{
    doctors: any[];
    count: number;
    detected_specialization: string;
    ranking_method: string;
  } | null>(null);

  async function handleFindDoctors() {
    if (!doctorQuery.trim() && !symptomResult) {
      toast.error("Enter a search query or run the symptom checker first");
      return;
    }
    setDoctorSearchLoading(true);
    try {
      const symptomsFromChecker = symptomInput.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.post("/api/assistant/recommend-doctors", {
        symptoms: symptomsFromChecker.length > 0 ? symptomsFromChecker : [],
        query: doctorQuery.trim(),
        specialization: symptomResult?.recommended_specialization || "",
      });
      setRecommendedDoctors(res.data);
    } catch (err) {
      console.error("Doctor recommendation failed", err);
      toast.error("Doctor search failed. Please try again.");
    } finally {
      setDoctorSearchLoading(false);
    }
  }

  // ── Book Appointment state ──
  const [appointmentReason, setAppointmentReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  async function handleBookAppointment() {
    const patientId = useAuthStore.getState().user?.id || "patient-123";
    // Pick the first recommended doctor, or fall back to first live doctor
    const doctor = recommendedDoctors?.doctors?.[0] ?? null;
    const doctorId = doctor?.id || doctor?.doctor_id || "doctor-fallback";
    const hospitalId = doctor?.hospital_id || doctor?.hospital?.id || "hospital-fallback";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    setBookingLoading(true);
    try {
      await api.post("/api/appointments/", {
        patient_id: patientId,
        doctor_id: doctorId,
        hospital_id: hospitalId,
        appointment_date: dateStr,
        appointment_time: "10:00",
        reason: appointmentReason || "General consultation",
      });
      toast.success("Appointment booked successfully!", {
        description: `Scheduled for ${dateStr} at 10:00 with ${doctor?.name || doctor?.user_name || "your doctor"}.`,
      });
    } catch (err) {
      console.error("Appointment booking failed", err);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  // ── Active Vault Tab ──
  const [activeVaultTab, setActiveVaultTab] = useState<"reports" | "prescriptions">("reports");

  // ── Emergency Contacts State ──
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRel, setNewContactRel] = useState("");

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await api.get("/api/emergency-contacts/");
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error("Failed to fetch emergency contacts", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      await api.post("/api/emergency-contacts/", {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRel.trim() || null,
      });
      toast.success("Emergency contact added!");
      setNewContactName("");
      setNewContactPhone("");
      setNewContactRel("");
      fetchContacts();
    } catch (err) {
      console.error("Failed to add emergency contact", err);
      toast.error("Failed to add contact");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.delete(`/api/emergency-contacts/${contactId}`);
      toast.success("Contact deleted");
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact", err);
      toast.error("Failed to delete contact");
    }
  };

  // ── Prescription History State ──
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  const fetchPrescriptions = async () => {
    const userId = useAuthStore.getState().user?.id || "patient-123";
    setPrescriptionsLoading(true);
    try {
      const res = await api.get(`/api/records/patient/${userId}/prescriptions`);
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error("Failed to fetch prescriptions", err);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  useEffect(() => {
    api.get("/api/home/stats")
      .then((res) => setHomeStats(res.data))
      .catch((err) => console.error("Failed to fetch home stats", err));
    fetchContacts();
    fetchPrescriptions();
  }, []);

  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(121,40,202,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(255,0,51,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8 overflow-hidden">
          <MotionStaggerItem className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
              >
                <ArrowLeft size={16} />
                Exit dashboard
              </Link>

              <Link
                href="/dashboard/patient/emergency"
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-bold text-rose-300 backdrop-blur-xl transition hover:border-rose-400/60 hover:bg-rose-400/20 hover:text-rose-200 shadow-[0_0_20px_rgba(255,59,95,0.15)] hover:shadow-[0_0_30px_rgba(255,59,95,0.25)]"
              >
                <Siren size={16} className="animate-pulse" />
                Emergency SOS
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="relative inline-flex items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-400/20 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              >
                <Bell size={14} className="mr-1.5 animate-pulse" />
                Console Alerts
                {toastQueue.length + liveEmergencies.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-500 text-[9px] font-black text-white border border-slate-950">
                    {toastQueue.length + liveEmergencies.length}
                  </span>
                )}
              </button>

              <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:inline-flex">
                <Zap size={14} />
                AI sync active
              </div>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <header className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Sparkles size={14} />
                    Smart Hospital Patient Dashboard
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Welcome back,{" "}
                      <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                        Alex Morgan
                      </span>
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                      Your care journey is live, synchronized, and mirrored across queue ops,
                      emergency response, and doctor availability.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {careLabels.map((label) => (
                      <div
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-white/75"
                      >
                        <MotionPulseDot className="text-cyan-300" />
                        {label}
                      </div>
                    ))}
                  </div>

                  {homeStats && (
                    <div className="flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        📅 {homeStats.upcoming_appointments} upcoming appointment{homeStats.upcoming_appointments !== 1 ? "s" : ""}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        📋 {homeStats.total_records} medical record{homeStats.total_records !== 1 ? "s" : ""}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                        {homeStats.active_queue_entry ? "🟢 In queue" : "⚪ Not in queue"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/30 px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-cyan-400/30 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.25),rgba(0,0,0,0.15))] text-lg font-black text-cyan-200 shadow-[0_0_30px_rgba(0,240,255,0.18)]">
                        AM
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-cyan-400 text-[10px] text-black">
                        <CheckCircle2 size={12} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <UserRound size={15} className="text-cyan-300" />
                        P-948271
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                        <ShieldCheck size={12} />
                        Biometric verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <main className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 overflow-hidden">
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-white/5 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-8 lg:p-0 overflow-hidden min-h-[400px]">
                <div className="p-5 sm:p-6">
                  <RealtimePatientQueueWidget />
                </div>
              </MotionCard>

              <MotionCard
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-4 min-h-[280px] flex flex-col"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(255, 59, 95, 0.0)",
                    "0 0 24px rgba(255, 59, 95, 0.35)",
                    "0 0 0px rgba(255, 59, 95, 0.0)",
                  ],
                  borderColor: [
                    "rgba(251, 113, 133, 0.15)",
                    "rgba(255, 59, 95, 0.7)",
                    "rgba(251, 113, 133, 0.15)",
                  ],
                }}
                transition={emergencyMotion.emergencyBorder.transition}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(true)}
                    className="flex items-center gap-2 text-lg font-semibold text-left cursor-pointer group/bell"
                  >
                    <Bell size={18} className="text-violet-300 group-hover/bell:animate-bounce transition" />
                    <span>Notifications</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(true)}
                    className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300 cursor-pointer hover:bg-violet-400/20 transition"
                  >
                    Expand Drawer ({latestToasts.length} live)
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {latestToasts.map((item) => {
                    const colors =
                      item.tone === "amber"
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : item.tone === "rose"
                          ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                          : item.tone === "emerald"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

                    return (
                      <div key={item.id} className={`rounded-[20px] border p-4 ${colors}`}>
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-white/65">
                          {item.message ?? "Live notification."}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles size={15} className="text-cyan-300" />
                    Alert stream
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Popup alerts and toast notifications are mirrored from the hospital simulator
                    in real time.
                  </p>
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-rose-400/15 bg-rose-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6 min-h-[320px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <HeartPulse size={18} className="text-rose-300" />
                    Emergency activity
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                    <MotionPulseDot className="bg-rose-300" />
                    {emergencyCount} critical
                  </div>
                </div>

                <div className="grid gap-3">
                  {liveEmergencies.map((item) => {
                    const tone =
                      item.priority === "critical"
                        ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                        : item.priority === "high"
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

                    return (
                      <div key={item.title} className={`rounded-[22px] border p-4 ${tone}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            <div className="mt-1 text-sm text-white/55">{item.room}</div>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/75">
                            <MotionPulseDot className="bg-current" />
                            {item.priority.toUpperCase()}
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-white/65">{item.status}</div>
                      </div>
                    );
                  })}
                </div>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-5 lg:p-6 min-h-[320px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock3 size={18} className="text-cyan-300" />
                    Doctor status
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    {activeDoctorCount} active
                  </div>
                </div>

                <div className="space-y-3">
                  {topDoctors.map((doctor) => (
                    <div key={doctor.name} className={`rounded-[22px] border p-4 ${doctorTone(doctor.state)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{doctor.name}</div>
                          <div className="mt-1 text-sm text-white/55">{doctor.specialty}</div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                          {doctor.state.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                        <span>Active consultations</span>
                        <span className="inline-flex items-center gap-2 font-semibold text-white">
                          <MotionPulseDot className="bg-cyan-300" />
                          {doctor.consults}
                        </span>
                      </div>

                      {doctor.activeConsult ? (
                        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white/70">
                          <div className="flex items-center justify-between gap-3">
                            <span>Consulting</span>
                            <span className="text-white">{doctor.activeConsult.patient}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                            <MotionPulseDot className="bg-emerald-300" />
                            Active for {doctor.activeConsult.elapsedSec}s
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </MotionCard>

              {/* ── Emergency Contacts Manager ── */}
              <MotionCard className="rounded-[28px] border border-rose-400/15 bg-rose-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6 min-h-[220px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <HeartPulse size={18} className="text-rose-300 animate-pulse" />
                    Emergency Contacts Manager
                  </div>
                  <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                    {contacts.length} saved
                  </div>
                </div>

                <form onSubmit={handleAddContact} className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-rose-400/40 focus:outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-rose-400/40 focus:outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Spouse, Mother)"
                      value={newContactRel}
                      onChange={(e) => setNewContactRel(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-rose-400/40 focus:outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-rose-400/30 bg-rose-400/15 px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/25 cursor-pointer hover:border-rose-400/60"
                  >
                    + Add Emergency Contact
                  </button>
                </form>

                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-h-[220px] overflow-y-auto pr-1">
                  {contactsLoading ? (
                    <div className="text-center text-xs text-white/40 py-4 col-span-3">Loading contacts...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center text-xs text-white/30 py-4 col-span-3">No emergency contacts saved yet. Please add your trusted family/friends.</div>
                  ) : (
                    contacts.map((contact) => (
                      <div key={contact.id} className="rounded-xl border border-white/5 bg-black/20 p-3.5 flex items-center justify-between text-xs hover:border-rose-400/20 transition-all duration-300">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            {contact.name}
                            {contact.relationship && (
                              <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-[9px] font-medium text-rose-300">
                                {contact.relationship}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/55 mt-0.5">{contact.phone}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer ml-2 whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </MotionCard>

              <div className="lg:col-span-12">
                <HospitalActivityFeed />
              </div>

              <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6 min-h-[300px] flex flex-col">
                <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 border-b border-white/15 pb-2 md:pb-0">
                    <button
                      type="button"
                      onClick={() => setActiveVaultTab("reports")}
                      className={`text-lg font-bold transition cursor-pointer pb-1 ${
                        activeVaultTab === "reports"
                          ? "text-cyan-300 border-b-2 border-cyan-300"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Lab Reports ({patientReports.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveVaultTab("prescriptions")}
                      className={`text-lg font-bold transition cursor-pointer pb-1 ${
                        activeVaultTab === "prescriptions"
                          ? "text-cyan-300 border-b-2 border-cyan-300"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Prescriptions History ({prescriptions.length})
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 self-start md:self-auto">
                    <ShieldCheck size={12} />
                    Verified Storage
                  </div>
                </div>

                {activeVaultTab === "reports" ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {patientReports.map((item) => (
                      <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all duration-300">
                        <div className="text-sm font-semibold text-white truncate">{item.reportName}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">{item.uploadedAt}</div>
                        <div className="mt-3 flex items-center justify-between text-xs text-white/65">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-cyan-300 animate-pulse" />
                            <span className="text-[11px] font-medium truncate max-w-[130px]">{item.proof}</span>
                          </span>
                          {item.findings && (
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(item.reportName + " Summary", {
                                  description: item.findings,
                                  className: "border border-cyan-500/20 bg-black/90 text-cyan-300",
                                });
                              }}
                              className="text-cyan-400 font-bold hover:underline cursor-pointer text-[11px]"
                            >
                              View Summary
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    {prescriptionsLoading ? (
                      <div className="text-center text-xs text-white/40 py-8 col-span-3">Loading prescriptions...</div>
                    ) : prescriptions.length === 0 ? (
                      <div className="text-center text-xs text-white/30 py-8 col-span-3">
                        No prescriptions found. Please upload one in the <strong>Prescription OCR</strong> scanner!
                      </div>
                    ) : (
                      prescriptions.map((item) => (
                        <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all duration-300 flex flex-col justify-between">
                          <div>
                            <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              <Pill size={14} className="text-cyan-300" />
                              {item.medications || "Prescribed Medications"}
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                              Prescribed by Dr. {item.doctor_name || "Doctor"}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-[11px] text-white/60">
                            <span>{new Date(item.prescribed_at).toLocaleDateString()}</span>
                            {item.dosage_instructions && (
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info("Dosage Instructions", {
                                    description: item.dosage_instructions,
                                    className: "border border-cyan-500/20 bg-black/90 text-cyan-300",
                                  });
                                }}
                                className="text-cyan-400 font-bold hover:underline cursor-pointer"
                              >
                                View Instructions
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="mt-5 rounded-[24px] border border-cyan-400/15 bg-cyan-400/5 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Live control summary</div>
                      <div className="mt-1 text-sm text-white/55">
                        Queue, doctors, emergency signals, and notifications are updating through
                        the realtime simulator.
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <MotionPulseDot className="bg-emerald-300" />
                      {queueCount} queue / {emergencyCount} critical
                    </div>
                  </div>
                </div>
              </MotionCard>

              {/* ── Symptom Checker ── */}
              <MotionCard className="rounded-[28px] border border-emerald-400/15 bg-emerald-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6 min-h-[320px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Stethoscope size={18} className="text-emerald-300" />
                    Symptom Checker
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    AI-powered
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="e.g. headache, fever, nausea"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:outline-none transition"
                    onKeyDown={(e) => e.key === "Enter" && handleSymptomCheck()}
                  />
                  <button
                    type="button"
                    onClick={handleSymptomCheck}
                    disabled={symptomLoading}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/25 disabled:opacity-50 cursor-pointer"
                  >
                    {symptomLoading ? "Analyzing..." : "Check Symptoms"}
                  </button>
                </div>

                {symptomResult && (
                  <div className="mt-4 space-y-3">
                    {symptomResult.seek_emergency && (
                      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/15 p-3 text-sm font-semibold text-rose-300 text-center animate-pulse">
                        ⚠️ Seek emergency care immediately
                      </div>
                    )}
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Severity score</span>
                        <span className="font-bold text-white">{symptomResult.severity_score}/10</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Specialization</span>
                        <span className="font-bold text-emerald-300">{symptomResult.recommended_specialization}</span>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-white/70">{symptomResult.advice}</div>
                    </div>
                  </div>
                )}
              </MotionCard>

              {/* ── Find Doctors ── */}
              <MotionCard className="rounded-[28px] border border-violet-400/15 bg-violet-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6 min-h-[320px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Search size={18} className="text-violet-300" />
                    Find Doctors
                  </div>
                  <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                    AI-matched
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={doctorQuery}
                    onChange={(e) => setDoctorQuery(e.target.value)}
                    placeholder="Search by specialty or describe needs..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none transition"
                    onKeyDown={(e) => e.key === "Enter" && handleFindDoctors()}
                  />
                  <button
                    type="button"
                    onClick={handleFindDoctors}
                    disabled={doctorSearchLoading}
                    className="w-full rounded-2xl border border-violet-400/30 bg-violet-400/15 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-400/25 disabled:opacity-50 cursor-pointer"
                  >
                    {doctorSearchLoading ? "Searching..." : "Find Doctors"}
                  </button>
                </div>

                {recommendedDoctors && (
                  <div className="mt-4 space-y-3">
                    <div className="text-xs text-white/50">
                      {recommendedDoctors.count} doctor(s) found · {recommendedDoctors.detected_specialization || "General"} · {recommendedDoctors.ranking_method}
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {recommendedDoctors.doctors.map((doc: any, i: number) => (
                        <Link key={doc.id || i} href={`/dashboard/patient/doctor/${doc.id}`} className="rounded-2xl border border-white/10 bg-black/25 p-3 flex items-center justify-between hover:border-violet-400/30 hover:bg-violet-400/5 transition-all duration-300">
                          <div>
                            <div className="text-sm font-semibold text-white">{doc.name || doc.user_name || "Doctor"}</div>
                            <div className="text-xs text-white/50">{doc.specialization || "General"}</div>
                          </div>
                          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                            {doc.is_available ? "Available" : "Busy"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </MotionCard>

              {/* ── Book Appointment ── */}
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6 min-h-[200px] flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarPlus size={18} className="text-cyan-300" />
                    Book Appointment
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    {recommendedDoctors?.doctors?.[0]
                      ? `With ${recommendedDoctors.doctors[0].name || recommendedDoctors.doctors[0].user_name || "Doctor"}`
                      : "Find a doctor first"}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input
                    type="text"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="Reason for visit (optional)"
                    className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-400/40 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleBookAppointment}
                    disabled={bookingLoading}
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {bookingLoading ? "Booking..." : "Book for Tomorrow at 10:00"}
                  </button>
                  <Link
                    href="/dashboard/patient/appointments"
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 whitespace-nowrap text-center"
                  >
                    View Appointments
                  </Link>
                </div>
              </MotionCard>

              {/* ── AI Tools Navigation ── */}
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/5 to-violet-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6 min-h-[180px] flex flex-col group">
                <Link href="/dashboard/patient/prescription-ocr" className="flex flex-col flex-1">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition">
                        <Pill size={22} className="text-cyan-300" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-white group-hover:text-cyan-200 transition">Prescription OCR</div>
                        <div className="text-xs text-white/45">TrOCR + Gemini AI</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">
                      New
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-white/55 flex-1">
                    Upload a prescription image and let AI extract medications, dosages, and instructions automatically.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200 transition">
                    Open Scanner →
                  </div>
                </Link>
              </MotionCard>

              <MotionCard className="rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-violet-400/5 to-cyan-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-6 lg:p-6 min-h-[180px] flex flex-col group">
                <Link href="/dashboard/patient/report-analysis" className="flex flex-col flex-1">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/10 group-hover:bg-violet-400/20 transition">
                        <Brain size={22} className="text-violet-300" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-white group-hover:text-violet-200 transition">Report Analysis</div>
                        <div className="text-xs text-white/45">Gemini AI Powered</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
                      New
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-white/55 flex-1">
                    Analyze medical reports via text or image. Get AI summaries, key findings, risk factors, and recommendations.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-300 group-hover:text-violet-200 transition">
                    Open Analyzer →
                  </div>
                </Link>
              </MotionCard>

              <div className="lg:col-span-12">
                <AIReportAnalyzerMock />
              </div>

              <div className="lg:col-span-7">
                <PatientTimelineMock />
              </div>

              <div className="lg:col-span-5">
                <HospitalMapMock />
              </div>
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
      <AIHealthcareChatbot />
      <SmartNotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </MotionPage>
  );
}
