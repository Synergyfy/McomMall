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
import { useImportGiftCards } from '@/service/gift-card/hook';

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
  const importMutation = useImportGiftCards();

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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
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

        importMutation.mutate(
          {
            templateId,
            importDto: { giftCards: transformedData },
          },
          {
            onSuccess: (data) => {
              toast.info(
                `Import Complete - Success: ${data.successCount}, Failures: ${data.errorCount}`
              );
              onSuccess();
            },
            onError: (error) => {
              toast.error(error.message || 'An unknown error occurred.');
            },
          }
        );
      },
      error: (error) => {
        toast.error(`Failed to parse the CSV file: ${error.message}`);
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
          <SelectContent className="z-[10000]">
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
      <Button type="submit" disabled={importMutation.isPending}>
        {importMutation.isPending ? 'Importing...' : 'Import Gift Cards'}
      </Button>
    </form>
  );
};
