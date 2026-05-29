"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCog, ArrowRight, Database, Shield, Building2 } from "lucide-react";
import { MotionPage, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";
import { AdminAuthForm } from "@/components/portal/AdminAuthForm";
import { HospitalRegistrationForm } from "@/components/portal/HospitalRegistrationForm";

export default function HospitalAdminPortalPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <MotionPage className="cc-login-container">
      <MotionStagger className="w-full">
        <div className="cc-login-bg">
          <div className="cc-orb cc-orb-blue" style={{ animationDelay: "-1s", top: "14%", left: "20%" }}></div>
          <div className="cc-orb cc-orb-red" style={{ background: "var(--cc-neon-purple)", bottom: "16%", right: "18%" }}></div>
        </div>

        <MotionStaggerItem>
          <Link href="/login/hospital" className="cc-portal-back-link">
            <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Hospital Roles
          </Link>
        </MotionStaggerItem>

        <div className="cc-portal-centered-wrapper">
          <div className="cc-portal-centered-content">
            <MotionStaggerItem className="cc-portal-header">
              <h1 className="cc-h1">
                {isRegistering ? (
                  <>Facility <span className="cc-text-gradient">Registration</span></>
                ) : (
                  <>Admin <span className="cc-text-gradient">Control Portal</span></>
                )}
              </h1>
              <p className="cc-subtitle">
                {isRegistering
                  ? "Onboard a new hospital to generate secure Super Admin credentials."
                  : "Monitor systems, manage records, and oversee hospital-wide access and analytics."}
              </p>
            </MotionStaggerItem>

            <MotionStaggerItem className="cc-portal-card-wrapper">
              <div className="cc-portal-gradient-bg" />
              <div className="cc-login-card cc-login-admin">
                <div className="cc-login-icon-box">
                  {isRegistering ? <Building2 size={32} /> : <UserCog size={32} />}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="cc-h1" style={{ fontSize: "1.75rem", margin: 0 }}>
                    {isRegistering ? "Hospital Setup" : "Admin Login"}
                  </h2>
                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition"
                  >
                    {isRegistering ? "Back to Login" : "Register Facility"}
                  </button>
                </div>

                {!isRegistering && (
                  <>
                    <p className="cc-card-desc mb-4">
                      Manage users, audit logs, databases, and operational controls from a central dashboard.
                    </p>
                    <ul className="cc-login-features mb-6">
                      <li><Database size={16} /> Database administration</li>
                      <li><Shield size={16} /> Security and compliance</li>
                      <li><UserCog size={16} /> User management</li>
                    </ul>
                  </>
                )}

                <div className={isRegistering ? "mt-2" : ""}>
                  {isRegistering ? (
                    <HospitalRegistrationForm onComplete={() => setIsRegistering(false)} />
                  ) : (
                    <AdminAuthForm />
                  )}
                </div>
              </div>
            </MotionStaggerItem>
          </div>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
