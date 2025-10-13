'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { GiftCardTemplate } from '@/types/gift-card-template';

interface BulkCreateGiftCardFormProps {
  templates: GiftCardTemplate[];
  onSuccess: () => void;
}

export const BulkCreateGiftCardForm = ({
  templates,
  onSuccess,
}: BulkCreateGiftCardFormProps) => {
  const [templateId, setTemplateId] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/merchant/gift-cards/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          amount: parseFloat(amount),
          quantity: parseInt(quantity, 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create gift cards in bulk.');
      }

      toast({
        title: 'Success',
        description: `${quantity} gift cards created successfully.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="templateId">Gift Card Template</Label>
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 25.00"
          required
        />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g., 100"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Gift Cards'}
      </Button>
    </form>
  );
};
