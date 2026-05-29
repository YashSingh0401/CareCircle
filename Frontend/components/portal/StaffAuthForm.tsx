"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Lock, Activity, ArrowRight } from "lucide-react";

export function StaffAuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock an API call and redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/staff");
    }, 1200); // Staff login is fast
  };

  return (
    <div className="w-full">
      <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-center">
        <p className="text-xs text-purple-200/70">
          Shared Terminal Access. Auto-logoff in 15 mins.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300/60">
            Employee ID
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
              <Users size={16} />
            </div>
            <input
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-2039"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50 focus:bg-white/10"
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300/60">
            Shift PIN
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30">
              <Lock size={16} />
            </div>
            <input
              required
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-center text-xl tracking-[0.5em] text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/50 focus:bg-white/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || pin.length !== 4}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
            isLoading || pin.length !== 4
              ? "bg-white/10 text-white/50 cursor-not-allowed"
              : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          }`}
        >
          {isLoading ? (
            <Activity className="animate-pulse" size={18} />
          ) : (
            <>
              Quick Access <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
