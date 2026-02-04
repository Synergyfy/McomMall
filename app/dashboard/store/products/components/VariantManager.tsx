'use client';

import React, { useState, useMemo } from 'react';
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
import { X, ChevronsUpDown, Plus, Trash2, Edit2, Settings, ImageIcon, Upload, CheckSquare, Zap, Package, ChevronDown, ChevronRight, Copy, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProductAttribute, ProductVariation } from '@/service/store/products/types';
import { Badge } from '@/components/ui/badge';
import { predefinedVariantOptions, sizeSystems, sizeMapping } from '@/lib/variant-options';
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
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VariantManagerProps {
  attributesName?: string;
  variationsName?: string;
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  onAttributesChange?: (attrs: ProductAttribute[]) => void;
  onVariationsChange?: (vars: ProductVariation[]) => void;
  readOnlyPricing?: boolean;
}

// Helper to group variations by the first attribute's value
const groupVariations = (variations: ProductVariation[], firstAttributeName: string) => {
  const groups: Record<string, { originalIndex: number, variation: ProductVariation }[]> = {};

  variations.forEach((v, index) => {
    const groupKey = v.combination[firstAttributeName] || 'Unassigned';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ originalIndex: index, variation: v });
  });

  return groups;
};

// Sub-component for a group of rows within the single main table
function VariantGroupRows({
  groupValue,
  groupItems,
  attributes,
  updateVariation,
  removeVariation,
  addVariantToGroup,
  selectedIndices,
  toggleSelect,
  openDimensionEditor,
  generateSuggestedSku,
  readOnlyPricing = false,
}: {
  groupValue: string,
  groupItems: { originalIndex: number, variation: ProductVariation }[],
  attributes: ProductAttribute[],
  updateVariation: (index: number, data: ProductVariation) => void,
  removeVariation: (index: number) => void,
  addVariantToGroup: (groupValue: string, combos: Record<string, string> | Record<string, string>[], extras?: Partial<ProductVariation>) => void,
  selectedIndices: number[],
  toggleSelect: (index: number) => void,
  openDimensionEditor: (v: ProductVariation, idx: number) => void,
  generateSuggestedSku: (combination: Record<string, string>) => string,
  readOnlyPricing?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const firstAttrName = attributes[0]?.name;
  const childAttributes = attributes.slice(1);

  const groupSelected = groupItems.every(i => selectedIndices.includes(i.originalIndex));

  if (groupItems.length === 0) return null;

  return (
    <>
      {/* Group Header Row - Aligned with columns */}
      <TableRow className="bg-orange-50/40 dark:bg-orange-900/10 hover:bg-orange-100/40 border-y-2 border-orange-200/30">
        <TableCell className="w-[40px] pl-4 py-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0 text-orange-700 hover:bg-orange-200/50" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Checkbox
              checked={groupSelected}
              onCheckedChange={(checked) => {
                groupItems.forEach(item => {
                  if (checked && !selectedIndices.includes(item.originalIndex)) toggleSelect(item.originalIndex);
                  else if (!checked && selectedIndices.includes(item.originalIndex)) toggleSelect(item.originalIndex);
                });
              }}
              className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
            />
          </div>
        </TableCell>

        {/* Primary Attribute Cell */}
        <TableCell className="py-2 px-4 border-r border-orange-200/20">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter opacity-70">
              {firstAttrName}
            </span>
            <span className="text-sm font-extrabold text-orange-800 dark:text-orange-400">
              {groupValue}
            </span>
          </div>
        </TableCell>

        {/* Other Attributes with Quick Pickers */}
        {attributes.slice(1).map((attr) => (
          <TableCell key={attr.name} className="py-2 px-4 border-r border-orange-200/20">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                {attr.name}
              </span>
              <QuickAttributePicker
                attributeName={attr.name}
                onAdd={(values) => {
                  const combos = values.map(val => ({ [attr.name]: val }));
                  addVariantToGroup(groupValue, combos);
                }}
              />
            </div>
          </TableCell>
        ))}

        {/* Action/Meta space */}
        <TableCell colSpan={10} className="py-2 px-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white dark:bg-black/40 text-orange-700 border-orange-200 h-6 text-[11px] font-bold shadow-sm">
              {groupItems.length} Variations
            </Badge>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && groupItems.map(({ originalIndex, variation }, idx) => {
        return (
          <TableRow key={originalIndex} className={cn("hover:bg-orange-50/10", selectedIndices.includes(originalIndex) && "bg-orange-50/30")}>
            <TableCell className="pl-4 py-2 w-[40px]">
              <Checkbox
                checked={selectedIndices.includes(originalIndex)}
                onCheckedChange={() => toggleSelect(originalIndex)}
              />
            </TableCell>

            {/* Primary Attribute Column - With row-level + button */}
            <TableCell className="py-3 px-4 border-r border-orange-100/30">
              <div className="flex items-center justify-between group/row-picker">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-60" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{groupValue}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AddVariantPopover
                          groupValue={groupValue}
                          attributes={attributes}
                          baseCombination={variation.combination}
                          onAdd={(combos) => addVariantToGroup(groupValue, combos)}
                          triggerIcon={<Plus className="h-3 w-3" />}
                          triggerClassName="h-5 w-5 rounded-full p-0 opacity-100 transition-opacity bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new variant in this group</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>

            {/* Dynamic columns for each child attribute - With recursive + button */}
            {attributes.slice(1).map((attr) => {
              const value = variation.combination[attr.name] || '';
              return (
                <TableCell key={attr.name} className="py-3 px-4 border-r border-orange-100/30">
                  <div className="flex items-center justify-between group/cell-picker">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {value || <span className="text-xs text-gray-400 italic">-</span>}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <AddVariantPopover
                              groupValue={groupValue}
                              attributes={attributes}
                              baseCombination={variation.combination}
                              onAdd={(combos) => addVariantToGroup(groupValue, combos)}
                              triggerIcon={<Plus className="h-3 w-3" />}
                              triggerClassName="h-5 w-5 rounded-full p-0 opacity-100 transition-opacity bg-white text-orange-600 border-orange-100 hover:bg-orange-50 shadow-sm"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add a variant based on this attribute</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              );
            })}

            {/* Image */}
            <TableCell className="py-2">
              <div className="relative group w-8 h-8 mx-auto">
                {variation.image ? (
                  <img src={variation.image} alt="Variant" className="w-full h-full object-cover rounded-md border border-gray-200" />
                ) : (
                  <div className="w-full h-full bg-gray-50 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                    <ImageIcon className="w-3 h-3 text-gray-300" />
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-md transition-opacity">
                  <Upload className="w-3 h-3 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateVariation(originalIndex, { ...variation, image: url });
                    }
                  }} />
                </label>
              </div>
            </TableCell>

            {/* Warranty */}
            <TableCell className="py-2">
              <Input
                className="w-20 h-8 text-xs bg-white dark:bg-black/10"
                value={variation.warranty || ''}
                onChange={(e) => updateVariation(originalIndex, { ...variation, warranty: e.target.value })}
                placeholder="1 Year"
              />
            </TableCell>

            {/* SKU */}
            <TableCell className="py-2">
              <Input
                className="w-24 h-8 text-xs bg-white dark:bg-black/10 uppercase"
                value={variation.sku}
                onChange={(e) => updateVariation(originalIndex, { ...variation, sku: e.target.value })}
                placeholder={generateSuggestedSku(variation.combination)}
                disabled={readOnlyPricing}
              />
            </TableCell>

            {/* Price */}
            <TableCell className="py-2">
              <Input
                type="number"
                className="w-20 h-8 text-xs bg-white dark:bg-black/10"
                value={variation.price}
                onChange={(e) => updateVariation(originalIndex, { ...variation, price: parseFloat(e.target.value) || 0 })}
                disabled={readOnlyPricing}
              />
            </TableCell>

            {/* Sale Price */}
            <TableCell className="py-2">
              <Input
                type="number"
                className="w-20 h-8 text-xs bg-white dark:bg-black/10 text-orange-600"
                value={variation.salePrice || 0}
                onChange={(e) => updateVariation(originalIndex, { ...variation, salePrice: parseFloat(e.target.value) || 0 })}
                disabled={readOnlyPricing}
              />
            </TableCell>

            {/* Quantity */}
            <TableCell className="py-2">
              <Input
                type="number"
                className="w-16 h-8 text-xs bg-white dark:bg-black/10"
                value={variation.stock}
                onChange={(e) => updateVariation(originalIndex, { ...variation, stock: parseInt(e.target.value) || 0 })}
                disabled={readOnlyPricing}
              />
            </TableCell>

            {/* Weight */}
            <TableCell className="py-2">
              <Input
                type="number"
                className="w-16 h-8 text-xs bg-white dark:bg-black/10"
                value={variation.weight || 0}
                onChange={(e) => updateVariation(originalIndex, { ...variation, weight: parseFloat(e.target.value) || 0 })}
                disabled={readOnlyPricing}
              />
            </TableCell>

            {/* Notes */}
            <TableCell className="py-2">
              <Input
                className="w-32 h-8 text-xs bg-white dark:bg-black/10"
                value={variation.notes || ''}
                onChange={(e) => updateVariation(originalIndex, { ...variation, notes: e.target.value })}
              />
            </TableCell>

            {/* Settings */}
            <TableCell className="py-2">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-400 hover:text-blue-600"
                  onClick={() => {
                    const dup = { ...variation };
                    addVariantToGroup(groupValue, variation.combination, { ...dup, sku: `${dup.sku}-COPY` });
                  }}
                  disabled={readOnlyPricing}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                  onClick={() => openDimensionEditor(variation, originalIndex)}
                  disabled={readOnlyPricing}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>

            {/* Delete */}
            <TableCell className="py-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50" onClick={() => removeVariation(originalIndex)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

// Popover component to select attributes before adding a variant
function AddVariantPopover({
  groupValue,
  attributes,
  onAdd,
  baseCombination,
  triggerIcon,
  triggerClassName
}: {
  groupValue: string,
  attributes: ProductAttribute[],
  onAdd: (combos: Record<string, string>[]) => void,
  baseCombination?: Record<string, string>,
  triggerIcon?: React.ReactNode,
  triggerClassName?: string
}) {
  const [isOpen, setIsOpen] = useState(false);

  // selections now tracks multiple values: { Size: ["Small", "Medium"], Material: ["Cotton"] }
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  // Track which attributes the user has decided to "add" to this specific variation
  const [activeAttributes, setActiveAttributes] = useState<string[]>([]);

  const firstAttrName = attributes[0]?.name;

  // Get ALL predefined attributes as available options
  // Filter out the primary grouping attribute AND any attributes already in the baseCombination
  const allPredefinedAttributes = Object.entries(predefinedVariantOptions)
    .filter(([name]) => {
      const isFirst = name === firstAttrName;
      const isAlreadyInBase = baseCombination && baseCombination[name] && baseCombination[name] !== '';
      return !isFirst && !isAlreadyInBase;
    })
    .map(([name, options]) => ({
      name,
      options: options.map(opt => ({ name: opt, priceModifier: 0 }))
    }));

  const handleConfirm = () => {
    // Generate all combinations from the selections
    const attributeNames = Object.keys(selections);
    const attributeValues = attributeNames.map(name => selections[name]);

    const cartesianProduct = (arr: string[][]): string[][] => {
      return arr.reduce<string[][]>((a, b) => {
        return a.flatMap(d => b.map(e => [...d, e]));
      }, [[]]);
    };

    const combinations = cartesianProduct(attributeValues);
    const combos = combinations.map(comboValues => {
      const combo: Record<string, string> = baseCombination ? { ...baseCombination } : {};
      attributeNames.forEach((name, index) => {
        combo[name] = comboValues[index];
      });
      return combo;
    });

    onAdd(combos);

    setSelections({});
    setActiveAttributes([]);
    setIsOpen(false);
  };

  const toggleSelection = (attrName: string, value: string) => {
    setSelections(prev => {
      const current = prev[attrName] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      if (updated.length === 0) {
        const newSelections = { ...prev };
        delete newSelections[attrName];
        return newSelections;
      }

      return { ...prev, [attrName]: updated };
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 bg-white dark:bg-black text-orange-700 border-orange-200 hover:bg-orange-100",
            triggerClassName
          )}
          onClick={(e) => { e.stopPropagation(); }}
        >
          {triggerIcon || <Plus className="h-3.5 w-3.5 mr-1.5" />}
          {!triggerIcon && `Add Variant to ${groupValue}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl border-orange-100" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-sm text-gray-900 leading-none">Build Variation</h4>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Adding under {groupValue}</p>
            </div>
            {(activeAttributes.length > 0 || Object.keys(selections).length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-gray-400 hover:text-red-500"
                onClick={() => {
                  setActiveAttributes([]);
                  setSelections({});
                }}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Primary Attribute Selector - Shows all available attributes as dropdown */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-gray-500">Select Attributes for this Variant:</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-between text-sm border-orange-200 bg-orange-50/30 hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-700 font-medium">
                      {activeAttributes.length > 0 ? 'Add More Attributes' : 'Select Attribute...'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-orange-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full min-w-[280px] max-h-[300px] overflow-y-auto">
                {allPredefinedAttributes.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-500">
                    No attributes available.
                  </div>
                ) : (
                  allPredefinedAttributes.map(attr => {
                    const isSelected = activeAttributes.includes(attr.name);
                    return (
                      <DropdownMenuItem
                        key={attr.name}
                        onClick={() => {
                          if (!isSelected) {
                            setActiveAttributes(prev => [...prev, attr.name]);
                          }
                        }}
                        className={cn(
                          "cursor-pointer py-2.5",
                          isSelected && "bg-orange-50 text-orange-700"
                        )}
                        disabled={isSelected}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {isSelected && <CheckSquare className="h-3.5 w-3.5 text-orange-500" />}
                            <span className="font-medium">{attr.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] h-5 px-2 bg-orange-50 text-orange-600 border border-orange-100">
                            {attr.options.length} options
                          </Badge>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Selected Attributes with Multi-Value Selection */}
          {activeAttributes.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <Label className="text-[10px] uppercase font-bold text-gray-400">Configure Selected Attributes:</Label>
              {activeAttributes.map(attrName => {
                const attr = allPredefinedAttributes.find(a => a.name === attrName);
                if (!attr) return null;

                const selectedValues = selections[attrName] || [];

                return (
                  <div key={attrName} className="space-y-1.5 p-2 bg-orange-50/30 rounded-lg border border-orange-100/50 relative group/attr">
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-[10px] uppercase font-bold text-orange-600">{attrName}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-orange-300 hover:text-orange-500"
                        onClick={() => {
                          setActiveAttributes(prev => prev.filter(a => a !== attrName));
                          const newSels = { ...selections };
                          delete newSels[attrName];
                          setSelections(newSels);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Multi-Select Dropdown using Popover/Combobox style */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between h-8 text-xs bg-white border-orange-200/50">
                          {selectedValues.length > 0
                            ? `${selectedValues.length} selected`
                            : `Select ${attrName}...`}
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[200px]" align="start">
                        <Command>
                          <CommandInput placeholder={`Search ${attrName}...`} className="h-8 text-xs" />
                          <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {attr.options.map((option) => (
                                <CommandItem
                                  key={option.name}
                                  value={option.name}
                                  onSelect={() => toggleSelection(attrName, option.name)}
                                  className="text-xs"
                                >
                                  <div className={cn(
                                    "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                    selectedValues.includes(option.name)
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible"
                                  )}>
                                    <CheckSquare className={cn("h-3 w-3")} />
                                  </div>
                                  {option.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Selected tags display */}
                    {selectedValues.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedValues.map(val => (
                          <Badge key={val} variant="secondary" className="text-[9px] px-1 h-4 bg-white border border-gray-200">
                            {val}
                            <button
                              type="button"
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(attrName, val);
                              }}
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-9 shadow-sm"
            onClick={handleConfirm}
            disabled={activeAttributes.length === 0 || activeAttributes.some(a => !selections[a] || selections[a].length === 0)}
          >
            {activeAttributes.length > 0
              ? `Add Variants`
              : `Add Base ${groupValue}`
            }
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function VariantAttributeSelect({ attribute, value, onChange }: { attribute: ProductAttribute, value: string, onChange: (val: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className={cn("h-7 px-2 text-xs font-normal justify-start w-full", !value && "text-gray-400 italic")}>
          {value || `Select ${attribute.name}...`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-48" align="start">
        <Command>
          <CommandInput placeholder={`Search ${attribute.name}...`} />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-2">"{attribute.name}" not found.</p>
                <Button type="button" variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => onChange("New Option")}>
                  <Plus className="w-3 h-3 mr-1" /> Add Custom
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {attribute.options.map(opt => (
                <CommandItem key={opt.name} onSelect={() => onChange(opt.name)} className="text-xs">
                  {opt.name}
                  {value === opt.name && <CheckSquare className="w-3 h-3 ml-auto text-orange-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


function QuickAttributePicker({
  attributeName,
  onAdd
}: {
  attributeName: string,
  onAdd: (values: string[]) => void
}) {
  const options = predefinedVariantOptions[attributeName] || [];
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  if (options.length === 0) return null;

  const handleApply = () => {
    onAdd(selected);
    setSelected([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-5 w-5 rounded-full bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 shadow-sm transition-all"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-gray-500 px-2 pt-1">Quick Select {attributeName}</p>
          <div className="max-h-[250px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {options.map(opt => (
              <div
                key={opt}
                className="flex items-center space-x-2 p-1.5 hover:bg-orange-50 rounded-md cursor-pointer transition-colors"
                onClick={() => {
                  setSelected(prev =>
                    prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                  );
                }}
              >
                <Checkbox checked={selected.includes(opt)} className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                <span className="text-xs font-medium text-gray-700">{opt}</span>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-white text-xs"
            onClick={handleApply}
            disabled={selected.length === 0}
          >
            Add {selected.length} Variations
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


export default function VariantManager({
  attributesName = 'attributes',
  variationsName = 'variations',
  attributes: propAttributes,
  variations: propVariations,
  onAttributesChange,
  onVariationsChange,
  readOnlyPricing = false
}: VariantManagerProps) {

  const context = useFormContext();
  const isControlled = !!(propAttributes && onAttributesChange);

  // Watch product base SKU for auto-generation
  const productBaseSku = context?.watch('sku') || '';

  const rhfAttributes = useFieldArray({ control: context?.control, name: attributesName });
  const rhfVariations = useFieldArray({ control: context?.control, name: variationsName });

  const attributes = (isControlled ? propAttributes : (rhfAttributes.fields as unknown as ProductAttribute[])) || [];
  const variations = (isControlled ? propVariations : (rhfVariations.fields as unknown as ProductVariation[])) || [];

  // Centralized SKU generation logic
  const generateSuggestedSku = (combination: Record<string, string>) => {
    const suffix = attributes
      .map(attr => combination[attr.name])
      .filter(val => val && val.trim() !== '')
      .join('-')
      .toUpperCase();

    if (!suffix) return '';
    return productBaseSku ? `${productBaseSku}-${suffix}` : suffix;
  };


  // Update methods
  const updateAttribute = (index: number, data: ProductAttribute) => {
    if (isControlled) {
      const newAttrs = [...(propAttributes || [])];
      newAttrs[index] = data;
      onAttributesChange?.(newAttrs);
    } else rhfAttributes.update(index, data);
  };

  const appendAttribute = (data: ProductAttribute) => {
    if (isControlled) onAttributesChange?.([...(propAttributes || []), data]);
    else rhfAttributes.append(data);
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
    // Enforce sales price is not bigger than price
    if (data.salePrice && data.price && data.salePrice > data.price) {
      toast.error("Sale price cannot be higher than regular price");
      data.salePrice = data.price;
    }

    if (isControlled) {
      const newVars = [...(propVariations || [])];
      newVars[index] = data;
      onVariationsChange?.(newVars);
    } else rhfVariations.update(index, data);
  };

  const removeVariation = (index: number) => {
    if (isControlled) {
      const newVars = (propVariations || []).filter((_, i) => i !== index);
      onVariationsChange?.(newVars);
    } else rhfVariations.remove(index);
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
  const [sizeSystem, setSizeSystem] = useState<'Standard' | 'UK'>('Standard');


  // Initial generation logic (preserved but less aggressive)
  React.useEffect(() => {
    // We only auto-generate if we have attributes but NO variations yet.
    // This allows the "manual add" flow to persist without being overwritten.
    if (attributes.length > 0 && variations.length === 0) {
      // Only generate if we have at least one option in the first attribute
      if (attributes[0].options.length > 0) {
        // Generate initial groups based on first attribute options
        const firstAttr = attributes[0];
        const newVariations: ProductVariation[] = [];

        firstAttr.options.forEach(opt => {
          // Create a base variant for each option of the first attribute
          // Other attributes are left empty for the user to fill (as per new requirements)
          // OR we can do a partial cross-product if convenient. 
          // Let's stick to: "Generate full Cartesian product initially" to save time,
          // but allow adding manual ones later.
          const combo: Record<string, string> = { [firstAttr.name]: opt.name };
          // Initialize other attributes as empty strings
          attributes.slice(1).forEach(a => combo[a.name] = '');

          newVariations.push({
            combination: combo,
            sku: generateSuggestedSku(combo),
            price: opt.price || 0,
            stock: 0,
            available: true
          });
        });

        // If there are other attributes, we might want to do a full cartesian product?
        // The user said "under Red they can add what ever attribute they want".
        // If we pre-generate everything, it might be overwhelming.
        // BUT, if we don't generate, the table is empty.
        // Strategy: If multiple attributes exist, do full Cartesian.
        if (attributes.length > 1 && attributes.every(a => a.options.length > 0)) {
          const combos = cartesian(attributes.map(a => a.options));
          const fullVars = combos.map(opts => {
            const combo: Record<string, string> = {};
            opts.forEach((o: any, i: number) => combo[attributes[i].name] = o.name);
            return {
              combination: combo,
              sku: generateSuggestedSku(combo),
              price: 0,
              stock: 0,
              available: true
            };
          });
          replaceVariations(fullVars);
          return;
        }

        // If we just added the first attribute (e.g. Color), generate rows for it.
        if (variations.length === 0) {
          replaceVariations(newVariations);
        }
      }
    }
  }, [attributes.length]); // Dependency reduced to avoid loops. Careful here.

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

  // --- Attribute Form Handlers ---
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
    const attributeData: ProductAttribute = { name: attributeName, options: attributeOptions };
    if (editingAttributeIndex !== null) updateAttribute(editingAttributeIndex, attributeData);
    else appendAttribute(attributeData);
    hideAttributeForm();
  };

  const handleAddOptionToAttribute = (optionName: string, modifier: number, price?: number) => {
    if (optionName && !attributeOptions.some(o => o.name === optionName)) {
      const newOptions = [...attributeOptions, { name: optionName, priceModifier: modifier, price }];
      // Auto-mapping for Size
      if (attributeName === 'Size') {
        const mapped = sizeMapping[optionName];
        if (mapped && !newOptions.some(o => o.name === mapped)) {
          newOptions.push({ name: mapped, priceModifier: modifier });
          toast.info(`Auto-mapped ${optionName} to UK ${mapped}`);
        }
      }
      setAttributeOptions(newOptions);
    }
  };

  const handleRemoveOptionFromAttribute = (optionName: string) => {
    setAttributeOptions(attributeOptions.filter((o) => o.name !== optionName));
  };


  // --- Variation Handlers ---

  const addVariantToGroup = (groupValue: string, combos: Record<string, string> | Record<string, string>[], extras?: Partial<ProductVariation>) => {
    const comboArray = Array.isArray(combos) ? combos : [combos];
    const firstAttr = attributes[0];

    // 1. Sync attributes - ensure all selected attributes exist in the global list
    const newAttributesAdded: string[] = [];
    comboArray.forEach(combo => {
      Object.keys(combo).forEach(attrName => {
        const exists = attributes.some(a => a.name === attrName) || newAttributesAdded.includes(attrName);
        if (!exists) {
          appendAttribute({ name: attrName, options: [] });
          newAttributesAdded.push(attrName);
        }
      });
    });

    // 2. Prepare new variations
    const newVars: ProductVariation[] = comboArray.map(childCombo => {
      const newCombo: Record<string, string> = {
        [firstAttr.name]: groupValue,
        ...childCombo
      };

      // Ensure all attributes have a value
      attributes.forEach(a => {
        if (newCombo[a.name] === undefined) newCombo[a.name] = '';
      });

      return {
        combination: newCombo,
        sku: extras?.sku || generateSuggestedSku(newCombo),
        price: extras?.price || 0,
        stock: extras?.stock || 0,
        available: extras?.available !== undefined ? extras.available : true,
        image: extras?.image || '',
        weight: extras?.weight || 0,
        notes: extras?.notes || '',
        warranty: extras?.warranty || '1 Year',
        ...extras
      };
    });

    // 3. Update state once
    let updatedVariations = [...variations];

    // SMART DEDUPLICATION & PLACEHOLDER REMOVAL
    if (comboArray.length > 0) {
      // 1. Identify which existing variations should be "replaced" or "cleaned up"
      updatedVariations = updatedVariations.filter(v => {
        const isThisGroup = v.combination[firstAttr.name] === groupValue;
        if (!isThisGroup) return true;

        const otherAttrs = Object.keys(v.combination).filter(k => k !== firstAttr.name);

        // A placeholder (no specific attributes filled) should always be removed if we add specific ones
        const isEmptyPlaceholder = otherAttrs.length > 0 && otherAttrs.every(k => v.combination[k] === '');
        if (isEmptyPlaceholder) return false;

        // If we are adding common-base refinements, we might want to replace the base
        // e.g. if we have "Red" (with empty Storage) and we add "Red + 64GB", remove the "Red" one.
        const isSubsetOfAnyNewVar = newVars.some(nv => {
          // Check if nv is a refinement of v
          // nv must have ALL non-empty values that v has
          return Object.keys(v.combination).every(key => {
            const vVal = v.combination[key];
            const nvVal = nv.combination[key];
            if (!vVal || vVal === '') return true; // v didn't have this, so nv can have anything
            return vVal === nvVal; // v had it, nv must match it
          });
        });

        return !isSubsetOfAnyNewVar;
      });
    }

    if (isControlled) {
      onVariationsChange?.([...newVars, ...updatedVariations]);
    } else {
      rhfVariations.replace([...newVars, ...updatedVariations]);
    }
    toast.success(`Added ${newVars.length} variants to ${groupValue}`);
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

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  // Bulk actions
  const applyBulkPrice = () => {
    let val = parseFloat(bulkPriceValue);
    if (isNaN(val)) return;
    const targets = selectedIndices.length > 0 ? selectedIndices : variations.map((_, i) => i);
    targets.forEach(idx => updateVariation(idx, { ...variations[idx], price: val }));
    setBulkPriceValue('');
    toast.success(`Applied to ${targets.length} items`);
  };

  const applyBulkStock = () => {
    let val = parseInt(bulkStockValue);
    if (isNaN(val)) return;
    const targets = selectedIndices.length > 0 ? selectedIndices : variations.map((_, i) => i);
    targets.forEach(idx => updateVariation(idx, { ...variations[idx], stock: val }));
    setBulkStockValue('');
    toast.success(`Applied to ${targets.length} items`);
  };


  const handleAddGroup = (groupValue: string) => {
    if (!attributes.length) return;
    const firstAttr = attributes[0];

    // Create a base variant for this new group
    const newCombo: Record<string, string> = { [firstAttr.name]: groupValue };
    // Init other attributes as empty
    attributes.slice(1).forEach(a => newCombo[a.name] = '');

    const newVar: ProductVariation = {
      combination: newCombo,
      sku: generateSuggestedSku(newCombo),
      price: 0,
      stock: 0,
      available: true
    };

    if (isControlled) {
      onVariationsChange?.([newVar, ...variations]);
    } else {
      rhfVariations.update(0, newVar); // Prepend in RHF is usually via insert or update at 0? 
      // Actually append puts it at end. To put at top in RHF without replace, we use insert(0, data)
      // Since replace is cleaner for our logic:
      rhfVariations.replace([newVar, ...variations]);
    }
    toast.success(`Added new group: ${groupValue}`);
  };

  // --- Render ---

  // 1. Group the variations
  const groups = useMemo(() => {
    if (attributes.length === 0) return {};
    return groupVariations(variations, attributes[0].name);
  }, [variations, attributes]);

  return (
    <div className="space-y-8">

      {/* 1. Define Attributes Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{attributes.length === 0 ? "1. Select Primary Attribute" : "1. Define Attributes"}</h3>
            <p className="text-sm text-gray-500">
              {attributes.length === 0
                ? "Choose the main attribute to group by (e.g. Color)."
                : `Grouping by ${attributes[0].name}. Add more attributes (like Size, Material) to create columns.`}
            </p>
          </div>
          {!isAttributeFormVisible && (
            <Button type="button" variant="outline" size="sm" onClick={() => showAttributeForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {attributes.length === 0 ? "Start with an Attribute" : "Add Another Attribute"}
            </Button>
          )}
        </div>

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {attributes.map((attr, idx) => (
              <div key={idx} className={cn("flex items-center gap-2 p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm", idx === 0 && "border-orange-200 ring-1 ring-orange-100")}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{idx === 0 ? "Primary Group" : "Column"}</span>
                  <span className="font-semibold">{attr.name}</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                  {attr.options.slice(0, 3).map(o => <Badge key={o.name} variant="secondary" className="text-[10px] px-1 h-5">{o.name}</Badge>)}
                  {attr.options.length > 3 && <span className="text-[10px] text-gray-400">+{attr.options.length - 3}</span>}
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => showAttributeForm(attr, idx)}><Edit2 className="h-3 w-3" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => removeAttribute(idx)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        )}

        {isAttributeFormVisible && (
          // Reusing the attribute form UI from before (simplified for brevity in this rewrite, but full implementation below)
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
                <Label>Options</Label>
                <VariantOptionInput variantName={attributeName} onAddOption={handleAddOptionToAttribute} existingOptions={attributeOptions.map(o => o.name)} />
                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {attributeOptions.map(opt => (
                    <Badge key={opt.name} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 text-[10px]">
                      {opt.name}
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOptionFromAttribute(opt.name);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
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

      {/* 2. Configure Variations Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">2. Manage Variations</h3>
            <p className="text-sm text-gray-500">Grouped by {attributes[0]?.name || 'Primary Attribute'}</p>
          </div>
          {/* Bulk Tools */}
          {variations.length > 0 && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8">
                    <Zap className="w-3 h-3 mr-2" /> Bulk Actions
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-xs uppercase text-gray-500">Bulk Edit ({selectedIndices.length || 'All'} Items)</h4>
                    <div className="flex gap-2">
                      <Input placeholder="Price" className="h-8" value={bulkPriceValue} onChange={e => setBulkPriceValue(e.target.value)} />
                      <Button type="button" size="sm" className="h-8" onClick={applyBulkPrice}>Set</Button>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Stock" className="h-8" value={bulkStockValue} onChange={e => setBulkStockValue(e.target.value)} />
                      <Button type="button" size="sm" className="h-8" onClick={applyBulkStock}>Set</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Add Group Button (Only if variants exist or at least attributes defined) */}
          {attributes.length > 0 && (
            <AddGroupPopover
              attributes={attributes}
              existingGroups={Object.keys(groups)}
              onAdd={handleAddGroup}
            />
          )}

        </div>

        {variations.length === 0 && attributes.length > 0 && (
          <Alert className="bg-orange-50 border-orange-200 text-orange-800">
            <Zap className="h-4 w-4" />
            <AlertTitle>Start Building</AlertTitle>
            <AlertDescription>
              We've initialized groups for {attributes[0].name}. Click "Add Variant" inside a group to define specific combinations (like Size, Material).
            </AlertDescription>
          </Alert>
        )}

        {variations.length > 0 && attributes.length > 0 && (
          <div className="border border-orange-100 dark:border-orange-900/30 rounded-xl overflow-hidden bg-white dark:bg-[#2d241b] shadow-sm">
            <TableRoot>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-orange-100">
                  <TableHead className="w-[40px] pl-4"><span className="sr-only">Select</span></TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 px-4">{attributes[0]?.name || 'Primary'}</TableHead>
                  {attributes.slice(1).map((attr) => (
                    <TableHead key={attr.name} className="text-xs font-bold text-gray-500 px-4">{attr.name}</TableHead>
                  ))}
                  <TableHead className="w-[50px] text-center">Img</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500">Warranty</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500">SKU</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    Price (£)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The standard selling price.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    Sale (£)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The discounted price. Must be lower than regular price.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-xs font-bold text-gray-500">Qty</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500">Weight</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500">Notes</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groups).map(([groupKey, items]) => (
                  <VariantGroupRows
                    key={groupKey}
                    groupValue={groupKey}
                    groupItems={items}
                    attributes={attributes}
                    updateVariation={updateVariation}
                    removeVariation={removeVariation}
                    addVariantToGroup={addVariantToGroup}
                    selectedIndices={selectedIndices}
                    toggleSelect={toggleSelect}
                    openDimensionEditor={openDimensionEditor}
                    generateSuggestedSku={generateSuggestedSku}
                    readOnlyPricing={readOnlyPricing}
                  />
                ))}
              </TableBody>
            </TableRoot>
          </div>
        )}

        {attributes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/20 text-gray-500">
            <Package className="h-12 w-12 mb-2 opacity-50" />
            <p>Define attributes above to start managing variations.</p>
          </div>
        )}
      </div>

      {/* Dimension Editor Dialog */}
      <Dialog open={editingVariationIndex !== null} onOpenChange={(open) => { if (!open) setEditingVariationIndex(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dimensions for Variation</DialogTitle>
            <DialogDescription>Override the base product dimensions.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={tempDimensions.weight} onChange={(e) => setTempDimensions({ ...tempDimensions, weight: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Length (cm)</Label><Input type="number" value={tempDimensions.length} onChange={(e) => setTempDimensions({ ...tempDimensions, length: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Width (cm)</Label><Input type="number" value={tempDimensions.width} onChange={(e) => setTempDimensions({ ...tempDimensions, width: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={tempDimensions.height} onChange={(e) => setTempDimensions({ ...tempDimensions, height: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter><Button type="button" onClick={saveDimensions}>Save Dimensions</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Re-implementing the helper component inline to include it in the file
function VariantOptionInput({
  variantName,
  onAddOption,
  existingOptions,
}: {
  variantName: string;
  onAddOption: (optionName: string, modifier: number, price?: number) => void;
  existingOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const options = predefinedVariantOptions[variantName as keyof typeof predefinedVariantOptions] || [];

  const handleAdd = () => {
    if (inputValue) {
      onAddOption(inputValue, 0);
      setInputValue('');
      setOpen(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between"><span className="truncate">{inputValue || `Type custom ${variantName || 'attribute'}...`}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder={`Type custom ${variantName || 'attribute'}...`} value={inputValue} onValueChange={setInputValue} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }} />
              <CommandList>
                <CommandEmpty className="py-2 px-2 text-xs">Press Enter to add "{inputValue}"</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {options.filter(opt => !existingOptions.includes(opt)).map((option) => (
                    <CommandItem key={option} value={option} onSelect={() => { onAddOption(option, 0); }}>{option}</CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button size="icon" variant="ghost" onClick={handleAdd} disabled={!inputValue} type="button">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AddGroupPopover({
  attributes,
  existingGroups,
  onAdd
}: {
  attributes: ProductAttribute[],
  existingGroups: string[],
  onAdd: (val: string) => void
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (attributes.length === 0) return null;

  const primaryAttr = attributes[0];
  const allOptions = predefinedVariantOptions[primaryAttr.name as keyof typeof predefinedVariantOptions] || [];

  // Filter out existing groups to prevent duplicates (though technically possible, usually avoided for base groups)
  const availableOptions = allOptions.filter(opt => !existingGroups.includes(opt)); // Strict filtering

  const handleSelect = (val: string) => {
    onAdd(val);
    setOpen(false);
    setInputValue('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed text-orange-600 border-orange-200 bg-orange-50/50 hover:bg-orange-50 ml-2">
          <Plus className="mr-2 h-4 w-4" />
          Add {primaryAttr.name} Group
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${primaryAttr.name}...`} value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-2">No option found.</p>
              </div>
            </CommandEmpty>
            <CommandGroup heading={`Available ${primaryAttr.name}s`}>
              {availableOptions.map(opt => (
                <CommandItem key={opt} value={opt} onSelect={() => handleSelect(opt)}>
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
