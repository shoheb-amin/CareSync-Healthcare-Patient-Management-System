import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import hospitalBuildingImg from '../../assets/hospital-building.png';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', position: 'relative' }}>
      {/* Global Hospital Background Watermark across full frontend */}
      <div
        className="hospital-global-watermark"
        style={{
          backgroundImage: `url(${hospitalBuildingImg})`,
        }}
        aria-hidden="true"
      />

      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <Header />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
