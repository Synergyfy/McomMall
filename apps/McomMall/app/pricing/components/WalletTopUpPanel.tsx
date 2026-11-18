'use client';

import { ExternalLink, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletTopUpPanelProps {
  suggestedAmount?: number;
  topUpUrl?: string | null;
  onTopUpComplete?: () => void;
}

/**
 * Wallet top-ups are owned by MCOM Central. The mall must not collect card
 * details here and then credit Central's wallet from its own funds — that
 * created a second ledger and made the mall absorb MCOM's processing fee.
 */
export default function WalletTopUpPanel({
  suggestedAmount,
  topUpUrl,
}: WalletTopUpPanelProps) {
  const url =
    topUpUrl ||
    `${(process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'https://centralhubsolution.com').replace(/\/$/, '')}/dashboard/wallet`;

  return (
    <div className="mt-3 rounded-xl border border-orange-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Top up in MCOM Central
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Your MCOM Wallet balance and top-ups are managed by MCOM Central.
            {suggestedAmount && suggestedAmount > 0
              ? ` You need about ${suggestedAmount.toFixed(2)} MCOM for this payment.`
              : ''}
          </p>
          <Button asChild className="mt-3 bg-orange-600 hover:bg-orange-700">
            <a href={url} target="_blank" rel="noreferrer">
              Open MCOM Wallet <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
