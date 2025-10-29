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
import { X, Plus } from 'lucide-react';
import { ProductVariant } from '@/service/store/products/types';
import { Badge } from '@/components/ui/badge';

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
                A variant is a version of your product with a specific set of options, like size or color.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                defaultValue={isCustomVariant ? 'custom' : currentVariant?.name}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose or Enter Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Color">Color</SelectItem>
                  <SelectItem value="Size">Size</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
               {isCustomVariant && (
                <Input
                  placeholder="Variant Name (e.g., Material)"
                  value={currentVariant?.name || ''}
                  onChange={(e) =>
                    setCurrentVariant({ ...currentVariant, name: e.target.value })
                  }
                />
              )}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Option (e.g., Red)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault();
                      const newOption = {
                        name: e.currentTarget.value,
                        quantity: 0,
                      };
                      setCurrentVariant({
                        ...currentVariant,
                        options: [
                          ...(currentVariant?.options || []),
                          newOption,
                        ],
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                {currentVariant?.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary">{option.name}</Badge>
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
