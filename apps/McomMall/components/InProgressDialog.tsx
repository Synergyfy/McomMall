'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface InProgressDialogProps {
  isOpen: boolean;
  message: string;
}

export function InProgressDialog({
  isOpen,
  message,
}: InProgressDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center">
        <DialogTitle className="sr-only">Processing Upload</DialogTitle>
        <DialogDescription className="sr-only">Please wait while we process your request.</DialogDescription>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-24 w-24 text-orange-600" />
        </motion.div>
        <p className="text-lg font-semibold mt-4">{message}</p>
      </DialogContent>
    </Dialog>
  );
}
