import React from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-input-wrapper">
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--slate-400)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '36px' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
