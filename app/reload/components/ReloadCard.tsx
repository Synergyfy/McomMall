'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';

interface ReloadCardProps {
  type: 'giftcard' | 'voucher' | 'coupon';
  cardId: string;
}

const ReloadCard: React.FC<ReloadCardProps> = ({ type, cardId }) => {
  const [amount, setAmount]       = useState('');
  const [isReloaded, setIsReloaded] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    title: '',
    balance: 0,
    image: '',
  });

  useEffect(() => {
    // Mock data fetching
    const mockData = {
      giftcard: {
        '123': {
          title: 'Gift Card',
          balance: 100,
          image: '/placeholder.svg',
        },
      },
      voucher: {
        '456': {
          title: 'Voucher',
          balance: 50,
          image: '/placeholder.svg',
        },
      },
      coupon: {
        '789': {
          title: 'Coupon',
          balance: 25,
          image: '/placeholder.svg',
        },
      },
    };
    // @ts-ignore
    if (mockData[type] && mockData[type][cardId]) {
      // @ts-ignore
      setCardDetails(mockData[type][cardId]);
    }
  }, [type, cardId]);

  const handleReload = (e: React.FormEvent) => {
    e.preventDefault();
    // payment logic here
    setIsReloaded(true);
  };

  if (!cardDetails.title) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Card not found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reload Your {cardDetails.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You are reloading this {type}. Please enter the amount you would
            like to add and complete the payment below.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={cardDetails.image}
            alt={cardDetails.title}
            className="w-48 h-auto"
          />
          <h3 className="text-xl font-bold">{cardDetails.title}</h3>
          <p className="text-lg">Balance: ₦{cardDetails.balance}</p>
        </div>
        {!isReloaded ? (
          <form className="space-y-6" onSubmit={handleReload}>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md"
            >
              Proceed to Payment
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-500">
              Reload Successful!
            </h3>
            <p className="text-lg">
              New Balance: ₦{cardDetails.balance + Number(amount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReloadCard;
