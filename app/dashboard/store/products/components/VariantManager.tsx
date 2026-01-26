
'use client';

import React, { useState, useEffect } from 'react';
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
import { X, ChevronsUpDown, Plus, Table, Trash2, Edit2, Settings } from 'lucide-react';
import { ProductAttribute, ProductVariation } from '@/service/store/products/types';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import {
  Table as TableRoot,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { v4 as uuidv4 } from 'uuid';

interface VariantManagerProps {
  // We now use specific field names for the new structure, but fall back to 'attributes' and 'variations'
  attributesName?: string;
  variationsName?: string;
}

export default function VariantManager({ attributesName = 'attributes', variationsName = 'variations' }: VariantManagerProps) {
  const { control, watch, setValue } = useFormContext();

  // Manage Attributes (e.g., Color: [Red, Blue])
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
    update: updateAttribute
  } = useFieldArray({
    control,
    name: attributesName,
  });

  // Manage Variations (The Matrix: Red-Small, Red-Large, etc.)
  const {
    fields: variationFields,
    replace: replaceVariations,
    update: updateVariation
  } = useFieldArray({
    control,
    name: variationsName,
  });

  const [isAttributeFormVisible, setIsAttributeFormVisible] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [attributeOptions, setAttributeOptions] = useState<string[]>([]);
  const [isCustomAttribute, setIsCustomAttribute] = useState(false);

  // State for editing dimensions of a specific variation
  const [editingVariationId, setEditingVariationId] = useState<string | null>(null);
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [tempDimensions, setTempDimensions] = useState({
      weight: 0,
      length: 0,
      width: 0,
      height: 0
  });

  // Helper to generate cartesian product of arrays
  const cartesian = (args: any[][]): any[][] => {
    const r: any[][] = [];
    const max = args.length - 1;
    function helper(arr: any[], i: number) {
      for (let j = 0, l = args[i].length; j < l; j++) {
        const a = arr.slice(0);
        a.push(args[i][j]);
        if (i == max) r.push(a);
        else helper(a, i + 1);
      }
    }
    helper([], 0);
    return r;
  };

  // Regenerate Matrix when Attributes Change
  const generateVariations = () => {
    const attributes = watch(attributesName) as ProductAttribute[];

    if (!attributes || attributes.length === 0) {
      replaceVariations([]);
      return;
    }

    // Extract options arrays: [['Red', 'Blue'], ['S', 'M']]
    const optionsArrays = attributes.map(a => a.options);

    // Generate combinations: [['Red', 'S'], ['Red', 'M'], ...]
    const combinations = cartesian(optionsArrays);

    const newVariations: ProductVariation[] = combinations.map(combo => {
      // Construct the combination object: { Color: 'Red', Size: 'S' }
      const combinationMap: Record<string, string> = {};
      attributes.forEach((attr, index) => {
        combinationMap[attr.name] = combo[index];
      });

      // Generate a predictable SKU suffix
      const skuSuffix = combo.join('-').toUpperCase().replace(/\s+/g, '');

      return {
        id: uuidv4(),
        combination: combinationMap,
        sku: `${skuSuffix}`,
        price: 0,
        stock: 0,
        available: true,
        weight: 0,
        length: 0,
        width: 0,
        height: 0
      };
    });

    replaceVariations(newVariations);
  };

  const showAttributeForm = (attribute?: ProductAttribute, index?: number) => {
    if (attribute) {
      setEditingAttributeIndex(index as number);
      setAttributeName(attribute.name);
      setAttributeOptions(attribute.options || []);
      const isPredefined = ['Color', 'Size', 'Material', 'Style'].includes(attribute.name);
      setIsCustomAttribute(!isPredefined);
    } else {
      setEditingAttributeIndex(null);
      setAttributeName('');
      setAttributeOptions([]);
      setIsCustomAttribute(false);
    }
    setIsAttributeFormVisible(true);
  };

  const hideAttributeForm = () => {
    setIsAttributeFormVisible(false);
    setEditingAttributeIndex(null);
  };

  const handleSaveAttribute = () => {
    if (attributeName && attributeOptions.length > 0) {
      const attributeData: ProductAttribute = {
        name: attributeName,
        options: attributeOptions,
      };
      if (editingAttributeIndex !== null) {
        updateAttribute(editingAttributeIndex, attributeData);
      } else {
        appendAttribute(attributeData);
      }
      hideAttributeForm();
    }
  };

  const handleAddOptionToAttribute = (optionName: string) => {
    if (optionName && !attributeOptions.includes(optionName)) {
      setAttributeOptions([...attributeOptions, optionName]);
    }
  };

  const handleRemoveOptionFromAttribute = (option: string) => {
    setAttributeOptions(attributeOptions.filter((o) => o !== option));
  };

  const openDimensionEditor = (variation: ProductVariation, index: number) => {
      setEditingVariationId(variation.id);
      setEditingVariationIndex(index);
      setTempDimensions({
          weight: variation.weight || 0,
          length: variation.length || 0,
          width: variation.width || 0,
          height: variation.height || 0
      });
  };

  const saveDimensions = () => {
      if (editingVariationIndex !== null && editingVariationId !== null) {
          const currentVariation = variationFields[editingVariationIndex] as unknown as ProductVariation;
          updateVariation(editingVariationIndex, {
              ...currentVariation,
              ...tempDimensions
          });
          setEditingVariationId(null);
          setEditingVariationIndex(null);
      }
  };


  // Safe type casting for the fields
  const safeAttributeFields = attributeFields as unknown as ProductAttribute[];
  const safeVariationFields = variationFields as unknown as ProductVariation[];

  return (
    <div className="space-y-8">

      {/* SECTION 1: ATTRIBUTE DEFINITIONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">1. Define Attributes</h3>
          {!isAttributeFormVisible && (
            <Button type="button" variant="outline" size="sm" onClick={() => showAttributeForm()}>
              <Plus className="mr-2 h-4 w-4" /> Add Attribute
            </Button>
          )}
        </div>

        {safeAttributeFields.length > 0 && (
          <div className="grid gap-4">
            {safeAttributeFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold">{field.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {field.options.map((opt) => (
                      <Badge key={opt} variant="secondary" className='text-xs'>{opt}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => showAttributeForm(field, index)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeAttribute(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAttributeFormVisible && (
          <div className="p-6 border rounded-lg space-y-6 bg-white shadow-sm animate-in fade-in zoom-in-95 duration-200">
             <h4 className="text-md font-semibold text-gray-900">{editingAttributeIndex !== null ? 'Edit Attribute' : 'New Attribute'}</h4>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Attribute Name</Label>
                   <Select
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setIsCustomAttribute(true);
                        setAttributeName('');
                      } else {
                        setIsCustomAttribute(false);
                        setAttributeName(value);
                      }
                    }}
                    value={isCustomAttribute ? 'custom' : (['Color', 'Size', 'Material'].includes(attributeName) ? attributeName : (attributeName ? 'custom' : ''))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Name (e.g. Color)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Color">Color</SelectItem>
                      <SelectItem value="Size">Size</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                   {isCustomAttribute && (
                    <Input
                      placeholder="Enter custom name"
                      value={attributeName}
                      onChange={(e) => setAttributeName(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                   <Label>Options</Label>
                   <VariantOptionInput
                      variantName={attributeName || 'Color'} // Default to allow typing
                      onAddOption={handleAddOptionToAttribute}
                      existingOptions={attributeOptions}
                    />
                     <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 bg-gray-50 rounded-md">
                        {attributeOptions.length === 0 && <span className="text-sm text-gray-400 italic">No options added yet.</span>}
                        {attributeOptions.map((opt) => (
                          <Badge key={opt} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                            {opt}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveOptionFromAttribute(opt)} />
                          </Badge>
                        ))}
                    </div>
                </div>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={hideAttributeForm}>Cancel</Button>
                <Button type="button" onClick={handleSaveAttribute} disabled={!attributeName || attributeOptions.length === 0}>Save Attribute</Button>
             </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* SECTION 2: VARIATION MATRIX */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-medium">2. Configure Variations</h3>
            <p className="text-sm text-gray-500">Generate all possible combinations and set their prices/stock.</p>
          </div>
          <Button type="button" onClick={generateVariations} disabled={safeAttributeFields.length === 0}>
             Generate Variations
          </Button>
        </div>

        {safeVariationFields.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <TableRoot>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {/* Dynamic Headers based on Attributes */}
                  {Object.keys(safeVariationFields[0].combination).map((key) => (
                    <TableHead key={key} className="w-[100px]">{key}</TableHead>
                  ))}
                  <TableHead>Price (£)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[80px]">Dims</TableHead>
                  <TableHead className="w-[80px]">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeVariationFields.map((field, index) => (
                  <TableRow key={field.id}>
                    {/* Render Combination Values */}
                    {Object.values(field.combination).map((value, i) => (
                       <TableCell key={i} className="font-medium">{value}</TableCell>
                    ))}

                    {/* Editable Price */}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24 h-8"
                        defaultValue={field.price}
                        onChange={(e) => {
                           const val = parseFloat(e.target.value);
                           updateVariation(index, { ...field, price: isNaN(val) ? 0 : val });
                        }}
                      />
                    </TableCell>

                    {/* Editable Stock */}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24 h-8"
                        defaultValue={field.stock}
                         onChange={(e) => {
                           const val = parseInt(e.target.value);
                           updateVariation(index, { ...field, stock: isNaN(val) ? 0 : val });
                        }}
                      />
                    </TableCell>

                    {/* Editable SKU */}
                    <TableCell>
                      <Input
                        className="w-32 h-8 text-xs"
                        defaultValue={field.sku}
                        onChange={(e) => {
                           updateVariation(index, { ...field, sku: e.target.value });
                        }}
                      />
                    </TableCell>

                    {/* Dimensions Popover Trigger */}
                    <TableCell>
                        <Dialog open={editingVariationId === field.id} onOpenChange={(open) => {
                            if (!open) {
                                setEditingVariationId(null);
                                setEditingVariationIndex(null);
                            }
                        }}>
                          <DialogTrigger asChild>
                             <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openDimensionEditor(field, index)}
                             >
                                <Settings className="h-4 w-4 text-gray-500" />
                             </Button>
                          </DialogTrigger>
                          <DialogContent>
                             <DialogHeader>
                                <DialogTitle>Dimensions for {Object.values(field.combination).join('/')}</DialogTitle>
                                <DialogDescription>
                                   Override the base product dimensions for this specific variation.
                                </DialogDescription>
                             </DialogHeader>
                             <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                   <Label>Weight (kg)</Label>
                                   <Input
                                      type="number"
                                      value={tempDimensions.weight}
                                      onChange={(e) => setTempDimensions({...tempDimensions, weight: parseFloat(e.target.value) || 0})}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <Label>Length (cm)</Label>
                                   <Input
                                      type="number"
                                      value={tempDimensions.length}
                                      onChange={(e) => setTempDimensions({...tempDimensions, length: parseFloat(e.target.value) || 0})}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <Label>Width (cm)</Label>
                                   <Input
                                      type="number"
                                      value={tempDimensions.width}
                                      onChange={(e) => setTempDimensions({...tempDimensions, width: parseFloat(e.target.value) || 0})}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <Label>Height (cm)</Label>
                                   <Input
                                      type="number"
                                      value={tempDimensions.height}
                                      onChange={(e) => setTempDimensions({...tempDimensions, height: parseFloat(e.target.value) || 0})}
                                   />
                                </div>
                             </div>
                             <DialogFooter>
                                <Button onClick={saveDimensions}>Save Dimensions</Button>
                             </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </TableCell>

                    {/* Toggle Available */}
                    <TableCell>
                       <Select
                          defaultValue={field.available ? 'true' : 'false'}
                          onValueChange={(val) => {
                             updateVariation(index, { ...field, available: val === 'true' });
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="true">Yes</SelectItem>
                             <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                       </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
              <Table className="h-12 w-12 mb-2 opacity-50" />
              <p>No variations generated yet.</p>
              <p className="text-sm">Add attributes above, then click "Generate Variations".</p>
           </div>
        )}
      </div>

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

  // Fallback to empty array if variantName key doesn't exist
  const options = predefinedVariantOptions[variantName as keyof typeof predefinedVariantOptions] || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {inputValue || "Type or select option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Type new option..."
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
            <CommandEmpty className="py-2 px-4 text-sm">
               Press Enter to add "{inputValue}"
            </CommandEmpty>
            <CommandGroup heading="Suggestions">
              {options.filter(opt => !existingOptions.includes(opt)).map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    // Start Case for better UX if needed, or keep raw
                    onAddOption(option);
                    setOpen(false);
                    setInputValue('');
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
