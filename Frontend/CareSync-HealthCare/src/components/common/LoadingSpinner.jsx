import React from 'react';

export default function LoadingSpinner({ size = '24px', color = 'var(--teal-600)' }) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `3px solid rgba(13, 148, 136, 0.2)`,
        borderRadius: '50%',
        borderTopColor: color,
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
