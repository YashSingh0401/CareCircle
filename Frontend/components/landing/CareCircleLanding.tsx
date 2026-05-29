"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  FileText,
  Fingerprint,
  HeartPulse,
  Layers3,
  Map,
  MapPinned,
  Shield,
  Sparkles,
  Stethoscope,
  UserCog,
  Users,
  Waves,
  AlertTriangle,
  Route,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  MotionCard,
  MotionGlowLine,
  MotionPulseDot,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/carecircle-motion";

import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";

const featureList = [
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description: "Verify identity instantly using secure biometric signals—built for healthcare-grade trust.",
  },
  {
    icon: FileText,
    title: "AI Medical Report Analyzer",
    description: "AI highlights anomalies, summarizes trends, and helps doctors move from data to decisions faster.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency SOS System",
    description: "One-tap critical response that triages, notifies staff, and prioritizes the next best action.",
  },
  {
    icon: Activity,
    title: "Realtime Queue Tracking",
    description: "Live waiting-room telemetry and token routing to reduce friction and improve throughput.",
  },
  {
    icon: HeartPulse,
    title: "Medical History Timeline",
    description: "A unified, scrollable medical timeline—structured, readable, and always accessible.",
  },
  {
    icon: Map,
    title: "Smart Hospital Navigation",
    description: "Intuitive guidance that helps patients and staff find the right department, room, or lab.",
  },
];

