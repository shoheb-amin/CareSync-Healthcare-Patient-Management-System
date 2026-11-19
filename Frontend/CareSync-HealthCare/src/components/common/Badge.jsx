import React from 'react';

export default function Badge({ variant = 'neutral', children }) {
  let badgeClass = 'badge-neutral';
  if (variant === 'success') badgeClass = 'badge-success';
  if (variant === 'warning') badgeClass = 'badge-warning';
  if (variant === 'danger') badgeClass = 'badge-danger';
  if (variant === 'info') badgeClass = 'badge-info';

  return <span className={`badge ${badgeClass}`}>{children}</span>;
}
