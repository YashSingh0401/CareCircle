"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, User, Phone, Mail, Droplet, Calendar, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PatientAuthForm() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [patientId, setPatientId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    bloodGroup: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock an API call and redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/patient");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Mock an API call and redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/patient");
    }, 1500);
  };

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="mb-6 flex rounded-full border border-white/10 bg-black/25 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            authMode === "login" ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30" : "text-white/40 hover:text-white/70"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            authMode === "signup" ? "bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/30" : "text-white/40 hover:text-white/70"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {authMode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Patient ID
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
                      <Fingerprint size={16} />
                    </div>
                    <input
                      required
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="e.g. PAT-948271"
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:bg-white/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Personal Details Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    Full Name
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                      <User size={14} />
                    </div>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50"
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    Email ID
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                      <Mail size={14} />
                    </div>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Details Row */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 col-span-1">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">
                    Age
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-white/30">
                      <Calendar size={14} />
                    </div>
                    <input
                      required
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="35"
                      className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50"
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 col-span-1">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">
                    Gender
                  </label>
                  <div className="relative mt-2">
                    <select
                      required
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="min-h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-2 text-sm text-white outline-none transition focus:border-purple-400/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">
                    Blood Group
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                      <Droplet size={14} />
                    </div>
                    <select
                      required
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="min-h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-purple-400/50 [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="" disabled>Select Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Row */}
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Phone Number
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                    <Phone size={14} />
                  </div>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
            isLoading 
              ? "bg-white/10 text-white/50 cursor-not-allowed" 
              : authMode === "login" 
                ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]" 
                : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          }`}
        >
          {isLoading ? (
            <Activity className="animate-pulse" size={18} />
          ) : authMode === "login" ? (
            <>
              <ShieldCheck size={18} /> Authenticate Access
            </>
          ) : (
            <>
              Register & Enter <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2 opacity-60">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">OR</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
