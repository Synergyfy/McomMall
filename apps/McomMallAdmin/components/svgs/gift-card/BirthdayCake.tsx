import React from 'react';

const BirthdayCake = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="cake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffecd2', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fcb69f', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="cake-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#cake-gradient)" />
    <g transform="translate(45 10)" filter="url(#cake-shadow)">
      <path d="M10 25 V 15 C 10 10, 20 10, 20 15 V 25 Z" fill="#fff" />
      <path d="M2 25 H 28" stroke="#F4A261" strokeWidth="2" />
      <path d="M4 20 H 26" stroke="#E76F51" strokeWidth="1.5" />
      <path d="M4 15 H 26" stroke="#E9C46A" strokeWidth="1.5" />
      <path d="M12 10 L 12 13" stroke="#D62828" strokeWidth="1" />
      <path d="M18 10 L 18 13" stroke="#D62828" strokeWidth="1" />
      <circle cx="12" cy="9" r="1" fill="#F9C74F" />
      <circle cx="18" cy="9" r="1" fill="#F9C74F" />
    </g>
    <text x="10" y="18" fontFamily="Arial, sans-serif" fontSize="8" fill="#555">Happy</text>
    <text x="10" y="28" fontFamily="Arial, sans-serif" fontSize="8" fill="#555">Birthday!</text>
  </svg>
);

export default BirthdayCake;
