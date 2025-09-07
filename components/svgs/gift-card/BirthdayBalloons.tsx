import React from 'react';

const BirthdayBalloons = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="balloon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#a8e6cf', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#dcedc1', stopOpacity: 1 }} />
      </linearGradient>
       <filter id="balloon-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#balloon-gradient)" />
    <g transform="translate(60 5)" filter="url(#balloon-shadow)">
      <circle cx="10" cy="10" r="8" fill="#FF6B6B" />
      <path d="M 10 18 Q 10 22, 8 25" stroke="#444" strokeWidth="0.5" fill="none" />
    </g>
    <g transform="translate(80 8)" filter="url(#balloon-shadow)">
      <circle cx="15" cy="12" r="10" fill="#4D96FF" />
      <path d="M 15 22 Q 15 26, 17 29" stroke="#444" strokeWidth="0.5" fill="none" />
    </g>
     <g transform="translate(40 12)" filter="url(#balloon-shadow)">
      <circle cx="12" cy="10" r="9" fill="#FFD166" />
      <path d="M 12 19 Q 12 23, 10 26" stroke="#444" strokeWidth="0.5" fill="none" />
    </g>
    <text x="10" y="25" fontFamily="Verdana, sans-serif" fontSize="7" fill="#333">Celebrate!</text>
  </svg>
);

export default BirthdayBalloons;
