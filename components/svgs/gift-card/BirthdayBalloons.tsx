import React from 'react';

const BirthdayBalloons = ({ className }: { className?: string }) => (
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
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 12a5 5 0 0 1 5 5" />
    <path d="M12 2a5 5 0 0 1 5 5" />
    <path d="M12 2a5 5 0 0 0-5 5" />
    <path d="M12 12a5 5 0 0 0-5 5" />
    <path d="M12 22a5 5 0 0 0 5-5" />
    <path d="M12 22a5 5 0 0 1-5-5" />
    <path d="M7 17a5 5 0 0 0 10 0" />
    <path d="M7 7a5 5 0 0 1 10 0" />
  </svg>
);

export default BirthdayBalloons;
