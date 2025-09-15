'use client';
import { AdFormData, FormErrors, SearchableSelectItem } from '../types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  HelpCircle,
  PoundSterling,
} from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';

interface GeneralAdSettingsProps {
  formData: AdFormData;
  setFormData: React.Dispatch<React.SetStateAction<AdFormData>>;
  errors: FormErrors;
  listings: SearchableSelectItem[];
  isLoading: boolean;
  isError: boolean;
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
  isLoading,
  isError,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  items: SearchableSelectItem[];
  placeholder: string;
  notFoundMessage: string;
  isLoading?: boolean;
  isError?: boolean;
}) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        disabled={isLoading || isError}
      >
        {isLoading
          ? 'Loading listings...'
          : isError
          ? 'Error fetching listings'
          : value
          ? items.find((item: SearchableSelectItem) => item.value === value)
              ?.label
          : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
      <Command>
        <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
        <CommandEmpty>{notFoundMessage}</CommandEmpty>
        <CommandGroup>
          {items.map((item: SearchableSelectItem) => (
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

const DateTimePicker = ({
  selected,
  onSelect,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) => {
  const [date, setDate] = useState<Date | undefined>(selected);
  const [time, setTime] = useState(
    selected ? format(selected, 'HH:mm') : ''
  );

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      onSelect(undefined);
      return;
    }
    const [h, m] = time.split(':').map(Number);
    newDate.setHours(h || 0);
    newDate.setMinutes(m || 0);
    setDate(newDate);
    onSelect(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    if (!date) {
      // If no date is set, create a new one for today
      const newDate = new Date();
      const [h, m] = e.target.value.split(':').map(Number);
      newDate.setHours(h || 0);
      newDate.setMinutes(m || 0);
      setDate(newDate);
      onSelect(newDate);
      return;
    }
    const [h, m] = e.target.value.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(h || 0);
    newDate.setMinutes(m || 0);
    setDate(newDate);
    onSelect(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            format(selected, 'PPP p')
          ) : (
            <span>YYYY-MM-DD HH:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
        />
        <div className="p-2 border-t border-border">
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const GeneralAdSettings = ({
  formData,
  setFormData,
  errors,
  listings,
  isLoading,
  isError,
}: GeneralAdSettingsProps) => {
  const [openListing, setOpenListing] = React.useState(false);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-settings"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        General Ad Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* For Listing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            For Listing{' '}
            <InfoTooltip message="Select the listing you want to promote." />
          </label>
          <SearchableSelect
            open={openListing}
            setOpen={setOpenListing}
            value={formData.listing}
            setValue={val =>
              setFormData(prev => ({
                ...prev,
                listing: typeof val === 'string' ? val : prev.listing,
              }))
            }
            items={listings}
            placeholder="Search for a listing"
            notFoundMessage="No listing found."
            isLoading={isLoading}
            isError={isError}
          />
          {errors.listing && (
            <p className="text-red-500 text-xs mt-1">{errors.listing}</p>
          )}
        </div>

        {/* Ad Campaign Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Campaign Type
          </label>
          <Select
            value={formData.campaignType}
            onValueChange={(value: 'ppv' | 'ppc') =>
              setFormData(prev => ({ ...prev, campaignType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ppv">Pay Per View</SelectItem>
              <SelectItem value="ppc">Pay Per Click</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            Campaign start date{' '}
            <InfoTooltip message="The date and time your campaign will go live. Cannot be in the past." />
          </label>
          <DateTimePicker
            selected={formData.startDate}
            onSelect={date =>
              setFormData(prev => ({ ...prev, startDate: date }))
            }
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>

        {/* Campaign End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            Campaign end date{' '}
            <InfoTooltip message="The date and time your campaign will end. Must be after the start date." />
          </label>
          <DateTimePicker
            selected={formData.endDate}
            onSelect={date =>
              setFormData(prev => ({ ...prev, endDate: date }))
            }
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="200"
              value={formData.budget}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  budget: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              className="pr-8"
            />
            <PoundSterling className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.budget && (
            <p className="text-red-500 text-xs mt-1">{errors.budget}</p>
          )}
        </div>
      </div>
    </div>
  );
};
