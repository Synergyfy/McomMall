'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProductAttribute, ProductVariation } from '@/service/store/products/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Ruler } from 'lucide-react';
import SizeGuideModal from './SizeGuideModal';

interface VisualVariantSelectorProps {
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    selectedValues: Record<string, string>;
    onChange: (attributeName: string, value: string) => void;
    sizeGuide?: any; // To show tooltips if available
}

export default function VisualVariantSelector({
    attributes,
    variations,
    selectedValues,
    onChange,
    sizeGuide
}: VisualVariantSelectorProps) {

    // Helper to check if a value is selectable given current other selections
    const isValueAvailable = (attrName: string, value: string) => {
        return variations.some(v => {
            if (!v.available) return false;
            if (v.combination[attrName] !== value) return false;

            // Check if matches other ALREADY selected values (excluding this attribute)
            return Object.entries(selectedValues).every(([sName, sVal]) => {
                if (sName === attrName) return true;
                return v.combination[sName] === sVal;
            });
        });
    };

    // Determine which attributes are relevant for the current selection path
    // This handles the hierarchical "sparse" tree: Red -> Size, Blue -> Material
    const visibleAttributes = useMemo(() => {
        return attributes.filter(attr => {
            // Root attributes (usually the first one) are always visible
            // In a tree, the first attribute is the common root
            if (attributes.indexOf(attr) === 0) return true;

            // For other attributes, only show if they exist in at least one variation
            // that matches the CURRENT selection so far.
            return variations.some(v => {
                const matchesSelection = Object.entries(selectedValues).every(([sName, sVal]) => {
                    // We only check attributes that appear BEFORE this one in the list
                    // or are already selected.
                    if (sName === attr.name) return true;
                    if (!v.combination[sName]) return true; // if variation doesn't have it, it's a mismatch if it's selected
                    return v.combination[sName] === sVal;
                });

                // Crucially: variation must HAVE this attribute
                return matchesSelection && v.combination[attr.name] !== undefined;
            });
        });
    }, [attributes, variations, selectedValues]);

    return (
        <div className="space-y-6">
            {visibleAttributes.map((attr) => (
                <div key={attr.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {attr.name}
                            </label>
                            {attr.name.toLowerCase().includes('size') && sizeGuide && (
                                <SizeGuideModal
                                    config={sizeGuide}
                                    trigger={
                                        <button className="text-[10px] flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold uppercase tracking-tighter bg-orange-50 px-2 py-0.5 rounded-full transition-colors">
                                            <Ruler size={10} />
                                            Size Guide
                                        </button>
                                    }
                                />
                            )}
                        </div>
                        {selectedValues[attr.name] && (
                            <span className="text-xs text-orange-600 font-medium">
                                Selected: {selectedValues[attr.name]}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {attr.options.map((opt) => {
                            const isSelected = selectedValues[attr.name] === opt.name;
                            const isAvailable = isValueAvailable(attr.name, opt.name);

                            // Find measurement for tooltip if it's a size
                            const measurement = sizeGuide?.measurements?.find((m: any) => m.size === opt.name);

                            const content = (
                                <button
                                    key={opt.name}
                                    disabled={!isAvailable}
                                    onClick={() => onChange(attr.name, opt.name)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                                        isSelected
                                            ? "border-orange-600 bg-orange-50 text-orange-600 shadow-sm"
                                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300",
                                        !isAvailable && "opacity-30 cursor-not-allowed border-dashed grayscale"
                                    )}
                                >
                                    {opt.name}
                                    {opt.priceModifier !== 0 && (
                                        <span className="ml-1.5 text-[10px] opacity-70">
                                            ({opt.priceModifier > 0 ? '+' : ''}£{opt.priceModifier})
                                        </span>
                                    )}
                                </button>
                            );

                            if (measurement) {
                                return (
                                    <TooltipProvider key={opt.name}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {content}
                                            </TooltipTrigger>
                                            <TooltipContent className="p-3 bg-white dark:bg-gray-900 border border-orange-100 shadow-xl rounded-lg">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-orange-600 uppercase">Approx. Measurements</p>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                        {Object.entries(measurement)
                                                            .filter(([key]) => key !== 'id' && key !== 'size')
                                                            .map(([key, val]) => (
                                                                <div key={key} className="flex justify-between gap-4">
                                                                    <span className="text-[10px] text-gray-500 capitalize">{key}:</span>
                                                                    <span className="text-[10px] font-mono font-bold">{val as string}</span>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            }

                            return content;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
