'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoucherProductForm } from './VoucherProductForm';
import {
  CreateVoucherProductDto,
  VoucherProduct,
} from '@/service/vouchers/types';
import {
  useAddVoucherProduct,
  useEditVoucherProduct,
} from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';

interface VoucherProductModalProps {
  children: React.ReactNode;
  product?: VoucherProduct;
  onSuccess: () => void;
}

export const VoucherProductModal: React.FC<VoucherProductModalProps> = ({
  children,
  product,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addVoucherProduct = useAddVoucherProduct();
  const editVoucherProduct = useEditVoucherProduct();

  const handleSubmit = async (data: CreateVoucherProductDto) => {
    setIsSubmitting(true);
    try {
      if (product) {
        await editVoucherProduct(product.id, data);
        toast.success('Voucher product updated successfully!');
      } else {
        await addVoucherProduct(data);
        toast.success('Voucher product created successfully!');
      }
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Voucher Product' : 'Create New Voucher Product'}
          </DialogTitle>
        </DialogHeader>
        <VoucherProductForm
          onSubmit={handleSubmit}
          initialData={product}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};