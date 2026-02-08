'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateSuccessDialog({
  open,
  onOpenChange,
}: SuccessDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Product Updated!
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <CheckCircle2 className="w-24 h-24 text-green-500 animate-pulse" />
          <p className="text-lg text-gray-600">
            Your product has been updated successfully.
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/dashboard/store/products')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Back to Products
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
