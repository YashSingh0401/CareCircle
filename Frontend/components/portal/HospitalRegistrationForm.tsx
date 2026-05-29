"use client";

import React, { useState } from "react";
import { Building2, Mail, Phone, MapPin, FileBadge, Activity, ArrowRight, CheckCircle2, ShieldAlert, KeyRound, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GeneratedCredentials = {
  adminId: string;
  masterPassword: string;
  authCode: string;
};

export function HospitalRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    hospitalName: "",
    address: "",
    licenseNumber: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call and generation
    setTimeout(() => {
      setIsLoading(false);
      setCredentials({
        adminId: "ADM-" + Math.floor(1000 + Math.random() * 9000),
        masterPassword: Math.random().toString(36).slice(-8) + "H#p",
        authCode: Math.floor(100000 + Math.random() * 900000).toString(),
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!credentials ? (
          <motion.form
            key="register"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="mb-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
              <p className="text-xs font-medium text-rose-200/70">
                Register a new facility to receive Super Admin credentials.
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/60">
                Hospital Name
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                  <Building2 size={14} />
                </div>
                <input
                  required
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  placeholder="e.g. CareCircle General"
                  className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/60">
                  License Number
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                    <FileBadge size={14} />
                  </div>
                  <input
                    required
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="HL-482910"
                    className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50"
                  />
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/60">
                  Contact Phone
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                    <Phone size={14} />
                  </div>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 000-0000"
                    className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/60">
                Official Email
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
                  placeholder="admin@hospital.com"
                  className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50"
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/60">
                Facility Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                  <MapPin size={14} />
                </div>
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Health Ave, City, State"
                  className="min-h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
                isLoading
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              }`}
            >
              {isLoading ? (
                <Activity className="animate-pulse" size={18} />
              ) : (
                <>
                  Register & Generate Keys <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Facility Registered</h3>
              <p className="mt-1 text-sm text-white/60">
                Your Super Admin credentials have been generated. Save these securely; they will not be shown again.
              </p>
            </div>

            <div className="space-y-3 rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-5">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">Admin ID</div>
                  <div className="mt-1 font-mono text-sm text-white">{credentials.adminId}</div>
                </div>
                <button onClick={() => copyToClipboard(credentials.adminId)} className="text-white/40 hover:text-white">
                  <Copy size={16} />
                </button>
              </div>
              
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">Master Password</div>
                  <div className="mt-1 font-mono text-sm text-white">{credentials.masterPassword}</div>
                </div>
                <button onClick={() => copyToClipboard(credentials.masterPassword)} className="text-white/40 hover:text-white">
                  <Copy size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-rose-400/30 bg-rose-400/10 p-3">
                <div>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-rose-300/70">
                    <ShieldAlert size={12} /> MFA Code
                  </div>
                  <div className="mt-1 font-mono text-xl tracking-widest text-white">{credentials.authCode}</div>
                </div>
                <button onClick={() => copyToClipboard(credentials.authCode)} className="text-white/40 hover:text-white">
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/20 py-3.5 text-sm font-semibold text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all hover:bg-rose-500/30 hover:border-rose-400/50"
            >
              <KeyRound size={18} /> Proceed to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