const portalList = [
  {
    icon: Users,
    title: "Patient Portal",
    description: "Appointments, lab insights, and live queue status—made emotionally simple.",
    accent: "rgba(0, 240, 255, 0.12)",
    glow: "rgba(0, 240, 255, 0.35)",
    href: "/login/patient",
  },
  {
    icon: Stethoscope,
    title: "Doctor Portal",
    description: "AI-assisted insights, timelines, and secure cross-department collaboration.",
    accent: "rgba(121, 40, 202, 0.14)",
    glow: "rgba(121, 40, 202, 0.38)",
    href: "/login/hospital/doctor",
  },
  {
    icon: Activity,
    title: "Staff Portal",
    description: "Dynamic tasks, prep tracking, and realtime room readiness signals.",
    accent: "rgba(255, 0, 128, 0.12)",
    glow: "rgba(255, 0, 128, 0.35)",
    href: "/login/hospital/staff",
  },
  {
    icon: UserCog,
    title: "Admin Portal",
    description: "Operational clarity: AI predictions, hospital metrics, and resource planning.",
    accent: "rgba(0, 112, 243, 0.14)",
    glow: "rgba(0, 112, 243, 0.4)",
    href: "/login/hospital/admin",
  },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function CareCircleLanding() {
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });
  const [demoSosActive, setDemoSosActive] = React.useState(false);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      setMouse({ x: clamp(e.clientX / w, 0, 1), y: clamp(e.clientY / h, 0, 1) });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Realtime data (already driven by RealtimeSimulatorDriver in layout)
  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const emergencyPulseOn = useRealtimeSimulatorStore((s) => s.emergencyPulseOn);
  const liveDoctors = useRealtimeSimulatorStore((s) => s.liveDoctors);
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);

  const criticalEmergency = liveEmergencies.find((e) => e.priority === "critical");
  const queueCalled = liveQueue.filter((q) => q.status === "called");
  const queuePriority = liveQueue.filter((q) => q.status === "priority");
  const sosActive = emergencyPulseOn || demoSosActive;

  const heroParallax = {
    transform: `translate3d(${(mouse.x - 0.5) * 10}px, ${(mouse.y - 0.5) * 10}px, 0)`,
  };

  const dashboardParallax = {
    transform: `translate3d(${(mouse.x - 0.5) * 14}px, ${(mouse.y - 0.5) * 8}px, 0)`,
  };

  function triggerDemoSos() {
    setDemoSosActive(true);
    toast.error("Demo SOS dispatched", {
      description: "Frontend-only alert sent to the simulated triage board.",
    });
    window.setTimeout(() => setDemoSosActive(false), 7000);
  }

  return (
    <div className="cc-landing-root">
      <MotionStagger>
        {/* NAV */}
        <nav className="cc-nav">
          <div className="cc-logo">
            <div className="cc-logo-icon flex items-center justify-center">
              <HeartPulse size={14} color="#050505" />
            </div>
            CareCircle
          </div>
          <div className="cc-nav-ctas">
            <Link href="/login" className="cc-btn cc-btn-glow text-sm px-4 py-2">
              Sign In
            </Link>
          </div>
        </nav>

        {/* SECTION 1 — HERO */}
        <section className="cc-hero cc-container" aria-label="CareCircle hero">
          <div className="cc-bg-layers" aria-hidden>
            <div className="cc-bg-mesh" />
            <div className="cc-bg-grid" />
            <div className="cc-bg-particles" />
            <div className="cc-bg-lights" />
          </div>

          <motion.div className="cc-hero-left" style={heroParallax}>
            <MotionStaggerItem>
              <div className="cc-hero-badge">
                <Sparkles size={16} /> AI-powered Medical OS
              </div>
            </MotionStaggerItem>

            <MotionStaggerItem>
              <h1 className="cc-h1">
                Smart Healthcare <br />
                <span className="cc-text-gradient-accent">Powered by AI & Biometrics</span>
              </h1>
            </MotionStaggerItem>

            <MotionStaggerItem>
              <p className="cc-subtitle">
                CareCircle improves emergency response, expands medical accessibility, reduces queue friction, and delivers
                AI-powered healthcare assistance—so hospitals can act faster, and patients feel safer.
              </p>
            </MotionStaggerItem>

            <MotionStaggerItem>
              <div className="cc-hero-cta">
                <Link href="/login" className="cc-btn cc-btn-primary">
                  Start Free Trial <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
                <Link href="/login" className="cc-btn cc-btn-glow">
                  Book a Demo
                </Link>
              </div>
            </MotionStaggerItem>

            <div className="cc-hero-trustline" aria-label="Trust line">
              <div className="cc-hero-trustitem">
                <MotionPulseDot className="cc-dot-neon" />
                <span>Biometric protected access</span>
              </div>
              <div className="cc-hero-trustdivider" />
              <div className="cc-hero-trustitem">
                <MotionPulseDot className="cc-dot-neon cc-dot-emerald" />
                <span>Realtime queue telemetry</span>
              </div>
              <div className="cc-hero-trustdivider" />
              <div className="cc-hero-trustitem">
                <MotionPulseDot className="cc-dot-neon cc-dot-red" />
                <span>Emergency-first dispatch</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="cc-hero-right" style={dashboardParallax}>
            <MotionStaggerItem>
              <div className="cc-hero-visual-stack">
                <div className="cc-holo-medcard cc-holo-medcard--a" />
                <div className="cc-holo-medcard cc-holo-medcard--b" />
                <div className="cc-holo-medcard cc-holo-medcard--c" />

                {/* Dashboard preview */}
                <div className="cc-dashboard-preview cc-dashboard-preview--hero">
                  <div className="cc-dashboard-header">
                    <div className="cc-dot red" />
                    <div className="cc-dot yellow" />
                    <div className="cc-dot green" />
                    <div className="cc-dashboard-header-meta">
                      <Shield size={12} /> Secure E2E Encryption
                    </div>
                  </div>

                  <div className="cc-dashboard-body">
                    <div className="cc-dashboard-sidebar">
                      <div className="cc-skeleton cc-skeleton--pulse" style={{ height: 30, width: "80%", marginBottom: 10 }} />
                      <div className="cc-skeleton" style={{ height: 20, width: "100%" }} />
                      <div className="cc-skeleton" style={{ height: 20, width: "90%" }} />
                      <div className="cc-skeleton" style={{ height: 20, width: "95%" }} />
                      <div className="cc-skeleton" style={{ height: 20, width: "85%" }} />
                    </div>

                    <div className="cc-dashboard-main">
                      <div className="cc-hero-mini-grid">
                        <div className="cc-hero-analytics-card">
                          <div className="cc-hero-analytics-title">Queue Pulse</div>
                          <div className="cc-hero-analytics-row">
                            <span className="cc-status-pill cc-status-pill--emerald">{queueCalled.length || 0} called</span>
                            <span className="cc-status-pill">{queuePriority.length || 0} priority</span>
                          </div>
                          <div className="cc-bars" aria-hidden>
                            {[12, 24, 18, 32, 26, 40].map((h, i) => (
                              <div key={i} className="cc-bar" style={{ height: `${h}px` }} />
                            ))}
                          </div>
                        </div>

                        <div className="cc-hero-analytics-card cc-hero-analytics-card--alt">
                          <div className="cc-hero-analytics-title">AI Insight</div>
                          <div className="cc-hero-ai-line">
                            <span className="cc-ai-chip">Anomaly scan</span>
                            <span className={"cc-ai-chip cc-ai-chip--hot"}>+{Math.floor(5 + (queuePriority.length % 9))} risk points</span>
                          </div>
                          <div className="cc-ai-spark" aria-hidden />
                        </div>
                      </div>

                      <div className="cc-hero-queue-strip">
                        <div className="cc-queue-strip-left">
                          <span className={"cc-queue-flag " + (sosActive ? "cc-queue-flag--hot" : "")}>Live</span>
                          <span className="cc-queue-strip-title">Realtime notifications</span>
                        </div>
                        <div className="cc-queue-strip-right">
                          <Bell size={16} />
                          <span>{(toastQueue?.[0]?.title || "System update").toString().slice(0, 28)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionStaggerItem>
          </motion.div>
        </section>

        {/* SECTION 2 — FEATURE SHOWCASE */}
        <section className="cc-section cc-container" aria-label="Feature showcase">
          <div className="cc-section-head">
            <h2 className="cc-h2">
              Premium <span className="cc-text-gradient-accent">Feature OS</span>
            </h2>
            <p className="cc-subtitle" style={{ maxWidth: 760 }}>
              Biometric security, AI medical analysis, emergency dispatch, queue telemetry, timeline intelligence, and smart navigation.
            </p>
          </div>

          <MotionStagger>
            <div className="cc-feature-grid">
              {featureList.map((f) => {
                const Icon = f.icon;
                return (
                  <MotionStaggerItem key={f.title}>
                    <MotionCard className="cc-feature-card" whileHover={{ y: -6, scale: 1.015 }}>
                      <div className="cc-feature-card-sheen" aria-hidden />

                      <div className="cc-feature-card-top">
                        <div className="cc-feature-icon">
                          <Icon size={30} />
                        </div>
                      </div>

                      <h3 className="cc-feature-title">{f.title}</h3>
                      <p className="cc-feature-desc">{f.description}</p>

                      <div className="cc-feature-bottom">
                        <MotionGlowLine className="cc-feature-line" />
                        <a
                          className="cc-feature-action"
                          href="/login"
                          aria-label={`See ${f.title} in action`}
                        >
                          See in action
                        </a>
                      </div>

                    </MotionCard>
                  </MotionStaggerItem>
                );
              })}
            </div>
          </MotionStagger>
        </section>

        {/* SECTION 3 — LIVE SYSTEM PREVIEW */}
        <section className="cc-section cc-container" aria-label="Live system preview">
          <div className="cc-section-head">
            <h2 className="cc-h2">
              Live <span className="cc-text-gradient-accent">Healthcare Operating System</span>
            </h2>
            <p className="cc-subtitle" style={{ maxWidth: 800 }}>
              A realtime cockpit for queue flow, AI insights, emergency triage, and notifications—powered by CareCircle’s simulation.
            </p>
          </div>

          <div className="cc-dashboard-live">
            {/* Left: queue + analytics */}
            <div className="cc-live-panels">
              <MotionStagger>
                <MotionStaggerItem>
                  <div className="cc-live-card cc-live-card--queue">
                    <div className="cc-live-card-head">
                      <div className="cc-live-card-title">
                        <Layers3 size={16} /> Patient Queue
                      </div>
                      <span className={"cc-live-status " + (sosActive ? "cc-live-status--hot" : "")}>Realtime</span>
                    </div>

                    <div className="cc-queue-rows">
                      {liveQueue.slice(0, 4).map((q) => (
                        <div key={q.token} className={"cc-queue-row " + (q.status === "called" ? "cc-queue-row--called" : q.status === "priority" ? "cc-queue-row--priority" : "")}
                        >
                          <div className="cc-queue-token">{q.token}</div>
                          <div className="cc-queue-patient">{q.patient}</div>
                          <div className="cc-queue-wait">{q.wait}</div>
                          <div className="cc-queue-pill">{q.status}</div>
                        </div>
                      ))}
                    </div>

                    <div className="cc-analytics-grid" aria-label="Queue analytics">
                      <div className="cc-analytics-mini">
                        <div className="cc-analytics-label">Called</div>
                        <div className="cc-analytics-value cc-analytics-value--emerald">{queueCalled.length || 0}</div>
                        <div className="cc-analytics-bars" aria-hidden>
                          {[0, 1, 3, 2, 4, 5].map((i) => (
                            <div key={i} className="cc-analytics-bar" style={{ height: `${8 + i * 8}px` }} />
                          ))}
                        </div>
                      </div>
                      <div className="cc-analytics-mini">
                        <div className="cc-analytics-label">Priority</div>
                        <div className="cc-analytics-value cc-analytics-value--cyan">{queuePriority.length || 0}</div>
                        <div className="cc-analytics-bars" aria-hidden>
                          {[2, 4, 1, 5, 3, 6].map((i) => (
                            <div key={i} className="cc-analytics-bar cc-analytics-bar--cyan" style={{ height: `${8 + i * 7}px` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionStaggerItem>

                <MotionStaggerItem>
                  <div className="cc-live-card cc-live-card--ai">
                    <div className="cc-live-card-head">
                      <div className="cc-live-card-title">
                        <FileText size={16} /> AI Analysis Preview
                      </div>
                      <span className="cc-live-status cc-live-status--cyan">Medical OS</span>
                    </div>

                    <div className="cc-ai-preview">
                      <div className="cc-ai-preview-left">
                        <div className="cc-ai-score">
                          <span className="cc-ai-score-label">Risk Index</span>
                          <span className={"cc-ai-score-value " + (sosActive ? "cc-ai-score-value--hot" : "")}>{
                            Math.min(99, 38 + queuePriority.length * 14 + (sosActive ? 22 : 0))
                          }</span>
                        </div>
                        <div className="cc-ai-bullets">
                          <div className="cc-ai-bullet">
                            <span className="cc-ai-bullet-dot cc-ai-bullet-dot--cyan" />
                            Anomaly scan summary
                          </div>
                          <div className="cc-ai-bullet">
                            <span className="cc-ai-bullet-dot cc-ai-bullet-dot--emerald" />
                            Condition prioritization
                          </div>
                          <div className="cc-ai-bullet">
                            <span className="cc-ai-bullet-dot cc-ai-bullet-dot--rose" />
                            Suggested next actions
                          </div>
                        </div>
                      </div>

                      <div className="cc-ai-preview-right">
                        <div className={"cc-ai-holo-chart " + (sosActive ? "cc-ai-holo-chart--pulse" : "")}
                          aria-hidden>
                          <div className="cc-ai-holo-chart-grid" />
                          {[6, 12, 18, 14, 22, 26, 19].map((h, i) => (
                            <div key={i} className="cc-ai-holo-chart-bar" style={{ height: `${h * 3}px` }} />
                          ))}
                        </div>
                        <div className="cc-ai-preview-footer">
                          <BadgeCheck size={16} /> AI validation + encrypted summary
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionStaggerItem>
              </MotionStagger>
            </div>

            {/* Right: emergency + feed + notifications */}
            <div className="cc-live-right">
              <div className={"cc-live-card cc-live-card--emergency " + (sosActive ? "cc-live-card--emergency--hot" : "")}
              >
                <div className="cc-live-card-head">
                  <div className="cc-live-card-title">
                    <AlertTriangle size={16} /> Emergency Triage
                  </div>
                  <span className={"cc-live-status " + (sosActive ? "cc-live-status--hot" : "cc-live-status--stable")}>
                    {sosActive ? "Critical" : "Stable"}
                  </span>
                </div>

                <div className="cc-emergency-sim">
                  <div className="cc-emergency-pop">
                    <div className="cc-emergency-pop-top">
                      <span className="cc-emergency-room">{criticalEmergency?.room || "Emergency Bay —"}</span>
                      <span className="cc-emergency-priority">{criticalEmergency?.priority || "—"}</span>
                    </div>
                    <div className="cc-emergency-title">{criticalEmergency?.title || "Awaiting realtime escalation"}</div>
                    <div className="cc-emergency-status">{criticalEmergency?.status || "Systems monitoring vitals stream"}</div>
                  </div>

                  <div className="cc-emergency-nurse">
                    <div className="cc-nurse-head">
                      <span className="cc-nurse-dot" /> Nurse Notification
                    </div>
                    <div className="cc-nurse-line">
                      {sosActive ? "Response acknowledged" : "No critical alerts"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="cc-live-card cc-live-card--feed">
                <div className="cc-live-card-head">
                  <div className="cc-live-card-title">
                    <Bell size={16} /> Realtime Notifications
                  </div>
                  <span className="cc-live-status cc-live-status--cyan">AI Dispatch</span>
                </div>

                <div className="cc-feed-list" role="log" aria-label="Live feed">
                  {feedItems.slice(0, 5).map((it) => (
                    <div key={it.id} className={"cc-feed-item cc-feed-item--" + (it.tone || "cyan")}>
                      <div className="cc-feed-time">{it.time}</div>
                      <div className="cc-feed-main">
                        <div className="cc-feed-title">{it.title}</div>
                        <div className="cc-feed-detail">{it.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cc-live-card cc-live-card--queue2">
                <div className="cc-live-card-head">
                  <div className="cc-live-card-title">
                    <Activity size={16} /> Doctors & Consult Load
                  </div>
                  <span className="cc-live-status cc-live-status--emerald">Realtime</span>
                </div>

                <div className="cc-doctor-rows">
                  {liveDoctors.slice(0, 3).map((d) => (
                    <div key={d.name} className={"cc-doctor-row cc-doctor-row--" + d.state}>
                      <div className="cc-doctor-name">{d.name}</div>
                      <div className="cc-doctor-spec">{d.specialty}</div>
                      <div className="cc-doctor-consults">{d.consults} streams</div>
                      <div className="cc-doctor-pill">{d.state}</div>
                    </div>
                  ))}
                </div>

                <div className="cc-live-scrollhint">Scrolling system previews • cinematic telemetry</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — ROLE-BASED ACCESS */}
        <section className="cc-section cc-container" aria-label="Role-based access">
          <div className="cc-section-head">
            <h2 className="cc-h2">
              Role-based <span className="cc-text-gradient-accent">Smart Portals</span>
            </h2>
            <p className="cc-subtitle" style={{ maxWidth: 820 }}>
              Patients, doctors, staff, and administrators get interfaces designed for their workflows—premium, secure, and intuitive.
            </p>
          </div>

          <div className="cc-portal-grid">
            {portalList.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  className="cc-portal-card"
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="cc-portal-border" style={{ boxShadow: `0 0 0 1px ${p.glow}, 0 0 40px ${p.glow}` }} />
                  <div className="cc-portal-visual" style={{ background: p.accent }}>
                    <div className="cc-portal-visual-top" />
                    <Icon size={26} className="cc-portal-icon" />
                    <div className="cc-portal-holo" />
                  </div>

                  <div className="cc-portal-content">
                    <h3 className="cc-portal-title">{p.title}</h3>
                    <p className="cc-portal-desc">{p.description}</p>

                    <Link href={p.href} className="cc-portal-link">
                      Enter portal <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5 — EMERGENCY SYSTEM HIGHLIGHT */}
        <section className="cc-section cc-container" aria-label="Emergency system highlight">
          <div className="cc-section-head">
            <h2 className="cc-h2">
              Technology <span className="cc-text-gradient-accent">Saving Lives</span>
            </h2>
            <p className="cc-subtitle" style={{ maxWidth: 820 }}>
              A dramatic, realtime emergency experience—triage prioritization, nurse notification, and instant dispatch.
            </p>
          </div>

          <div className={"cc-emergency-drama " + (sosActive ? "cc-emergency-drama--hot" : "")}
          >
            <div className="cc-emergency-left">
              <button
                className={"cc-sos-giant " + (sosActive ? "cc-sos-giant--active" : "")}
                type="button"
                aria-label="Simulate emergency SOS"
                onClick={() => {
                  triggerDemoSos();
                  // We don't have a real SOS backend in this landing page.
                  // This click just creates a “demo feel” without mutating store.
                  // The realtime driver will continue simulation regardless.
                  // (Intentionally no-op.)
                }}
              >
                <motion.div
                  className="cc-sos-giant-glow"
                  animate={sosActive ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.65 }}
                  transition={{ duration: 1.05, repeat: sosActive ? Infinity : 0, ease: "easeInOut" }}
                />
                SOS
                <span className="cc-sos-sub">One tap dispatch</span>
              </button>

              <div className="cc-emergency-simulation">
                <div className="cc-emergency-sim-row">
                  <div className="cc-emergency-key">Emergency Queue Prioritization</div>
                  <div className="cc-emergency-value">{queuePriority.length ? `${queuePriority.length} priority tokens` : "No priority tokens"}</div>
                </div>
                <div className="cc-emergency-sim-row">
                  <div className="cc-emergency-key">Realtime Nurse Notification</div>
                  <div className="cc-emergency-value">{sosActive ? "Acknowledged - path recalculated" : "Standby - monitoring vitals"}</div>
                </div>
                <div className="cc-emergency-sim-row">
                  <div className="cc-emergency-key">Dispatch Model Update</div>
                  <div className="cc-emergency-value">{sosActive ? "Triage plan refreshing" : "AI dispatch stable"}</div>
                </div>
              </div>
            </div>

            <div className="cc-emergency-right">
              <div className="cc-emergency-panel cc-emergency-panel--ai">
                <div className="cc-emergency-panel-head">
                  <Route size={16} /> Emergency Alert Simulation
                </div>
                <div className="cc-emergency-panel-body">
                  <div className="cc-emergency-alert-badge">
                    <AlertTriangle size={16} /> {sosActive ? "ALERT ACTIVE" : "READY"}
                  </div>

                  <div className="cc-emergency-alert-copy">
                    <div className="cc-emergency-alert-title">{criticalEmergency?.title || "Waiting for critical events"}</div>
                    <div className="cc-emergency-alert-detail">
                      {criticalEmergency?.status || "Emergency triage model monitoring live signals and pathways."}
                    </div>
                  </div>

                  <div className="cc-emergency-room-track">
                    <div className="cc-room-track">
                      <div className="cc-room-track-head">Triage Desk</div>
                      <div className="cc-room-track-body">Telemetry synced</div>
                    </div>
                    <div className="cc-room-track">
                      <div className="cc-room-track-head">Rapid Response</div>
                      <div className="cc-room-track-body">{sosActive ? "En route now" : "Standby"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cc-emergency-panel cc-emergency-panel--team">
                <div className="cc-emergency-panel-head">
                  <MapPinned size={16} /> Live Response Team
                </div>
                <div className="cc-emergency-team">
                  {liveDoctors.slice(0, 3).map((d) => (
                    <div key={d.name} className={"cc-emergency-team-card cc-emergency-team-card--" + d.state}>
                      <div className="cc-team-card-top">
                        <div className="cc-team-name">{d.name.split(" ")[1] || d.name}</div>
                        <div className="cc-team-pill">{d.state}</div>
                      </div>
                      <div className="cc-team-spec">{d.specialty}</div>
                      <div className="cc-team-consults">{d.consults} consults</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — TRUST & SECURITY */}
        <section className="cc-section cc-container" aria-label="Trust and security">
          <div className="cc-section-head">
            <h2 className="cc-h2">
              Trust, Security & <span className="cc-text-gradient-accent">AI Validation</span>
            </h2>
            <p className="cc-subtitle" style={{ maxWidth: 820 }}>
              Biometric authentication, secure medical records, encryption-first data protection, and AI validation layers.
            </p>
          </div>

          <div className="cc-trust-grid">
            <div className="cc-trust-vault">
              <div className="cc-vault-glow" />
              <div className="cc-vault">
                <Shield size={26} />
                <div className="cc-vault-title">Medical Vault</div>
                <div className="cc-vault-sub">Encrypted records • access audited</div>
                <div className="cc-vault-seals" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="cc-vault-seal" />
                  ))}
                </div>
              </div>
            </div>

            <div className="cc-trust-cards">
              <MotionCard className="cc-trust-card">
                <div className="cc-trust-card-top">
                  <Fingerprint size={18} />
                  <h3 className="cc-trust-title">Biometric authentication</h3>
                </div>
                <p className="cc-trust-desc">Identity verification before access to sensitive medical areas.</p>
                <div className="cc-trust-metric">Zero-trust intent • secure entry</div>
              </MotionCard>

              <MotionCard className="cc-trust-card">
                <div className="cc-trust-card-top">
                  <Shield size={18} />
                  <h3 className="cc-trust-title">Secure medical records</h3>
                </div>
                <p className="cc-trust-desc">Tamper-resistant storage with role-based permissions and audit trails.</p>
                <div className="cc-trust-metric">Encrypted • verified • retrievable</div>
              </MotionCard>

              <MotionCard className="cc-trust-card">
                <div className="cc-trust-card-top">
                  <Waves size={18} />
                  <h3 className="cc-trust-title">Encrypted data protection</h3>
                </div>
                <p className="cc-trust-desc">End-to-end encryption for streaming signals, reports, and notifications.</p>
                <div className="cc-trust-metric">E2E • TLS-like secure channels</div>
              </MotionCard>

              <MotionCard className="cc-trust-card">
                <div className="cc-trust-card-top">
                  <Sparkles size={18} />
                  <h3 className="cc-trust-title">AI validation system</h3>
                </div>
                <p className="cc-trust-desc">AI validation checks anomalies and highlights risk with medical-safe summaries.</p>
                <div className="cc-trust-metric">Explainable insights • human-first</div>
              </MotionCard>
            </div>
          </div>
        </section>

        {/* SECTION 7 — FOOTER */}
        <footer className="cc-footer cc-container" aria-label="Footer">
          <div className="cc-footer-top">
            <div className="cc-logo">
              <div className="cc-logo-icon flex items-center justify-center">
                <HeartPulse size={14} color="#050505" />
              </div>
              CareCircle
            </div>

            <div className="cc-footer-links">
              <Link href="/privacy" className="cc-footer-link">Privacy</Link>
              <Link href="/terms" className="cc-footer-link">Terms</Link>
              <Link href="/contact" className="cc-footer-link">Contact</Link>
            </div>
          </div>

          <div className="cc-footer-divider" aria-hidden />

          <div className="cc-footer-bottom">
            <div style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
              &copy; {new Date().getFullYear()} CareCircle. Smart Healthcare OS.
            </div>

            <div className="cc-footer-social" aria-label="Social icons">
              <Link href="/login" className="cc-social" aria-label="Open CareCircle portal">
                <Sparkles size={16} />
              </Link>
              <Link href="/dashboard/patient" className="cc-social" aria-label="Open patient dashboard">
                <Bell size={16} />
              </Link>
              <Link href="/dashboard/admin" className="cc-social" aria-label="Open admin dashboard">
                <Shield size={16} />
              </Link>
            </div>
          </div>
        </footer>
      </MotionStagger>
    </div>
  );
}

