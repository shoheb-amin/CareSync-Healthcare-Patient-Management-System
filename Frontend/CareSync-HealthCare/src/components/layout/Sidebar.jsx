import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  X,
} from 'lucide-react';
import hospitalLogo from '../../assets/hospital-building.png';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Doctors', path: '/doctors', icon: UserCheck },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Billing & Payments', path: '/billing', icon: CreditCard },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar-root ${isOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Link
          to="/dashboard"
          onClick={onClose}
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
              background: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '3px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              flexShrink: 0,
            }}
          >
            <img
              src={hospitalLogo}
              alt="CareSync Hospital"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              CareSync
            </h2>
            <p style={{ fontSize: '0.675rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 600 }}>
              Hospital Management
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.75rem',
          color: '#bfdbfe',
        }}
      >
        CareSync v1.0.0 Microservices
      </div>
    </aside>
  );
}
