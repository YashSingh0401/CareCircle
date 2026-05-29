"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Activity, ScanFace, ArrowRight, CheckCircle2 } from "lucide-react";

export function DoctorAuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Form states
  const [npiNumber, setNpiNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock an API call and redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/doctor");
    }, 1500);
  };

  const handleBiometricScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/doctor");
      }, 800);
    }, 2000);
  };

  return (
    <div className="w-full">
      {/* Biometric Quick Scan Option */}
      <div className="mb-6 rounded-[22px] border border-cyan-500/20 bg-cyan-500/5 p-5 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300/70">
          Fast Access
        </p>
        <button
          type="button"
          onClick={handleBiometricScan}
          disabled={isScanning || scanSuccess || isLoading}
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 ${
            scanSuccess
              ? "border-green-400 bg-green-400/20 text-green-300"
              : isScanning
                ? "animate-pulse border-cyan-400 bg-cyan-400/20 text-cyan-200"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:scale-105 hover:bg-cyan-500/20"
          }`}
        >
          {scanSuccess ? (
            <CheckCircle2 size={28} />
          ) : (
            <ScanFace size={28} className={isScanning ? "animate-pulse" : ""} />
          )}
        </button>
        <p className="mt-3 text-xs text-white/50">
          {scanSuccess
            ? "Identity Verified"
            : isScanning
              ? "Scanning Biometrics..."
              : "Tap Badge or Scan Face"}
        </p>
      </div>

      <div className="flex items-center gap-3 py-2 opacity-60">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">OR MANUAL LOGIN</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            NPI Number
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
              <Stethoscope size={16} />
            </div>
            <input
              required
              value={npiNumber}
              onChange={(e) => setNpiNumber(e.target.value)}
              placeholder="e.g. DOC-1042"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:bg-white/10"
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Password
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
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:bg-white/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isScanning || scanSuccess}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
            isLoading || isScanning || scanSuccess
              ? "bg-white/10 text-white/50 cursor-not-allowed"
              : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          }`}
        >
          {isLoading ? (
            <Activity className="animate-pulse" size={18} />
          ) : (
            <>
              Access Clinical Dashboard <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
