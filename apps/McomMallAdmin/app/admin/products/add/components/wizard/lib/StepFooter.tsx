"use client";

import { ArrowLeft } from 'lucide-react';

interface StepFooterProps {
  onBack: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export const StepFooter = ({ onBack, onSkip, showSkip = true }: StepFooterProps) => (
  <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#e8dbce] dark:border-[#4a3b2e]">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-[#594a3d] dark:text-[#cba885] hover:text-[#f48c25] font-bold transition-all group"
    >
      <ArrowLeft 
        size={20} 
        className="group-hover:-translate-x-1 transition-transform duration-200" 
      />
      Back
    </button>
    
    {showSkip && (
      <button 
        onClick={onSkip}
        className="text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] font-medium text-sm transition-colors hover:underline underline-offset-4 decoration-[#f48c25]/30 hover:decoration-[#f48c25]"
      >
        Skip for now
      </button>
    )}
  </div>
);