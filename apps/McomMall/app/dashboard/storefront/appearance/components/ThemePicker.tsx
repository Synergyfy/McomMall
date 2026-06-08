'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Palette } from 'lucide-react';

interface ThemePickerProps {
  theme: 'light' | 'dark' | 'brand';
  setTheme: (theme: 'light' | 'dark' | 'brand') => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  theme,
  setTheme,
  brandColor,
  setBrandColor,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Storefront Theme</h3>
        <p className="text-xs text-gray-500">Choose the baseline color mode for your customer-facing store.</p>
      </div>

      <RadioGroup
        value={theme}
        onValueChange={(val) => setTheme(val as 'light' | 'dark' | 'brand')}
        className="grid grid-cols-3 gap-4"
      >
        {/* Light */}
        <label
          htmlFor="theme-light"
          className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-4 hover:bg-gray-50/50 cursor-pointer transition-all ${
            theme === 'light' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200/80'
          }`}
        >
          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
          <Sun className={`w-6 h-6 mb-2 ${theme === 'light' ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="text-xs font-semibold text-gray-900">Light</span>
        </label>

        {/* Dark */}
        <label
          htmlFor="theme-dark"
          className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-4 hover:bg-gray-50/50 cursor-pointer transition-all ${
            theme === 'dark' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200/80'
          }`}
        >
          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
          <Moon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="text-xs font-semibold text-gray-900">Dark</span>
        </label>

        {/* Brand */}
        <label
          htmlFor="theme-brand"
          className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-4 hover:bg-gray-50/50 cursor-pointer transition-all ${
            theme === 'brand' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200/80'
          }`}
        >
          <RadioGroupItem value="brand" id="theme-brand" className="sr-only" />
          <Palette className={`w-6 h-6 mb-2 ${theme === 'brand' ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="text-xs font-semibold text-gray-900">Custom Brand</span>
        </label>
      </RadioGroup>

      {/* Brand Color Picker (Shown when Custom Brand is active) */}
      {theme === 'brand' && (
        <div className="pt-4 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <Label htmlFor="brand-color" className="font-semibold text-gray-950 text-sm">Primary Accent Color</Label>
            <span className="font-mono text-xs uppercase text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
              {brandColor}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="brand-color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-0 overflow-hidden shrink-0"
            />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-800">Select color from palette</p>
              <p className="text-[10px] text-gray-400">This will flavor buttons, badges, and accents on your store.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
