'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CouponCodeInputProps {
  onApply: (couponCode: string) => void;
  isLoading: boolean;
}

export default function CouponCodeInput({ onApply, isLoading }: CouponCodeInputProps) {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = () => {
    if (couponCode) {
      onApply(couponCode);
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Coupon code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={handleApply} disabled={isLoading}>
        {isLoading ? 'Applying...' : 'Apply'}
      </Button>
    </div>
  );
}
