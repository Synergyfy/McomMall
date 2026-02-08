'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProductAttribute, ProductVariation } from '@/app/admin/types/product-variant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Trash2, Wand2, Copy, MoreHorizontal, Settings2, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface VariantManagerProps {
    attributesName?: string;
    variationsName?: string;
}

export function VariantManager({ attributesName = 'attributes', variationsName = 'variations' }: VariantManagerProps) {
    const { control, register, watch, setValue, getValues } = useFormContext();

    // Field Arrays
    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: attributesName,
    });

    const { fields: variationFields, append: appendVariation, remove: removeVariation, replace: replaceVariations } = useFieldArray({
        control,
        name: variationsName,
    });

    // Watch values for reactivity
    const watchedAttributes = watch(attributesName) as ProductAttribute[];
    const watchedVariations = watch(variationsName) as ProductVariation[];

    // --- Logic: Generate Variations ---
    const generateVariations = () => {
        if (!watchedAttributes || watchedAttributes.length === 0) return;

        // 1. Prepare options arrays
        // e.g. [['Red', 'Blue'], ['S', 'M']]
        const optionsArrays = watchedAttributes.map(attr =>
            attr.options.map(opt => opt.name).filter(Boolean)
        );

        if (optionsArrays.some(arr => arr.length === 0)) {
            // Alert or toast: "Add options to all attributes first"
            return;
        }

        // 2. Cartesian Product Helper
        const cartesian = (arrays: string[][]): string[][] => {
            return arrays.reduce<string[][]>((acc, curr) => {
                return acc.flatMap(x => curr.map(y => [...x, y]));
            }, [[]]);
        };

        const combinations = cartesian(optionsArrays);

        // 3. Create Variation Objects
        const newVariations: ProductVariation[] = combinations.map(combo => {
            const combinationRecord: Record<string, string> = {};
            let skuParts: string[] = [];
            let priceMod = 0;

            combo.forEach((optName, index) => {
                const attrName = watchedAttributes[index].name;
                combinationRecord[attrName] = optName;

                // SKU Logic: Take first 3 chars of option, uppercase
                skuParts.push(optName.substring(0, 3).toUpperCase());

                // Price Logic
                const optDef = watchedAttributes[index].options.find(o => o.name === optName);
                if (optDef?.priceModifier) priceMod += Number(optDef.priceModifier);
            });

            // Base price from product form? Or just default 0.
            // The prompt says "priceModifier: number // Optional +/- to base price".
            // Let's assume base price is accessible or we just store the modifier?
            // The ProductVariation interface has `price`. Let's assume we sum basePrice (if avail) + modifiers.
            // For now, defaulting to 0 + modifiers.

            const basePrice = getValues('basePrice') || 0;

            return {
                combination: combinationRecord,
                sku: `PROD-${skuParts.join('-')}`,
                price: Number(basePrice) + priceMod,
                stock: 0,
                available: true,
            };
        });

        replaceVariations(newVariations);
    };

    // --- Grouping Logic ---
    // We group by the first attribute's value
    const firstAttributeName = watchedAttributes?.[0]?.name;

    const groupedVariations = useMemo(() => {
        if (!firstAttributeName || !watchedVariations) return null;

        const groups: Record<string, { index: number; variation: ProductVariation }[]> = {};

        watchedVariations.forEach((variation, index) => {
            const groupKey = variation.combination[firstAttributeName] || 'Other';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push({ index, variation });
        });

        return groups;
    }, [watchedVariations, firstAttributeName]);


    return (
        <div className="space-y-8">
            {/* 1. Attribute Definition */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Product Attributes</CardTitle>
                            <CardDescription>Define the options for this product (e.g. Color, Size).</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => appendAttribute({ name: '', options: [{ name: '', priceModifier: 0 }] })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Attribute
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {attributeFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg bg-slate-50/50 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label>Attribute Name</Label>
                                    <Input
                                        {...register(`${attributesName}.${index}.name`)}
                                        placeholder="e.g. Color"
                                        className="bg-white"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-6 text-slate-400 hover:text-red-500"
                                    onClick={() => removeAttribute(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Options for this attribute */}
                            <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Options</Label>
                                <AttributeOptionsNest
                                    nestIndex={index}
                                    control={control}
                                    register={register}
                                    parentName={attributesName}
                                />
                            </div>
                        </div>
                    ))}

                    {attributeFields.length === 0 && (
                        <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                            No attributes defined. Click "Add Attribute" to start.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 2. Variations Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Variations</CardTitle>
                            <CardDescription>Manage stock and pricing for each combination.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateVariations}
                                disabled={attributeFields.length === 0}
                            >
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Variations
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => appendVariation({
                                    combination: {},
                                    sku: '',
                                    price: 0,
                                    stock: 0,
                                    available: true
                                })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Single
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {variationFields.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No variations generated yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedVariations ? (
                                    Object.entries(groupedVariations).map(([groupKey, items]) => (
                                        <>
                                            {/* Group Header */}
                                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                <TableCell colSpan={6} className="font-semibold text-slate-700 py-2">
                                                    {firstAttributeName}: <span className="text-slate-900">{groupKey}</span>
                                                </TableCell>
                                            </TableRow>
                                            {/* Items */}
                                            {items.map(({ index }) => (
                                                <VariationRow
                                                    key={variationFields[index].id}
                                                    index={index}
                                                    register={register}
                                                    remove={removeVariation}
                                                    variationsName={variationsName}
                                                    attributes={watchedAttributes}
                                                />
                                            ))}
                                        </>
                                    ))
                                ) : (
                                    variationFields.map((field, index) => (
                                        <VariationRow
                                            key={field.id}
                                            index={index}
                                            register={register}
                                            remove={removeVariation}
                                            variationsName={variationsName}
                                            attributes={watchedAttributes}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Sub-component for Options (needed for nesting in useFieldArray)
function AttributeOptionsNest({ nestIndex, control, register, parentName }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${parentName}.${nestIndex}.options`
    });

    return (
        <div className="space-y-2">
            {fields.map((item, k) => (
                <div key={item.id} className="flex items-center gap-2">
                    <Input
                        {...register(`${parentName}.${nestIndex}.options.${k}.name`)}
                        placeholder="Option Name (e.g. Red)"
                        className="bg-white flex-1 h-9"
                    />
                    <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">+/-</span>
                        <Input
                            type="number"
                            step="0.01"
                            {...register(`${parentName}.${nestIndex}.options.${k}.priceModifier`)}
                            placeholder="0.00"
                            className="bg-white h-9 pl-8"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-red-500"
                        onClick={() => remove(k)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto font-normal"
                onClick={() => append({ name: '', priceModifier: 0 })}
            >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
            </Button>
        </div>
    );
}

// Row Component
function VariationRow({ index, register, remove, variationsName, attributes }: any) {
    // We can't easily access the combination string here without watching,
    // but the parent passes it via grouping or we can use `getValues` if needed.
    // Actually, we can use `useFormContext` inside here too if we want to watch specific fields,
    // but better to rely on what's passed or just register inputs.

    // To display the "Combination" label (e.g. "Red / Small"), we need to know the values.
    // Since we are iterating `variationFields` in the parent, we might not have the *values*
    // if `variationFields` only has default values.
    // However, `useFieldArray` fields usually merge default + current.
    // Let's rely on `register` which binds to the form state.

    // For display purposes, we might need to `watch` this specific row to show the label dynamically if it changes?
    // But usually combinations are static once generated.

    // Let's use `useFormContext` to get the specific combination value for display.
    const { getValues } = useFormContext();
    const combination = getValues(`${variationsName}.${index}.combination`);
    const label = combination ? Object.values(combination).join(' / ') : 'New Variant';

    return (
        <TableRow>
            <TableCell>
                <GripVertical className="h-4 w-4 text-slate-300" />
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{label}</span>
                    <div className="flex gap-1 mt-1">
                        {combination && Object.entries(combination).map(([key, val]: any) => (
                            <Badge key={key} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal text-slate-500">
                                {key}: {val}
                            </Badge>
                        ))}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Input
                    {...register(`${variationsName}.${index}.sku`)}
                    className="h-8 w-32 font-mono text-xs"
                />
            </TableCell>
            <TableCell>
                <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">£</span>
                    <Input
                        type="number"
                        step="0.01"
                        {...register(`${variationsName}.${index}.price`)}
                        className="h-8 pl-5 text-right"
                    />
                </div>
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    {...register(`${variationsName}.${index}.stock`)}
                    className="h-8 w-20 text-right"
                />
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Settings2 className="h-4 w-4 mr-2" />
                            Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
