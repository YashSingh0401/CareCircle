import React from 'react';
import Link from 'next/link';
import { Stethoscope, Users, UserCog, ArrowLeft } from 'lucide-react';

export default function HospitalPortalPage() {
  return (
    <div className="cc-login-container">
      {/* Animated Background */}
      <div className="cc-login-bg">
        <div className="cc-orb cc-orb-blue" style={{ animationDelay: '-5s', top: '20%', left: '30%' }}></div>
        <div className="cc-orb cc-orb-red" style={{ background: 'var(--cc-neon-purple)', bottom: '10%', right: '20%' }}></div>
      </div>

      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cc-text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.3s' }}>
          <ArrowLeft size={16} /> Back to Portals
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
        <h1 className="cc-h1" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Hospital <span className="cc-text-gradient">Access Portal</span>
        </h1>
        <p className="cc-subtitle" style={{ margin: '0' }}>
          Select your authorized role to access the central management system.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', justifyItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px' }}>
        
        {/* Staff Login Card */}
        <Link href="/login/hospital/staff" className="cc-login-card cc-login-staff" style={{ width: '100%', maxWidth: '350px' }}>

          <div className="cc-login-icon-box">
            <Users size={32} />
          </div>
          <h2 className="cc-h1" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Staff Login</h2>
          <p className="cc-card-desc" style={{ marginBottom: '1rem', flex: 1 }}>
            Manage patient queues, emergency alerts, and hospital operations dynamically.
          </p>
        </Link>

        {/* Doctor Login Card */}
        <Link href="/login/hospital/doctor" className="cc-login-card cc-login-doctor" style={{ maxWidth: '350px' }}>
          <div className="cc-login-icon-box">
            <Stethoscope size={32} />
          </div>
          <h2 className="cc-h1" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Doctor Login</h2>
          <p className="cc-card-desc" style={{ marginBottom: '1rem', flex: 1 }}>
            Access patient medical history, reports, and emergency cases in real-time.
          </p>
        </Link>

        {/* Admin Login Card */}
        <Link href="/login/hospital/admin" className="cc-login-card cc-login-admin" style={{ maxWidth: '350px' }}>
          <div className="cc-login-icon-box">
            <UserCog size={32} />
          </div>
          <h2 className="cc-h1" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Login</h2>
          <p className="cc-card-desc" style={{ marginBottom: '1rem', flex: 1 }}>
            Manage hospital database, users, records, analytics, and system control.
          </p>
        </Link>

      </div>
    </div>
  );
}
