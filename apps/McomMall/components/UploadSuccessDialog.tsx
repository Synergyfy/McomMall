'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function UploadSuccessDialog({
  isOpen,
  onClose,
  message,
}: UploadSuccessDialogProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/dashboard/my-listings');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col items-center gap-4">
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
                stroke="#f97316"
                strokeWidth="2"
                initial={{ strokeDasharray: '0 157' }}
                animate={{ strokeDasharray: '157 157' }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M14 27l5 5 16-16"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </motion.svg>
            Success
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-slate-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleNavigate} className="mt-4 bg-orange-600 hover:bg-orange-700">
          View My Listings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
