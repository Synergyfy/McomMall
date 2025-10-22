'use client';
import React, { useState } from 'react';
import { useInitiateFund } from '@/service/wallet/hooks/useInitiateFund';
import { useVerifyFund } from '@/service/wallet/hooks/useVerifyFund';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';

interface FundWalletProps {
  onBack: () => void;
}

const FundWallet: React.FC<FundWalletProps> = ({ onBack }) => {
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe');
  const initiateFund = useInitiateFund();
  const verifyFund = useVerifyFund();
  const queryClient = useQueryClient();

  const handleInitiateFund = async () => {
    if (amount < 10) {
      alert('Minimum funding amount is 10 GBP');
      return;
    }
    initiateFund.mutate(
      { amount, paymentProvider: provider },
      {
        onSuccess: (data) => {
          // Here you would integrate with the payment provider's client-side SDK
          // For now, we'll just simulate a successful payment and verification
          alert(
            `Funding initiated with ${provider}. Client Secret: ${
              data.clientSecret || data.orderId
            }`
          );
          handleVerifyFund(data.clientSecret || data.orderId);
        },
        onError: (error) => {
          alert(`Error initiating fund: ${error.message}`);
        },
      }
    );
  };

  const handleVerifyFund = async (transactionId: string) => {
    verifyFund.mutate(
      { transactionId, amount, paymentProvider: provider },
      {
        onSuccess: () => {
          alert('Funding successful');
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          onBack();
        },
        onError: (error) => {
          alert(`Error verifying fund: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <Button onClick={onBack} className="self-start">
        Back
      </Button>
      <div className="flex flex-col gap-3">
        <Label htmlFor="amount">Amount (GBP)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="provider">Payment Provider</Label>
        <Select
          onValueChange={(value: 'stripe' | 'paypal') => setProvider(value)}
          defaultValue={provider}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a payment provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleInitiateFund}
        disabled={initiateFund.isPending || verifyFund.isPending}
      >
        {initiateFund.isPending || verifyFund.isPending
          ? 'Processing...'
          : 'Fund Wallet'}
      </Button>
    </div>
  );
};

export default FundWallet;
