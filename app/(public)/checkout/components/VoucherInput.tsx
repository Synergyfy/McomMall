'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface VoucherInputProps {
  onApply: (code: string) => void;
  isLoading: boolean;
}

export default function VoucherInput({
  onApply,
  isLoading,
}: VoucherInputProps) {
  const [code, setCode] = useState('');

  return (
    <div className="flex items-center gap-2 mt-4">
      <Input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter voucher code"
        className="flex-grow"
        disabled={isLoading}
      />
      <Button onClick={() => onApply(code)} disabled={isLoading || !code}>
        {isLoading ? (
          <Loader className="animate-spin h-5 w-5" />
        ) : (
          'Apply Voucher'
        )}
      </Button>
    </div>
  );
}