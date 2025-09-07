import React from 'react';

const AnniversaryChampagne = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="champagne-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f5f7fa', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#c3cfe2', stopOpacity: 1 }} />
      </linearGradient>
       <filter id="champagne-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#champagne-gradient)" />
    <g transform="translate(60 5)" filter="url(#champagne-shadow)">
      <path d="M15 35 L 15 20 L 10 10 L 20 10 L 15 20" fill="#C0C0C0" />
      <path d="M10 10 L 8 5 H 22 L 20 10" fill="#B0B0B0" />
    </g>
    <g transform="translate(75 8)" filter="url(#champagne-shadow)">
       <path d="M15 32 L 15 18 L 10 8 L 20 8 L 15 18" fill="#F0E68C" />
       <path d="M10 8 L 8 3 H 22 L 20 8" fill="#E0D67C" />
    </g>
    <text x="10" y="20" fontFamily="Garamond, serif" fontSize="9" fill="#555">Cheers</text>
    <text x="15" y="30" fontFamily="Garamond, serif" fontSize="9" fill="#555">to Us!</text>
  </svg>
);

export default AnniversaryChampagne;
