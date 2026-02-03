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
    Scale,
    StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

    // Get all unique attribute names used in the tree for filtering
    const usedAttributes = useMemo(() => {
        const names = new Set<string>();
        const traverse = (nodes: VariantNode[]) => {
            nodes.forEach(node => {
                names.add(node.attributeName);
                traverse(node.children);
            });
        };
        traverse(tree);
        return Array.from(names);
    }, [tree]);

    // --- Initialization Logic (Rebuild tree from variations if tree is empty) ---
    useEffect(() => {
        if (tree.length === 0 && propVariations.length > 0) {
            const rebuildTree = (vars: ProductVariation[]): VariantNode[] => {
                if (vars.length === 0) return [];
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
                    const remainingVars = groupVars.map(v => {
                        const newComb = { ...v.combination };
                        delete newComb[firstAttr];
                        return { ...v, combination: newComb };
                    }).filter(v => Object.keys(v.combination).length > 0);

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
        const usedAttrs = new Set<string>();

        const traverse = (nodes: VariantNode[], currentCombination: Record<string, string>) => {
            nodes.forEach(node => {
                const combination = { ...currentCombination, [node.attributeName]: node.value };
                usedAttrs.add(node.attributeName);

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

        const flatAttrs: ProductAttribute[] = Array.from(usedAttrs).map(name => ({
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

    const addGlobalSubAttribute = (attrName: string, values: string[]) => {
        const updateRecursive = (nodes: VariantNode[]): VariantNode[] => {
            return nodes.map(node => {
                if (node.children.length === 0) {
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
                    return { ...node, children: newChildren, isExpanded: true };
                }
                return { ...node, children: updateRecursive(node.children) };
            });
        };
        setTree(prev => updateRecursive(prev));
        toast.success(`Added ${attrName} to all variations`);
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
            {/* INITIAL STATE */}
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
                            usedAttributes={[]}
                        />
                    </div>
                </div>
            )}

            {/* BUILDER TABLE */}
            {tree.length > 0 && (
                <div className="space-y-6">
                    <div className="flex flex-wrap justify-between items-end gap-4 bg-white dark:bg-[#1a120b] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black flex items-center gap-2 tracking-tight">
                                <Settings2 className="text-orange-500" size={24} />
                                VARIANT MATRIX BUILDER
                            </h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Configure attributes, inventory and pricing</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <AttributeSelector
                                label="Add Global Attribute"
                                onSelect={addGlobalSubAttribute}
                                placeholder="Choose attribute to apply to all..."
                                usedAttributes={usedAttributes}
                                variant="orange"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 rounded-xl px-4 font-bold border-2">
                                        <Zap size={16} className="mr-2 text-orange-500" /> Bulk Tools
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-4 space-y-4 rounded-2xl shadow-2xl border-orange-100">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Global Bulk Updates</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">£</span>
                                                <Input placeholder="Price" type="number" id="bulk-price" className="h-9 pl-5 text-xs rounded-lg" />
                                            </div>
                                            <Button size="sm" className="h-9 bg-orange-600 hover:bg-orange-700" onClick={() => {
                                                const el = document.getElementById('bulk-price') as HTMLInputElement;
                                                if (el.value) applyBulk('price', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">£</span>
                                                <Input placeholder="Sale" type="number" id="bulk-sale" className="h-9 pl-5 text-xs rounded-lg" />
                                            </div>
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => {
                                                const el = document.getElementById('bulk-sale') as HTMLInputElement;
                                                if (el.value) applyBulk('salePrice', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Package size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <Input placeholder="Qty" type="number" id="bulk-qty" className="h-9 pl-6 text-xs rounded-lg" />
                                            </div>
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => {
                                                const el = document.getElementById('bulk-qty') as HTMLInputElement;
                                                if (el.value) applyBulk('stock', parseInt(el.value));
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Scale size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <Input placeholder="Weight" type="number" id="bulk-weight" className="h-9 pl-6 text-xs rounded-lg" />
                                            </div>
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => {
                                                const el = document.getElementById('bulk-weight') as HTMLInputElement;
                                                if (el.value) applyBulk('weight', parseFloat(el.value));
                                            }}>Go</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1a120b] shadow-xl">
                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-left border-collapse min-w-[1400px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-5 w-12 text-center">#</th>
                                        <th className="px-6 py-5 min-w-[280px]">Hierarchical Configuration</th>
                                        <th className="px-4 py-5 w-24 text-center">Status</th>
                                        <th className="px-4 py-5 w-24 text-center">Image</th>
                                        <th className="px-4 py-5 w-36">SKU Mapping</th>
                                        <th className="px-4 py-5 w-28">Price (£)</th>
                                        <th className="px-4 py-5 w-28 text-orange-600">Sale (£)</th>
                                        <th className="px-4 py-5 w-24">Qty</th>
                                        <th className="px-4 py-5 w-24">Weight</th>
                                        <th className="px-4 py-5">Notes</th>
                                        <th className="px-4 py-5 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
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
                                            usedAttributes={usedAttributes}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add another main value */}
                        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                            <div className="max-w-xs">
                                <AttributeSelector
                                    label={`Add another ${topLevelAttribute}`}
                                    onSelect={(name: string, values: string[]) => addTopLevelValues(name, values)}
                                    fixedAttribute={topLevelAttribute}
                                    placeholder={`Type more ${topLevelAttribute}s...`}
                                    usedAttributes={[]}
                                />
                            </div>
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
    usedAttributes: string[];
}

function NodeRows({ node, level, onUpdate, onRemove, onAddSub, index, applyBulk, usedAttributes }: NodeRowsProps) {
    const isLeaf = node.children.length === 0;

    return (
        <>
            <tr className={cn(
                "group transition-all duration-200",
                level === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/20 dark:bg-gray-900/5",
                !node.available && "bg-gray-50/50 opacity-60 grayscale-[0.5]"
            )}>
                <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black font-mono text-gray-300">{index + 1}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 28}px` }}>
                        <div className={cn(
                            "p-2 rounded-xl border-2 flex flex-col min-w-[120px] transition-all group-hover:shadow-md",
                            level === 0
                                ? "bg-orange-50/50 border-orange-100 text-orange-700"
                                : "bg-blue-50/50 border-blue-100 text-blue-700"
                        )}>
                            <span className="text-[9px] font-black uppercase tracking-tighter block leading-none mb-1.5 opacity-50">
                                {node.attributeName}
                            </span>
                            <span className="text-sm font-black block leading-none tracking-tight">
                                {node.value}
                            </span>
                        </div>

                        {/* PLUS BUTTON - Beside all options apart from the base (level 0) */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-7 w-7 rounded-full bg-gray-100 text-gray-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm flex-shrink-0",
                                        level === 0 && "hidden"
                                    )}
                                >
                                    <Plus size={14} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-64 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                                <Command className="border-none">
                                    <CommandInput placeholder="Add sub-attribute..." className="h-11" />
                                    <CommandList>
                                        <CommandEmpty>No attribute found.</CommandEmpty>
                                        <CommandGroup heading="Hierarchical Attributes">
                                            {Object.keys(predefinedVariantOptions)
                                                .map((type) => (
                                                    <CommandItem
                                                        key={type}
                                                        onSelect={() => {
                                                            const values = prompt(`Enter values for ${type} (comma separated):`);
                                                            if (values) onAddSub(node.id, type, values.split(',').map(v => v.trim()));
                                                        }}
                                                        className="py-2.5 px-4 font-bold text-xs"
                                                    >
                                                        {type}
                                                    </CommandItem>
                                                ))
                                            }
                                            <CommandItem onSelect={() => {
                                                const name = prompt("Enter attribute name:");
                                                const values = prompt(`Enter values for ${name} (comma separated):`);
                                                if (name && values) onAddSub(node.id, name, values.split(',').map(v => v.trim()));
                                            }} className="py-2.5 px-4 font-bold text-xs text-orange-600">
                                                Custom...
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {!isLeaf && (
                            <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-100 to-transparent ml-2 opacity-50 min-w-[20px]" />
                        )}

                        {/* If it's a leaf at level 0, it still needs a way to get a child */}
                        {isLeaf && level === 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-gray-100 text-gray-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                                        <Plus size={14} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-64 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                                    <Command className="border-none">
                                        <CommandInput placeholder="Add first sub-attribute..." className="h-11" />
                                        <CommandList>
                                            <CommandEmpty>No attribute found.</CommandEmpty>
                                            <CommandGroup heading="Available Attributes">
                                                {Object.keys(predefinedVariantOptions).map((type) => (
                                                    <CommandItem
                                                        key={type}
                                                        onSelect={() => {
                                                            const values = prompt(`Enter values for ${type} (comma separated):`);
                                                            if (values) onAddSub(node.id, type, values.split(',').map(v => v.trim()));
                                                        }}
                                                        className="py-2.5 px-4 font-bold text-xs"
                                                    >
                                                        {type}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </td>

                <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center">
                        <Switch
                            checked={node.available}
                            onCheckedChange={(val) => onUpdate(node.id, { available: val })}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="flex justify-center">
                        <div className="size-11 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/30 transition-all overflow-hidden group/img shadow-sm">
                            {node.image ? (
                                <img src={node.image} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                            ) : (
                                <ImagePlus size={18} className="text-gray-300 group-hover/img:text-orange-400" />
                            )}
                        </div>
                    </div>
                </td>

                <td className="px-4 py-4">
                    <Input
                        type="text"
                        className="h-9 text-[10px] font-black font-mono uppercase rounded-lg border-gray-100 bg-gray-50/50"
                        placeholder="AUTO-GENERATED"
                        value={node.sku}
                        onChange={(e) => onUpdate(node.id, { sku: e.target.value })}
                    />
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">£</span>
                        <Input
                            type="number"
                            className="h-9 pl-5 text-xs font-black rounded-lg border-gray-100"
                            placeholder="0.00"
                            value={node.price}
                            onChange={(e) => onUpdate(node.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">£</span>
                        <Input
                            type="number"
                            className="h-9 pl-5 text-xs font-black rounded-lg border-orange-100 bg-orange-50/30 text-orange-600 dark:text-orange-400"
                            placeholder="0.00"
                            value={node.salePrice}
                            onChange={(e) => onUpdate(node.id, { salePrice: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <Input
                        type="number"
                        className="h-9 text-xs font-black rounded-lg border-gray-100"
                        placeholder="0"
                        value={node.stock}
                        onChange={(e) => onUpdate(node.id, { stock: parseInt(e.target.value) || 0 })}
                    />
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <Scale size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" />
                        <Input
                            type="number"
                            className="h-9 pl-7 text-[10px] font-bold rounded-lg border-gray-100"
                            placeholder="KG"
                            value={node.weight}
                            onChange={(e) => onUpdate(node.id, { weight: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </td>

                <td className="px-4 py-4">
                    <div className="relative">
                        <StickyNote size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" />
                        <Input
                            type="text"
                            className="h-9 pl-7 text-[10px] font-medium rounded-lg border-gray-100"
                            placeholder="Notes..."
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                                        <Zap size={16} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-4 w-60 space-y-4 rounded-2xl shadow-2xl border-orange-100">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Apply to all under "{node.value}"</p>
                                        <div className="flex gap-2">
                                            <Input placeholder="Price" type="number" id={`bulk-price-${node.id}`} className="h-9 text-xs rounded-lg" />
                                            <Button size="sm" className="h-9 bg-orange-600 hover:bg-orange-700" onClick={() => {
                                                const el = document.getElementById(`bulk-price-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('price', parseFloat(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Sale Price" type="number" id={`bulk-sale-${node.id}`} className="h-9 text-xs rounded-lg" />
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                const el = document.getElementById(`bulk-sale-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('salePrice', parseFloat(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Qty" type="number" id={`bulk-qty-${node.id}`} className="h-9 text-xs rounded-lg" />
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => {
                                                const el = document.getElementById(`bulk-qty-${node.id}`) as HTMLInputElement;
                                                if (el.value) applyBulk('stock', parseInt(el.value), [node]);
                                            }}>Go</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="Weight" type="number" id={`bulk-weight-${node.id}`} className="h-9 text-xs rounded-lg" />
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => {
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
                            className="h-8 w-8 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={() => onRemove(node.id)}
                        >
                            <Trash2 size={16} />
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
                    usedAttributes={usedAttributes}
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
    usedAttributes: string[];
    variant?: 'default' | 'orange';
}

function AttributeSelector({ onSelect, placeholder, label, fixedAttribute, usedAttributes, variant = 'default' }: AttributeSelectorProps) {
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
                    className="max-w-xs h-10 rounded-xl"
                    onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') handleConfirm(fixedAttribute, (e.target as HTMLInputElement).value);
                    }}
                />
                <Button size="sm" className="h-10 px-4 rounded-xl font-bold bg-[#1c140d] text-white" onClick={() => {
                    const el = document.getElementById('fixed-attr-input') as HTMLInputElement;
                    if (el) handleConfirm(fixedAttribute, el.value);
                }}>Add</Button>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={variant === 'orange' ? 'default' : 'outline'}
                    className={cn(
                        "w-full justify-between h-10 rounded-xl font-bold",
                        variant === 'orange' && "bg-orange-600 hover:bg-orange-700 text-white border-none shadow-lg shadow-orange-200"
                    )}
                >
                    <div className="flex items-center gap-2">
                        {variant === 'orange' ? <Layers size={16} /> : <Plus size={16} />}
                        {label || placeholder}
                    </div>
                    <ChevronDown size={16} className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80 rounded-2xl overflow-hidden shadow-2xl border-none" align="center">
                <Command>
                    <CommandInput placeholder="Search attributes..." className="h-11" />
                    <CommandList>
                        <CommandEmpty>No attribute found.</CommandEmpty>
                        <CommandGroup heading="Available Attributes">
                            {Object.keys(predefinedVariantOptions)
                                .map((type) => (
                                    <CommandItem
                                        key={type}
                                        onSelect={() => {
                                            const values = prompt(`Enter values for ${type} (comma separated):`);
                                            if (values) handleConfirm(type, values);
                                        }}
                                        className="py-3 px-4 font-bold text-xs"
                                    >
                                        {type}
                                    </CommandItem>
                                ))}
                            <CommandItem onSelect={() => {
                                const name = prompt("Enter attribute name:");
                                const values = prompt(`Enter values for ${name} (comma separated):`);
                                if (name && values) handleConfirm(name, values);
                            }} className="py-3 px-4 font-bold text-xs text-orange-600">
                                Custom...
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
