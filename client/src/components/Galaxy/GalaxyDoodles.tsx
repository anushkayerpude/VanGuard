import React from 'react';

/**
 * Tactical aerospace & radar vector doodles in defense-appropriate color palette
 * (Cyan, Sky, Slate, Emerald, and Amber accents)
 */

// 1. Tactical Orbital Radar / Satellite Doodle
export const PlanetDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Core node */}
    <circle cx="25" cy="25" r="12" stroke="#38bdf8" strokeWidth="1.6" fill="rgba(14, 165, 233, 0.15)" />
    <path
      d="M16 23C18 20 22 19 26 21C29 23 33 21 35 24"
      stroke="#00f0ff"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M17 28C20 30 25 31 30 28"
      stroke="#38bdf8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Outer orbital radar sweep */}
    <ellipse
      cx="25"
      cy="25"
      rx="22"
      ry="6.5"
      transform="rotate(-22 25 25)"
      stroke="#00f0ff"
      strokeWidth="1.5"
      strokeDasharray="4 2 8 2"
      strokeLinecap="round"
    />
    {/* Satellite beacon */}
    <circle cx="43" cy="18" r="2" fill="#22c55e" />
    <path d="M43 14V22M39 18H47" stroke="#22c55e" strokeWidth="0.8" opacity="0.7" />
  </svg>
);

// 2. Tactical Constellation / C2 Mesh Network (Cassiopeia / Star Link form)
export const ConstellationDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 50,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Dotted data-link tracks */}
    <polyline
      points="8,10 20,28 34,14 46,30 54,8"
      stroke="#0284c7"
      strokeWidth="1.2"
      strokeDasharray="2 3"
      strokeLinecap="round"
    />
    {/* Network nodes */}
    <circle cx="8" cy="10" r="3" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
    <circle cx="20" cy="28" r="2.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
    <circle cx="34" cy="14" r="3.5" fill="#00f0ff" stroke="#0284c7" strokeWidth="1" />
    <circle cx="46" cy="30" r="2.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
    <circle cx="54" cy="8" r="3" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
    {/* Reticle on key hub */}
    <path d="M34 8V20M28 14H40" stroke="#00f0ff" strokeWidth="0.8" opacity="0.8" />
  </svg>
);

// 3. Hand-drawn Defense Satellite Doodle
export const SatelliteDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 36,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Solar array left */}
    <rect x="4" y="15" width="10" height="10" rx="2" stroke="#38bdf8" strokeWidth="1.2" fill="rgba(14, 165, 233, 0.25)" />
    <line x1="9" y1="15" x2="9" y2="25" stroke="#38bdf8" strokeWidth="0.8" />
    <line x1="4" y1="20" x2="14" y2="20" stroke="#38bdf8" strokeWidth="0.8" />

    {/* Center bus */}
    <rect x="16" y="16" width="8" height="8" rx="2" stroke="#00f0ff" strokeWidth="1.4" fill="rgba(2, 132, 199, 0.35)" />
    <circle cx="20" cy="20" r="1.5" fill="#22c55e" />

    {/* Solar array right */}
    <rect x="26" y="15" width="10" height="10" rx="2" stroke="#38bdf8" strokeWidth="1.2" fill="rgba(14, 165, 233, 0.25)" />
    <line x1="31" y1="15" x2="31" y2="25" stroke="#38bdf8" strokeWidth="0.8" />
    <line x1="26" y1="20" x2="36" y2="20" stroke="#38bdf8" strokeWidth="0.8" />

    {/* Transceiver horn */}
    <path d="M20 16V9M16 9C16 9 18 6 20 6C22 6 24 9 24 9" stroke="#00f0ff" strokeWidth="1.2" strokeLinecap="round" />
    {/* RF transmission pulses */}
    <path d="M17 3C19 2 21 2 23 3" stroke="#22c55e" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
  </svg>
);

// 4. Supersonic Intercept Vector / Trail Doodle
export const ShootingStarDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 42,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Hypersonic ionization trail */}
    <path d="M4 26L34 10" stroke="#0369a1" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    <path d="M14 24L38 10" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 3" strokeLinecap="round" />
    <path d="M22 20L42 10" stroke="#00f0ff" strokeWidth="1.6" strokeLinecap="round" />

    {/* Interceptor target icon */}
    <path
      d="M42 4L44 9L49 10L44 11L42 16L40 11L35 10L40 9L42 4Z"
      fill="#38bdf8"
      stroke="#00f0ff"
      strokeWidth="0.8"
    />
  </svg>
);

// 5. Tactical Radar Sweep / Spiral Doodle
export const GalaxySpiralDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 46,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Inner and outer radar beam waves */}
    <path
      d="M25 25C26 21 30 20 32 23C35 28 32 34 26 35C18 36 14 28 16 20C18 10 30 8 38 12C45 16 46 28 42 36"
      stroke="#0284c7"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeDasharray="2 3 6 3"
      opacity="0.65"
    />
    <path
      d="M25 25C24 29 20 30 18 27C15 22 18 16 24 15C32 14 36 22 34 30C32 40 20 42 12 38C5 34 4 22 8 14"
      stroke="#00f0ff"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.75"
    />
    {/* Core beacon cluster */}
    <circle cx="25" cy="25" r="3" fill="#00f0ff" />
    <circle cx="29" cy="22" r="1.5" fill="#38bdf8" />
    <circle cx="21" cy="27" r="1.2" fill="#22c55e" />
    <circle cx="33" cy="29" r="1" fill="#38bdf8" />
  </svg>
);

// 6. Aerospace Recon Vehicle Doodle
export const RocketDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 38,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Fuselage */}
    <path
      d="M20 6C20 6 27 12 27 24L20 28L13 24C13 12 20 6 20 6Z"
      stroke="#38bdf8"
      strokeWidth="1.4"
      fill="rgba(2, 132, 199, 0.3)"
      strokeLinejoin="round"
    />
    {/* Sensor bay */}
    <circle cx="20" cy="16" r="3" stroke="#00f0ff" strokeWidth="1.2" fill="rgba(0, 240, 255, 0.2)" />
    <circle cx="19.2" cy="15.2" r="0.8" fill="#ffffff" />
    {/* Delta wings */}
    <path d="M13 22L7 27L13 26" stroke="#0284c7" strokeWidth="1.2" fill="rgba(2, 132, 199, 0.3)" strokeLinejoin="round" />
    <path d="M27 22L33 27L27 26" stroke="#0284c7" strokeWidth="1.2" fill="rgba(2, 132, 199, 0.3)" strokeLinejoin="round" />
    {/* Thruster exhaust */}
    <path d="M17 28L20 34L23 28" stroke="#00f0ff" strokeWidth="1.2" fill="rgba(0, 240, 255, 0.5)" strokeLinecap="round" />
  </svg>
);

// 7. Tactical Sensor Lock Sparkle
export const SparkleDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M15 2L17.5 11.5L27 14L17.5 16.5L15 26L12.5 16.5L3 14L12.5 11.5L15 2Z"
      fill="#00f0ff"
      stroke="#38bdf8"
      strokeWidth="0.8"
    />
    <circle cx="7" cy="6" r="1" fill="#38bdf8" />
    <circle cx="23" cy="22" r="1.2" fill="#22c55e" />
  </svg>
);
