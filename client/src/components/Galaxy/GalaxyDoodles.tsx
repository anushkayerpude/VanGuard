import React from 'react';

/**
 * Hand-drawn aesthetic galaxy vector doodles in #806874 palette
 */

// 1. Planet with Orbital Rings Doodle
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
    {/* Planet core */}
    <circle cx="25" cy="25" r="12" stroke="#b39ba8" strokeWidth="1.6" fill="rgba(128, 104, 116, 0.25)" />
    <path
      d="M16 23C18 20 22 19 26 21C29 23 33 21 35 24"
      stroke="#cfc0c8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M17 28C20 30 25 31 30 28"
      stroke="#b39ba8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Outer tilted rings */}
    <ellipse
      cx="25"
      cy="25"
      rx="22"
      ry="6.5"
      transform="rotate(-22 25 25)"
      stroke="#e5dce1"
      strokeWidth="1.5"
      strokeDasharray="4 2 8 2"
      strokeLinecap="round"
    />
    {/* Tiny satellite moon */}
    <circle cx="43" cy="18" r="2" fill="#e5dce1" />
    <path d="M43 14V22M39 18H47" stroke="#b39ba8" strokeWidth="0.8" opacity="0.6" />
  </svg>
);

// 2. Constellation Star Chart Doodle (Cassiopeia / W-form)
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
    {/* Dotted connecting lines */}
    <polyline
      points="8,10 20,28 34,14 46,30 54,8"
      stroke="#b39ba8"
      strokeWidth="1.2"
      strokeDasharray="2 3"
      strokeLinecap="round"
    />
    {/* Star nodes */}
    <circle cx="8" cy="10" r="3" fill="#e5dce1" stroke="#806874" strokeWidth="1" />
    <circle cx="20" cy="28" r="2.5" fill="#e5dce1" stroke="#806874" strokeWidth="1" />
    <circle cx="34" cy="14" r="3.5" fill="#f3eff1" stroke="#b39ba8" strokeWidth="1" />
    <circle cx="46" cy="30" r="2.5" fill="#e5dce1" stroke="#806874" strokeWidth="1" />
    <circle cx="54" cy="8" r="3" fill="#e5dce1" stroke="#806874" strokeWidth="1" />
    {/* Sparkle on main star */}
    <path d="M34 8V20M28 14H40" stroke="#e5dce1" strokeWidth="0.8" opacity="0.7" />
  </svg>
);

// 3. Hand-drawn Orbiting Satellite Doodle
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
    {/* Solar panel left */}
    <rect x="4" y="15" width="10" height="10" rx="1.5" stroke="#b39ba8" strokeWidth="1.2" fill="rgba(128, 104, 116, 0.3)" />
    <line x1="9" y1="15" x2="9" y2="25" stroke="#b39ba8" strokeWidth="0.8" />
    <line x1="4" y1="20" x2="14" y2="20" stroke="#b39ba8" strokeWidth="0.8" />

    {/* Center bus body */}
    <rect x="16" y="16" width="8" height="8" rx="2" stroke="#e5dce1" strokeWidth="1.4" fill="rgba(179, 155, 168, 0.4)" />
    <circle cx="20" cy="20" r="1.5" fill="#e5dce1" />

    {/* Solar panel right */}
    <rect x="26" y="15" width="10" height="10" rx="1.5" stroke="#b39ba8" strokeWidth="1.2" fill="rgba(128, 104, 116, 0.3)" />
    <line x1="31" y1="15" x2="31" y2="25" stroke="#b39ba8" strokeWidth="0.8" />
    <line x1="26" y1="20" x2="36" y2="20" stroke="#b39ba8" strokeWidth="0.8" />

    {/* Antenna dish */}
    <path d="M20 16V9M16 9C16 9 18 6 20 6C22 6 24 9 24 9" stroke="#e5dce1" strokeWidth="1.2" strokeLinecap="round" />
    {/* Radio beam waves */}
    <path d="M17 3C19 2 21 2 23 3" stroke="#cfc0c8" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
  </svg>
);

// 4. Shooting Star & Meteor Trail Doodle
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
    {/* Trail glow lines */}
    <path d="M4 26L34 10" stroke="#806874" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    <path d="M14 24L38 10" stroke="#b39ba8" strokeWidth="1.2" strokeDasharray="3 3" strokeLinecap="round" />
    <path d="M22 20L42 10" stroke="#cfc0c8" strokeWidth="1.6" strokeLinecap="round" />

    {/* Star head 4-point sparkle */}
    <path
      d="M42 4L44 9L49 10L44 11L42 16L40 11L35 10L40 9L42 4Z"
      fill="#f3eff1"
      stroke="#e5dce1"
      strokeWidth="0.8"
    />
  </svg>
);

// 5. Galaxy Spiral Swirl Doodle
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
    {/* Inner and outer spiral arms */}
    <path
      d="M25 25C26 21 30 20 32 23C35 28 32 34 26 35C18 36 14 28 16 20C18 10 30 8 38 12C45 16 46 28 42 36"
      stroke="#b39ba8"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeDasharray="2 3 6 3"
      opacity="0.65"
    />
    <path
      d="M25 25C24 29 20 30 18 27C15 22 18 16 24 15C32 14 36 22 34 30C32 40 20 42 12 38C5 34 4 22 8 14"
      stroke="#cfc0c8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.75"
    />
    {/* Galactic core star cluster */}
    <circle cx="25" cy="25" r="3" fill="#f3eff1" />
    <circle cx="29" cy="22" r="1.5" fill="#e5dce1" />
    <circle cx="21" cy="27" r="1.2" fill="#b39ba8" />
    <circle cx="33" cy="29" r="1" fill="#cfc0c8" />
  </svg>
);

// 6. Cute Rocket Spacecraft Doodle
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
    {/* Rocket fuselage */}
    <path
      d="M20 6C20 6 27 12 27 24L20 28L13 24C13 12 20 6 20 6Z"
      stroke="#e5dce1"
      strokeWidth="1.4"
      fill="rgba(128, 104, 116, 0.35)"
      strokeLinejoin="round"
    />
    {/* Porthole window */}
    <circle cx="20" cy="16" r="3" stroke="#b39ba8" strokeWidth="1.2" fill="rgba(207, 192, 200, 0.5)" />
    <circle cx="19.2" cy="15.2" r="0.8" fill="#ffffff" />
    {/* Fins */}
    <path d="M13 22L7 27L13 26" stroke="#b39ba8" strokeWidth="1.2" fill="rgba(128, 104, 116, 0.4)" strokeLinejoin="round" />
    <path d="M27 22L33 27L27 26" stroke="#b39ba8" strokeWidth="1.2" fill="rgba(128, 104, 116, 0.4)" strokeLinejoin="round" />
    {/* Flame booster */}
    <path d="M17 28L20 34L23 28" stroke="#cfa07e" strokeWidth="1.2" fill="rgba(207, 160, 126, 0.4)" strokeLinecap="round" />
  </svg>
);

// 7. Sparkle Star Cluster Doodle
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
      fill="#f3eff1"
      stroke="#b39ba8"
      strokeWidth="0.8"
    />
    <circle cx="7" cy="6" r="1" fill="#cfc0c8" />
    <circle cx="23" cy="22" r="1.2" fill="#cfc0c8" />
  </svg>
);
