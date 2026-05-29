"use client";

import React from "react";
import { BadgeCheck, Fingerprint } from "lucide-react";

type DemoLoginFieldsProps = {
  role: string;
  placeholder: string;
};

export function DemoLoginFields({ role, placeholder }: DemoLoginFieldsProps) {
  const [value, setValue] = React.useState("");

  return (
    <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
      <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
        {role} ID
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/35"
        />
        <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-200">
          {value ? <BadgeCheck size={16} /> : <Fingerprint size={16} />}
          {value ? "Ready" : "Mock scan"}
        </div>
      </div>
    </div>
  );
}
