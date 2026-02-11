'use client';

import { ProductAttribute, ProductVariation } from '@/app/admin/types/product-variant';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VisualVariantSelectorProps {
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    selectedVariants: Record<string, string>;
    onChange: (attributeName: string, value: string) => void;
    ignoreStock?: boolean;
}

export function VisualVariantSelector({
    attributes,
    variations,
    selectedVariants,
    onChange,
    ignoreStock = false,
}: VisualVariantSelectorProps) {

    // Helper to check availability
    const isOptionAvailable = (attributeName: string, optionName: string) => {
        // Construct a hypothetical selection combining current state + this option
        const potentialSelection = { ...selectedVariants, [attributeName]: optionName };

        // Find if any variation matches this subset of selection
        return variations.some(v => {
            // 1. Must match all keys in potentialSelection
            const matchesSelection = Object.entries(potentialSelection).every(([key, val]) => {
                return v.combination[key] === val;
            });

            // 2. Must be available and in stock (unless ignoring stock)
            // Note: If the selection is partial (e.g. only Color selected), we check if *any* Size exists for that Color.
            const stockCheck = ignoreStock ? true : v.stock > 0;
            return matchesSelection && v.available && stockCheck;
        });
    };

    return (
        <div className="space-y-6">
            {attributes.map((attr) => {
                const isColor = attr.name.toLowerCase().includes('color');

                return (
                    <div key={attr.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">{attr.name}</span>
                            {selectedVariants[attr.name] && (
                                <span className="text-xs text-slate-500">
                                    {selectedVariants[attr.name]}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attr.options.map((opt) => {
                                const isSelected = selectedVariants[attr.name] === opt.name;
                                const available = isOptionAvailable(attr.name, opt.name);

                                if (isColor) {
                                    return (
                                        <TooltipProvider key={opt.name}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() => available && onChange(attr.name, opt.name)}
                                                        disabled={!available}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative",
                                                            isSelected ? "border-slate-900 scale-110" : "border-transparent hover:scale-105",
                                                            !available && "opacity-50 cursor-not-allowed grayscale"
                                                        )}
                                                        style={{ backgroundColor: opt.name.toLowerCase().replace(' ', '') }} // Basic CSS color support
                                                    >
                                                        {isSelected && (
                                                            <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm">
                                                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                            </div>
                                                        )}
                                                        {!available && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-[120%] h-0.5 bg-slate-400 rotate-45" />
                                                            </div>
                                                        )}
                                                        {/* Fallback for non-css colors or just visual cue */}
                                                        <span className="sr-only">{opt.name}</span>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {opt.name} {!available && '(Out of Stock)'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                }

                                return (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        onClick={() => available && onChange(attr.name, opt.name)}
                                        disabled={!available}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                                            isSelected
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                                            !available && "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 decoration-slate-400" // line-through handled by SVG or logic
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {opt.name}
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
