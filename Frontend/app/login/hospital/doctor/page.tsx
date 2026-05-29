import React from "react";
import Link from "next/link";
import { Stethoscope, ArrowRight, FileText, Sparkles } from "lucide-react";
import { MotionPage, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";
import { DoctorAuthForm } from "@/components/portal/DoctorAuthForm";

export default function HospitalDoctorPortalPage() {
  return (
    <MotionPage className="cc-login-container">
      <MotionStagger className="w-full">
        <div className="cc-login-bg">
          <div className="cc-orb cc-orb-blue" style={{ animationDelay: "-2s", top: "16%", left: "24%" }}></div>
          <div className="cc-orb cc-orb-red" style={{ background: "var(--cc-neon-purple)", bottom: "14%", right: "14%" }}></div>
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
                Doctor <span className="cc-text-gradient">Clinical Portal</span>
              </h1>
              <p className="cc-subtitle">
                Review records, analyze reports, and coordinate care with AI-assisted tools.
              </p>
            </MotionStaggerItem>

            <MotionStaggerItem className="cc-portal-card-wrapper">
              <div className="cc-portal-gradient-bg" />
              <div className="cc-login-card cc-login-doctor">
                <div className="cc-login-icon-box">
                  <Stethoscope size={32} />
                </div>

                <h2 className="cc-h1" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Doctor Login</h2>
                <p className="cc-card-desc">
                  Access patient histories, AI summaries, and diagnostic workflows in one place.
                </p>

                <ul className="cc-login-features">
                  <li><FileText size={16} /> Medical report review</li>
                  <li><Sparkles size={16} /> AI-assisted diagnostics</li>
                  <li><Stethoscope size={16} /> Clinical coordination</li>
                </ul>

                <div className="mt-6">
                  <DoctorAuthForm />
                </div>
              </div>
            </MotionStaggerItem>
          </div>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
