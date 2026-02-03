'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Trash2,
    ChevronRight,
    ChevronDown,
    ImagePlus,
    Zap,
    Package,
    Settings2,
    Layers,
    Type,
    MoreHorizontal,
    Scale,
    StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { predefinedVariantOptions } from '@/lib/variant-options';
import { ProductAttribute, ProductVariation } from '@/service/store/products/types';

// --- Types for Hierarchical Structure ---

interface VariantNode {
    id: string;
    attributeName: string;
    value: string;
    price: number;
    salePrice: number;
    stock: number;
    sku: string;
    weight: number;
    notes: string;
    image?: string;
    available: boolean;
    children: VariantNode[];
    isExpanded?: boolean;
}

interface VariantManagerProps {
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    onAttributesChange: (attrs: ProductAttribute[]) => void;
    onVariationsChange: (vars: ProductVariation[]) => void;
}

export default function VariantManager({
    attributes: propAttributes,
    variations: propVariations,
    onAttributesChange,
    onVariationsChange
}: VariantManagerProps) {

    // Internal hierarchical state
    const [tree, setTree] = useState<VariantNode[]>([]);
    const [topLevelAttribute, setTopLevelAttribute] = useState<string>("");

    // --- Initialization Logic (Rebuild tree from variations if tree is empty) ---
    useEffect(() => {
        if (tree.length === 0 && propVariations.length > 0) {
            // Best-effort rebuild of the hierarchical tree from flat variations
            const rebuildTree = (vars: ProductVariation[]): VariantNode[] => {
                if (vars.length === 0) return [];

                // 1. Group by the FIRST attribute found in combinations
                // Note: This assumes a consistent root attribute for all variations
                const firstAttr = propAttributes[0]?.name;
                if (!firstAttr) return [];

                const groups: Record<string, ProductVariation[]> = {};
                vars.forEach(v => {
                    const val = v.combination[firstAttr];
                    if (val) {
                        if (!groups[val]) groups[val] = [];
                        groups[val].push(v);
                    }
                });

                return Object.entries(groups).map(([val, groupVars]) => {
                    // Find remaining attributes for this group
                    const remainingVars = groupVars.map(v => {
                        const newComb = { ...v.combination };
                        delete newComb[firstAttr];
                        return { ...v, combination: newComb };
                    }).filter(v => Object.keys(v.combination).length > 0);

                    // If no more attributes, this is a leaf
                    const isLeaf = remainingVars.length === 0;
                    const leafData = groupVars[0];

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        attributeName: firstAttr,
                        value: val,
                        price: isLeaf ? leafData.price : 0,
                        salePrice: isLeaf ? (leafData.salePrice || 0) : 0,
                        stock: isLeaf ? leafData.stock : 0,
                        sku: isLeaf ? (leafData.sku || '') : '',
                        weight: isLeaf ? (leafData.weight || 0) : 0,
                        notes: isLeaf ? (leafData.notes || '') : '',
                        image: isLeaf ? leafData.image : undefined,
                        available: isLeaf ? leafData.available : true,
                        children: isLeaf ? [] : rebuildSubTree(remainingVars, propAttributes.slice(1)),
                        isExpanded: true
                    };
                });
            };

            const rebuildSubTree = (vars: ProductVariation[], attrs: ProductAttribute[]): VariantNode[] => {
                if (vars.length === 0 || attrs.length === 0) return [];
                const currentAttr = attrs[0].name;
                const groups: Record<string, ProductVariation[]> = {};

                vars.forEach(v => {
                    const val = v.combination[currentAttr];
                    if (val) {
                        if (!groups[val]) groups[val] = [];
                        groups[val].push(v);
                    }
                });

                return Object.entries(groups).map(([val, groupVars]) => {
                    const remainingVars = groupVars.map(v => {
                        const newComb = { ...v.combination };
                        delete newComb[currentAttr];
                        return { ...v, combination: newComb };
                    }).filter(v => Object.keys(v.combination).length > 0);

                    const isLeaf = remainingVars.length === 0;
                    const leafData = groupVars[0];

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        attributeName: currentAttr,
                        value: val,
                        price: isLeaf ? leafData.price : 0,
                        salePrice: isLeaf ? (leafData.salePrice || 0) : 0,
                        stock: isLeaf ? leafData.stock : 0,
                        sku: isLeaf ? (leafData.sku || '') : '',
                        weight: isLeaf ? (leafData.weight || 0) : 0,
                        notes: isLeaf ? (leafData.notes || '') : '',
                        image: isLeaf ? leafData.image : undefined,
                        available: isLeaf ? leafData.available : true,
                        children: isLeaf ? [] : rebuildSubTree(remainingVars, attrs.slice(1)),
                        isExpanded: true
                    };
                });
            };

            const newTree = rebuildTree(propVariations);
            if (newTree.length > 0) {
                setTree(newTree);
                setTopLevelAttribute(newTree[0].attributeName);
            }
        }
    }, [propVariations, propAttributes]);

    // --- Sync Logic ---

    // Sync tree to flat Variations and Attributes whenever tree changes
    const [isInitialSync, setIsInitialSync] = useState(true);

    useEffect(() => {
        if (isInitialSync) {
            setIsInitialSync(false);
            return;
        }

        if (tree.length === 0) {
            onVariationsChange([]);
            onAttributesChange([]);
            return;
        }

        const flatVars: ProductVariation[] = [];
        const usedAttributes = new Set<string>();

        const traverse = (nodes: VariantNode[], currentCombination: Record<string, string>) => {
            nodes.forEach(node => {
                const combination = { ...currentCombination, [node.attributeName]: node.value };
                usedAttributes.add(node.attributeName);

                if (node.children.length === 0) {
                    flatVars.push({
                        combination,
                        price: node.price,
                        salePrice: node.salePrice || undefined,
                        stock: node.stock,
                        sku: node.sku || Object.values(combination).join('-').toUpperCase(),
                        weight: node.weight || undefined,
                        notes: node.notes || undefined,
                        image: node.image,
                        available: node.available,
                        reservedStock: 0,
                        soldCount: 0
                    });
                } else {
                    traverse(node.children, combination);
                }
            });
        };

        traverse(tree, {});

        const flatAttrs: ProductAttribute[] = Array.from(usedAttributes).map(name => ({
            name,
            options: []
        }));

        flatAttrs.forEach(attr => {
            const values = new Set<string>();
            flatVars.forEach(v => {
                if (v.combination[attr.name]) values.add(v.combination[attr.name]);
            });
            attr.options = Array.from(values).map(v => ({ name: v, priceModifier: 0 }));
        });

        onVariationsChange(flatVars);
        onAttributesChange(flatAttrs);
    }, [tree]);

    // --- Tree Mutations ---

    const addTopLevelValues = (attrName: string, values: string[]) => {
        const newNodes: VariantNode[] = values.map(val => ({
            id: Math.random().toString(36).substr(2, 9),
            attributeName: attrName,
            value: val,
            price: 0,
            salePrice: 0,
            stock: 0,
            sku: val.toUpperCase(),
            weight: 0,
            notes: '',
            available: true,
            children: [],
            isExpanded: true
        }));
        setTree(prev => [...prev, ...newNodes]);
        setTopLevelAttribute(attrName);
    };

    const addSubAttribute = (parentId: string, attrName: string, values: string[]) => {
        const updateRecursive = (nodes: VariantNode[]): VariantNode[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    const newChildren: VariantNode[] = values.map(val => ({
                        id: Math.random().toString(36).substr(2, 9),
                        attributeName: attrName,
                        value: val,
                        price: node.price,
                        salePrice: node.salePrice,
                        stock: node.stock,
                        sku: node.sku ? `${node.sku}-${val.toUpperCase()}` : val.toUpperCase(),
                        weight: node.weight,
                        notes: node.notes,
                        available: true,
                        children: [],
                        isExpanded: true
                    }));
                    return { ...node, children: [...node.children, ...newChildren], isExpanded: true };
                }
                return { ...node, children: updateRecursive(node.children) };
            });
        };
        setTree(prev => updateRecursive(prev));
    };

    const updateNode = (id: string, data: Partial<VariantNode>) => {
        const updateRecursive = (nodes: VariantNode[]): VariantNode[] => {
            return nodes.map(node => {
                if (node.id === id) return { ...node, ...data };
                return { ...node, children: updateRecursive(node.children) };
            });
        };
        setTree(prev => updateRecursive(prev));
    };

    const removeNode = (id: string) => {
        const removeRecursive = (nodes: VariantNode[]): VariantNode[] => {
            return nodes.filter(node => node.id !== id).map(node => ({
                ...node,
                children: removeRecursive(node.children)
            }));
        };
        setTree(prev => removeRecursive(prev));
    };

    // --- Bulk Actions ---

    const applyBulk = (field: keyof VariantNode, value: any, startNodes?: VariantNode[]) => {
        const traverseAndApply = (nodes: VariantNode[]) => {
            nodes.forEach(node => {
                (node as any)[field] = value;
                traverseAndApply(node.children);
            });
        };
        const newTree: VariantNode[] = JSON.parse(JSON.stringify(tree));
        if (startNodes) {
            const ids = new Set(startNodes.map(n => n.id));
            const findAndApply = (nodes: VariantNode[]) => {
                nodes.forEach(node => {
                    if (ids.has(node.id)) {
                        (node as any)[field] = value;
                        traverseAndApply(node.children);
                    } else {
                        findAndApply(node.children);
                    }
                });
            };
            findAndApply(newTree);
        } else {
            traverseAndApply(newTree);
        }
        setTree(newTree);
        toast.success(`Applied ${field} bulk update`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. INITIAL STATE: CHOOSE TOP LEVEL */}
            {tree.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-gray-50 dark:bg-gray-800/20 text-center gap-6">
                    <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600">
                        <Layers size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start with your first variant</h3>
                        <p className="text-sm text-gray-500 max-w-sm">Choose the main option customers see first (e.g., Color or Model).</p>
                    </div>

                    <div className="w-full max-w-md">
                        <AttributeSelector
                            onSelect={(name: string, values: string[]) => addTopLevelValues(name, values)}
                            placeholder="Search main attribute (Color, Size...)"
                        />
                    </div>
                </div>
            )}

            {/* 2. HIERARCHICAL BUILDER TABLE */}
            {tree.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-end bg-white dark:bg-[#1a120b] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Settings2 className="text-orange-500" size={20} />
                                Product Variant Hierarchy
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Add sub-variants under each option to create your inventory matrix.</p>
                        </div>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Zap size={14} className="mr-1" /> Bulk Tools
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 p-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Apply to All</label>
                                        <div className="flex gap-2">
                                            <Input placeholder="Price" type="number" id="bulk-price" className="h-8 text-xs" />
                                            <Button size="sm" className="h-8" onClick={() => {
                                                const el = document.getElementById('bulk-price') as HTMLInputElement;
                                                if (el.value) applyBulk('price', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Sale Price" type="number" id="bulk-sale" className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById('bulk-sale') as HTMLInputElement;
                                                if (el.value) applyBulk('salePrice', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Qty" type="number" id="bulk-qty" className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById('bulk-qty') as HTMLInputElement;
                                                if (el.value) applyBulk('stock', parseInt(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Weight" type="number" id="bulk-weight" className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById('bulk-weight') as HTMLInputElement;
                                                if (el.value) applyBulk('weight', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1a120b]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="px-6 py-4 w-12 text-center">#</th>
                                        <th className="px-6 py-4 min-w-[200px]">Variant Hierarchy</th>
                                        <th className="px-4 py-4 w-28 text-center">Image</th>
                                        <th className="px-4 py-4 w-32">SKU</th>
                                        <th className="px-4 py-4 w-28">Price (£)</th>
                                        <th className="px-4 py-4 w-28">Sale (£)</th>
                                        <th className="px-4 py-4 w-24">Qty</th>
                                        <th className="px-4 py-4 w-24">Weight (kg)</th>
                                        <th className="px-4 py-4">Notes</th>
                                        <th className="px-4 py-4 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {tree.map((node, index) => (
                                        <NodeRows
                                            key={node.id}
                                            node={node}
                                            level={0}
                                            onUpdate={updateNode}
                                            onRemove={removeNode}
                                            onAddSub={addSubAttribute}
                                            index={index}
                                            applyBulk={applyBulk}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add another main value */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                            <AttributeSelector
                                label={`Add another ${topLevelAttribute}`}
                                onSelect={(name: string, values: string[]) => addTopLevelValues(name, values)}
                                fixedAttribute={topLevelAttribute}
                                placeholder={`Add more ${topLevelAttribute}s...`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Internal Helper Components ---

interface NodeRowsProps {
    node: VariantNode;
    level: number;
    onUpdate: (id: string, data: Partial<VariantNode>) => void;
    onRemove: (id: string) => void;
    onAddSub: (parentId: string, attrName: string, values: string[]) => void;
    index: number;
    applyBulk: (field: keyof VariantNode, value: any, startNodes?: VariantNode[]) => void;
}

function NodeRows({ node, level, onUpdate, onRemove, onAddSub, index, applyBulk }: NodeRowsProps) {
    const isLeaf = node.children.length === 0;

    return (
        <>
            <tr className={cn(
                "group transition-colors",
                level === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/30 dark:bg-gray-900/10",
                !node.available && "opacity-50"
            )}>
                <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-gray-400">{index + 1}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        <div className={cn(
                            "p-1.5 rounded-lg border flex flex-col min-w-[100px]",
                            level === 0 ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"
                        )}>
                            <span className="text-[9px] font-black uppercase tracking-tighter block leading-none mb-1 opacity-60">
                                {node.attributeName}
                            </span>
                            <span className="text-sm font-bold block leading-none">
                                {node.value}
                            </span>
                        </div>

                        {!isLeaf && (
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent mx-2" />
                        )}

                        {isLeaf && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-orange-500">
                                        <Plus size={16} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-60" align="start">
                                    <Command>
                                        <CommandInput placeholder="Add sub-attribute..." />
                                        <CommandList>
                                            <CommandEmpty>No attribute found.</CommandEmpty>
                                            <CommandGroup heading="Available Attributes">
                                                {Object.keys(predefinedVariantOptions)
                                                    .filter(type => type !== node.attributeName)
                                                    .map((type) => (
                                                        <CommandItem
                                                            key={type}
                                                            onSelect={() => {
                                                                const values = prompt(`Enter values for ${type} (comma separated):`);
                                                                if (values) onAddSub(node.id, type, values.split(',').map(v => v.trim()));
                                                            }}
                                                        >
                                                            {type}
                                                        </CommandItem>
                                                    ))
                                                }
                                                <CommandItem onSelect={() => {
                                                    const name = prompt("Enter attribute name:");
                                                    const values = prompt(`Enter values for ${name} (comma separated):`);
                                                    if (name && values) onAddSub(node.id, name, values.split(',').map(v => v.trim()));
                                                }}>
                                                    Custom...
                                                </CommandItem>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="flex justify-center">
                        <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden">
                            {node.image ? (
                                <img src={node.image} className="w-full h-full object-cover" />
                            ) : (
                                <ImagePlus size={16} className="text-gray-400" />
                            )}
                        </div>
                    </div>
                </td>

                <td className="px-4 py-4">
                    <Input
                        type="text"
                        className="h-9 text-[10px] font-mono uppercase"
                        placeholder="SKU"
                        value={node.sku}
                        onChange={(e) => onUpdate(node.id, { sku: e.target.value })}
                    />
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">£</span>
                        <Input
                            type="number"
                            className="h-9 pl-5 text-sm font-medium"
                            placeholder="0.0"
                            value={node.price}
                            onChange={(e) => onUpdate(node.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">£</span>
                        <Input
                            type="number"
                            className="h-9 pl-5 text-sm font-medium text-green-600 dark:text-green-400"
                            placeholder="0.0"
                            value={node.salePrice}
                            onChange={(e) => onUpdate(node.id, { salePrice: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <Input
                        type="number"
                        className="h-9 text-sm font-medium"
                        placeholder="0"
                        value={node.stock}
                        onChange={(e) => onUpdate(node.id, { stock: parseInt(e.target.value) || 0 })}
                    />
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <Scale size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="number"
                            className="h-9 pl-6 text-[10px]"
                            placeholder="0.0"
                            value={node.weight}
                            onChange={(e) => onUpdate(node.id, { weight: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <StickyNote size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            className="h-9 pl-6 text-[10px]"
                            placeholder="Add notes..."
                            value={node.notes}
                            onChange={(e) => onUpdate(node.id, { notes: e.target.value })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {!isLeaf && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-400 hover:text-orange-600">
                                        <Zap size={14} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-4 w-60 space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Apply to all under "{node.value}"</p>
                                        <div className="flex gap-2">
                                            <Input placeholder="Price" type="number" id={`bulk-price-${node.id}`} className="h-8 text-xs" />
                                            <Button size="sm" className="h-8" onClick={() => {
                                                const el = document.getElementById(`bulk-price-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('price', parseFloat(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Sale Price" type="number" id={`bulk-sale-${node.id}`} className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById(`bulk-sale-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('salePrice', parseFloat(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Qty" type="number" id={`bulk-qty-${node.id}`} className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById(`bulk-qty-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('stock', parseInt(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Weight" type="number" id={`bulk-weight-${node.id}`} className="h-8 text-xs" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById(`bulk-weight-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('weight', parseFloat(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-300 hover:text-red-500"
                            onClick={() => onRemove(node.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </td>
            </tr>

            {node.children.map((child: VariantNode, idx: number) => (
                <NodeRows
                    key={child.id}
                    node={child}
                    level={level + 1}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onAddSub={onAddSub}
                    index={idx}
                    applyBulk={applyBulk}
                />
            ))}
        </>
    );
}

interface AttributeSelectorProps {
    onSelect: (name: string, values: string[]) => void;
    placeholder?: string;
    label?: string;
    fixedAttribute?: string;
}

function AttributeSelector({ onSelect, placeholder, label, fixedAttribute }: AttributeSelectorProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = (name: string, valuesStr: string) => {
        const values = valuesStr.split(',').map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
            onSelect(name, values);
            setOpen(false);
        }
    };

    if (fixedAttribute) {
        return (
            <div className="flex items-center gap-3">
                <Input
                    id="fixed-attr-input"
                    placeholder={placeholder}
                    className="max-w-xs h-9"
                    onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') handleConfirm(fixedAttribute, (e.target as HTMLInputElement).value);
                    }}
                />
                <Button size="sm" onClick={() => {
                    const el = document.getElementById('fixed-attr-input') as HTMLInputElement;
                    if (el) handleConfirm(fixedAttribute, el.value);
                }}>Add</Button>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-11 rounded-xl">
                    {label || placeholder}
                    <ChevronDown size={16} className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80" align="center">
                <Command>
                    <CommandInput placeholder="Search attributes..." />
                    <CommandList>
                        <CommandEmpty>No attribute found.</CommandEmpty>
                        <CommandGroup heading="Common Attributes">
                            {Object.keys(predefinedVariantOptions).map((type) => (
                                <CommandItem
                                    key={type}
                                    onSelect={() => {
                                        const values = prompt(`Enter values for ${type} (comma separated):`);
                                        if (values) handleConfirm(type, values);
                                    }}
                                >
                                    {type}
                                </CommandItem>
                            ))}
                            <CommandItem onSelect={() => {
                                const name = prompt("Enter attribute name:");
                                const values = prompt(`Enter values for ${name} (comma separated):`);
                                if (name && values) handleConfirm(name, values);
                            }}>
                                Custom...
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
