import React from 'react';

const AnniversaryChampagne = ({ className }: { className?: string }) => (
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
    <path d="M8 22h8" />
    <path d="M12 18v4" />
    <path d="M12 18h.01" />
    <path d="M10 3h4" />
    <path d="M12 3v6" />
    <path d="M12 9c-2.209 0-4 1.791-4 4v5h8v-5c0-2.209-1.791-4-4-4z" />
    <path d="M8 13h8" />
  </svg>
);

export default AnniversaryChampagne;
