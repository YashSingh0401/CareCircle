import React from "react";
import Link from "next/link";
import { Users, ArrowRight, BellRing, ClipboardList } from "lucide-react";
import { MotionPage, MotionStagger, MotionStaggerItem } from "@/components/motion/carecircle-motion";

export default function HospitalStaffPortalPage() {
  return (
    <MotionPage className="cc-login-container">
      <MotionStagger className="w-full">
        <div className="cc-login-bg">
          <div className="cc-orb cc-orb-blue" style={{ animationDelay: "-3s", top: "18%", left: "22%" }}></div>
          <div className="cc-orb cc-orb-red" style={{ background: "var(--cc-neon-purple)", bottom: "10%", right: "16%" }}></div>
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
                Staff <span className="cc-text-gradient">Operations Portal</span>
              </h1>
              <p className="cc-subtitle">
                Manage wards, queue flow, and support tasks from a single command view.
              </p>
            </MotionStaggerItem>

            <MotionStaggerItem className="cc-portal-card-wrapper">
              <div className="cc-portal-gradient-bg" />
              <div className="cc-login-card cc-login-staff">
                <div className="cc-login-icon-box">
                  <Users size={32} />
                </div>

                <h2 className="cc-h1" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Staff Login</h2>
                <p className="cc-card-desc">
                  Access operational tools for patient coordination, task routing, and alerts.
                </p>

                <ul className="cc-login-features">
                  <li><ClipboardList size={16} /> Patient queue management</li>
                  <li><BellRing size={16} /> Emergency alerts</li>
                  <li><Users size={16} /> Team coordination</li>
                </ul>

                <Link href="/dashboard/admin" className="cc-portal-link-btn cc-portal-link-btn--purple">
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
