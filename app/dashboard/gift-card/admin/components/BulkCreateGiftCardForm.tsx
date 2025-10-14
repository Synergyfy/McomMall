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
import { toast } from 'sonner';
import { GiftCardTemplate } from '@/types/gift-card-template';
import { useBulkCreateGiftCards } from '@/service/gift-card/hook';

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
  const bulkCreateMutation = useBulkCreateGiftCards();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bulkCreateMutation.mutate(
      {
        templateId,
        amount: parseFloat(amount),
        quantity: parseInt(quantity, 10),
      },
      {
        onSuccess: () => {
          toast.success(`${quantity} gift cards created successfully.`);
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || 'An unknown error occurred.');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="templateId">Gift Card Template</Label>
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent className="z-[100000]">
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
      <Button type="submit" disabled={bulkCreateMutation.isPending}>
        {bulkCreateMutation.isPending ? 'Creating...' : 'Create Gift Cards'}
      </Button>
    </form>
  );
};
