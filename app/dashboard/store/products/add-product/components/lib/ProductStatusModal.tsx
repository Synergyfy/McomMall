"use client";

import { Check, AlertCircle, Eye, Plus, LayoutDashboard, X } from 'lucide-react';

interface ProductStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  dashboardAction?: {
    label: string;
    onClick: () => void;
  };
}

export const ProductStatusModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  primaryAction,
  secondaryAction,
  dashboardAction,
}: ProductStatusModalProps) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1c140d]/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container - Max width reduced to 400px and padding tightened */}
      <div className="relative w-full max-w-[400px] transform overflow-hidden rounded-2xl bg-white dark:bg-[#2c2219] p-6 text-center shadow-2xl transition-all flex flex-col items-center animate-in zoom-in-95 duration-200 border border-[#e8dbce] dark:border-[#4a3b2f]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-[#9c7349] hover:text-[#f48c25] dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon Circle - Scaled down */}
        <div className={`mb-4 flex size-16 items-center justify-center rounded-full shadow-inner ${
          isSuccess 
            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {isSuccess ? (
            <Check size={32} strokeWidth={3} />
          ) : (
            <AlertCircle size={32} strokeWidth={2.5} />
          )}
        </div>

        {/* Text Content - Tighter spacing */}
        <h2 className="mb-2 text-xl font-bold leading-tight text-[#1c140d] dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="mb-6 text-[#9c7349] dark:text-gray-400 leading-snug text-sm">
          {message}
        </p>

        {/* Action Buttons - More compact padding */}
        <div className="flex w-full flex-col gap-2">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className={`w-full rounded-lg px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 ${
                isSuccess 
                  ? 'bg-[#f48c25] hover:bg-[#f48c25]/90 shadow-[#f48c25]/20' 
                  : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              }`}
            >
              {isSuccess ? <Eye size={16} /> : null}
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full rounded-lg bg-white dark:bg-transparent px-4 py-3 text-sm font-bold text-[#f48c25] ring-1 ring-inset ring-[#f48c25] hover:bg-[#f48c25]/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {secondaryAction.label}
            </button>
          )}

          {dashboardAction && (
            <button
              onClick={dashboardAction.onClick}
              className="w-full rounded-lg bg-transparent px-4 py-2 text-xs font-bold text-[#9c7349] hover:text-[#f48c25] dark:hover:text-white hover:bg-[#f48c25]/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={14} />
              {dashboardAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};