import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Menu } from 'lucide-react';
import hospitalLogo from '../../assets/hospital-building.png';

export default function Header({ onToggleMobileNav }) {
  const { user, logout } = useAuth();

  return (
    <header className="header-root">
      {/* Left Area: Mobile Hamburger + Hospital Identity */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          className="header-hamburger-btn"
          onClick={onToggleMobileNav}
          aria-label="Open Navigation Menu"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Hospital Identity & Campus Name */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          title="Go to Dashboard"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
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
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="header-brand-title">
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
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }}></span>
                <span className="header-badge-text">24x7 CLINICAL OPS</span>
              </span>
            </div>
            <p className="header-subtitle">
              Central Healthcare Facility &bull; Emergency, Inpatient &amp; Outpatient Services
            </p>
          </div>
        </Link>
      </div>

      {/* User profile & Sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--slate-600)',
              flexShrink: 0,
            }}
          >
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="header-user-email"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--primary-navy)',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.sub || 'Admin'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Shield size={11} color="var(--teal-600)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}
          title="Sign out of CareSync"
        >
          <LogOut size={15} />
          <span style={{ display: 'inline' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
