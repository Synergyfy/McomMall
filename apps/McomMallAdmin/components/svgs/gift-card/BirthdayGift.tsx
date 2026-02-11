import React from 'react';

const BirthdayGift = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="gift-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fde4cf', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#ffcfd2', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="gift-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#gift-gradient)" />
    <g transform="translate(75 8)" filter="url(#gift-shadow)">
      <rect x="5" y="10" width="20" height="15" fill="#8E97FD" />
      <rect x="13" y="10" width="4" height="15" fill="#A6AAFF" />
      <rect x="5" y="16" width="20" height="4" fill="#A6AAFF" />
       <path d="M 15 10 C 12 5, 18 5, 15 10" stroke="#C3C6FF" strokeWidth="1" fill="none" />
       <path d="M 15 10 C 12 5, 18 5, 15 10" stroke="#C3C6FF" strokeWidth="1" fill="none" transform="rotate(90 15 10)" />
    </g>
     <g transform="translate(45 15)" filter="url(#gift-shadow)">
      <rect x="5" y="10" width="15" height="10" fill="#FFCDB2" />
      <rect x="11" y="10" width="3" height="10" fill="#FFB4A2" />
      <rect x="5" y="14" width="15" height="3" fill="#FFB4A2" />
       <path d="M 12.5 10 C 10.5 7, 14.5 7, 12.5 10" stroke="#E5989B" strokeWidth="0.8" fill="none" />
       <path d="M 12.5 10 C 10.5 7, 14.5 7, 12.5 10" stroke="#E5989B" strokeWidth="0.8" fill="none" transform="rotate(90 12.5 10)" />
    </g>
    <text x="10" y="25" fontFamily="Georgia, serif" fontSize="6" fill="#4A4A4A">A special gift</text>
    <text x="12" y="32" fontFamily="Georgia, serif" fontSize="6" fill="#4A4A4A">for you</text>
  </svg>
);

export default BirthdayGift;
