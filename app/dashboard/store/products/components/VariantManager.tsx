'use client';

import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Check, ChevronsUpDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface VariantManagerProps {
  name: string;
}

export default function VariantManager({ name }: VariantManagerProps) {
  const { control, register } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<Partial<ProductVariant> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCustomVariant, setIsCustomVariant] = useState(false);

  const openDialog = (variant?: ProductVariant, index?: number) => {
    setCurrentVariant(
      variant
        ? { ...variant }
        : { name: '', options: [] }
    );
    setEditingIndex(typeof index === 'number' ? index : null);
    setIsCustomVariant(false);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (currentVariant?.name && currentVariant?.options) {
      if (editingIndex !== null) {
        update(editingIndex, currentVariant as ProductVariant);
      } else {
        append(currentVariant as ProductVariant);
      }
      setIsDialogOpen(false);
      setCurrentVariant(null);
      setEditingIndex(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Variants</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" onClick={() => openDialog()}>
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Edit Variant' : 'Add Variant'}
              </DialogTitle>
              <DialogDescription>
                Add variations to your product. For example, if you sell clothing, you can create a &quot;Size&quot; variant with options like &quot;Small&quot;, &quot;Medium&quot;, and &quot;Large&quot;. Each option can have its own quantity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm font-medium">Variant Name</p>
              <Select
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setIsCustomVariant(true);
                    setCurrentVariant({ ...currentVariant, name: '' });
                  } else {
                    setIsCustomVariant(false);
                    setCurrentVariant({ ...currentVariant, name: value });
                  }
                }}
                value={
                  isCustomVariant
                    ? 'custom'
                    : currentVariant?.name || undefined
                }
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
                  value={currentVariant?.name || ''}
                  onChange={(e) =>
                    setCurrentVariant({
                      ...currentVariant,
                      name: e.target.value,
                    })
                  }
                />
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Variant Options</p>
                <p className="text-xs text-gray-500 mb-2">
                  Select from the list or type your own option and press Enter.
                </p>
                <div className="flex items-center gap-2">
                  <VariantOptionInput
                    variantName={currentVariant?.name || ''}
                    onAddOption={(optionName) => {
                      const newOption = {
                        name: optionName,
                        quantity: 0,
                      };
                      setCurrentVariant({
                        ...currentVariant,
                        options: [
                          ...(currentVariant?.options || []),
                          newOption,
                        ],
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {currentVariant?.options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <Badge variant="secondary" className="text-base">
                      {option.name}
                    </Badge>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={option.quantity}
                      onChange={(e) => {
                        const newOptions = [...(currentVariant.options || [])];
                        newOptions[index].quantity = parseInt(e.target.value);
                        setCurrentVariant({
                          ...currentVariant,
                          options: newOptions,
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentVariant({
                          ...currentVariant,
                          options: currentVariant.options?.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <div>
              <p className="font-semibold">
                {(field as unknown as ProductVariant).name}
              </p>
              <p className="text-sm text-gray-500">
                {(field as unknown as ProductVariant).options
                  .map((o) => `${o.name} (${o.quantity})`)
                  .join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openDialog(field as unknown as ProductVariant, index)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantOptionInput({
  variantName,
  onAddOption,
}: {
  variantName: string;
  onAddOption: (optionName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const options =
    predefinedVariantOptions[variantName as keyof typeof predefinedVariantOptions] || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || 'Select or create option...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search or add option..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                e.preventDefault();
                onAddOption(e.currentTarget.value);
                setValue('');
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No options found. Type to create.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onAddOption(currentValue);
                    setValue('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option ? 'opacity-100' : 'opacity-0'
                    )}
                  />
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
