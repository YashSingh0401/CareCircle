"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export function PatientDevLoginButton() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleDevLogin = () => {
    // Generated local JWT token with role="patient"
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXRpZW50LTEyMyIsImVtYWlsIjoicGF0aWVudEBjYXJlY2lyY2xlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiZXhwIjoxODExNjAwMDA1LCJhdWQiOiJhdXRoZW50aWNhdGVkIn0.lY2N_7CKDGlctWbAYg45k-sejyloK231bW1sdwvPQu4";
    setAuth(token, { id: "test-patient", email: "patient@carecircle.com", role: "patient" });
    router.push("/dashboard/patient");
  };

  return (
    <button 
      onClick={handleDevLogin}
      className="mt-4 w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-6 py-3 text-sm font-bold text-cyan-300 transition-colors"
    >
      Developer Bypass: Login as Patient
    </button>
  );
}
