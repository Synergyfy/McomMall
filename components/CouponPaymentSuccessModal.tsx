'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CouponPaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponCode: string;
  recipientEmail?: string;
}

export default function CouponPaymentSuccessModal({
  isOpen,
  onClose,
  couponCode,
  recipientEmail,
}: CouponPaymentSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your coupon has been purchased successfully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center">
            Your coupon code is: <span className="font-bold">{couponCode}</span>
          </p>
          {recipientEmail && (
            <p className="text-center">
              The coupon has been sent to <span className="font-bold">{recipientEmail}</span>.
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
