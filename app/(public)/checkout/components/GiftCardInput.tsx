'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GiftCardInputProps {
  onApply: (giftCardCode: string) => void;
  isLoading: boolean;
}

export default function GiftCardInput({
  onApply,
  isLoading,
}: GiftCardInputProps) {
  const [giftCardCode, setGiftCardCode] = useState('');

  const handleApply = () => {
    if (giftCardCode) {
      onApply(giftCardCode);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex w-full items-center space-x-3 mt-4"
    >
      <Input
        type="text"
        placeholder="Enter your gift card code"
        value={giftCardCode}
        onChange={(e) => setGiftCardCode(e.target.value)}
        disabled={isLoading}
        className="h-12 text-lg"
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleApply}
          disabled={isLoading}
          className="h-12 text-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
        >
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            'Apply Gift Card'
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}