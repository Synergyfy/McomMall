'use client';

import { CouponProduct } from '@/service/coupon-products/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CouponProductCardProps {
  product: CouponProduct;
  onDelete: (productId: string) => void;
}

export function CouponProductCard({ product, onDelete }: CouponProductCardProps) {
  const router = useRouter();
  const cardStyle = {
    backgroundColor: product.backgroundImage ? 'transparent' : '#f0f0f0',
    backgroundImage: `url(${product.backgroundImage})`,
    color: product.textColor || '#000000',
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden">
      <div
        className="h-48 bg-cover bg-center p-4 flex flex-col justify-between"
        style={cardStyle}
      >
        <h3 className="text-xl font-bold">{product.name}</h3>
        <p>{product.description}</p>
      </div>
      <div className="p-4 bg-white">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/dashboard/coupons/products/edit/${product.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
