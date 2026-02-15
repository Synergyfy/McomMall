'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Wand2, Copy, Settings2, ChevronDown, ChevronRight, Package, Image as ImageIcon, ExternalLink, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { VariantBuilder } from './VariantBuilder';
import { AttributeSelector } from './AttributeSelector';
import { AttributeValueSelector } from './AttributeValueSelector';

interface VariantManagerProps {
    attributesName?: string;
    variationsName?: string;
    showAttributes?: boolean;
    showVariations?: boolean;
}

export function VariantManager({
    attributesName = 'attributes',
    variationsName = 'variations',
    showAttributes = true,
    showVariations = true
}: VariantManagerProps) {
    const { control, register, watch, setValue, getValues } = useFormContext();

    // Field Arrays
    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: attributesName,
    });

    const { fields: variationFields, append: appendVariation, prepend: prependVariation, remove: removeVariation, replace: replaceVariations } = useFieldArray({
        control,
        name: variationsName,
    });

    // Watch values for reactivity
    const watchedAttributes = watch(attributesName) as ProductAttribute[] || [];
    const watchedVariations = watch(variationsName) as ProductVariation[] || [];

    // --- Refactored State ---
    const [primaryAttribute, setPrimaryAttribute] = useState<string>('');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    // Initialize primary attribute if not set
    useEffect(() => {
        if (!primaryAttribute && watchedAttributes.length > 0) {
            setPrimaryAttribute(watchedAttributes[0].name);
        }
    }, [watchedAttributes, primaryAttribute]);

    // --- Helper: Add Attribute ---
    const handleAddAttribute = (name: string) => {
        if (watchedAttributes.find(a => a.name === name)) return;
        appendAttribute({ name, options: [] });
        if (watchedAttributes.length === 0) setPrimaryAttribute(name);
    };

    // --- Helper: Remove Attribute ---
    const handleRemoveAttribute = (index: number) => {
        const attrToRemove = watchedAttributes[index];
        removeAttribute(index);
        if (attrToRemove.name === primaryAttribute) {
            setPrimaryAttribute('');
            replaceVariations([]);
        }
    };

    const generateBaseVariations = (attrIndex: number) => {
        const attr = watchedAttributes[attrIndex];
        if (!attr || attr.options.length === 0) return;

        const newVariations: ProductVariation[] = attr.options.map(option => ({
            combination: { [attr.name]: option.name },
            sku: `${option.name.toUpperCase().substring(0, 3)}`,
            price: Number(getValues('basePrice') || 0),
            stock: 0,
            available: true,
            salePrice: 0,
            weight: 0,
            warranty: '1 Year',
            notes: '',
        }));

        replaceVariations(newVariations);
    };

    // --- Helper: Add Blank Variant to Group ---
    const handleAddVariantToGroup = (groupKey: string) => {
        const baseVariation: ProductVariation = {
            combination: { [primaryAttribute]: groupKey },
            sku: `${groupKey.toUpperCase()}`,
            price: Number(getValues('basePrice') || 0),
            stock: 0,
            available: true,
            // Add extended fields matching UI
            salePrice: 0,
            weight: 0,
            warranty: '1 Year',
            notes: '',
        };
        prependVariation(baseVariation); // Use prepend to add to top
    };

    // --- Helper: Add Sub-Variations via Builder ---
    const handleAddSubVariants = (
        groupKey: string,
        newAttributes: { name: string; values: string[] }[]
    ) => {
        const currentVariations = getValues(variationsName) as ProductVariation[];
        const groupIndices = currentVariations
            .map((v, i) => ({ v, i }))
            .filter(({ v }) => v.combination[primaryAttribute] === groupKey)
            .map(({ i }) => i);

        if (groupIndices.length === 0) {
            // If no rows in group, just create combinations for this group value
            const cartesian = (arrays: string[][]) => arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);
            const newAttrValues = newAttributes.map(a => a.values);
            const newCombinations = cartesian(newAttrValues);

            const newVars: ProductVariation[] = newCombinations.map(combo => {
                const combination: Record<string, string> = { [primaryAttribute]: groupKey };
                combo.forEach((val, idx) => {
                    combination[newAttributes[idx].name] = val;
                });
                return {
                    combination,
                    sku: `${groupKey.toUpperCase()}-${combo.map(c => c.substring(0, 2).toUpperCase()).join('-')}`,
                    price: Number(getValues('basePrice') || 0),
                    stock: 0,
                    available: true,
                    salePrice: 0,
                    weight: 0,
                    warranty: '1 Year',
                    notes: '',
                };
            });
            prependVariation(newVars); // Prepend new variations
        } else {
            // Expand existing rows in group (standard logic)
            const variationsToExpand = groupIndices.map(i => currentVariations[i]);
            const cartesian = (arrays: string[][]) => arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);
            const newAttrValues = newAttributes.map(a => a.values);
            const newCombinations = cartesian(newAttrValues);

            const expandedFromGroup: ProductVariation[] = [];

            // Determine if we are "Refining" (filling empty slots) or "Branching" (adding alternatives)
            // If we are branching, we must KEEP the original variations.
            // If we are refining, we must REPLACE the original variations.
            let shouldKeepOriginals = true;

            // We check the FIRST variation in the group to decide strategy (assuming all in group have same structure)
            if (variationsToExpand.length > 0) {
                const sampleVar = variationsToExpand[0];
                // If ANY new attribute maps to an existing value in the sample, we are branching.
                // If ALL new attributes map to undefined/empty in the sample, we are refining.
                const isOverwriting = newAttributes.some(attr =>
                    sampleVar.combination[attr.name] !== undefined &&
                    sampleVar.combination[attr.name] !== ''
                );

                shouldKeepOriginals = isOverwriting;
            }

            variationsToExpand.forEach(baseVar => {
                newCombinations.forEach(combo => {
                    const extraCombo: Record<string, string> = {};
                    combo.forEach((val, idx) => {
                        extraCombo[newAttributes[idx].name] = val;
                    });
                    const mergedCombo = { ...baseVar.combination, ...extraCombo };

                    // Check for duplicates
                    const isDuplicateInCurrent = currentVariations.some(existing => {
                        if (Object.keys(existing.combination).length !== Object.keys(mergedCombo).length) return false;
                        return Object.entries(existing.combination).every(([k, v]) => mergedCombo[k] === v);
                    });

                    const isDuplicateInBatch = expandedFromGroup.some(added => {
                        if (Object.keys(added.combination).length !== Object.keys(mergedCombo).length) return false;
                        return Object.entries(added.combination).every(([k, v]) => mergedCombo[k] === v);
                    });

                    if (!isDuplicateInCurrent && !isDuplicateInBatch) {
                        const suffix = combo.map(c => c.substring(0, 2).toUpperCase()).join('-');
                        expandedFromGroup.push({
                            ...baseVar,
                            combination: mergedCombo,
                            sku: `${baseVar.sku}-${suffix}`,
                        });
                    }
                });
            });

            // Filter out original items ONLY if we are NOT branching
            const keptVariations = currentVariations.filter((_, i) => {
                if (!groupIndices.includes(i)) return true; // Always keep rows from OTHER groups
                return shouldKeepOriginals; // If branching, keep originals. If refining, drop them.
            });

            // Apply updates
            replaceVariations([...expandedFromGroup, ...keptVariations]);
        }

        // Sync attributes to global list
        newAttributes.forEach(na => {
            if (!watchedAttributes.find(wa => wa.name === na.name)) {
                appendAttribute({ name: na.name, options: na.values.map(v => ({ name: v, priceModifier: 0 })) });
            }
        });
    };

    // --- Grouping Logic ---
    const groupedVariations = useMemo(() => {
        if (!primaryAttribute || !watchedVariations) return null;
        const groups: Record<string, { index: number; variation: ProductVariation }[]> = {};
        watchedVariations.forEach((variation, index) => {
            const groupKey = variation.combination[primaryAttribute];
            if (!groupKey) return;
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push({ index, variation });
        });
        return groups;
    }, [watchedVariations, primaryAttribute]);

    // Secondary attributes are those that are NOT the primary one
    const secondaryAttributeNames = useMemo(() => {
        return watchedAttributes
            .map(a => a.name)
            .filter(name => name !== primaryAttribute);
    }, [watchedAttributes, primaryAttribute]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* 1. Attribute Definition Section */}
                {showAttributes && (
                    <Card className="border-none shadow-sm bg-slate-50/30">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">1. Define Attributes</CardTitle>
                                    <CardDescription>Select the main attribute to group variations by.</CardDescription>
                                </div>
                                {!primaryAttribute && <AttributeSelector onSelect={handleAddAttribute} />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {attributeFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg bg-slate-50/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={watchedAttributes[index]?.name === primaryAttribute ? "default" : "outline"} className={cn(
                                                    "uppercase text-[10px]",
                                                    watchedAttributes[index]?.name === primaryAttribute ? "bg-orange-500 hover:bg-orange-600" : "text-slate-500"
                                                )}>
                                                    {watchedAttributes[index]?.name === primaryAttribute ? "Primary" : "Attribute"}
                                                </Badge>
                                                <span className="font-bold text-slate-700 text-lg">{watchedAttributes[index]?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {watchedAttributes[index]?.name !== primaryAttribute && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={() => setPrimaryAttribute(watchedAttributes[index]?.name)}
                                                    >
                                                        Set as Primary
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveAttribute(index)}
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="pl-4 border-l-2 border-slate-200 ml-1">
                                            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">
                                                Options for {watchedAttributes[index]?.name}
                                            </Label>
                                            <AttributeOptionsNest
                                                nestIndex={index}
                                                control={control}
                                                register={register}
                                                parentName={attributesName}
                                            />

                                            {/* Show Generate Button for Primary Attribute if variations empty */}
                                            {watchedAttributes[index]?.name === primaryAttribute && watchedVariations.length === 0 && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="mt-4 w-full border-dashed border-2 bg-white hover:bg-slate-50 text-slate-600"
                                                    onClick={() => generateBaseVariations(index)}
                                                >
                                                    <Wand2 className="h-4 w-4 mr-2 text-orange-500" />
                                                    Generate Initial {primaryAttribute} Variations
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {watchedAttributes.length > 0 && (
                                    <div className="pt-2 flex justify-end">
                                        <AttributeSelector
                                            onSelect={handleAddAttribute}
                                            excludedAttributes={watchedAttributes.map(a => a.name)}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Variations Management Table */}
                {showVariations && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    2. Manage Variations
                                </h3>
                                <p className="text-sm text-slate-500">Grouped by {primaryAttribute || 'Primary Attribute'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white shadow-sm">
                                    <Wand2 className="h-4 w-4 mr-2 text-orange-500" />
                                    Bulk Actions
                                </Button>
                                <Button
                                    className="h-9 px-4 rounded-lg bg-white border-2 border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all font-bold"
                                    onClick={() => {
                                        // Trigger logic to add a new group
                                        // Simplified: for now just ensure we have a primary attribute
                                        if (!primaryAttribute) return;
                                        // This button in UI often adds a new "Color" (Primary value)
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add {primaryAttribute || "Group"}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <Table className="border-collapse">
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-10">
                                            <Checkbox className="rounded-md border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                                        </TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">{primaryAttribute || 'Color'}</TableHead>

                                        {/* Dynamic Attribute Columns */}
                                        {secondaryAttributeNames.map(name => (
                                            <TableHead key={name} className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">{name}</TableHead>
                                        ))}

                                        <TableHead className="text-xs font-bold uppercase text-slate-500 text-center">Img</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Warranty</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">SKU</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Price (£) <HelpCircle className="h-3 w-3 inline text-slate-300" /></TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Sale (£) <HelpCircle className="h-3 w-3 inline text-slate-300" /></TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Qty</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Weight</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">Notes</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500">DIM</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-slate-500 text-center w-10">DEL</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {variationFields.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10 + secondaryAttributeNames.length} className="h-32 text-center text-slate-400 italic bg-slate-50/50">
                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                No variations defined. Add attributes above to start.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        groupedVariations && Object.entries(groupedVariations).map(([groupKey, items]) => (
                                            <VariantGroupRows
                                                key={groupKey}
                                                groupKey={groupKey}
                                                items={items}
                                                primaryAttribute={primaryAttribute}
                                                secondaryAttributes={secondaryAttributeNames}
                                                register={register}
                                                remove={removeVariation}
                                                onAddVariant={handleAddVariantToGroup}
                                                onAddSubVariants={handleAddSubVariants}
                                                variationFields={variationFields}
                                                variationsName={variationsName}
                                                allAttributes={watchedAttributes}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

// --- Helper Component: Grouped Rows ---

interface AttributeOptionsNestProps {
    nestIndex: number;
    control: any;
    register: any;
    parentName: string;
}

// --- Helper Component: Attribute Options Nesting ---
function AttributeOptionsNest({ nestIndex, control, register, parentName }: AttributeOptionsNestProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${parentName}.${nestIndex}.options`,
    });

    const watchedAttributeName = useWatch({
        control,
        name: `${parentName}.${nestIndex}.name`
    });

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-white border-slate-200 text-slate-700">
                        <span className="text-xs font-medium">{(field as any).name}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-slate-400 hover:text-red-500"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </Badge>
                ))}
                <AttributeValueSelector
                    attributeName={watchedAttributeName}
                    excludedValues={fields.map((f: any) => f.name)}
                    onSelect={(value) => {
                        if (!fields.some(f => (f as any).name === value)) {
                            append({ name: value, priceModifier: 0 });
                        }
                    }}
                />
            </div>
        </div>
    );
}

interface VariantGroupRowsProps {
    groupKey: string;
    items: { index: number; variation: any }[];
    primaryAttribute: string;
    secondaryAttributes: string[];
    register: any;
    remove: (index: number) => void;
    onAddVariant: (groupKey: string) => void;
    onAddSubVariants: (groupKey: string, newAttributes: { name: string; values: string[] }[]) => void;
    variationFields: any[];
    variationsName: string;
    allAttributes: ProductAttribute[];
}

function VariantGroupRows({
    groupKey,
    items,
    primaryAttribute,
    secondaryAttributes,
    register,
    remove,
    onAddVariant,
    onAddSubVariants,
    variationFields,
    variationsName,
    allAttributes
}: VariantGroupRowsProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Group Header Row */}
            <TableRow className="bg-orange-50/60 hover:bg-orange-100/70 border-y border-orange-100/50">
                <TableCell>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCollapsed(!collapsed)} className="text-orange-400 hover:text-orange-600 transition-colors">
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <Checkbox className="rounded-md border-orange-200 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                    </div>
                </TableCell>
                <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">{primaryAttribute}</span>
                        <span className="font-bold text-sm text-slate-800">{groupKey}</span>
                    </div>
                </TableCell>

                {/* Headers for Secondary Attributes in Group Row */}
                {secondaryAttributes.map((name: string) => (
                    <TableCell key={name} className="py-2.5">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{name}</span>
                            <AttributeValueSelector
                                attributeName={name}
                                onSelect={(val) => onAddSubVariants(groupKey, [{ name, values: [val] }])}
                                trigger={
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-full p-0.5 transition-colors"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                }
                            />
                        </div>
                    </TableCell>
                ))}

                <TableCell colSpan={10}>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="h-5 px-2 bg-white text-[10px] text-orange-600 border-orange-200 font-bold uppercase rounded-md shadow-sm">
                            {items.length} Variations
                        </Badge>

                        {/* Summary info or additional group actions could go here */}
                    </div>
                </TableCell>
            </TableRow>

            {/* Variation Rows */}
            {!collapsed && items.map(({ index }: any) => {
                const variation = variationFields[index];
                return (
                    <TableRow key={variation.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                        <TableCell>
                            <Checkbox className="rounded-md border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                        </TableCell>

                        {/* Primary Attribute Value with Dot */}
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span className="text-sm font-medium text-slate-600">{groupKey}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <VariantBuilder
                                        baseAttributeName={primaryAttribute}
                                        baseAttributeValue={groupKey}
                                        existingAttributes={[primaryAttribute, ...secondaryAttributes]}
                                        onGenerate={(attrs) => onAddSubVariants(groupKey, attrs)}
                                        trigger={
                                            <button
                                                type="button"
                                                className="text-orange-400 hover:text-orange-600"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        }
                                    />
                                </div>
                            </div>
                        </TableCell>

                        {/* Secondary Attributes Values */}
                        {secondaryAttributes.map((name: string) => (
                            <TableCell key={name}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500">
                                        {variation.combination[name] || '-'}
                                    </span>
                                    <AttributeValueSelector
                                        attributeName={name}
                                        onSelect={(val) => onAddSubVariants(groupKey, [{ name, values: [val] }])}
                                        trigger={
                                            <button
                                                type="button"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-orange-500 bg-white hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-full h-5 w-5 flex items-center justify-center ml-2"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        }
                                    />
                                </div>
                            </TableCell>
                        ))}

                        {/* Data Inputs matching the UI */}
                        <TableCell className="text-center">
                            <div className="w-9 h-9 border rounded-lg border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-orange-200 hover:text-orange-400 cursor-pointer transition-all">
                                <ImageIcon className="h-4 w-4" />
                            </div>
                        </TableCell>

                        <TableCell>
                            <Input
                                {...register(`${variationsName}.${index}.warranty`)}
                                defaultValue="1 Year"
                                className="h-9 w-24 bg-white border border-slate-200 text-xs px-2 rounded-lg focus-visible:ring-orange-500"
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                {...register(`${variationsName}.${index}.sku`)}
                                className="h-9 w-28 bg-white border border-slate-200 text-xs px-3 font-mono uppercase tracking-tight rounded-lg focus-visible:ring-orange-500"
                                placeholder="SKU"
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                type="number"
                                {...register(`${variationsName}.${index}.price`)}
                                className="h-9 w-20 bg-white border border-slate-200 text-xs px-3 rounded-lg focus-visible:ring-orange-500"
                                defaultValue={0}
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                type="number"
                                {...register(`${variationsName}.${index}.salePrice`)}
                                className="h-9 w-20 bg-white border border-slate-200 text-xs px-3 rounded-lg focus-visible:ring-orange-500 text-orange-600 font-bold"
                                defaultValue={0}
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                type="number"
                                {...register(`${variationsName}.${index}.stock`)}
                                className="h-9 w-16 bg-white border border-slate-200 text-xs px-2 text-center rounded-lg focus-visible:ring-orange-500"
                                defaultValue={0}
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                type="number"
                                {...register(`${variationsName}.${index}.weight`)}
                                className="h-9 w-16 bg-white border border-slate-200 text-xs px-2 text-center rounded-lg focus-visible:ring-orange-500"
                                defaultValue={0}
                            />
                        </TableCell>

                        <TableCell>
                            <Input
                                {...register(`${variationsName}.${index}.notes`)}
                                className="h-9 w-32 bg-white border border-slate-200 text-xs px-2 rounded-lg focus-visible:ring-orange-500"
                                placeholder="..."
                            />
                        </TableCell>

                        <TableCell className="text-center">
                            <div className="flex justify-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        // Handle copy/duplicate
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>

                        <TableCell>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50 mx-auto"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                );
            })}
        </>
    );
}
