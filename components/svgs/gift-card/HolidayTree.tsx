import React from 'react';

const HolidayTree = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="tree-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2a5a3b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1e3c28', stopOpacity: 1 }} />
      </linearGradient>
       <filter id="tree-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="2" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>
    <rect width="120" height="40" rx="5" fill="url(#tree-gradient)" />
    <g transform="translate(60 5)" filter="url(#tree-shadow)">
        <polygon points="15,2 25,20 5,20" fill="#388E3C" />
        <polygon points="15,10 22,25 8,25" fill="#4CAF50" />
        <polygon points="15,18 20,30 10,30" fill="#66BB6A" />
        <rect x="13" y="30" width="4" height="5" fill="#5D4037" />
        <polygon points="15,0 16,2 17,0 16,1" fill="#FFD700" />
    </g>
     <circle cx="20" cy="20" r="1.5" fill="#E57373" />
     <circle cx="75" cy="25" r="1" fill="#81D4FA" />
     <circle cx="50" cy="15" r="1.2" fill="#FFF176" />
    <text x="10" y="25" fontFamily="Mountains of Christmas, cursive" fontSize="10" fill="white">Seasons</text>
    <text x="15" y="35" fontFamily="Mountains of Christmas, cursive" fontSize="10" fill="white">Greetings</text>
  </svg>
);

export default HolidayTree;
