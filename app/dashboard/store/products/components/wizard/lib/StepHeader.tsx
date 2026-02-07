import React from 'react';

interface StepHeaderProps {
  step: string;
  title: string;
  description: string;
  progress: number;
  nextStepLabel?: string;
}

export const StepHeader = ({ step, title, description, progress, nextStepLabel }: StepHeaderProps) => (
  <div className="flex flex-col gap-6 mb-8">
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <p className="text-[#1c140d] dark:text-white text-base font-bold uppercase tracking-tight">{step}</p>
        {nextStepLabel && (
          <p className="text-[#9c7349] dark:text-[#cba885] text-sm font-medium">Next: {nextStepLabel}</p>
        )}
      </div>
      <div className="w-full h-2 rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] overflow-hidden">
        <div 
          className="h-full rounded-full bg-[#f48c25] transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <h1 className="text-[#1c140d] dark:text-white text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
      <p className="text-[#594a3d] dark:text-gray-400 text-lg max-w-2xl leading-relaxed">{description}</p>
    </div>
  </div>
);