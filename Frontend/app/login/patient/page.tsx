import React from 'react';
import Link from 'next/link';
import { Fingerprint, Database, Activity, ArrowLeft } from 'lucide-react';
import { PatientAuthForm } from '@/components/portal/PatientAuthForm';

export default function PatientPortalPage() {
  return (
      <div className="cc-login-container">
      <div className="cc-login-bg">
        <div className="cc-orb cc-orb-blue" style={{ animationDelay: '-4s', top: '15%', left: '25%' }}></div>
        <div className="cc-orb cc-orb-red" style={{ background: 'var(--cc-neon-purple)', bottom: '12%', right: '18%' }}></div>
      </div>


      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cc-text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Portals
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
        <h1 className="cc-h1" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Patient <span className="cc-text-gradient">Access Portal</span>
        </h1>
        <p className="cc-subtitle" style={{ margin: '0' }}>
          Sign in to view your records, appointments, and care updates.
        </p>
      </div>

      <div className="cc-login-card cc-login-patient" style={{ position: 'relative', zIndex: 10, maxWidth: '520px' }}>
        <div className="cc-login-icon-box">
          <Fingerprint size={32} />
        </div>

        <h2 className="cc-h1" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Secure Patient Login</h2>
        <p className="cc-card-desc" style={{ marginBottom: '1.5rem' }}>
          Access medical history, lab reports, prescriptions, and your personal AI health assistant.
        </p>

        <ul className="cc-login-features">
          <li><Database size={16} /> Medical records access</li>
          <li><Activity size={16} /> Live health insights</li>
          <li><Fingerprint size={16} /> Biometric authentication</li>
        </ul>

        <div className="mt-6">
          <PatientAuthForm />
        </div>
      </div>
    </div>
  );
}
