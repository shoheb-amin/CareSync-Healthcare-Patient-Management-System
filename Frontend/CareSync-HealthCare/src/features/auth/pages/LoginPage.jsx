import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/NotificationContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import hospitalLogo from '../../../assets/hospital-building.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        addToast('Successfully signed in to CareSync', 'success');
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid email or password. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.status === 401
          ? 'Invalid credentials provided. Check email or password.'
          : 'Unable to connect to Auth Service. Ensure API Gateway is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '20px',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* Background Hospital Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '580px',
          maxWidth: '90vw',
          height: '580px',
          maxHeight: '90vh',
          backgroundImage: `url(${hospitalLogo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
        }}
        aria-hidden="true"
      />

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)',
          padding: 'clamp(20px, 6vw, 36px)',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '14px',
            }}
          >
            <img
              src={hospitalLogo}
              alt="Hospital Logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em', margin: 0 }}>
            CareSync Multi-Speciality Hospital
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '6px', marginBottom: 0 }}>
            Hospital &amp; Patient Management System
          </p>
        </div>

        {isExpired && (
          <div
            style={{
              backgroundColor: 'var(--warning-bg)',
              color: '#92400e',
              border: '1px solid #fde68a',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="name@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ padding: '0.75rem 1rem', fontSize: '0.925rem' }}
          >
            {loading ? <LoadingSpinner size="18px" color="#ffffff" /> : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          For any queries regarding login or account access, please contact hospital administration support.
        </div>
      </div>
    </div>
  );
}
