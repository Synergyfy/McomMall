'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface InfoIconProps {
  tooltip: string;
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ tooltip, className = "" }) => (
  <div className={`group relative inline-block cursor-help ${className}`}>
    <Info className="w-4 h-4 text-gray-400 hover:text-[#f48c25] transition-colors" />

    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg w-48 text-center z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-normal">
      {tooltip}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

export default InfoIcon;