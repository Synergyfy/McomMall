import React from 'react';

const OtherCongrats = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="congrats-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#84fab0', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8fd3f4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#congrats-gradient)" />
    <text x="60" y="25" textAnchor="middle" fontFamily="Impact, Charcoal, sans-serif" fontSize="14" fill="white" stroke="gray" strokeWidth="0.5">Congratulations!</text>
  </svg>
);

export default OtherCongrats;
