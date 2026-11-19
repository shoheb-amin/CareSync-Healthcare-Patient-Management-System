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
} from 'lucide-react';
import hospitalLogo from '../../assets/hospital-building.png';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Doctors', path: '/doctors', icon: UserCheck },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Billing & Payments', path: '/billing', icon: CreditCard },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Brand Header */}
      <Link
        to="/"
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
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

      {/* Navigation Links */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
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
