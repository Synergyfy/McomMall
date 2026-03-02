'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReviewForm } from './ReviewForm';

interface AddReviewModalProps {
  businessId?: string;
  productId?: string;
  serviceId?: string;
}

export function AddReviewModal({ businessId, productId, serviceId }: AddReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <ReviewForm 
            businessId={businessId} 
            productId={productId} 
            serviceId={serviceId} 
            onSuccess={() => setIsOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
