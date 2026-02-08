import React from 'react';

const AnniversaryHearts = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="hearts-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ff9a9e', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fecfef', stopOpacity: 1 }} />
      </linearGradient>
       <filter id="hearts-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#hearts-gradient)" />
    <g transform="translate(50 10)" filter="url(#hearts-shadow)">
       <path d="M10 10 C 0 0, 30 0, 20 10 C 10 20, 0 15, 10 10 Z" fill="#FF4747" />
    </g>
    <g transform="translate(70 15)" filter="url(#hearts-shadow)">
       <path d="M12 12 C 2 2, 32 2, 22 12 C 12 22, 2 17, 12 12 Z" fill="#FF1C1C" opacity="0.8" />
    </g>
     <text x="10" y="28" fontFamily="Lucida Handwriting, cursive" fontSize="9" fill="white">With Love</text>
  </svg>
);

export default AnniversaryHearts;
