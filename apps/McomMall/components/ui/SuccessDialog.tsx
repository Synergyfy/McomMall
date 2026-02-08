'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './button';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  variant?: 'success' | 'error';
}

export const SuccessDialog = ({
  isOpen,
  onClose,
  title = 'Success!',
  description = 'Your request has been processed successfully.',
  buttonText = 'Continue',
  variant = 'success',
}: SuccessDialogProps) => {
  const isSuccess = variant === 'success';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          )}>
            {isSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
                <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <DialogTitle className="mt-4">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-5 sm:mt-6">
          <Button onClick={onClose} className="w-full">
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};