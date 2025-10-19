'use client';

import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

  const openDialog = (variant?: ProductVariant, index?: number) => {
    setCurrentVariant(variant ? { ...variant } : { name: '', options: [] });
    setEditingIndex(typeof index === 'number' ? index : null);
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
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Variant Name (e.g., Color)"
                value={currentVariant?.name || ''}
                onChange={(e) =>
                  setCurrentVariant({ ...currentVariant, name: e.target.value })
                }
              />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Option (e.g., Red)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault();
                      setCurrentVariant({
                        ...currentVariant,
                        options: [
                          ...(currentVariant?.options || []),
                          e.currentTarget.value,
                        ],
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {currentVariant?.options?.map((option, index) => (
                  <Badge key={index} variant="secondary">
                    {option}
                    <button
                      type="button"
                      className="ml-1"
                      onClick={() => {
                        setCurrentVariant({
                          ...currentVariant,
                          options: currentVariant.options?.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
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
                <p className="font-semibold">{(field as unknown as ProductVariant).name}</p>
                <p className="text-sm text-gray-500">
                {(field as unknown as ProductVariant).options.join(', ')}
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
