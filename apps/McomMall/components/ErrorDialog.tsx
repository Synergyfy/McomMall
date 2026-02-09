'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ErrorDialog({ isOpen, onClose, message }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col items-center gap-4 text-red-600">
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
              width="60"
              height="60"
            >
              <motion.circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                initial={{ strokeDasharray: '0 157' }}
                animate={{ strokeDasharray: '157 157' }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M16 16 36 36 M36 16 16 36"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </motion.svg>
            Error Occurred
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-slate-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors">
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
