"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock3,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import {
  MotionCard,
  MotionPage,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AvailabilitySlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_appointments: number;
  is_active: boolean;
}

interface DoctorDetail {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  total_reviews: number;
  phone: string;
  email: string;
  image_url: string;
  bio: string;
  is_available: boolean;
  hospital_name: string;
  hospital_city: string;
  department_name: string;
  availability: AvailabilitySlot[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star key={i} size={14} className="fill-amber-400/50 text-amber-400" />
      );
    } else {
      stars.push(
        <Star key={i} size={14} className="text-white/20" />
      );
    }
  }
  return stars;
}

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function sortByDay(slots: AvailabilitySlot[]) {
  return [...slots].sort(
    (a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
  );
}

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Doctor Reviews Submission & Anomaly State ──
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [anomalyAlert, setAnomalyAlert] = useState<{
    is_suspicious: boolean;
    anomaly_score: number;
    reasons: string[];
    action: string;
  } | null>(null);

  const fetchDoctorDetails = async () => {
    try {
      const docRes = await api.get(`/api/doctors/${id}`);
      setDoctor(docRes.data);
    } catch (err) {
      console.error("Failed to fetch doctor details", err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Run AI review anomaly check first!
      if (!force) {
        const checkRes = await api.post("/api/assistant/check-review", {
          rating: rating,
          text: reviewText.trim(),
          posted_at: new Date().toISOString(),
          appointment_date: appointmentDate || null,
        });

        if (checkRes.data.is_suspicious) {
          setAnomalyAlert({
            is_suspicious: checkRes.data.is_suspicious,
            anomaly_score: checkRes.data.anomaly_score,
            reasons: checkRes.data.reasons || [],
            action: checkRes.data.action,
          });
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit the verified review to backend
      await api.post(`/api/doctors/${id}/reviews`, {
        rating: rating,
        review_text: reviewText.trim(),
      });

      toast.success("Review submitted successfully!");
      setReviewText("");
      setAppointmentDate("");
      setRating(5);
      setAnomalyAlert(null);
      fetchDoctorDetails();
    } catch (err) {
      console.error("Review submission failed", err);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {

    let mounted = true;

    async function fetchData() {
      try {
        const [docRes, availRes] = await Promise.all([
          api.get(`/api/doctors/${id}`),
          api.get(`/api/doctors/${id}/availability`).catch(() => ({ data: { availability: [] } })),
        ]);
        if (!mounted) return;
        setDoctor(docRes.data);
        setAvailability(availRes.data.availability || docRes.data.availability || []);
      } catch (err) {
        console.error("Failed to fetch doctor details", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <MotionPage className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={36} className="animate-spin text-cyan-300" />
              <p className="text-sm font-medium text-white/60">Loading doctor profile...</p>
            </div>
          </div>
        </div>
      </MotionPage>
    );
  }

  if (error || !doctor) {
    return (
      <MotionPage className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl text-center max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10">
                <User size={32} className="text-rose-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Doctor Not Found</h3>
              <p className="text-sm text-white/55">
                We couldn&apos;t find the doctor you&apos;re looking for.
              </p>
              <Link
                href="/dashboard/patient"
                className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </MotionPage>
    );
  }

  const sortedAvailability = sortByDay(availability);

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

            <div className="hidden items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 sm:inline-flex">
              <Sparkles size={14} />
              Doctor Profile
            </div>
          </MotionStaggerItem>

          {/* Profile Header */}
          <MotionStaggerItem>
            <header className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4 lg:items-start">
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.25),rgba(0,0,0,0.2))] text-3xl font-black text-cyan-200 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                      {getInitials(doctor.name)}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black ${
                        doctor.is_available ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    >
                      <MotionPulseDot
                        className={
                          doctor.is_available ? "bg-emerald-900 h-2 w-2" : "bg-rose-900 h-2 w-2"
                        }
                      />
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      doctor.is_available
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-400/25 bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {doctor.is_available ? "Available" : "Unavailable"}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                      {doctor.name}
                    </h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
                      <Stethoscope size={14} className="text-cyan-300" />
                      {doctor.specialization}
                      {doctor.department_name && (
                        <>
                          <span className="text-white/20">·</span>
                          {doctor.department_name}
                        </>
                      )}
                    </div>
                    {doctor.qualification && (
                      <div className="mt-1 text-sm text-white/45">{doctor.qualification}</div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                      <div className="flex items-center gap-0.5">{renderStars(doctor.rating)}</div>
                      <span>
                        {doctor.rating?.toFixed(1)} ({doctor.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                      <Briefcase size={12} />
                      {doctor.experience_years} yrs experience
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <DollarSign size={12} />₹{doctor.consultation_fee} consultation
                    </div>
                  </div>

                  {/* Hospital */}
                  {(doctor.hospital_name || doctor.hospital_city) && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin size={14} className="text-violet-300" />
                      {doctor.hospital_name}
                      {doctor.hospital_city && `, ${doctor.hospital_city}`}
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <div className="lg:self-center">
                  <Link
                    href="/dashboard/patient"
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 hover:border-cyan-400/50 hover:shadow-[0_0_24px_rgba(0,240,255,0.15)] whitespace-nowrap"
                  >
                    <Calendar size={16} />
                    Book Appointment
                  </Link>
                </div>
              </div>
            </header>
          </MotionStaggerItem>

          {/* Content Grid */}
          <MotionStaggerItem>
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Bio */}
              {doctor.bio && (
                <MotionCard className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-7 lg:p-6">
                  <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <User size={18} className="text-cyan-300" />
                    About
                  </div>
                  <p className="text-sm leading-7 text-white/70">{doctor.bio}</p>
                </MotionCard>
              )}

              {/* Contact Info */}
              <MotionCard
                className={`rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6 ${
                  doctor.bio ? "lg:col-span-5" : "lg:col-span-12"
                }`}
              >
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Phone size={18} className="text-emerald-300" />
                  Contact Information
                </div>
                <div className="space-y-4">
                  {doctor.phone && (
                    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/25 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                        <Phone size={16} className="text-emerald-300" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                          Phone
                        </div>
                        <div className="text-sm font-medium text-white">{doctor.phone}</div>
                      </div>
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/25 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                        <Mail size={16} className="text-cyan-300" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                          Email
                        </div>
                        <div className="text-sm font-medium text-white">{doctor.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </MotionCard>

              {/* Availability Schedule */}
              <MotionCard className="rounded-[28px] border border-violet-400/15 bg-violet-400/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock3 size={18} className="text-violet-300" />
                    Weekly Availability
                  </div>
                  <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                    {sortedAvailability.filter((s) => s.is_active).length} active days
                  </div>
                </div>

                {sortedAvailability.length === 0 ? (
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-6 text-center">
                    <p className="text-sm text-white/50">No availability schedule set.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedAvailability.map((slot, i) => (
                      <div
                        key={`${slot.day_of_week}-${i}`}
                        className={`rounded-[22px] border p-4 transition-all duration-300 ${
                          slot.is_active
                            ? "border-violet-400/20 bg-violet-400/5 hover:border-violet-400/40 hover:bg-violet-400/10"
                            : "border-white/5 bg-black/20 opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-white">{slot.day_of_week}</div>
                          <div
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              slot.is_active
                                ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border border-white/10 bg-white/5 text-white/30"
                            }`}
                          >
                            {slot.is_active ? "Active" : "Closed"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
                          <Clock3 size={11} />
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </div>
                        <div className="mt-1 text-[11px] text-white/35">
                          Max {slot.max_appointments} appointments
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </MotionCard>

              {/* ── Patient Reviews & AI Shield Section ── */}
              <MotionCard className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/5 to-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:col-span-12 lg:p-6 min-h-[300px] flex flex-col mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Star className="text-amber-400 fill-amber-400 animate-pulse" size={20} />
                      Patient Reviews & AI Integrity Shield
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Powered by **Isolation Forest Anomaly Detection** to flag spam and bot-generated reviews.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <Sparkles size={12} />
                    Lightweight AI Active
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Submission Form */}
                  <div className="lg:col-span-6 rounded-[22px] border border-white/10 bg-black/30 p-5">
                    <h4 className="text-sm font-bold text-white mb-4">Write a Review</h4>
                    <form onSubmit={(e) => handleReviewSubmit(e)} className="space-y-4">
                      {/* Rating Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60">Your Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none transition-all duration-250 cursor-pointer group"
                            >
                              <Star
                                size={22}
                                className={`transition-all duration-200 ${
                                  star <= rating
                                    ? "fill-amber-400 text-amber-400 scale-110"
                                    : "text-white/25 hover:text-white/50"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Appointment Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Appointment Date (Optional)</label>
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/40 focus:outline-none transition"
                        />
                      </div>

                      {/* Review Text */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Review Comment</label>
                        <textarea
                          rows={4}
                          placeholder="Please share your experience with the doctor..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none transition resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/15 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-400/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {submitting ? "Checking Review Integrity..." : "Submit Review"}
                      </button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div className="lg:col-span-6 flex flex-col">
                    <h4 className="text-sm font-bold text-white mb-4">Patient Feedback</h4>
                    <div className="flex-1 rounded-[22px] border border-white/10 bg-black/25 p-5 max-h-[360px] overflow-y-auto space-y-3">
                      <div className="rounded-xl border border-white/5 bg-black/35 p-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">Ramesh Kumar</span>
                          <span className="flex gap-0.5">{renderStars(5)}</span>
                        </div>
                        <p className="mt-2 text-white/65 leading-relaxed">
                          "Highly experienced doctor! Diagnosed my heart condition quickly and explained the prescription very politely."
                        </p>
                        <div className="text-[10px] text-white/35 mt-3 uppercase tracking-wider">
                          Verified Visit · 4 days ago
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/35 p-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">Ananya Sharma</span>
                          <span className="flex gap-0.5">{renderStars(4)}</span>
                        </div>
                        <p className="mt-2 text-white/65 leading-relaxed">
                          "Very friendly doctor and coordinates queues efficiently. The waiting time was about 15 minutes."
                        </p>
                        <div className="text-[10px] text-white/35 mt-3 uppercase tracking-wider">
                          Verified Visit · 1 week ago
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionCard>
            </div>
          </MotionStaggerItem>
        </div>
      </MotionStagger>

      {/* ── AI Review Shield Warning Modal ── */}
      {anomalyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="rounded-[30px] border-2 border-rose-500/50 bg-black p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Star size={32} className="animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">AI Review Shield Alert</h3>
              <p className="text-sm text-rose-300/80 font-semibold">
                Suspicious / Anomaly Review Pattern Detected
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                Our local **Isolation Forest** anomaly detection model has flagged this review as suspicious. Rating-to-text length ratio or timing mismatches resemble automated spam patterns.
              </p>
            </div>

            {anomalyAlert.reasons.length > 0 && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-left text-xs space-y-1.5 text-rose-300">
                <span className="font-bold">Detected Flags:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {anomalyAlert.reasons.map((reason, idx) => (
                    <li key={idx} className="capitalize">{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAnomalyAlert(null)}
                className="w-full rounded-xl border border-white/20 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
              >
                Edit Review (Recommended)
              </button>
              <button
                type="button"
                onClick={(e) => handleReviewSubmit(e, true)}
                className="w-full rounded-xl border border-rose-500/30 bg-rose-500/15 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition cursor-pointer"
              >
                Submit Anyway (Ignore Warning)
              </button>
            </div>
          </div>
        </div>
      )}
    </MotionPage>
  );
}
