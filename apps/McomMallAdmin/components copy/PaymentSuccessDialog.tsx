'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRedirect: () => void;
}

const PaymentSuccessDialog: React.FC<PaymentSuccessDialogProps> = ({
  isOpen,
  onClose,
  onRedirect,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center text-center p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
          >
            <Check className="w-16 h-16 text-green-600" />
          </motion.div>
          <DialogHeader className="mt-6">
            <DialogTitle className="text-2xl font-bold">
              Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-muted-foreground">
            Your payment has been recorded successfully.
          </p>
          <DialogFooter className="mt-8">
            <Button
              onClick={onRedirect}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Go to My Listings
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;
