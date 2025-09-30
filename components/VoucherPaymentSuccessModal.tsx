'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface VoucherPaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  recipientEmail?: string;
}

export default function VoucherPaymentSuccessModal({
  isOpen,
  onClose,
  voucherCode,
  recipientEmail,
}: VoucherPaymentSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-green-600">
            Payment Successful!
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
          >
            <Check className="h-16 w-16 text-green-600" />
          </motion.div>
          <p className="mt-4 text-center text-lg">
            Your voucher has been successfully purchased!
          </p>
          <div className="mt-4 rounded-lg bg-gray-100 px-4 py-2">
            <p className="text-center text-sm text-gray-600">
              Your voucher code is:
            </p>
            <p className="text-center text-xl font-bold text-gray-800">
              {voucherCode}
            </p>
          </div>
          {recipientEmail && (
            <p className="mt-4 text-center text-sm text-gray-500">
              A copy of the voucher has been sent to{' '}
              <span className="font-semibold">{recipientEmail}</span>.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}