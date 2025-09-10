'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SuccessAnimationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessAnimationDialog({
  isOpen,
  onClose,
}: SuccessAnimationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
          width="100"
          height="100"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="#4caf50"
            strokeWidth="2"
            initial={{ strokeDasharray: '0 157' }}
            animate={{ strokeDasharray: '157 157' }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M14 27l5 5 16-16"
            fill="none"
            stroke="#4caf50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </motion.svg>
        <p className="text-lg font-semibold mt-4">Booking Placed Successfully!</p>
      </DialogContent>
    </Dialog>
  );
}
