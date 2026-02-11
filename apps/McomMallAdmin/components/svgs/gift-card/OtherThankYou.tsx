import React from 'react';

const OtherThankYou = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="thankyou-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f7f0ac', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f3bda1', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#thankyou-gradient)" />
    <text x="60" y="25" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" fill="#5D4037">Thank You</text>
  </svg>
);

export default OtherThankYou;
