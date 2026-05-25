import React from "react";
import Link from "next/link";
import { UserCog, ArrowRight, Database, Shield } from "lucide-react";
import { MotionPage, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";

export default function HospitalAdminPortalPage() {
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
                Admin <span className="cc-text-gradient">Control Portal</span>
              </h1>
              <p className="cc-subtitle">
                Monitor systems, manage records, and oversee hospital-wide access and analytics.
              </p>
            </MotionStaggerItem>

            <MotionStaggerItem className="cc-portal-card-wrapper">
              <div className="cc-portal-gradient-bg" />
              <div className="cc-login-card cc-login-admin">
                <div className="cc-login-icon-box">
                  <UserCog size={32} />
                </div>

                <h2 className="cc-h1" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Admin Login</h2>
                <p className="cc-card-desc">
                  Manage users, audit logs, databases, and operational controls from a central dashboard.
                </p>

                <ul className="cc-login-features">
                  <li><Database size={16} /> Database administration</li>
                  <li><Shield size={16} /> Security and compliance</li>
                  <li><UserCog size={16} /> User management</li>
                </ul>

                <Link href="/dashboard/admin" className="cc-portal-link-btn cc-portal-link-btn--pink">
                  Enter Portal <ArrowRight size={18} />
                </Link>
              </div>
            </MotionStaggerItem>
          </div>
        </div>
      </MotionStagger>
    </MotionPage>
  );
}
