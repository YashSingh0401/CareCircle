"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Lock, Activity, ArrowRight, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminAuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerified, setKeyVerified] = useState(false);

  // Form states
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock password verification
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  };

  const handleSubmitMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock final login
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/admin");
    }, 1500);
  };

  const handleHardwareKeyTap = () => {
    setIsVerifyingKey(true);
    setTimeout(() => {
      setIsVerifyingKey(false);
      setKeyVerified(true);
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 1000);
    }, 2000);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleNextStep}
            className="space-y-4"
          >
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/50">
                Admin ID
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
                  <UserCog size={16} />
                </div>
                <input
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. ADM-0019"
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/50">
                Master Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
                  <Lock size={16} />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-rose-400/50 focus:bg-white/10"
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
                  Proceed to MFA <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmitMfa}
            className="space-y-4"
          >
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <ShieldAlert className="text-rose-400" size={24} />
              <p className="text-sm text-rose-200">
                Restricted System Access. Verify identity via MFA.
              </p>
            </div>

            {/* Hardware Key Mockup */}
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-5 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Tap Hardware Key
              </p>
              <button
                type="button"
                onClick={handleHardwareKeyTap}
                disabled={isVerifyingKey || keyVerified || isLoading}
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 ${
                  keyVerified
                    ? "border-green-400 bg-green-400/20 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                    : isVerifyingKey
                      ? "animate-pulse border-rose-400 bg-rose-400/20 text-rose-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:scale-105 hover:bg-rose-500/20"
                }`}
              >
                {keyVerified ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <KeyRound size={28} className={isVerifyingKey ? "animate-pulse" : ""} />
                )}
              </button>
              <p className="mt-3 text-xs text-white/50">
                {keyVerified
                  ? "Key Authenticated"
                  : isVerifyingKey
                    ? "Reading Security Key..."
                    : "Tap YubiKey or similar"}
              </p>
            </div>

            <div className="flex items-center gap-3 py-1 opacity-60">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">OR ENTER CODE</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300/50">
                6-Digit Authenticator Code
              </label>
              <input
                required={!keyVerified}
                disabled={keyVerified || isVerifyingKey}
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-center text-xl tracking-[0.5em] text-white outline-none transition placeholder:text-white/20 focus:border-rose-400/50 focus:bg-white/10 disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/10"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || isVerifyingKey || keyVerified || authCode.length !== 6}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
                  isLoading || isVerifyingKey || keyVerified || authCode.length !== 6
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                }`}
              >
                {isLoading ? (
                  <Activity className="animate-pulse" size={18} />
                ) : (
                  "Verify & Enter"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
