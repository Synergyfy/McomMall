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
    selectedVariants: Record<string, string[]>;
    onChange: (attributeName: string, optionName: string) => void;
    isOptionAvailable: (attributeName: string, optionName: string) => boolean;
    getOptionPrice?: (attributeName: string, optionValue: string) => number | null;
    variations?: any[]; // Pass variations to find images
    baseMedia?: string[]; // Fallback images
    sizeGuide?: SizeGuideConfig;
    productGender?: string;
}

export default function VisualVariantSelector({
    attributes,
    selectedVariants,
    onChange,
    isOptionAvailable,
    getOptionPrice,
    variations,
    baseMedia,
    sizeGuide,
    productGender
}: VisualVariantSelectorProps) {

    // Helper to determine visual style
    const getStyle = (attrName: string) => {
        const lower = attrName.toLowerCase();
        if (lower.includes('color') || lower.includes('colour')) return 'color';
        return 'pill';
    };

    // Helper to find an image for an option (e.g., first variation image for a color)
    const getOptionImage = (attrName: string, optionName: string) => {
        if (!variations) return null;
        const matchingVariation = variations.find(v => {
            const val = v.combination[attrName] || v.combination[attrName.toLowerCase()];
            return val?.toLowerCase() === optionName.toLowerCase() && v.image;
        });
        return matchingVariation?.image || null;
    };

    // Helper to get color code
    const getColorCode = (name: string) => {
        const colors: Record<string, string> = {
            'white': '#ffffff', 'silver': '#c0c0c0', 'gold': '#ffd700', 'black': '#000000',
            'red': '#ff0000', 'blue': '#0000ff', 'green': '#008000', 'gray': '#808080',
            'navy': '#000080', 'pink': '#ffc0cb', 'purple': '#800080', 'orange': '#ffa500'
        };
        if (colors[name.toLowerCase()]) return colors[name.toLowerCase()];

        if (typeof document !== 'undefined') {
            const div = document.createElement('div');
            div.style.color = name.toLowerCase();
            return div.style.color !== '' ? name.toLowerCase() : '#eee';
        }
        return '#eee';
    };

    return (
        <div className="space-y-6">
            {attributes.map((attr) => {
                const style = getStyle(attr.name);
                const isAllSelected = attributes.every(a => selectedVariants[a.name]?.length > 0);

                return (
                    <div key={attr.name} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold uppercase text-gray-700 tracking-wide">
                                {attr.name}: <span className="text-gray-900 font-bold ml-1">{selectedVariants[attr.name]?.join(', ') || 'Select'}</span>
                            </Label>
                            {style === 'pill' && attr.name.toLowerCase().includes('size') && sizeGuide && (
                                <SizeGuideModal config={sizeGuide} productGender={productGender} />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attr.options.map((option) => {
                                const isSelected = selectedVariants[attr.name]?.includes(option.name);
                                const isAvailable = isOptionAvailable(attr.name, option.name);
                                const price = getOptionPrice ? getOptionPrice(attr.name, option.name) : null;
                                const optionImage = style === 'color' ? getOptionImage(attr.name, option.name) : null;

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
                                            "group relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500",
                                            !isAvailable && "opacity-30 cursor-not-allowed",

                                            // Color Style (Thumbnail or Swatch)
                                            style === 'color' && "w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center p-0.5 shadow-sm hover:scale-105",
                                            style === 'color' && isSelected ? "border-orange-600 ring-1 ring-orange-600 ring-offset-1" : "border-gray-100 hover:border-gray-300",

                                            // Pill Style
                                            style === 'pill' && "px-4 py-2 border rounded-md text-sm font-medium min-w-[4.5rem] text-center",
                                            style === 'pill' && isSelected ? "bg-orange-50 border-orange-600 text-orange-700 ring-1 ring-orange-600 ring-offset-1" : "bg-white border-gray-200 hover:border-gray-300 text-gray-700",
                                        )}
                                        title={`${option.name} ${price ? `(£${price.toFixed(2)})` : ''}`}
                                    >
                                        {/* Color Option: Image or Swatch */}
                                        {style === 'color' && (
                                            <div className="w-full h-full relative rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                                                {optionImage ? (
                                                    <img src={optionImage} alt={option.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full" style={{ backgroundColor: getColorCode(option.name) }} />
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-orange-600/10 flex items-center justify-center">
                                                        <Check className={cn("w-6 h-6", ['white', 'yellow', 'cream', 'beige', 'gold', 'silver', 'pink'].includes(option.name.toLowerCase()) ? "text-gray-900" : "text-white")} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Pill Text & Price Info */}
                                        {style === 'pill' && (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="whitespace-nowrap font-semibold leading-tight">{option.name}</span>
                                                {price !== null && (
                                                    <span className={cn(
                                                        "text-[10px] font-bold leading-none",
                                                        isSelected ? "text-orange-700" : "text-gray-500 group-hover:text-orange-600"
                                                    )}>
                                                        {isAllSelected || isSelected ? `£${price.toFixed(2)}` : `From £${price.toFixed(2)}`}
                                                    </span>
                                                )}
                                                {conversion && (
                                                    <span className="text-[9px] uppercase font-bold text-gray-400">
                                                        {conversion}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Tooltip-like label for color on hover/selection */}
                                        {style === 'color' && (isSelected || !isAvailable) && (
                                            <div className={cn(
                                                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-tighter transition-opacity",
                                                !isAvailable ? "text-red-500" : "text-orange-600"
                                            )}>
                                                {isAvailable ? (price ? `£${price.toFixed(2)}` : option.name) : 'Out of Stock'}
                                            </div>
                                        )}

                                        {/* Slash-out for unavailable items */}
                                        {!isAvailable && (
                                            <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-gray-400 -rotate-45 pointer-events-none opacity-60" />
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

                                return <div key={option.name} className={cn(style === 'color' && "mb-3")}>{content}</div>;
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
