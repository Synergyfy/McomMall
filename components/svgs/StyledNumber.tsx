import React from 'react';

interface StyledNumberProps {
  number: number;
}

const StyledNumber: React.FC<StyledNumberProps> = ({ number }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background number */}
      <span className="absolute text-9xl font-extrabold text-orange-700 opacity-75 select-none">
        {number}
      </span>

      {/* Stylized SVG */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
      >
        {/* The leaf shape */}
        <path
          d="M 55,20 Q 70,10 80,25 C 70,30 60,35 55,20 Z"
          fill="#34D399"
        />
        {/* Faint leaf outlines in the background */}
        <path
            d="M 60 70 C 50 50, 70 40, 80 50 S 70 90, 60 70 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
        />
        <path
            d="M 30 50 C 20 30, 40 20, 50 30 S 40 70, 30 50 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
        />
      </svg>
    </div>
  );
};

export default StyledNumber;
