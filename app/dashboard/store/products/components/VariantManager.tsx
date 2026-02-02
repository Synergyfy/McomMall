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
import { X, ChevronsUpDown, Plus, Trash2, Edit2, Settings, ImageIcon, Upload, CheckSquare, Square, Zap, Package } from 'lucide-react';
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
  attributesName?: string;
  variationsName?: string;
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  onAttributesChange?: (attrs: ProductAttribute[]) => void;
  onVariationsChange?: (vars: ProductVariation[]) => void;
}

function VariantTableRow({
    index,
    field,
    attributes,
    variations,
    updateVariation,
    updateAttribute,
    selectedIndices,
    toggleSelect,
    openDimensionEditor,
}: any) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <TableRow className={cn(selectedIndices.includes(index) && "bg-orange-50/30")}>
            <TableCell>
                <Checkbox
                    checked={selectedIndices.includes(index)}
                    onCheckedChange={() => toggleSelect(index)}
                />
            </TableCell>
            {/* Render Combination Values as Dropdowns with Fading/Exhaustive List */}
            {Object.entries(field.combination).map(([attrName, value], i) => {
                const allPredefined = predefinedVariantOptions[attrName as keyof typeof predefinedVariantOptions] || [];
                const currentAttrOptions = attributes.find((a: any) => a.name === attrName)?.options.map((o: any) => o.name) || [];
                const displayOptions = Array.from(new Set([...allPredefined, ...currentAttrOptions]));

                return (
                    <TableCell key={i}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 p-0 font-medium hover:bg-gray-100 transition-colors w-full justify-start px-2 text-xs">
                                    {value as string}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-48" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={`Search ${attrName}...`}
                                        value={searchValue}
                                        onValueChange={setSearchValue}
                                    />
                                    <CommandList>
                                        {searchValue && !displayOptions.includes(searchValue) && (
                                            <div className="p-1 border-b">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8"
                                                    onClick={() => {
                                                        const attrIndex = attributes.findIndex((a: any) => a.name === attrName);
                                                        if (attrIndex !== -1) {
                                                            const currentAttr = attributes[attrIndex];
                                                            const newOptions = [...currentAttr.options, { name: searchValue, priceModifier: 0 }];
                                                            updateAttribute(attrIndex, { ...currentAttr, options: newOptions });
                                                            setSearchValue("");
                                                            toast.success(`Added "${searchValue}" to ${attrName}`);
                                                        }
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-2" />
                                                    Add "{searchValue}"
                                                </Button>
                                            </div>
                                        )}
                                        <CommandGroup>
                                            {displayOptions.map(opt => {
                                                const isUsed = variations.some((v: any, vIdx: number) =>
                                                    vIdx !== index &&
                                                    v.combination[attrName] === opt &&
                                                    Object.entries(v.combination).every(([k, val]) =>
                                                        k === attrName || val === field.combination[k]
                                                    )
                                                );

                                                return (
                                                    <CommandItem
                                                        key={opt}
                                                        onSelect={() => {
                                                            const newCombination = { ...field.combination, [attrName]: opt };
                                                            updateVariation(index, { ...field, combination: newCombination });
                                                        }}
                                                        disabled={isUsed}
                                                        className={cn("flex items-center justify-between text-xs", isUsed && "opacity-30 grayscale cursor-not-allowed")}
                                                    >
                                                        {opt}
                                                        {value === opt && <CheckSquare className="w-3 h-3 text-orange-500" />}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                );
            })}

            <TableCell>
                <div className="relative group w-10 h-10">
                    {field.image ? (
                        <img src={field.image} alt="Variant" className="w-full h-full object-cover rounded-md border border-gray-200" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-md transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const url = URL.createObjectURL(file);
                                updateVariation(index, { ...field, image: url });
                            }
                        }} />
                    </label>
                    {field.image && (
                        <button type="button" onClick={() => updateVariation(index, { ...field, image: undefined })} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-2 h-2" />
                        </button>
                    )}
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-1">
                    <span className={cn("text-[10px] font-bold w-3 text-center", field.price > 0 ? "text-green-600" : "text-gray-400")}>
                        {field.price > 0 ? '+' : ''}
                    </span>
                    <Input type="number" className="w-16 h-7 text-xs" value={field.price} onChange={(e) => updateVariation(index, { ...field, price: parseFloat(e.target.value) || 0 })} />
                </div>
            </TableCell>

            <TableCell>
                <Input type="number" className="w-16 h-7 text-xs" value={field.stock} onChange={(e) => updateVariation(index, { ...field, stock: parseInt(e.target.value) || 0 })} />
            </TableCell>

            <TableCell className="text-center font-medium text-gray-500 text-[10px]">{field.reservedStock || 0}</TableCell>
            <TableCell className="text-center font-medium text-green-600 text-[10px]">{field.soldCount || 0}</TableCell>

            <TableCell>
                <Input className="w-24 h-7 text-[10px]" value={field.sku} onChange={(e) => updateVariation(index, { ...field, sku: e.target.value })} />
            </TableCell>

            <TableCell>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openDimensionEditor(field, index)}>
                    <Settings className="h-3.5 w-3.5 text-gray-500" />
                </Button>
            </TableCell>

            <TableCell>
                <Select value={field.available ? 'true' : 'false'} onValueChange={(val) => updateVariation(index, { ...field, available: val === 'true' })}>
                    <SelectTrigger className="h-7 w-[60px] text-[10px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
        </TableRow>
    );
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

  const rhfAttributes = useFieldArray({ control: context?.control, name: attributesName });
  const rhfVariations = useFieldArray({ control: context?.control, name: variationsName });

  const attributes = (isControlled ? propAttributes : (rhfAttributes.fields as unknown as ProductAttribute[])) || [];
  const variations = (isControlled ? propVariations : (rhfVariations.fields as unknown as ProductVariation[])) || [];

  const appendAttribute = (data: ProductAttribute) => {
    if (isControlled) onAttributesChange?.([...(propAttributes || []), data]);
    else rhfAttributes.append(data);
  };

  const updateAttribute = (index: number, data: ProductAttribute) => {
    if (isControlled) {
      const newAttrs = [...(propAttributes || [])];
      newAttrs[index] = data;
      onAttributesChange?.(newAttrs);
    } else rhfAttributes.update(index, data);
  };

  const removeAttribute = (index: number) => {
    if (isControlled) {
      const newAttrs = (propAttributes || []).filter((_, i) => i !== index);
      onAttributesChange?.(newAttrs);
    } else rhfAttributes.remove(index);
  };

  const replaceVariations = (data: ProductVariation[]) => {
    if (isControlled) onVariationsChange?.(data);
    else rhfVariations.replace(data);
  };

  const updateVariation = (index: number, data: ProductVariation) => {
    if (isControlled) {
      const newVars = [...(propVariations || [])];
      newVars[index] = data;
      onVariationsChange?.(newVars);
    } else rhfVariations.update(index, data);
  };

  const [isAttributeFormVisible, setIsAttributeFormVisible] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [attributeOptions, setAttributeOptions] = useState<{ name: string, priceModifier: number }[]>([]);
  const [isCustomAttribute, setIsCustomAttribute] = useState(false);

  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [tempDimensions, setTempDimensions] = useState({ weight: 0, length: 0, width: 0, height: 0 });
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('');
  const [bulkStockValue, setBulkStockValue] = useState<string>('');

  const cartesian = (args: any[][]): any[][] => {
    if (args.length === 0) return [];
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

  React.useEffect(() => {
    let currentAttributes = attributes;
    if (!isControlled && context) currentAttributes = context.watch(attributesName);

    if (!currentAttributes || currentAttributes.length === 0) {
      if (variations.length > 0) replaceVariations([]);
      return;
    }

    const optionsArrays = currentAttributes.map(a => a.options);
    if (optionsArrays.some(opts => opts.length === 0)) return;

    const combinations = cartesian(optionsArrays);

    const newVariations: ProductVariation[] = combinations.map(combo => {
      const combinationMap: Record<string, string> = {};
      let variationPriceModifier = 0;

      combo.forEach((opt, index) => {
        const attr = currentAttributes![index];
        combinationMap[attr.name] = opt.name;
        variationPriceModifier += (opt.priceModifier || 0);
      });

      const existing = variations.find(v =>
        Object.entries(combinationMap).every(([key, val]) => v.combination[key] === val) &&
        Object.keys(v.combination).length === Object.keys(combinationMap).length
      );

      if (existing) return existing;

      const skuSuffix = combo.map((opt: any) => opt.name).join('-').toUpperCase().replace(/\s+/g, '');

      return {
        combination: combinationMap,
        sku: `${skuSuffix}`,
        price: variationPriceModifier,
        stock: 0,
        available: true,
        weight: 0, length: 0, width: 0, height: 0
      };
    });

    if (JSON.stringify(newVariations.map(v => v.combination)) !== JSON.stringify(variations.map(v => v.combination))) {
        replaceVariations(newVariations);
    }
  }, [attributes, isControlled, context, attributesName]);

  const showAttributeForm = (attribute?: ProductAttribute, index?: number) => {
    if (attribute) {
      setEditingAttributeIndex(index as number);
      setAttributeName(attribute.name);
      setAttributeOptions(attribute.options || []);
      const isPredefined = Object.keys(predefinedVariantOptions).includes(attribute.name);
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
      const attributeData: ProductAttribute = { name: attributeName, options: attributeOptions };
      if (editingAttributeIndex !== null) updateAttribute(editingAttributeIndex, attributeData);
      else appendAttribute(attributeData);
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
      updateVariation(editingVariationIndex, { ...currentVariation, ...tempDimensions });
      setEditingVariationIndex(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === variations.length) setSelectedIndices([]);
    else setSelectedIndices(variations.map((_, i) => i));
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const applyBulkPrice = () => {
    let val = parseFloat(bulkPriceValue);
    if (isNaN(val)) {
        if (variations.length > 0) val = variations[0].price;
        else return;
    }
    const targets = selectedIndices.length > 0 ? selectedIndices : variations.map((_, i) => i);
    targets.forEach(idx => updateVariation(idx, { ...variations[idx], price: val }));
    setBulkPriceValue('');
    toast.success(`Applied price to ${targets.length} variations`);
  };

  const applyBulkStock = () => {
    let val = parseInt(bulkStockValue);
    if (isNaN(val)) {
        if (variations.length > 0) val = variations[0].stock;
        else return;
    }
    const targets = selectedIndices.length > 0 ? selectedIndices : variations.map((_, i) => i);
    targets.forEach(idx => updateVariation(idx, { ...variations[idx], stock: val }));
    setBulkStockValue('');
    toast.success(`Applied quantity to ${targets.length} variations`);
  };

  const bulkToggleAvailability = (available: boolean) => {
    selectedIndices.forEach(idx => updateVariation(idx, { ...variations[idx], available }));
    toast.success(`Updated status for ${selectedIndices.length} variations`);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{attributes.length === 0 ? "Select Product Option Type" : "1. Define Attributes"}</h3>
          {!isAttributeFormVisible && attributes.length < 4 && attributes.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => showAttributeForm()}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Variant Type
            </Button>
          )}
        </div>

        {attributes.length === 0 && !isAttributeFormVisible && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-800/20 text-center gap-6">
                <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">What variants does this product have?</p>
                    <p className="text-sm text-gray-500 max-w-sm">Select an attribute like Size or Color to start building your variant table.</p>
                </div>
                <div className="w-full max-w-md">
                    <Command className="rounded-xl border shadow-md bg-white dark:bg-gray-900">
                        <CommandInput placeholder="Search all attributes (Size, Color, Material...)" />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No attribute found. Add "Custom" instead.</CommandEmpty>
                            <CommandGroup heading="Common Attributes">
                                {Object.keys(predefinedVariantOptions)
                                    .filter(type => !attributes.some(a => a.name === type))
                                    .map((type) => (
                                    <CommandItem key={type} onSelect={() => { setAttributeName(type); setIsCustomAttribute(false); setAttributeOptions([]); setIsAttributeFormVisible(true); }} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                                        <div className="size-2 rounded-full bg-orange-400" />
                                        {type}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup heading="Others">
                                <CommandItem onSelect={() => { setIsCustomAttribute(true); setAttributeName(''); setAttributeOptions([]); setIsAttributeFormVisible(true); }} className="italic text-gray-500 flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                                    <Plus className="size-4" /> Custom / Manual Input
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            </div>
        )}

        {attributes && attributes.length > 0 && (
          <div className="grid gap-4">
            {attributes.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <p className="font-semibold">{field.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {field.options.map((opt) => (
                      <Badge key={opt.name} variant="secondary" className='text-[10px]'>
                        {opt.name} {opt.priceModifier !== 0 ? `(${opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier})` : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => showAttributeForm(field, index)}><Edit2 className="h-4 w-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeAttribute(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAttributeFormVisible && (
          <div className="p-6 border rounded-lg space-y-6 bg-white dark:bg-gray-900 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">{editingAttributeIndex !== null ? 'Edit Attribute' : 'New Attribute'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Attribute Name</Label>
                <Select onValueChange={(value) => { if (value === 'custom') { setIsCustomAttribute(true); setAttributeName(''); } else { setIsCustomAttribute(false); setAttributeName(value); } }} value={isCustomAttribute ? 'custom' : (Object.keys(predefinedVariantOptions).includes(attributeName) ? attributeName : (attributeName ? 'custom' : ''))}>
                  <SelectTrigger><SelectValue placeholder="Select Name (e.g. Color)" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(predefinedVariantOptions).map(type => (
                        <SelectItem key={type} value={type} disabled={attributes.some(a => a.name === type && editingAttributeIndex === null)}>{type}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomAttribute && <Input placeholder="Enter custom name" value={attributeName} onChange={(e) => setAttributeName(e.target.value)} className="mt-2" />}
              </div>
              <div className="space-y-2">
                <Label>Options & Price Modifiers</Label>
                {attributeName === 'Size' && (
                    <div className="flex gap-2 mb-2">
                        <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => { const standard = ['S', 'M', 'L', 'XL']; standard.forEach(s => handleAddOptionToAttribute(s, 0)); }}>Standard (S-XL)</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => { const uk = ['6', '8', '10', '12', '14']; uk.forEach(s => handleAddOptionToAttribute(s, 0)); }}>UK (6-14)</Button>
                    </div>
                )}
                <VariantOptionInput variantName={attributeName || 'Color'} onAddOption={handleAddOptionToAttribute} existingOptions={attributeOptions.map(o => o.name)} />
                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {attributeOptions.length === 0 && <span className="text-sm text-gray-400 italic">No options added yet.</span>}
                  {attributeOptions.map((opt) => (
                    <Badge key={opt.name} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 text-[10px]">
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

      <hr className="border-gray-200 dark:border-gray-800" />

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-medium">2. Configure Variations</h3>
            <p className="text-sm text-gray-500">All possible combinations are auto-generated. Set unique prices and quantity here.</p>
          </div>
        </div>

        {variations && variations.length > 0 && (
          <div className={cn("flex flex-wrap items-center gap-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-lg transition-all duration-300", selectedIndices.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}>
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-300"><Zap className="w-4 h-4" /><span className="uppercase text-[10px] font-bold">Bulk Fill Tools</span><span className="opacity-60">|</span><span>{selectedIndices.length} selected</span></div>
            <div className="h-6 w-[1px] bg-orange-200 dark:bg-orange-800 mx-2 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Bulk Price" className="w-24 h-8 bg-white dark:bg-gray-900" value={bulkPriceValue} onChange={(e) => setBulkPriceValue(e.target.value)} />
              <Button size="sm" onClick={applyBulkPrice} disabled={!bulkPriceValue}>Apply Price</Button>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Bulk Quantity" className="w-24 h-8 bg-white dark:bg-gray-900" value={bulkStockValue} onChange={(e) => setBulkStockValue(e.target.value)} />
              <Button size="sm" onClick={applyBulkStock} disabled={!bulkStockValue}>Apply Quantity</Button>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 bg-white dark:bg-gray-900" onClick={() => bulkToggleAvailability(true)}>Set Active</Button>
              <Button size="sm" variant="outline" className="h-8 bg-white dark:bg-gray-900 text-red-600 hover:text-red-700 font-medium" onClick={() => bulkToggleAvailability(false)}>Set Inactive</Button>
            </div>
          </div>
        )}

        {variations && variations.length > 0 ? (
          <div className="border rounded-md overflow-x-auto">
            <TableRoot className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableHead className="w-[40px]"><Checkbox checked={selectedIndices.length === variations.length && variations.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
                  {Object.keys(variations[0].combination).map((key) => (
                    <TableHead key={key} className="w-[120px]"><div className="flex flex-col gap-1"><span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Attribute</span><span className="text-gray-900 dark:text-white font-bold">{key}</span></div></TableHead>
                  ))}
                  <TableHead className="w-[150px]">
                      <Popover>
                        <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 text-[#f48c25] hover:bg-[#f48c25]/10 font-bold" disabled={attributes.length >= 4}><Plus className="w-3 h-3 mr-1" /> Add Option</Button></PopoverTrigger>
                        <PopoverContent className="p-0 w-60" align="start">
                            <Command>
                                <CommandInput placeholder="Search attributes..." />
                                <CommandList>
                                    <CommandEmpty>No attribute found.</CommandEmpty>
                                    <CommandGroup heading="Common Attributes">
                                        {Object.keys(predefinedVariantOptions).filter(type => !attributes.some(a => a.name === type)).map((type) => (
                                                <CommandItem key={type} onSelect={() => { setAttributeName(type); setIsCustomAttribute(false); setAttributeOptions([]); setIsAttributeFormVisible(true); }}>{type}</CommandItem>
                                            ))
                                        }
                                    </CommandGroup>
                                    <CommandGroup heading="Others">
                                        <CommandItem onSelect={() => { setIsCustomAttribute(true); setAttributeName(''); setAttributeOptions([]); setIsAttributeFormVisible(true); }}>Custom...</CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                      </Popover>
                  </TableHead>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead><div className="flex items-center gap-1 group/header"><span>Price</span><Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover/header:opacity-100 transition-opacity" onClick={applyBulkPrice} title="Apply first row's price to all"><Zap className="w-3 h-3" /></Button></div></TableHead>
                  <TableHead><div className="flex items-center gap-1 group/header"><span>Quantity</span><Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover/header:opacity-100 transition-opacity" onClick={applyBulkStock} title="Apply first row's quantity to all"><Zap className="w-3 h-3" /></Button></div></TableHead>
                  <TableHead className="w-[60px]">Reserved</TableHead>
                  <TableHead className="w-[60px]">Sold</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[80px]">Dims</TableHead>
                  <TableHead className="w-[80px]">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((field, index) => (
                  <VariantTableRow
                    key={index}
                    index={index}
                    field={field}
                    attributes={attributes}
                    variations={variations}
                    updateVariation={updateVariation}
                    updateAttribute={updateAttribute}
                    selectedIndices={selectedIndices}
                    toggleSelect={toggleSelect}
                    openDimensionEditor={openDimensionEditor}
                  />
                ))}
              </TableBody>
            </TableRoot>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/20 text-gray-500">
            <Package className="h-12 w-12 mb-2 opacity-50" />
            <p>No variations generated yet.</p>
            <p className="text-sm">Add attributes and options above to see combinations.</p>
          </div>
        )}
      </div>

      <Dialog open={editingVariationIndex !== null} onOpenChange={(open) => { if (!open) setEditingVariationIndex(null); }}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Dimensions for Variation</DialogTitle>
                <DialogDescription>Override the base product dimensions for this specific variation.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={tempDimensions.weight} onChange={(e) => setTempDimensions({ ...tempDimensions, weight: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Length (cm)</Label><Input type="number" value={tempDimensions.length} onChange={(e) => setTempDimensions({ ...tempDimensions, length: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Width (cm)</Label><Input type="number" value={tempDimensions.width} onChange={(e) => setTempDimensions({ ...tempDimensions, width: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={tempDimensions.height} onChange={(e) => setTempDimensions({ ...tempDimensions, height: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <DialogFooter><Button onClick={saveDimensions}>Save Dimensions</Button></DialogFooter>
          </DialogContent>
      </Dialog>
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
          <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between"><span className="truncate">{inputValue || "Type or select option..."}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Type new option..." value={inputValue} onValueChange={setInputValue} onKeyDown={(e) => { if (e.key === 'Enter' && inputValue) { e.preventDefault(); handleAdd(); } }} />
              <CommandList>
                <CommandEmpty className="py-2 px-4 text-sm">Press Enter to add "{inputValue}"</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {options.filter(opt => !existingOptions.includes(opt)).map((option) => (
                    <CommandItem key={option} value={option} onSelect={() => { onAddOption(option, priceModifier); }}>{option}</CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-1 shrink-0"><span className="text-xs text-gray-500 whitespace-nowrap">Charge:</span><Input type="number" placeholder="0.00" value={priceModifier} onChange={(e) => setPriceModifier(parseFloat(e.target.value) || 0)} className="w-20" /><Button size="icon" variant="ghost" onClick={handleAdd} disabled={!inputValue} type="button"><Plus className="h-4 w-4" /></Button></div>
    </div>
  );
}
