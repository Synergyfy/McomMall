'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUpdateProduct } from '@/service/store/products/hook';
import { toast } from 'sonner';
import { Star, RefreshCw, Megaphone, Loader2 } from 'lucide-react';
import { Product } from '@/service/listings/types';

interface PromoteProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const PromoteProductModal: React.FC<PromoteProductModalProps> = ({
  product,
  open,
  onClose,
}) => {
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRotatorEligible, setIsRotatorEligible] = useState(false);
  const [isPromotionEligible, setIsPromotionEligible] = useState(false);

  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setIsFeatured(product.isFeatured ?? false);
      setIsRotatorEligible(product.isRotatorEligible ?? false);
      setIsPromotionEligible(product.isPromotionEligible ?? false);
    }
  }, [product]);

  if (!product) return null;

  const handleApply = async () => {
    try {
      await updateProduct({
        id: product.id,
        isFeatured,
        isRotatorEligible,
        isPromotionEligible,
      } as any);
      toast.success('Promotion settings updated!');
      onClose();
    } catch {
      toast.error('Failed to update. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Promote Product</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Control where <span className="font-semibold text-gray-700">{product.title}</span> appears across the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">

          {/* Featured toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-amber-50/40 hover:bg-amber-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <Label className="font-semibold text-gray-900 leading-tight">Mark as Featured</Label>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Pins this product prominently at the top of your public storefront page.
                </p>
              </div>
            </div>
            <Switch
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
              id="featured-toggle"
              aria-label="Mark as Featured"
            />
          </div>

          {/* Rotator toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-blue-50/40 hover:bg-blue-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <Label className="font-semibold text-gray-900 leading-tight">Add to Local Mall Rotator</Label>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Opts this product into the Borough carousel and Local Mall discovery feed.
                </p>
              </div>
            </div>
            <Switch
              checked={isRotatorEligible}
              onCheckedChange={setIsRotatorEligible}
              id="rotator-toggle"
              aria-label="Add to Rotator"
            />
          </div>

          {/* Promotion / Campaign toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-orange-50/40 hover:bg-orange-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <Label className="font-semibold text-gray-900 leading-tight">Include in Campaigns</Label>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Allows this product to be picked up by platform-wide deals and marketing campaigns.
                </p>
              </div>
            </div>
            <Switch
              checked={isPromotionEligible}
              onCheckedChange={setIsPromotionEligible}
              id="promotion-toggle"
              aria-label="Include in Promotions"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleApply}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Apply Settings'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
