'use client';

import { cn } from '@/lib/utils'; // Assumes utils file is set up
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { GiftCardDesign } from '../types';
import React from 'react';
import { EmailPreview } from './EmailPreview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Props for the GiftCardForm component.
interface GiftCardFormProps {
  designs: GiftCardDesign[];
  selectedDesign: GiftCardDesign;
  onDesignChange: (design: GiftCardDesign) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
}

// Renders the form for purchasing the gift card.
export function GiftCardForm({
  designs,
  selectedDesign,
  onDesignChange,
  amount,
  onAmountChange,
}: GiftCardFormProps) {
  const [toEmail, setToEmail] = React.useState('torre@pimwick.com');
  const [recipientName, setRecipientName] = React.useState('Mom');
  const [fromName, setFromName] = React.useState('Son');
  const [message, setMessage] = React.useState('I love you!');
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const handleClearAmount = () => {
    onAmountChange('');
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-6">
        {/* Gift Card Amount */}
        <div>
          <Label htmlFor="amount" className="font-semibold text-gray-700">
            Gift Card Amount
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Select onValueChange={onAmountChange} value={amount}>
              <SelectTrigger id="amount" className="w-[180px]">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25.00">£25.00</SelectItem>
                <SelectItem value="50.00">£50.00</SelectItem>
                <SelectItem value="100.00">£100.00</SelectItem>
                <SelectItem value="250.00">£250.00</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Or enter custom amount"
              value={amount}
              onChange={e => onAmountChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              className="text-orange-600 hover:text-orange-700"
              onClick={handleClearAmount}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Form Fields: To, Recipient, From, Message */}
        <div>
          <Label htmlFor="to-email" className="font-semibold text-gray-700">
            To
          </Label>
          <Input
            id="to-email"
            type="email"
            placeholder="recipient@example.com"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple emails with a comma.
          </p>
        </div>
        <div>
          <Label htmlFor="recipient" className="font-semibold text-gray-700">
            Recipient
          </Label>
          <Input
            id="recipient"
            type="text"
            placeholder="Recipient's Name"
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="from" className="font-semibold text-gray-700">
            From
          </Label>
          <Input
            id="from"
            type="text"
            placeholder="Your Name"
            value={fromName}
            onChange={e => setFromName(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="message" className="font-semibold text-gray-700">
            Message (optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Write a personal message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="mt-2"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {500 - message.length} characters remaining
          </p>
        </div>

        {/* Delivery Date Picker */}
        <div>
          <Label
            htmlFor="delivery-date"
            className="font-semibold text-gray-700"
          >
            Delivery Date & Time
          </Label>
          <Input
            id="delivery-date"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Up to a year from today.
          </p>
        </div>

        {/* Email Design Selector */}
        <div>
          <div className="flex justify-between items-center">
            <Label className="font-semibold text-gray-700">Email Design</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] p-0 border-none bg-transparent shadow-none">
                <EmailPreview
                  design={selectedDesign}
                  amount={amount}
                  recipientName={recipientName}
                  fromName={fromName}
                  message={message}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {designs.map(design => (
              <button
                key={design.id}
                onClick={() => onDesignChange(design)}
                className={cn(
                  'p-2 rounded-[1.5rem] border-2 transition-all relative overflow-hidden',
                  selectedDesign.id === design.id
                    ? 'border-yellow-500 ring-4 ring-yellow-100'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div
                  className="h-16 w-full rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
                  }}
                >
                  <div className="absolute bottom-[20%] left-0 w-full h-1 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 z-10" />
                  <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-2px)] w-4 h-4 rounded-full bg-yellow-500 border border-yellow-200 z-20 shadow-sm" />

                  <design.icon className="h-6 w-6 text-yellow-400 opacity-60 drop-shadow-md z-30" />
                </div>
                <p className="text-[10px] font-bold text-center mt-2 text-gray-700 uppercase tracking-widest">
                  {design.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-0 pt-8">
        <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
