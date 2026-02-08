import React from 'react';

const HolidayPresents = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="presents-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#d32f2f', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#c2185b', stopOpacity: 1 }} />
      </linearGradient>
       <filter id="presents-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#presents-gradient)" />
    <g transform="translate(60 12)" filter="url(#presents-shadow)">
      <rect x="5" y="10" width="20" height="15" fill="#4CAF50" />
      <rect x="13" y="10" width="4" height="15" fill="#66BB6A" />
      <rect x="5" y="16" width="20" height="4" fill="#66BB6A" />
    </g>
    <g transform="translate(80 18)" filter="url(#presents-shadow)">
      <rect x="5" y="10" width="15" height="10" fill="#2196F3" />
      <rect x="11" y="10" width="3" height="10" fill="#42A5F5" />
      <rect x="5" y="14" width="15" height="3" fill="#42A5F5" />
    </g>
    <text x="10" y="28" fontFamily="Satisfy, cursive" fontSize="11" fill="white">Joy & Cheer</text>
  </svg>
);

export default HolidayPresents;
