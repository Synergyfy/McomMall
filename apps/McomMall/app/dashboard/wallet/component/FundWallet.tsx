'use client';

import React from 'react';
import { ExternalLink, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/service/wallet/hook';

interface FundWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wallet top-ups happen in MCOM Central, which owns the wallet balance and the
 * payment credentials. The mall deep-links there instead of collecting card
 * details and crediting Central's wallet from the mall's own funds.
 */
const FundWallet: React.FC<FundWalletProps> = ({ isOpen, onClose }) => {
  const { data: walletData } = useWallet();
  const topUpUrl =
    walletData?.centralWallet?.topUpUrl ||
    `${(process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'https://centralhubsolution.com').replace(/\/$/, '')}/dashboard/wallet`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            Top up MCOM Wallet
          </DialogTitle>
          <DialogDescription>
            MCOM Wallet balance and top-ups are managed by MCOM Central.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-600">
            You will be redirected to Central&apos;s secure wallet page to add
            funds by card. The balance is immediately available across every
            MCOM platform.
          </p>
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-orange-900">
            MCOM Mall never collects or stores your card details. Card data is
            entered only on MCOM Central / Stripe&apos;s PCI-compliant page.
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto">
            <a href={topUpUrl} target="_blank" rel="noreferrer">
              Open MCOM Wallet <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundWallet;
