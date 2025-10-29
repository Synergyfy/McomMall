'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Filter,
  BarChart,
  HelpCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// --- Type Definitions ---

type AdPlacement = 'homepage' | 'search_results' | 'sidebar';

type FormData = {
  listing: string;
  campaignType: string;
  startDate: Date | undefined;
  budget: number | string;
  category: string;
  region: string;
  locationSearch: string;
  loggedInOnly: boolean;
  adPlacement: AdPlacement | null;
};

type FormErrors = {
  [K in keyof FormData]?: string;
};

type AdPlacementOption = {
  id: AdPlacement;
  title: string;
  price: number;
  icon: React.ReactNode;
};

// --- Mock ShadCN UI Components ---
// In a real app, you would install these from shadcn/ui
// npx shadcn-ui@latest add select input button card tooltip switch date-picker

const Tooltip: React.FC<{ children: React.ReactNode; content: string }> = ({
  children,
  content,
}) => (
  <div className="group relative inline-flex">
    {children}
    <div className="absolute left-1/2 -top-2 z-10 w-max -translate-x-1/2 -translate-y-full scale-0 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white transition-all group-hover:scale-100">
      {content}
    </div>
  </div>
);

const Select: React.FC<{
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  value: string;
}> = ({ children, onValueChange, value }) => (
  <select
    value={value}
    onChange={e => onValueChange(e.target.value)}
    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </select>
);

