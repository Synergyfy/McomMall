import React from 'react';

const AnniversaryRings = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="rings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#e0c3fc', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8ec5fc', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="rings-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#rings-gradient)" />
    <g transform="translate(60 15)" filter="url(#rings-shadow)">
      <circle cx="10" cy="10" r="8" fill="none" stroke="#FFD700" strokeWidth="2" />
      <circle cx="22" cy="10" r="8" fill="none" stroke="#FFD700" strokeWidth="2" />
    </g>
    <g transform="translate(58 13)">
       <path d="M 10 5 L 12 3 L 14 5" stroke="#FFF" strokeWidth="0.5" fill="none" />
    </g>
    <text x="10" y="28" fontFamily="Brush Script MT, cursive" fontSize="10" fill="white">Our Anniversary</text>
  </svg>
);

export default AnniversaryRings;
