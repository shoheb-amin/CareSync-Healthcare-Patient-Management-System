import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import hospitalBuildingImg from '../../assets/hospital-building.png';

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile sidebar when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Global Hospital Background Watermark across full frontend */}
      <div
        className="hospital-global-watermark"
        style={{
          backgroundImage: `url(${hospitalBuildingImg})`,
        }}
        aria-hidden="true"
      />

      {/* Mobile Backdrop Overlay */}
      {mobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Drawer */}
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)} />
        <main className="main-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
