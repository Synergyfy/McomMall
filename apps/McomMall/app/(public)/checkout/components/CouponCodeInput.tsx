'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CouponCodeInputProps {
  onApply: (couponCode: string) => void;
  isLoading: boolean;
}

export default function CouponCodeInput({
  onApply,
  isLoading,
}: CouponCodeInputProps) {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = () => {
    if (couponCode) {
      onApply(couponCode);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2"
    >
      <Input
        type="text"
        placeholder="Enter your coupon code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        disabled={isLoading}
        className="h-12 text-lg flex-grow"
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
        <Button
          onClick={handleApply}
          disabled={isLoading}
          className="h-12 text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 w-full sm:w-auto"
        >
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            'Apply Coupon'
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