const Switch: React.FC<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ checked, onCheckedChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
      checked ? 'bg-slate-800' : 'bg-slate-300'
    }`}
  >
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// --- Reusable UI Components ---

const FormField: React.FC<{
  label: string;
  tooltip: string;
  children: React.ReactNode;
  error?: string;
}> = ({ label, tooltip, children, error }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <Tooltip content={tooltip}>
        <HelpCircle className="h-4 w-4 text-slate-400" />
      </Tooltip>
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

const AdPlacementCard: React.FC<{
  option: AdPlacementOption;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`relative cursor-pointer rounded-xl border-2 bg-white p-4 text-center transition-all duration-200 ${
      isSelected
        ? 'border-red-500 shadow-lg'
        : 'border-slate-200 hover:border-slate-400'
    }`}
  >
    {isSelected && (
      <div className="absolute -right-2 -top-2 rounded-full bg-white p-0.5">
        <CheckCircle2 className="h-6 w-6 text-red-500" />
      </div>
    )}
    <div
      className={`mx-auto flex h-20 w-28 items-center justify-center rounded-md bg-slate-100 ${
        isSelected ? 'border border-red-200' : ''
      }`}
    >
      {option.icon}
    </div>
    <h4 className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold">
      {option.title}
      <Tooltip content={`Details about the ${option.title} placement.`}>
        <HelpCircle className="h-4 w-4 text-slate-400" />
      </Tooltip>
    </h4>
    <p className="text-xs text-slate-500">${option.price.toFixed(2)}</p>
  </div>
);

// --- Main Page Component ---

export default function ManageAdsPage() {
  const [formData, setFormData] = useState<FormData>({
    listing: '',
    campaignType: 'pay_per_view',
    startDate: undefined,
    budget: '',
    category: '',
    region: '',
    locationSearch: '',
    loggedInOnly: false,
    adPlacement: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean | Date | undefined | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const adPlacementOptions: AdPlacementOption[] = [
    {
      id: 'homepage',
      title: 'Homepage',
      price: 0.1,
      icon: (
        <div className="h-12 w-20 rounded border-2 border-slate-300 bg-white p-1">
          <div className="h-full w-1/2 bg-yellow-400 rounded-sm"></div>
        </div>
      ),
    },
    {
      id: 'search_results',
      title: 'Top Of Search Results',
      price: 0.12,
      icon: (
        <div className="h-12 w-20 rounded border-2 border-slate-300 bg-white p-1">
          <div className="h-1/3 w-full bg-yellow-400 rounded-sm"></div>
        </div>
      ),
    },
    {
      id: 'sidebar',
      title: 'Sidebar',
      price: 0.11,
      icon: (
        <div className="h-12 w-20 rounded border-2 border-slate-300 bg-white p-1 flex gap-1">
          <div className="h-full w-2/3"></div>
          <div className="h-full w-1/3 bg-yellow-400 rounded-sm"></div>
        </div>
      ),
    },
  ];

  const budgetReach = useMemo(() => {
    if (typeof formData.budget !== 'number' || !formData.adPlacement) return 0;
    const selectedOption = adPlacementOptions.find(
      opt => opt.id === formData.adPlacement
    );
    if (!selectedOption || selectedOption.price === 0) return 0;
    return Math.floor(formData.budget / selectedOption.price);
  }, [formData.budget, formData.adPlacement]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.listing) newErrors.listing = 'Please select a listing.';
    if (!formData.startDate)
      newErrors.startDate = 'Please select a start date.';
    if (!formData.budget || +formData.budget <= 0)
      newErrors.budget = 'Budget must be greater than 0.';
    if (!formData.adPlacement)
      newErrors.adPlacement = 'Please select an ad placement.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form Submitted:', {
        ...formData,
        budget: Number(formData.budget),
      });
      alert('Ad submitted successfully! Check the console for the data.');
    } else {
      console.log('Validation failed:', errors);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <form onSubmit={handleSubmit} noValidate>
        <main className="container mx-auto px-4 py-8">
          <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h1 className="text-3xl font-bold text-slate-800">Manage Ads</h1>
            <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
          </header>

          <div className="space-y-8">
            {/* General Ad Settings */}
            <Card className="p-6">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold">
                <Settings className="h-6 w-6 text-slate-500" /> General Ad
                Settings
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="For Listing"
                  tooltip="Select which of your listings to promote."
                >
                  <Select
                    value={formData.listing}
                    onValueChange={value => handleInputChange('listing', value)}
                  >
                    <option value="" disabled>
                      Search for a listing
                    </option>
                    <option value="listing1">Modern Apartment</option>
                    <option value="listing2">Cozy Cottage</option>
                  </Select>
                </FormField>
                <FormField
                  label="Ad Campaign Type"
                  tooltip="Choose how you want to pay for your ad."
                >
                  <Select
                    value={formData.campaignType}
                    onValueChange={value =>
                      handleInputChange('campaignType', value)
                    }
                  >
                    <option value="pay_per_view">Pay Per View</option>
                    <option value="pay_per_click">Pay Per Click</option>
                  </Select>
                </FormField>
                <FormField
                  label="Campaign start date"
                  tooltip="The date your ad campaign will begin."
                >
                  <input
                    type="date"
                    value={
                      formData.startDate
                        ? formData.startDate.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'startDate',
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField
                  label="Budget"
                  tooltip="The total amount you want to spend on this campaign."
                >
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={e =>
                        handleInputChange(
                          'budget',
                          e.target.valueAsNumber || ''
                        )
                      }
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                  </div>
                </FormField>
              </div>
            </Card>

           

            {/* Select Ad Placement */}
            <Card className="p-6">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold">
                <BarChart className="h-6 w-6 text-slate-500" /> Select Ad
                Placement
              </h2>
              {errors.adPlacement && (
                <p className="mb-4 text-center text-sm text-red-600">
                  {errors.adPlacement}
                </p>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {adPlacementOptions.map(opt => (
                  <AdPlacementCard
                    key={opt.id}
                    option={opt}
                    isSelected={formData.adPlacement === opt.id}
                    onSelect={() => handleInputChange('adPlacement', opt.id)}
                  />
                ))}
              </div>
              {budgetReach > 0 && (
                <div className="mt-6 rounded-md bg-green-100 p-4 text-sm text-green-800">
                  With your budget you can get up to:{' '}
                  <strong className="font-semibold">
                    {budgetReach.toLocaleString()}{' '}
                    {formData.campaignType === 'pay_per_view'
                      ? 'Views'
                      : 'Clicks'}
                  </strong>
                </div>
              )}
            </Card>

             {/* Campaign Filters */}
            <Card className="p-6">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold">
                <Filter className="h-6 w-6 text-slate-500" /> Campaign Filters
              </h2>
              <div className="mb-6 rounded-md bg-sky-100 p-4 text-sm text-sky-800">
                Filters apply only to sidebar and search results placement
                options.
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Display only if category"
                  tooltip="Show ad only for listings in this category."
                >
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      handleInputChange('category', value)
                    }
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="electronics">Electronics</option>
                    <option value="vehicles">Vehicles</option>
                  </Select>
                </FormField>
                <FormField
                  label="Display only if region"
                  tooltip="Show ad only to users in this region."
                >
                  <Select
                    value={formData.region}
                    onValueChange={value => handleInputChange('region', value)}
                  >
                    <option value="" disabled>
                      Select a region
                    </option>
                    <option value="sf">San Francisco</option>
                    <option value="ny">New York</option>
                  </Select>
                </FormField>
                <FormField
                  label="Display only for location search"
                  tooltip="Show ad for specific location searches."
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.locationSearch}
                      onChange={e =>
                        handleInputChange('locationSearch', e.target.value)
                      }
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  </div>
                </FormField>
                <FormField
                  label="Enable only for logged in users"
                  tooltip="Restrict ad visibility to logged-in users."
                >
                  <Switch
                    checked={formData.loggedInOnly}
                    onCheckedChange={value =>
                      handleInputChange('loggedInOnly', value)
                    }
                  />
                </FormField>
              </div>
            </Card>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="rounded-full bg-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
              >
                Submit Ad
              </motion.button>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}
