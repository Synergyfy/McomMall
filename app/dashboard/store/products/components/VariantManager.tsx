'use client';

import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ChevronsUpDown, Plus, Trash2, Edit2, Settings, ImageIcon, Upload, CheckSquare, Square, Zap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';

interface VariantManagerProps {
  // Legacy / Uncontrolled (RHF)
  attributesName?: string;
  variationsName?: string;

  // Controlled (Manual State)
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  onAttributesChange?: (attrs: ProductAttribute[]) => void;
  onVariationsChange?: (vars: ProductVariation[]) => void;
}

export default function VariantManager({
  attributesName = 'attributes',
  variationsName = 'variations',
  attributes: propAttributes,
  variations: propVariations,
  onAttributesChange,
  onVariationsChange
}: VariantManagerProps) {

  const context = useFormContext();
  const isControlled = !!(propAttributes && onAttributesChange);

  // --- Data Access Layer ---

  // RHF Hooks (conditionally used, but rules of hooks say we must always call them)
  // We'll call them but ignore if controlled.
  const rhfAttributes = useFieldArray({ control: context?.control, name: attributesName });
  const rhfVariations = useFieldArray({ control: context?.control, name: variationsName });

  const attributes = (isControlled ? propAttributes : (rhfAttributes.fields as unknown as ProductAttribute[])) || [];
  const variations = (isControlled ? propVariations : (rhfVariations.fields as unknown as ProductVariation[])) || [];

  const appendAttribute = (data: ProductAttribute) => {
    if (isControlled) {
      onAttributesChange?.([...(propAttributes || []), data]);
    } else {
      rhfAttributes.append(data);
    }
  };

  const updateAttribute = (index: number, data: ProductAttribute) => {
    if (isControlled) {
      const newAttrs = [...(propAttributes || [])];
      newAttrs[index] = data;
      onAttributesChange?.(newAttrs);
    } else {
      rhfAttributes.update(index, data);
    }
  };

  const removeAttribute = (index: number) => {
    if (isControlled) {
      const newAttrs = (propAttributes || []).filter((_, i) => i !== index);
      onAttributesChange?.(newAttrs);
    } else {
      rhfAttributes.remove(index);
    }
  };

  const replaceVariations = (data: ProductVariation[]) => {
    if (isControlled) {
      onVariationsChange?.(data);
    } else {
      rhfVariations.replace(data);
    }
  };

  const updateVariation = (index: number, data: ProductVariation) => {
    if (isControlled) {
      const newVars = [...(propVariations || [])];
      newVars[index] = data;
      onVariationsChange?.(newVars);
    } else {
      rhfVariations.update(index, data);
    }
  };

  // --- UI State ---

  const [isAttributeFormVisible, setIsAttributeFormVisible] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [attributeOptions, setAttributeOptions] = useState<{ name: string, priceModifier: number }[]>([]);
  const [isCustomAttribute, setIsCustomAttribute] = useState(false);

  // State for editing dimensions of a specific variation
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [tempDimensions, setTempDimensions] = useState({
    weight: 0,
    length: 0,
    width: 0,
    height: 0
  });
  // State for variation selection
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('');
  const [bulkStockValue, setBulkStockValue] = useState<string>('');

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
    // If not controlled, we might need to watch() form values to get current state if fields array is stale?
    // But fields array should be up to date.
    // For RHF, fields array might be objects with id. We need to strip them or access properties carefully.

    // In RHF, `attributes` comes from `useFieldArray`, which is an array of objects with `id`.
    // But we cast it above.
    // However, for generation, we need the *current* values, which `fields` might not reflect immediately if we just updated?
    // Actually `fields` from useFieldArray is for rendering. For logic, `watch` is often safer in RHF.

    let currentAttributes = attributes;
    if (!isControlled && context) {
      currentAttributes = context.watch(attributesName);
    }

    if (!currentAttributes || currentAttributes.length === 0) {
      replaceVariations([]);
      return;
    }

    // Extract options arrays: [[{name: 'Red', priceModifier: 0}, {name: 'Blue', priceModifier: 5}], [...]]
    const optionsArrays = currentAttributes.map(a => a.options);

    // Generate combinations: [[{name: 'Red', ...}, {name: 'S', ...}], ...]
    const combinations = cartesian(optionsArrays);

    const newVariations: ProductVariation[] = combinations.map(combo => {
      // Construct the combination object: { Color: 'Red', Size: 'S' }
      const combinationMap: Record<string, string> = {};
      let variationPriceModifier = 0;

      combo.forEach((opt, index) => {
        const attr = currentAttributes[index];
        combinationMap[attr.name] = opt.name;
        variationPriceModifier += (opt.priceModifier || 0);
      });

      // Generate a predictable SKU suffix
      const skuSuffix = combo.map((opt: any) => opt.name).join('-').toUpperCase().replace(/\s+/g, '');

      return {
        combination: combinationMap,
        sku: `${skuSuffix}`,
        price: variationPriceModifier,
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

  const handleAddOptionToAttribute = (optionName: string, modifier: number) => {
    if (optionName && !attributeOptions.some(o => o.name === optionName)) {
      setAttributeOptions([...attributeOptions, { name: optionName, priceModifier: modifier }]);
    }
  };

  const handleRemoveOptionFromAttribute = (optionName: string) => {
    setAttributeOptions(attributeOptions.filter((o) => o.name !== optionName));
  };

  const openDimensionEditor = (variation: ProductVariation, index: number) => {
    setEditingVariationIndex(index);
    setTempDimensions({
      weight: variation.weight || 0,
      length: variation.length || 0,
      width: variation.width || 0,
      height: variation.height || 0
    });
  };

  const saveDimensions = () => {
    if (editingVariationIndex !== null) {
      const currentVariation = variations[editingVariationIndex];
      updateVariation(editingVariationIndex, {
        ...currentVariation,
        ...tempDimensions
      });
      setEditingVariationIndex(null);
    }
  };

  // --- Bulk Actions ---

  const toggleSelectAll = () => {
    if (selectedIndices.length === variations.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(variations.map((_, i) => i));
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const applyBulkPrice = () => {
    const val = parseFloat(bulkPriceValue);
    if (isNaN(val)) return;

    selectedIndices.forEach(idx => {
      updateVariation(idx, { ...variations[idx], price: val });
    });
    setBulkPriceValue('');
    toast.success(`Applied price to ${selectedIndices.length} variations`);
  };

  const applyBulkStock = () => {
    const val = parseInt(bulkStockValue);
    if (isNaN(val)) return;

    selectedIndices.forEach(idx => {
      updateVariation(idx, { ...variations[idx], stock: val });
    });
    setBulkStockValue('');
    toast.success(`Applied stock to ${selectedIndices.length} variations`);
  };

  const bulkToggleAvailability = (available: boolean) => {
    selectedIndices.forEach(idx => {
      updateVariation(idx, { ...variations[idx], available });
    });
    toast.success(`Updated status for ${selectedIndices.length} variations`);
  };


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

        {attributes && attributes.length > 0 && (
          <div className="grid gap-4">
            {attributes.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold">{field.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {field.options.map((opt) => (
                      <Badge key={opt.name} variant="secondary" className='text-xs'>
                        {opt.name} {opt.priceModifier !== 0 ? `(${opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier})` : ''}
                      </Badge>
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
                <Label>Options & Price Modifiers</Label>
                <VariantOptionInput
                  variantName={attributeName || 'Color'} // Default to allow typing
                  onAddOption={handleAddOptionToAttribute}
                  existingOptions={attributeOptions.map(o => o.name)}
                />
                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 bg-gray-50 rounded-md">
                  {attributeOptions.length === 0 && <span className="text-sm text-gray-400 italic">No options added yet.</span>}
                  {attributeOptions.map((opt) => (
                    <Badge key={opt.name} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {opt.name} {opt.priceModifier !== 0 ? `(${opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier})` : ''}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveOptionFromAttribute(opt.name)} />
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
          <Button type="button" onClick={generateVariations} disabled={!attributes || attributes.length === 0}>
            Generate Variations
          </Button>
        </div>

        {/* Bulk Actions Toolbar */}
        {variations && variations.length > 0 && (
          <div className={cn(
            "flex flex-wrap items-center gap-4 p-3 bg-orange-50 border border-orange-100 rounded-lg transition-all duration-300",
            selectedIndices.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          )}>
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
              <Zap className="w-4 h-4" />
              <span>{selectedIndices.length} items selected</span>
            </div>

            <div className="h-6 w-[1px] bg-orange-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Bulk Price"
                className="w-24 h-8 bg-white"
                value={bulkPriceValue}
                onChange={(e) => setBulkPriceValue(e.target.value)}
              />
              <Button size="sm" onClick={applyBulkPrice} disabled={!bulkPriceValue}>Apply Price</Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Bulk Stock"
                className="w-24 h-8 bg-white"
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(e.target.value)}
              />
              <Button size="sm" onClick={applyBulkStock} disabled={!bulkStockValue}>Apply Stock</Button>
            </div>

            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => bulkToggleAvailability(true)}>Set Active</Button>
              <Button size="sm" variant="outline" className="h-8 bg-white text-red-600 hover:text-red-700 font-medium" onClick={() => bulkToggleAvailability(false)}>Set Inactive</Button>
            </div>
          </div>
        )}

        {variations && variations.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <TableRoot>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedIndices.length === variations.length && variations.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  {/* Dynamic Headers based on Attributes */}
                  {Object.keys(variations[0].combination).map((key) => (
                    <TableHead key={key} className="w-[100px]">{key}</TableHead>
                  ))}
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Price (+/-)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[80px]">Dims</TableHead>
                  <TableHead className="w-[80px]">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((field, index) => (
                  <TableRow key={index} className={cn(selectedIndices.includes(index) && "bg-orange-50/30")}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIndices.includes(index)}
                        onCheckedChange={() => toggleSelect(index)}
                      />
                    </TableCell>
                    {/* Render Combination Values */}
                    {Object.values(field.combination).map((value, i) => (
                      <TableCell key={i} className="font-medium">{value}</TableCell>
                    ))}

                    {/* Image Upload */}
                    <TableCell>
                      <div className="relative group w-10 h-10">
                        {field.image ? (
                          <img
                            src={field.image}
                            alt="Variant"
                            className="w-full h-full object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}

                        {/* Hidden Input Overlay */}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-md transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                updateVariation(index, { ...field, image: url });
                              }
                            }}
                          />
                        </label>
                        {field.image && (
                          <button
                            type="button"
                            onClick={() => updateVariation(index, { ...field, image: undefined })}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        )}
                      </div>
                    </TableCell>

                    {/* Editable Price Modifier */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "text-xs font-bold w-4 text-center",
                          field.price > 0 ? "text-green-600" : field.price < 0 ? "text-red-600" : "text-gray-400"
                        )}>
                          {field.price > 0 ? '+' : field.price < 0 ? '' : ''}
                        </span>
                        <Input
                          type="number"
                          className={cn(
                            "w-20 h-8",
                            field.price > 0 ? "border-green-200 bg-green-50" : field.price < 0 ? "border-red-200 bg-red-50" : ""
                          )}
                          value={field.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateVariation(index, { ...field, price: isNaN(val) ? 0 : val });
                          }}
                        />
                      </div>
                    </TableCell>

                    {/* Editable Stock */}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24 h-8"
                        value={field.stock}
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
                        value={field.sku}
                        onChange={(e) => {
                          updateVariation(index, { ...field, sku: e.target.value });
                        }}
                      />
                    </TableCell>

                    {/* Dimensions Popover Trigger */}
                    <TableCell>
                      <Dialog open={editingVariationIndex === index} onOpenChange={(open) => {
                        if (!open) {
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
                                onChange={(e) => setTempDimensions({ ...tempDimensions, weight: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Length (cm)</Label>
                              <Input
                                type="number"
                                value={tempDimensions.length}
                                onChange={(e) => setTempDimensions({ ...tempDimensions, length: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Width (cm)</Label>
                              <Input
                                type="number"
                                value={tempDimensions.width}
                                onChange={(e) => setTempDimensions({ ...tempDimensions, width: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Height (cm)</Label>
                              <Input
                                type="number"
                                value={tempDimensions.height}
                                onChange={(e) => setTempDimensions({ ...tempDimensions, height: parseFloat(e.target.value) || 0 })}
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
                        value={field.available ? 'true' : 'false'}
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
            <TableRoot className="h-12 w-12 mb-2 opacity-50" />
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
  onAddOption: (optionName: string, modifier: number) => void;
  existingOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [priceModifier, setPriceModifier] = useState<number>(0);

  // Fallback to empty array if variantName key doesn't exist
  const options = predefinedVariantOptions[variantName as keyof typeof predefinedVariantOptions] || [];

  const handleAdd = () => {
    if (inputValue) {
      onAddOption(inputValue, priceModifier);
      setInputValue('');
      setPriceModifier(0);
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 min-w-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className="truncate">{inputValue || "Type or select option..."}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Type new option..."
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue) {
                    e.preventDefault();
                    handleAdd();
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
                        setInputValue(option);
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
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-500 whitespace-nowrap">Charge:</span>
        <Input
          type="number"
          placeholder="0.00"
          value={priceModifier}
          onChange={(e) => setPriceModifier(parseFloat(e.target.value) || 0)}
          className="w-20"
        />
        <Button size="icon" variant="ghost" onClick={handleAdd} disabled={!inputValue} type="button">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
