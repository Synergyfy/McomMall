'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Gift } from 'lucide-react';
import { GiftCard } from '@/service/gift-card/types';

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  giftCard?: GiftCard;
}

export default function PaymentSuccessDialog({
  isOpen,
  onClose,
  giftCard,
}: PaymentSuccessDialogProps) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard/gift-card');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center"
        >
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="mt-2">
              {giftCard
                ? "Your gift card has been successfully purchased and scheduled for delivery."
                : "Thank you for your purchase. Your order has been confirmed."}
            </DialogDescription>
          </DialogHeader>
          {giftCard && (
            <div className="mt-6 w-full bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-center mb-3">
                <Gift className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-orange-800">
                  Gift Card Details
                </h3>
              </div>
              <div className="space-y-2 text-sm text-left">
                <p>
                  <span className="font-semibold">Code:</span> {giftCard.code}
                </p>
                <p>
                  <span className="font-semibold">Balance:</span> ${giftCard.initialBalance.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">Recipient:</span> {giftCard.recipientEmail}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 w-full">
            <Button onClick={handleGoToDashboard} className="w-full bg-orange-600 hover:bg-orange-700">
              Go to My Gift Cards
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}