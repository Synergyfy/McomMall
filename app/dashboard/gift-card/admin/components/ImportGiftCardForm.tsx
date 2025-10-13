'use client';

import * as React from 'react';
import { useState } from 'react';
import Papa from 'papaparse';
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

interface ImportGiftCardFormProps {
  templates: GiftCardTemplate[];
  onSuccess: () => void;
}

interface ImportGiftCardDto {
  amount: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
}

interface CSVRow {
  amount: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
}

export const ImportGiftCardForm = ({
  templates,
  onSuccess,
}: ImportGiftCardFormProps) => {
  const [templateId, setTemplateId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !templateId) {
      toast.error('Please select a template and a CSV file.');
      return;
    }

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const transformedData: ImportGiftCardDto[] = (
          results.data as CSVRow[]
        ).map((row) => ({
          amount: parseFloat(row.amount),
          recipientEmail: row.recipientEmail || undefined,
            recipientName: row.recipientName || undefined,
            senderName: row.senderName || undefined,
            personalMessage: row.personalMessage || undefined,
          })
        );

        try {
          const response = await fetch(
            `/merchant/gift-cards/import/json?templateId=${templateId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ giftCards: transformedData }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to import gift cards.');
          }

          const result = await response.json();
          toast.info(
            `Import Complete - Success: ${result.successCount}, Failures: ${result.errorCount}`
          );
          onSuccess();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.'
          );
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        toast.error(`Failed to parse the CSV file: ${error.message}`);
        setIsLoading(false);
      },
    });
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
        <Label htmlFor="csvFile">CSV File</Label>
        <Input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Importing...' : 'Import Gift Cards'}
      </Button>
    </form>
  );
};
