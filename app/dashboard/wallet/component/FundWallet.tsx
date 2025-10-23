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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { Loader } from 'lucide-react';

interface FundWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const FundWallet: React.FC<FundWalletProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const initiateFund = useInitiateFund();
  const verifyFund = useVerifyFund();
  const queryClient = useQueryClient();

  const handleInitiateFund = async () => {
    if (amount < 10) {
      toast.error('Minimum funding amount is 10 GBP');
      return;
    }
    initiateFund.mutate(
      { amount, paymentProvider: provider },
      {
        onSuccess: (data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
          if (data.orderId) {
            setOrderId(data.orderId);
          }
        },
        onError: (error) => {
          toast.error(`Error initiating fund: ${error.message}`);
        },
      }
    );
  };

  const handleVerifyFund = async (transactionId: string) => {
    setIsProcessing(true);
    verifyFund.mutate(
      { transactionId, amount, paymentProvider: provider },
      {
        onSuccess: () => {
          toast.success('Funding successful');
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          onClose();
          setIsProcessing(false);
        },
        onError: (error) => {
          toast.error(`Error verifying fund: ${error.message}`);
          setIsProcessing(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
            <Loader className="animate-spin text-orange-600" size={48} />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Processing payment... Please do not close this page.
            </p>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Fund Your Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your spendable balance. Minimum amount is 10 GBP.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          {!clientSecret && !orderId && (
            <>
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
                  onValueChange={(value: 'stripe' | 'paypal') =>
                    setProvider(value)
                  }
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
            </>
          )}

          {provider === 'stripe' && clientSecret && (
            <StripeCheckoutForm
              clientSecret={clientSecret}
              onSuccess={handleVerifyFund}
            />
          )}

          {provider === 'paypal' && orderId && (
            <PayPalCheckoutButton
              orderId={orderId}
              onSuccess={handleVerifyFund}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {!clientSecret && !orderId && (
            <Button
              onClick={handleInitiateFund}
              disabled={initiateFund.isPending}
            >
              {initiateFund.isPending ? 'Processing...' : 'Continue'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundWallet;
