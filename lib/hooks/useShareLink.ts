'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export const useShareLink = () => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleShare = (type: 'giftcard' | 'voucher' | 'coupon', id: string) => {
    const shareLink = `${window.location.origin}/reload/${type}/${id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedLink(id);
      toast.success('Share link copied!');
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  return { copiedLink, handleShare };
};
