import React from 'react';

const OtherCelebration = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="celebration-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffb347', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#ffcc33', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#celebration-gradient)" />
    <g>
      <circle cx="20" cy="20" r="3" fill="#E57373" />
      <circle cx="40" cy="15" r="2" fill="#81D4FA" />
      <circle cx="60" cy="25" r="4" fill="#FFF176" />
      <circle cx="80" cy="10" r="2.5" fill="#A5D6A7" />
      <circle cx="100" cy="20" r="3.5" fill="#CE93D8" />
    </g>
    <text x="60" y="25" textAnchor="middle" fontFamily="Arial Black, Gadget, sans-serif" fontSize="10" fill="white" stroke="black" strokeWidth="0.2">Time to Celebrate!</text>
  </svg>
);

export default OtherCelebration;
