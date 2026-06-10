"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export function DevLoginButton() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleDevLogin = () => {
    // Generated local JWT token with role="admin" signed with real JWT_SECRET
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0xMjMiLCJlbWFpbCI6ImFkbWluQGNhcmVjaXJjbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxODExNjAwMDA1LCJhdWQiOiJhdXRoZW50aWNhdGVkIn0.zNmyIBO4tlKofBu3-xdkM5lBOdW8Pbiu02BZQohhKoE";
    setAuth(token, { id: "test-admin", email: "admin@carecircle.com", role: "admin" });
    router.push("/dashboard/admin");
  };

  return (
    <button 
      onClick={handleDevLogin}
      className="rounded-full bg-red-500 hover:bg-red-600 px-6 py-2 text-sm font-bold text-white transition-colors"
    >
      Login as Admin
    </button>
  );
}
