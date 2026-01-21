
'use client';

import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ChevronsUpDown, Plus } from 'lucide-react';
import { ProductVariant } from '@/service/store/products/types';
import { Badge } from '@/components/ui/badge';
import { predefinedVariantOptions } from '@/lib/variant-options';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface VariantManagerProps {
  name: string;
}

export default function VariantManager({ name }: VariantManagerProps) {
  const { control } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variantName, setVariantName] = useState('');
  const [variantType, setVariantType] = useState('select');
  const [variantOptions, setVariantOptions] = useState<{ name: string; quantity: number; priceModifier: number }[]>([]);
  const [isCustomVariant, setIsCustomVariant] = useState(false);

  const showForm = (variant?: ProductVariant, index?: number) => {
    if (variant) {
      setEditingIndex(index as number);
      setVariantName(variant.name);
      setVariantType(variant.type || 'select');
      setVariantOptions(variant.options || []);
      const isPredefined = ['Color', 'Size'].includes(variant.name);
      setIsCustomVariant(!isPredefined);
    } else {
      setEditingIndex(null);
      setVariantName('');
      setVariantType('select');
      setVariantOptions([]);
      setIsCustomVariant(false);
    }
    setIsFormVisible(true);
  };

  const hideForm = () => {
    setIsFormVisible(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (variantName && variantOptions.length > 0) {
      const variantData: ProductVariant = {
        name: variantName,
        type: variantType,
        options: variantOptions,
      };
      if (editingIndex !== null) {
        update(editingIndex, variantData);
      } else {
        append(variantData);
      }
      hideForm();
    }
  };

  const handleAddOption = (optionName: string) => {
    if (optionName && !variantOptions.some(opt => opt.name.toLowerCase() === optionName.toLowerCase())) {
      setVariantOptions([...variantOptions, { name: optionName, quantity: 0, priceModifier: 0 }]);
    }
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const newOptions = [...variantOptions];
    newOptions[index] = { ...newOptions[index], quantity: quantity >= 0 ? quantity : 0 };
    setVariantOptions(newOptions);
  };

  const handleUpdatePriceModifier = (index: number, price: number) => {
    const newOptions = [...variantOptions];
    newOptions[index] = { ...newOptions[index], priceModifier: price };
    setVariantOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    setVariantOptions(variantOptions.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
            <div>
              <p className="font-semibold">{(field as unknown as ProductVariant).name} <span className='text-xs font-normal text-gray-500'>({(field as unknown as ProductVariant).type})</span></p>
              <p className="text-sm text-gray-500">
                {(field as unknown as ProductVariant).options.map((o) => `${o.name} (Qty: ${o.quantity}, +£${o.priceModifier})`).join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => showForm(field as unknown as ProductVariant, index)}>Edit</Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>

      {isFormVisible ? (
        <div className="p-4 border rounded-md space-y-4 bg-white shadow-sm">
          <h3 className="text-lg font-medium">{editingIndex !== null ? 'Edit Variant' : 'Add New Variant'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Variant Name</Label>
              <Select
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setIsCustomVariant(true);
                    setVariantName('');
                  } else {
                    setIsCustomVariant(false);
                    setVariantName(value);
                  }
                }}
                value={isCustomVariant ? 'custom' : (['Color', 'Size'].includes(variantName) ? variantName : (variantName ? 'custom' : ''))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose or Enter Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Color">Color</SelectItem>
                  <SelectItem value="Size">Size</SelectItem>
                  <SelectItem value="custom">Custom (e.g., Material)</SelectItem>
                </SelectContent>
              </Select>
              {isCustomVariant && (
                <Input
                  placeholder="Variant Name (e.g., Material)"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>UI Type</Label>
              <Select
                onValueChange={setVariantType}
                value={variantType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UI Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Dropdown (Select)</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                  <SelectItem value="color-picker">Color Picker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Label>Variant Options</Label>
            <p className="text-xs text-gray-500 mb-2">Select from the list or type your own option and press Enter.</p>
            <VariantOptionInput
              variantName={variantName}
              onAddOption={handleAddOption}
              existingOptions={variantOptions.map(opt => opt.name)}
            />
          </div>

          <div className="space-y-2">
            {variantOptions.length > 0 && (
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Quantity</div>
                <div className="col-span-4">Price Modifier (£)</div>
                <div className="col-span-1"></div>
              </div>
            )}
            {variantOptions.map((option, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                <div className="col-span-4">
                  <Badge variant="secondary" className="text-base truncate w-full justify-center">{option.name}</Badge>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={option.quantity}
                    onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                  />
                </div>
                <div className="col-span-4">
                   <Input
                    type="number"
                    placeholder="Price Mod"
                    value={option.priceModifier}
                    onChange={(e) => handleUpdatePriceModifier(index, parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-4">
             <Button type="button" variant="ghost" onClick={hideForm}>Cancel</Button>
             <Button type="button" onClick={handleSave} disabled={!variantName || variantOptions.length === 0}>Save Variant</Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => showForm()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Variant
        </Button>
      )}
    </div>
  );
}

function VariantOptionInput({
  variantName,
  onAddOption,
  existingOptions,
}: {
  variantName: string;
  onAddOption: (optionName: string) => void;
  existingOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const options = predefinedVariantOptions[variantName as keyof typeof predefinedVariantOptions] || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={!variantName}
        >
          {inputValue || "Select or create option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search or add option..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                e.preventDefault();
                onAddOption(inputValue);
                setInputValue('');
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No options found. Type and press Enter to create.</CommandEmpty>
            <CommandGroup>
              {options.filter(opt => !existingOptions.includes(opt)).map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onAddOption(currentValue);
                    setOpen(false);
                  }}
                >
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
