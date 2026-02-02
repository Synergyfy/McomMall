"use client";

import React from 'react';
import { ProductAttribute, SizeGuideConfig } from '@/service/store/products/types';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import SizeGuideModal from './SizeGuideModal';

interface VisualVariantSelectorProps {
    attributes: ProductAttribute[];
    selectedVariants: Record<string, string>;
    onChange: (attributeName: string, optionName: string) => void;
    isOptionAvailable: (attributeName: string, optionName: string) => boolean;
    sizeGuide?: SizeGuideConfig;
    productGender?: string;
}

export default function VisualVariantSelector({
    attributes,
    selectedVariants,
    onChange,
    isOptionAvailable,
    sizeGuide,
    productGender
}: VisualVariantSelectorProps) {

    // Helper to determine visual style
    const getStyle = (attrName: string) => {
        const lower = attrName.toLowerCase();
        if (lower.includes('color') || lower.includes('colour')) return 'color';
        return 'pill';
    };

    // Helper to get color code (very basic mapping, in real app this would come from DB/Admin)
    const getColorCode = (name: string) => {
        const div = document.createElement('div');
        div.style.color = name;
        return div.style.color !== '' ? name : '#eee'; // Fallback if invalid color name
    };

    return (
        <div className="space-y-6">
            {attributes.map((attr) => {
                const style = getStyle(attr.name);

                return (
                    <div key={attr.name} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold uppercase text-gray-700 tracking-wide">
                                {attr.name}: <span className="text-gray-900 font-bold ml-1">{selectedVariants[attr.name]}</span>
                            </Label>
                            {/* Show Size Guide Link only for Size attribute */}
                            {style === 'pill' && attr.name.toLowerCase().includes('size') && sizeGuide && (
                                <SizeGuideModal config={sizeGuide} productGender={productGender} />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attr.options.map((option) => {
                                const isSelected = selectedVariants[attr.name] === option.name;
                                const isAvailable = isOptionAvailable(attr.name, option.name);

                                // Size Guide Data for Tooltip
                                const sizeData = style === 'pill' && sizeGuide?.measurements.find(m => m.size === option.name);
                                const conversion = style === 'pill' && sizeGuide?.conversionMap?.[option.name];

                                const tooltipText = sizeData
                                    ? Object.entries(sizeData)
                                        .filter(([k, v]) => k !== 'size' && k !== 'undefined' && v)
                                        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                                        .join(' | ')
                                    : null;

                                const content = (
                                    <button
                                        type="button"
                                        onClick={() => onChange(attr.name, option.name)}
                                        disabled={!isAvailable}
                                        className={cn(
                                            "relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500",
                                            !isAvailable && "opacity-40 cursor-not-allowed decoration-slate-400 decoration-1 line-through",

                                            // Color Style
                                            style === 'color' && "w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm hover:scale-105",
                                            style === 'color' && isSelected ? "border-orange-600 scale-110" : "border-gray-200",

                                            // Pill Style
                                            style === 'pill' && "px-4 py-2 border rounded-md text-sm font-medium min-w-[3.5rem]",
                                            style === 'pill' && isSelected ? "bg-orange-50 border-orange-600 text-orange-700" : "bg-white border-gray-200 hover:border-gray-300 text-gray-700",
                                        )}
                                        title={option.name}
                                        style={style === 'color' ? { backgroundColor: getColorCode(option.name) } : {}}
                                    >
                                        {/* Color Checkmark */}
                                        {style === 'color' && isSelected && (
                                            <Check className={cn("w-5 h-5 drop-shadow-md", ['white', 'yellow', 'cream', 'beige'].includes(option.name.toLowerCase()) ? "text-black" : "text-white")} />
                                        )}

                                        {/* Pill Text */}
                                        {style === 'pill' && (
                                            <div className="flex flex-col items-center">
                                                <span className="flex items-center">
                                                    {option.name}
                                                    {option.priceModifier !== 0 && (
                                                        <span className="text-[10px] ml-1 opacity-70">
                                                            ({option.priceModifier > 0 ? '+' : ''}£{option.priceModifier})
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

                                if (tooltipText && isAvailable) {
                                    return (
                                        <TooltipProvider key={option.name}>
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    {content}
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="bg-gray-900 text-white border-none">
                                                    <p>{tooltipText}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                }

                                return <div key={option.name}>{content}</div>;
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
