import React from 'react';

export default function HospitalWatermark() {
  return (
    <div
      className="hospital-watermark-container"
      style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '680px',
        maxWidth: '90vw',
        height: '680px',
        maxHeight: '90vw',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.045,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 600"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="watermarkTopArc"
            d="M 90,300 A 210,210 0 0,1 510,300"
            fill="none"
          />
          <path
            id="watermarkBottomArc"
            d="M 510,300 A 210,210 0 0,1 90,300"
            fill="none"
          />
        </defs>

        {/* Outer Circular Hospital Seal Rings */}
        <circle cx="300" cy="300" r="280" stroke="#0f172a" strokeWidth="4" strokeDasharray="10 8" />
        <circle cx="300" cy="300" r="260" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="300" cy="300" r="195" stroke="#0f172a" strokeWidth="2" />
        <circle cx="300" cy="300" r="135" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Circular Curved Typography */}
        <text fill="#0f172a" fontSize="16" fontWeight="800" letterSpacing="4.5">
          <textPath href="#watermarkTopArc" startOffset="50%" textAnchor="middle">
            CARESYNC HEALTHCARE SYSTEM
          </textPath>
        </text>

        <text fill="#0f172a" fontSize="13.5" fontWeight="700" letterSpacing="3.5">
          <textPath href="#watermarkBottomArc" startOffset="50%" textAnchor="middle">
            ★ HOSPITAL MANAGEMENT &amp; CLINICAL OPERATIONS ★
          </textPath>
        </text>

        {/* Prominent Hospital Cross Emblem */}
        <path
          d="M 260,150 H 340 V 240 H 430 V 320 H 340 V 410 H 260 V 320 H 170 V 240 H 260 Z"
          fill="#0f172a"
          fillOpacity="0.88"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Cardiac Rhythm / Heartbeat ECG Waveform through the Cross */}
        <path
          d="M 120,280 L 220,280 L 240,245 L 260,315 L 280,210 L 305,345 L 325,255 L 345,295 L 360,280 L 480,280"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Caduceus / Rod of Asclepius & Medical Seal Stars */}
        <circle cx="300" cy="100" r="8" fill="#0f172a" />
        <circle cx="300" cy="500" r="8" fill="#0f172a" />
        <circle cx="100" cy="300" r="8" fill="#0f172a" />
        <circle cx="500" cy="300" r="8" fill="#0f172a" />

        <circle cx="158" cy="158" r="5" fill="#0f172a" />
        <circle cx="442" cy="158" r="5" fill="#0f172a" />
        <circle cx="158" cy="442" r="5" fill="#0f172a" />
        <circle cx="442" cy="442" r="5" fill="#0f172a" />
      </svg>
    </div>
  );
}
