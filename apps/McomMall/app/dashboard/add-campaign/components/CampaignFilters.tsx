'use client';
import { AdFormData, FormErrors, SearchableSelectItem } from '../types';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, MapPin, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { ukLocations } from '../uk_locations';

interface CampaignFiltersProps {
  formData: AdFormData;
  setFormData: React.Dispatch<React.SetStateAction<AdFormData>>;
  categories: SearchableSelectItem[];
}

// Reusable Tooltip Component
const InfoTooltip = ({ message }: { message: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent className="bg-orange-800 text-white border-orange-800">
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Reusable Searchable Select (Combobox)
const SearchableSelect = ({
  open,
  setOpen,
  value,
  setValue,
  items,
  placeholder,
  notFoundMessage,
  disabled,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  items: { value: string; label: string }[];
  placeholder: string;
  notFoundMessage: string;
  disabled?: boolean;
}) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        disabled={disabled}
      >
        {value
          ? items.find(
              (item: { value: string; label: string }) => item.value === value
            )?.label
          : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
      <Command>
        <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
        <CommandEmpty>{notFoundMessage}</CommandEmpty>
        <CommandGroup>
          {items.map((item: { value: string; label: string }) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={currentValue => {
                setValue(currentValue === value ? '' : currentValue);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  value === item.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
);

export const CampaignFilters = ({
  formData,
  setFormData,
  categories,
}: CampaignFiltersProps) => {
  const [openCategory, setOpenCategory] = React.useState(false);
  const [openUkLocation, setOpenUkLocation] = React.useState(false);

  const isHomepageSelected = formData.placements.includes('homepage');

  return (
    <div
      className={cn('bg-white p-6 rounded-lg border border-gray-200', {
        'opacity-50 pointer-events-none': isHomepageSelected,
      })}
    >
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <Settings2 size={24} />
        Campaign Filters
        <InfoTooltip message="These filters determine where and to whom your ad is displayed. Filters are disabled when 'Homepage' placement is selected." />
      </h2>
      <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm mb-6 flex items-center gap-1.5">
        Filters apply only to sidebar and search results placement options
        <InfoTooltip message="Homepage ads are displayed to all users and do not support filtering." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            Display only if category{' '}
            <InfoTooltip message="Show ad only on these category pages." />
          </label>
          <SearchableSelect
            open={openCategory}
            setOpen={setOpenCategory}
            value={formData.category}
            setValue={val =>
              setFormData(prev => ({
                ...prev,
                category: typeof val === 'string' ? val : prev.category,
              }))
            }
            items={categories}
            placeholder="Choose Category"
            notFoundMessage="No category found."
            disabled={isHomepageSelected}
          />
        </div>

        {/* UK Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            Display Only for Location Search
            <InfoTooltip message="Select a location to display the ad, or manually enter a location below." />
          </label>
          <SearchableSelect
            open={openUkLocation}
            setOpen={setOpenUkLocation}
            value={formData.ukLocation || ''}
            setValue={val =>
              setFormData(prev => ({
                ...prev,
                ukLocation: typeof val === 'string' ? val : prev.ukLocation,
              }))
            }
            items={ukLocations}
            placeholder="Choose location"
            notFoundMessage="No location found."
            disabled={isHomepageSelected}
          />
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            Or type the location you want
            <InfoTooltip message="Show ad for specific location searches. This will be prioritized over the location dropdown." />
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="e.g., Central London"
              value={formData.locationSearch}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  locationSearch: e.target.value,
                }))
              }
              className="pl-10"
              disabled={isHomepageSelected}
            />
            <MapPin className="absolute left-3 top-1/2 -translatey-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Logged in users */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
            Enable only for logged in users{' '}
            <InfoTooltip message="Restrict ad visibility to logged-in users." />
          </label>
          <Switch
            checked={formData.forLoggedInUsers}
            onCheckedChange={checked =>
              setFormData(prev => ({ ...prev, forLoggedInUsers: checked }))
            }
            disabled={isHomepageSelected}
          />
        </div>
      </div>
    </div>
  );
};
