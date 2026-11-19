import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';
import hospitalLogo from '../../assets/hospital-building.png';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Hospital Identity & Campus Name */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
        title="Go to Dashboard"
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--slate-50)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            padding: '2px',
          }}
        >
          <img
            src={hospitalLogo}
            alt="CareSync Hospital"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--primary-navy)',
                letterSpacing: '-0.02em',
              }}
            >
              CareSync Multi-Speciality Hospital
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              24x7 CLINICAL OPS
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Central Healthcare Facility &bull; Emergency, Inpatient &amp; Outpatient Services
          </p>
        </div>
      </Link>

      {/* User profile & Sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--slate-600)',
            }}
          >
            <User size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
              {user?.sub || 'Authenticated User'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} color="var(--teal-600)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Sign out of CareSync"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
