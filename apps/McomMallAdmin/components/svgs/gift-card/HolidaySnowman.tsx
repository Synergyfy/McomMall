import React from 'react';

const HolidaySnowman = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="snow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#e0f2f1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#b2dfdb', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="snow-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#snow-gradient)" />
    <g transform="translate(70 10)" filter="url(#snow-shadow)">
        <circle cx="15" cy="20" r="8" fill="white" />
        <circle cx="15" cy="10" r="6" fill="white" />
        <rect x="12" y="4" width="6" height="2" fill="#333" />
        <rect x="10" y="6" width="10" height="2" fill="#333" />
        <circle cx="13.5" cy="9" r="0.5" fill="black" />
        <circle cx="16.5" cy="9" r="0.5" fill="black" />
        <path d="M 15 10 L 17 11 L 15 12" fill="orange" />
        <circle cx="15" cy="18" r="0.5" fill="black" />
        <circle cx="15" cy="21" r="0.5" fill="black" />
    </g>
    <text x="10" y="20" fontFamily="Comic Sans MS, cursive" fontSize="8" fill="#004d40">Happy</text>
    <text x="10" y="30" fontFamily="Comic Sans MS, cursive" fontSize="8" fill="#004d40">Holidays!</text>
  </svg>
);

export default HolidaySnowman;
