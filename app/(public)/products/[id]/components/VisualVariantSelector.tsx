'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProductAttribute, ProductVariation } from '@/service/store/products/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Ruler, Check } from 'lucide-react';
import SizeGuideModal from './SizeGuideModal';

interface VisualVariantSelectorProps {
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    selectedValues: Record<string, string>;
    onChange: (attributeName: string, value: string) => void;
    sizeGuide?: any;
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
        if (variations.length === 0) return true; // Fallback for legacy
        return variations.some(v => {
            if (!v.available) return false;
            if (v.combination[attrName] !== value) return false;

            // Check if matches other ALREADY selected values (excluding this attribute)
            return Object.entries(selectedValues).every(([sName, sVal]) => {
                if (sName === attrName) return true;
                if (!sVal) return true;
                if (v.combination[sName] === undefined) return false; // Sparse tree: if selected but variation doesn't have it, it's a mismatch
                return v.combination[sName] === sVal;
            });
        });
    };

    // Determine which attributes are relevant for the current selection path
    const visibleAttributes = useMemo(() => {
        if (variations.length === 0) return attributes; // Fallback for legacy

        return attributes.filter(attr => {
            // Root attributes are always visible
            if (attributes.indexOf(attr) === 0) return true;

            // Only show if there's a variation that matches CURRENT selection path AND has this attribute
            return variations.some(v => {
                const matchesSelection = Object.entries(selectedValues).every(([sName, sVal]) => {
                    if (sName === attr.name || !sVal) return true;
                    // If variation doesn't have a selected attribute, it's not a match for that path
                    if (v.combination[sName] === undefined) return false;
                    return v.combination[sName] === sVal;
                });

                return matchesSelection && v.combination[attr.name] !== undefined;
            });
        });
    }, [attributes, variations, selectedValues]);

    const getStyle = (attrName: string) => {
        const lower = attrName.toLowerCase();
        if (lower.includes('color') || lower.includes('colour')) return 'color';
        return 'pill';
    };

    const getColorCode = (name: string) => {
        const div = document.createElement('div');
        div.style.color = name;
        return div.style.color !== '' ? name : '#eee';
    };

    return (
        <div className="space-y-6">
            {visibleAttributes.map((attr) => {
                const style = getStyle(attr.name);

                return (
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
                                    {selectedValues[attr.name]}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attr.options.map((opt) => {
                                const isSelected = selectedValues[attr.name] === opt.name;
                                const isAvailable = isValueAvailable(attr.name, opt.name);

                                const measurement = sizeGuide?.measurements?.find((m: any) => m.size === opt.name);
                                const conversion = sizeGuide?.conversionMap?.[opt.name];

                                const content = (
                                    <button
                                        key={opt.name}
                                        disabled={!isAvailable}
                                        onClick={() => onChange(attr.name, opt.name)}
                                        className={cn(
                                            "relative transition-all duration-200",
                                            !isAvailable && "opacity-30 cursor-not-allowed grayscale",

                                            style === 'color' && "w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm hover:scale-105",
                                            style === 'color' && isSelected ? "border-orange-600 scale-110" : "border-gray-200",

                                            style === 'pill' && "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                                            style === 'pill' && isSelected
                                                ? "border-orange-600 bg-orange-50 text-orange-600 shadow-sm"
                                                : "border-gray-100 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300",
                                        )}
                                        style={style === 'color' ? { backgroundColor: getColorCode(opt.name) } : {}}
                                    >
                                        {style === 'color' && isSelected && (
                                            <Check className={cn("w-5 h-5 drop-shadow-md", ['white', 'yellow', 'cream', 'beige'].includes(opt.name.toLowerCase()) ? "text-black" : "text-white")} />
                                        )}

                                        {style === 'pill' && (
                                            <div className="flex flex-col items-center">
                                                <span className="flex items-center">
                                                    {opt.name}
                                                    {opt.priceModifier !== 0 && (
                                                        <span className="text-[10px] ml-1 opacity-70">
                                                            ({opt.priceModifier > 0 ? '+' : ''}£{opt.priceModifier})
                                                        </span>
                                                    )}
                                                </span>
                                                {conversion && (
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">
                                                        {conversion}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );

                                if (measurement && isAvailable) {
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
                                                                .filter(([key]) => key !== 'id' && key !== 'size' && key !== 'undefined' && measurement[key])
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
                );
            })}
        </div>
    );
}
