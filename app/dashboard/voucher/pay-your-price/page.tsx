'use client';

import React, { useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- TYPE DEFINITIONS ---
interface PayYourPriceState {
  enablePayYourPrice: boolean;
  inputFieldType: 'text' | 'button';
  recommendedPrice: string;
  minimumPrice: string;
  hideMinimumPriceText: boolean;
  maximumPrice: string;
  hideMaximumPriceText: boolean;
}

// --- MAIN COMPONENT ---
export default function PayYourPriceSettings() {
  const [settings, setSettings] = useState<PayYourPriceState>({
    enablePayYourPrice: true,
    inputFieldType: 'text',
    recommendedPrice: '',
    minimumPrice: '',
    hideMinimumPriceText: false,
    maximumPrice: '',
    hideMaximumPriceText: false,
  });

  const handleSettingChange = (
    key: keyof PayYourPriceState,
    value: string | boolean
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingRow = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b">
      <div className="flex-grow mb-2 sm:mb-0 sm:mr-4">
        <p className="text-base font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const PriceInput = ({
    id,
    value,
    onChange,
  }: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <Input
      id={id}
      type="number"
      value={value}
      onChange={onChange}
      className="w-full sm:w-64"
      placeholder="0.00"
    />
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">
            {' "Pay Your Price" Settings'}
          </h1>
        </div>
        <div>
          <SettingRow
            title="Enable Pay Your Price"
            description="Enable Pay Your Price if you want users to pay their own price for this product."
          >
            <Switch
              id="enable-pay-your-price"
              checked={settings.enablePayYourPrice}
              onCheckedChange={checked =>
                handleSettingChange('enablePayYourPrice', checked)
              }
            />
          </SettingRow>
          <SettingRow
            title="Input Field Type"
            description="Select the input field type: 'Text' or 'Button & Text'."
          >
            <Select
              value={settings.inputFieldType}
              onValueChange={(value: 'text' | 'button') =>
                handleSettingChange('inputFieldType', value)
              }
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="button">Button & Text</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            title="Recommended Price (£)"
            description="The recommended price prompts users to enter that amount."
          >
            <PriceInput
              id="recommended-price"
              value={settings.recommendedPrice}
              onChange={e =>
                handleSettingChange('recommendedPrice', e.target.value)
              }
            />
          </SettingRow>
          <SettingRow
            title="Minimum Price (£)"
            description="The minimum price prevents products from being sold for less than you are willing to accept."
          >
            <PriceInput
              id="minimum-price"
              value={settings.minimumPrice}
              onChange={e =>
                handleSettingChange('minimumPrice', e.target.value)
              }
            />
          </SettingRow>
          <SettingRow title="Hide Minimum Price Text" description="">
            <Switch
              id="hide-minimum-price"
              checked={settings.hideMinimumPriceText}
              onCheckedChange={checked =>
                handleSettingChange('hideMinimumPriceText', checked)
              }
            />
          </SettingRow>
          <SettingRow
            title="Maximum Price (£)"
            description="The maximum price prevents products from being sold for more than you are willing to accept."
          >
            <PriceInput
              id="maximum-price"
              value={settings.maximumPrice}
              onChange={e =>
                handleSettingChange('maximumPrice', e.target.value)
              }
            />
          </SettingRow>
          <SettingRow title="Hide Maximum Price Text" description="">
            <Switch
              id="hide-maximum-price"
              checked={settings.hideMaximumPriceText}
              onCheckedChange={checked =>
                handleSettingChange('hideMaximumPriceText', checked)
              }
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
