'use client';

import * as React from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const mockGiftCardData: { [key: string]: number } = {
  '5XW5-AVPD-WRLX-A6H9': 250.0,
  'ABCD-1234-EFGH-5678': 75.5,
  'ZYXW-9876-VUTS-5432': 15.25,
  'GIFT-CARD-2025-DEMO': 100.0,
};

export default function CheckBalancePage() {
  const [cardNumber, setCardNumber] = useState('5XW5-AVPD-WRLX-A6H9');
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setBalance(null);
    setIsLoading(true);

    setTimeout(() => {
      const formattedCardNumber = cardNumber.trim().toUpperCase();
      if (mockGiftCardData.hasOwnProperty(formattedCardNumber)) {
        setBalance(mockGiftCardData[formattedCardNumber]);
      } else {
        setError(
          'Invalid gift card number. Please check the number and try again.'
        );
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gray-200 dark:bg-gray-700 p-4 rounded-full w-fit mb-4">
            <Gift className="h-10 w-10 text-gray-600 dark:text-gray-300" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Check Gift Card Balance
          </CardTitle>
          <CardDescription>Enter your gift card number below.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Balance Display */}
          <AnimatePresence>
            {balance !== null && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="text-center my-6"
              >
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  £{balance.toFixed(2)}
                </p>
                <Button
                  variant="link"
                  className="mt-2 text-purple-600 dark:text-purple-400"
                >
                  Add more funds to this gift card.
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form for checking balance */}
          <form onSubmit={handleCheckBalance} className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="e.g., XXXX-XXXX-XXXX-XXXX"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="flex-grow"
                required
              />
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Balance'
                )}
              </Button>
            </div>
          </form>

          {/* Error Message Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md"
              >
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
