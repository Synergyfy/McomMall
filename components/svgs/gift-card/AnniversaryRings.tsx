import React from 'react';

const AnniversaryRings = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="15" r="5" />
    <circle cx="14" cy="15" r="5" />
    <path d="M10 15h4" />
  </svg>
);

export default AnniversaryRings;
