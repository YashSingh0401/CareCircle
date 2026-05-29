"use client";

import React, { useState } from "react";
import { Users, UserPlus, Stethoscope, BriefcaseMedical, Trash2, KeyRound, CheckCircle2 } from "lucide-react";
import { usePersonnelStore, Personnel } from "@/lib/realtime/personnelStore";
import { motion, AnimatePresence } from "framer-motion";

export function PersonnelManagement() {
  const { personnelList, addPersonnel, removePersonnel } = usePersonnelStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newlyAdded, setNewlyAdded] = useState<Personnel | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "Doctor" as Personnel["role"],
    department: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addPersonnel(formData);
    setNewlyAdded(result);
    setFormData({ name: "", role: "Doctor", department: "" });
    
    // Clear the success message after a few seconds
    setTimeout(() => {
      setNewlyAdded(null);
      setIsAdding(false);
    }, 8000);
  };

  const departments = ["Cardiology", "Neurology", "Emergency", "Pediatrics", "Oncology", "Radiology", "General Surgery"];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Hospital Personnel</h3>
          <p className="text-sm text-white/60">Manage doctors, nurses, and support staff credentials.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
        >
          {isAdding ? "Cancel" : <><UserPlus size={16} /> Register Staff</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && !newlyAdded && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Role</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Personnel["role"] })}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Registered Nurse</option>
                  <option value="Technician">Lab Technician</option>
                  <option value="Support">Hospital Support</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="" disabled>Select Dept</option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 text-black px-4 py-2.5 font-bold hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Generate Credentials
            </button>
          </motion.form>
        )}

        {newlyAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-300">Personnel Registered</h4>
                <p className="text-sm text-emerald-200/70">Share these generated credentials securely.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 rounded-xl bg-black/40 p-4">
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-white/40">Login ID (NPI / EMP)</div>
                <div className="mt-1 font-mono text-lg text-white">{newlyAdded.credentials.loginId}</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-white/40">Password / PIN</div>
                <div className="mt-1 font-mono text-lg text-white">{newlyAdded.credentials.password}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Login ID</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {personnelList.map((person) => (
              <tr key={person.id} className="transition hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-4 font-medium text-white">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${person.role === 'Doctor' ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' : 'border-purple-400/30 bg-purple-400/10 text-purple-300'}`}>
                      {person.role === 'Doctor' ? <Stethoscope size={14} /> : <BriefcaseMedical size={14} />}
                    </div>
                    {person.name}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-white/70">{person.role}</td>
                <td className="whitespace-nowrap px-4 py-4 text-white/70">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider">
                    {person.department}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-white/80">
                  {person.credentials.loginId}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    onClick={() => removePersonnel(person.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-400/70 transition hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={14} /> Revoke
                  </button>
                </td>
              </tr>
            ))}
            {personnelList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  No personnel registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
