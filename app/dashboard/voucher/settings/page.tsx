'use client';

import * as React from 'react';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

// TypeScript type for the form state
interface GeneralSettingsState {
  enablePartialRedemption: boolean;
  autoEnableCouponCodeGeneration: boolean;
  enableVoucherPreview: boolean;
  voucherPreviewType: 'popup' | 'newTab';
  previewWatermarkImage: File | null;
}

// Helper component for consistent form row layout
interface FormRowProps {
  label: string;
  children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start py-6 border-b last:border-b-0">
    <Label className="md:col-span-1 font-semibold text-gray-700 pt-1">
      {label}
    </Label>
    <div className="md:col-span-3">{children}</div>
  </div>
);

// Main Page Component
export default function SettingsPage() {
  const [formState, setFormState] = useState<GeneralSettingsState>({
    enablePartialRedemption: true,
    autoEnableCouponCodeGeneration: true,
    enableVoucherPreview: false,
    voucherPreviewType: 'newTab',
    previewWatermarkImage: null,
  });
  const [watermarkFileName, setWatermarkFileName] = useState<string>('');

  const handleSwitchChange = (
    field: keyof GeneralSettingsState,
    checked: boolean
  ) => {
    setFormState(prev => ({ ...prev, [field]: checked }));
  };

  const handleRadioChange = (value: 'popup' | 'newTab') => {
    setFormState(prev => ({ ...prev, voucherPreviewType: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormState(prev => ({ ...prev, previewWatermarkImage: file }));
      setWatermarkFileName(file.name);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formState);
    alert('General settings saved. Check the console for the form data.');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 relative overflow-hidden">
      <main className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-2">
          {'General Settings'}
        </h1>
        <form onSubmit={handleSubmit}>
          <FormRow label={'Enable Partial Redemption'}>
            <div className="flex items-center space-x-4">
              <Switch
                id="enablePartialRedemption"
                checked={formState.enablePartialRedemption}
                onCheckedChange={checked =>
                  handleSwitchChange('enablePartialRedemption', checked)
                }
              />
              <Button variant="outline">
                {'Choose individual products'} ({0}) {'Selected'}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {
                'Check "Enable Partial Redemption" if you want to enable partial redemption for all products. However, if you want to enable partial redemption for particular products then click on "Choose individual products" and select the products for which you want to allow partial redemption.'
              }
            </p>
          </FormRow>

          <FormRow label={'Auto Enable Coupon Code Generation'}>
            <Switch
              id="autoEnableCouponCodeGeneration"
              checked={formState.autoEnableCouponCodeGeneration}
              onCheckedChange={checked =>
                handleSwitchChange('autoEnableCouponCodeGeneration', checked)
              }
            />
            <p className="text-sm text-gray-500 mt-2">
              {
                'Check this box if you want to allow coupon code generation when a voucher code gets generated. This will allow you to use voucher codes on online store.'
              }
            </p>
          </FormRow>

          <FormRow label={'Enable Voucher Preview'}>
            <Switch
              id="enableVoucherPreview"
              checked={formState.enableVoucherPreview}
              onCheckedChange={checked =>
                handleSwitchChange('enableVoucherPreview', checked)
              }
            />
            <p className="text-sm text-gray-500 mt-2">
              {
                'Check this box if you want to allow users to preview the voucher on product detail page before placing the order.'
              }
            </p>
          </FormRow>

          <FormRow label={'Voucher Preview Type'}>
            <RadioGroup
              value={formState.voucherPreviewType}
              onValueChange={handleRadioChange}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="popup" id="popup" />
                <Label htmlFor="popup">
                  {'Pop-Up (Open the voucher preview in pop-up.)'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newTab" id="newTab" />
                <Label htmlFor="newTab">
                  {'New Tab (Open the voucher preview in new tab.)'}
                </Label>
              </div>
            </RadioGroup>
          </FormRow>

          <FormRow label={'Preview Watermark Image'}>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById('watermarkUpload')?.click()
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                {'Upload File'}
              </Button>
              {watermarkFileName && (
                <span className="text-sm text-gray-600">
                  {watermarkFileName}
                </span>
              )}
            </div>
            <Input
              type="file"
              id="watermarkUpload"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-2">
              {
                'Select the image that you would like to apply as watermark to the generated preview PDF on product page.'
              }
            </p>
          </FormRow>

          <div className="flex justify-start gap-4 pt-8 mt-8 border-t">
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {'Save Settings'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
