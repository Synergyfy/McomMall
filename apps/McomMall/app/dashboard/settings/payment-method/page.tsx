'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save, CreditCard, Lock, Sparkles } from 'lucide-react';

export default function UpdatePaymentMethodPage() {
  const router = useRouter();

  // Load existing from localStorage
  const [cardName, setCardName] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('billing_card_name') || 'John Doe' : 'John Doe';
  });
  const [cardNum, setCardNum] = useState(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('billing_card_num') || '4242424242424242' : '4242424242424242';
    // Format card number with spaces
    return raw.replace(/(\d{4})/g, '$1 ').trim();
  });
  const [expiry, setExpiry] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('billing_card_expiry') || '12/28' : '12/28';
  });
  const [cvv, setCvv] = useState('***');
  const [isFlipped, setIsFlipped] = useState(false);

  // Formatting utility for card input
  const handleCardNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const limited = rawValue.slice(0, 16);
    const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
    setCardNum(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setCvv(value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCardNum = cardNum.replace(/\s+/g, '');
    if (cleanCardNum.length < 16) {
      toast.error('Card number must be exactly 16 digits');
      return;
    }
    if (expiry.length < 5) {
      toast.error('Expiry date must be in MM/YY format');
      return;
    }
    if (cvv.length < 3) {
      toast.error('CVV must be at least 3 digits');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('billing_card_name', cardName);
      localStorage.setItem('billing_card_num', cleanCardNum);
      localStorage.setItem('billing_card_expiry', expiry);
    }

    toast.success('Payment method updated successfully!');
    router.push('/dashboard/settings/billing');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings/billing')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h1>
            <p className="text-xs text-gray-500">Update active billing card details with live previews.</p>
          </div>
        </div>
      </div>

      {/* Visual Live Credit Card (Interactive Card View) */}
      <div className="perspective-1000 w-full flex justify-center py-4">
        <div 
          className={`relative w-80 h-48 rounded-2xl transition-all duration-500 transform-style-3d cursor-pointer shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#213145] to-[#121c27] text-white p-5 rounded-2xl flex flex-col justify-between overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <Sparkles className="h-24 w-24 text-orange-400" />
            </div>
            
            <div className="flex justify-between items-start">
              {/* Chip and contact-less indicator */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-7 bg-amber-200/90 rounded-md shadow-inner flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-0.5 w-6 h-5 opacity-40 border border-gray-900">
                    <div className="border border-gray-900"></div>
                    <div className="border border-gray-900"></div>
                    <div className="border border-gray-900"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 opacity-60">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <span className="text-sm font-black tracking-widest text-[#ff6900]">VISA</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-lg font-mono tracking-[0.2em] block">
                {cardNum || '•••• •••• •••• ••••'}
              </span>
              
              <div className="flex justify-between items-end">
                <div className="min-w-0 flex-1 pr-4">
                  <span className="text-[9px] uppercase tracking-wider block opacity-50">Card Holder</span>
                  <span className="text-xs font-bold tracking-wide block truncate">
                    {cardName.toUpperCase() || 'JOHN DOE'}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[9px] uppercase tracking-wider block opacity-50">Expires</span>
                  <span className="text-xs font-mono font-bold block">
                    {expiry || 'MM/YY'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#121c27] to-[#0a1016] text-white rounded-2xl flex flex-col justify-between py-6 overflow-hidden border border-white/10">
            <div className="w-full h-10 bg-gray-950 shrink-0"></div>
            
            <div className="px-5 space-y-4">
              <div className="flex items-center justify-end gap-2">
                <span className="text-[8px] uppercase tracking-wider opacity-60">Authorized Signature</span>
                <div className="w-24 h-7 bg-white text-gray-800 font-mono text-xs flex items-center justify-end pr-2 italic rounded-sm select-none font-bold">
                  {cvv || '***'}
                </div>
              </div>
              <p className="text-[7px] opacity-40 text-center">
                This card is issued by McomMall Financial. If found, please return to any storefront office or branch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                onFocus={() => setIsFlipped(false)}
                placeholder="John Doe"
                required
                className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNum">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNum"
                  value={cardNum}
                  onChange={handleCardNumChange}
                  onFocus={() => setIsFlipped(false)}
                  placeholder="4242 4242 4242 4242"
                  required
                  className="rounded-xl border-gray-200/80 pl-10 focus-visible:ring-[#ff6900]"
                />
                <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={handleExpiryChange}
                  onFocus={() => setIsFlipped(false)}
                  placeholder="MM/YY"
                  required
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV Code</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type="password"
                    value={cvv === '***' ? '' : cvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    placeholder="CVV"
                    required
                    className="rounded-xl border-gray-200/80 pl-10 focus-visible:ring-[#ff6900]"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold rounded-xl h-11 flex items-center justify-center gap-1.5 mt-6"
            >
              <Save size={16} />
              Save Payment Card
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
