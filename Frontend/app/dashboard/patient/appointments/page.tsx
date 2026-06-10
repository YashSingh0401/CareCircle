"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarX2,
  Clock3,
  Hospital,
  Loader2,
  MapPin,
  Sparkles,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  MotionCard,
  MotionPage,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  doctor_name?: string;
  doctor_specialization?: string;
  doctor_image_url?: string;
  hospital_name?: string;
  hospital_address?: string;
}

const statusConfig: Record<string, { label: string; classes: string; dotClass: string }> = {
  scheduled: {
    label: "Scheduled",
    classes: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    dotClass: "bg-cyan-300",
  },
  checked_in: {
    label: "Checked In",
    classes: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    dotClass: "bg-amber-300",
  },
  completed: {
    label: "Completed",
    classes: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    dotClass: "bg-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    classes: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    dotClass: "bg-rose-300",
  },
  in_queue: {
    label: "In Queue",
    classes: "border-violet-400/25 bg-violet-400/10 text-violet-300",
    dotClass: "bg-violet-300",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] || {
      label: status,
      classes: "border-white/20 bg-white/10 text-white/70",
      dotClass: "bg-white/70",
    }
  );
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  try {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const patientId = useAuthStore.getState().user?.id || "patient-123";
    api
      .get(`/api/appointments/patient/${patientId}`)
      .then((res) => {
        setAppointments(res.data.appointments || []);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments", err);
        toast.error("Failed to load appointments");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(appointmentId: string) {
    setCancellingIds((prev) => new Set(prev).add(appointmentId));
    try {
      await api.patch(`/api/appointments/${appointmentId}/cancel`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: "cancelled" } : a))
      );
      toast.success("Appointment cancelled", {
        description: "Your appointment has been successfully cancelled.",
        className: "border border-white/10 bg-black/90 text-white",
      });
    } catch (err) {
      console.error("Cancel failed", err);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  }

  return (
    <MotionPage className="min-h-screen bg-black text-white">
      <MotionStagger className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(121,40,202,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(255,0,51,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%,rgba(255,255,255,0.01))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <MotionStaggerItem className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/dashboard/patient"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:inline-flex">
              <Sparkles size={14} />
              Appointment Manager
            </div>
          </MotionStaggerItem>

          {/* Header */}
          <MotionStaggerItem>
            <header className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Calendar size={14} />
                    Your Appointments
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Manage{" "}
                    <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                      Appointments
                    </span>
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-white/65">
                    View all your scheduled, completed, and cancelled appointments. Cancel upcoming
                    visits if your plans change.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                  <MotionPulseDot className="bg-emerald-300" />
                  {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
                </div>
              </div>
            </header>
          </MotionStaggerItem>

          {/* Content */}
          <MotionStaggerItem>
            <main className="mt-6">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={36} className="animate-spin text-cyan-300" />
                      <p className="text-sm font-medium text-white/60">
                        Loading your appointments...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && appointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24">
                  <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl text-center max-w-md">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                        <CalendarX2 size={32} className="text-cyan-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white">No Appointments Yet</h3>
                      <p className="text-sm leading-6 text-white/55">
                        You don&apos;t have any appointments scheduled. Use the symptom checker and
                        find a doctor to book your first appointment.
                      </p>
                      <Link
                        href="/dashboard/patient"
                        className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25"
                      >
                        <Stethoscope size={16} />
                        Find a Doctor
                      </Link>
                    </div>
                  </MotionCard>
                </div>
              )}

              {/* Appointment Cards Grid */}
              {!loading && appointments.length > 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {appointments.map((appt) => {
                    const status = getStatusConfig(appt.status);
                    const isCancelled = appt.status === "cancelled";
                    const isCompleted = appt.status === "completed";
                    const isCancelling = cancellingIds.has(appt.id);
                    const canCancel = !isCancelled && !isCompleted;

                    return (
                      <MotionCard
                        key={appt.id}
                        className="group rounded-[28px] border border-white/10 bg-white/5 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col"
                      >
                        {/* Card Top Accent Bar */}
                        <div
                          className={`h-1 w-full rounded-t-[28px] ${
                            isCancelled
                              ? "bg-gradient-to-r from-rose-500/60 to-rose-400/30"
                              : isCompleted
                                ? "bg-gradient-to-r from-emerald-500/60 to-emerald-400/30"
                                : "bg-gradient-to-r from-cyan-500/60 to-blue-400/30"
                          }`}
                        />

                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          {/* Status + Date */}
                          <div className="flex items-center justify-between">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}
                            >
                              <MotionPulseDot className={status.dotClass} />
                              {status.label}
                            </div>
                            <div className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                              {formatDate(appt.appointment_date)}
                            </div>
                          </div>

                          {/* Doctor Info */}
                          <div className="mt-5 flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.2),rgba(0,0,0,0.15))] text-sm font-black text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
                              {appt.doctor_name
                                ? appt.doctor_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "DR"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-white truncate">
                                {appt.doctor_name || "Doctor"}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                                <Stethoscope size={11} />
                                {appt.doctor_specialization || "General Practice"}
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="mt-4 space-y-2.5">
                            <div className="flex items-center gap-2 text-sm text-white/65">
                              <Clock3 size={14} className="shrink-0 text-cyan-300/60" />
                              <span>{formatTime(appt.appointment_time)}</span>
                            </div>
                            {appt.hospital_name && (
                              <div className="flex items-center gap-2 text-sm text-white/65">
                                <Hospital size={14} className="shrink-0 text-violet-300/60" />
                                <span className="truncate">{appt.hospital_name}</span>
                              </div>
                            )}
                            {appt.reason && (
                              <div className="flex items-start gap-2 text-sm text-white/65">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-amber-300/60" />
                                <span className="line-clamp-2">{appt.reason}</span>
                              </div>
                            )}
                          </div>

                          {/* Cancel Button */}
                          <div className="mt-auto pt-5">
                            {canCancel ? (
                              <button
                                type="button"
                                onClick={() => handleCancel(appt.id)}
                                disabled={isCancelling}
                                className="w-full rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:border-rose-400/50 hover:bg-rose-400/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                              >
                                {isCancelling ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} />
                                    Cancel Appointment
                                  </>
                                )}
                              </button>
                            ) : (
                              <div
                                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold text-center ${
                                  isCancelled
                                    ? "border-rose-400/15 bg-rose-400/5 text-rose-300/40"
                                    : "border-emerald-400/15 bg-emerald-400/5 text-emerald-300/40"
                                }`}
                              >
                                {isCancelled ? "Cancelled" : "Completed"}
                              </div>
                            )}
                          </div>
                        </div>
                      </MotionCard>
                    );
                  })}
                </div>
              )}
            </main>
          </MotionStaggerItem>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
