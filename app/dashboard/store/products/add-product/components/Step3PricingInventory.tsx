import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Package, Download, Terminal, Info, ChevronDown, Layers, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import VariantManager from '../../components/VariantManager';
import SizeGuideBuilder from '../../components/SizeGuideBuilder';
import { useForm, FormProvider } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Step3Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step3PricingInventory({ formData, updateFormData, onNext, onBack }: Step3Props) {
    // Initialize RHF for VariantManager compatibility
    const methods = useForm({
        defaultValues: {
            attributes: formData.attributes || [],
            variations: formData.variations || [],
        }
    });

    const hasVariants = formData.hasVariants || false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        updateFormData({ [e.target.id]: e.target.value });
    };

    const handleRadioChange = (name: string, value: string) => {
        updateFormData({ [name]: value });
    };

    const toggleVariants = (enabled: boolean) => {
        updateFormData({ hasVariants: enabled });
        if (enabled) {
            // Auto-enable variant pricing when variants are enabled
            updateFormData({ useVariantPricing: true });
        } else {
            // Clear variants in parent
            updateFormData({ attributes: [], variations: [] });
            methods.reset({ attributes: [], variations: [] });
        }
    };

    // Effect to sync global prices to variants when global override is active
    useEffect(() => {
        const useVariantPricing = formData.useVariantPricing ?? true;

        if (!useVariantPricing && hasVariants && formData.variations?.length > 0) {
            const updatedVariations = formData.variations.map((v: any) => ({
                ...v,
                price: parseFloat(formData.regular_price) || 0,
                salePrice: parseFloat(formData.sale_price) || undefined,
                stock: parseInt(formData.quantity) || 0,
                sku: formData.sku ? `${formData.sku}-${Object.values(v.combination).join('-').toUpperCase()}` : v.sku
            }));

            // Only update if there are actual changes to avoid infinite loops
            const isChanged = JSON.stringify(updatedVariations) !== JSON.stringify(formData.variations);
            if (isChanged) {
                updateFormData({ variations: updatedVariations });
            }
        }
    }, [formData.regular_price, formData.sale_price, formData.quantity, formData.sku, formData.useVariantPricing, hasVariants]);

    return (
        <FormProvider {...methods}>
            <div className="flex flex-col gap-6 pb-32 md:pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 px-2 md:px-0">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[#1c140d] dark:text-white text-2xl md:text-4xl font-black leading-tight">Pricing & Inventory</h1>
                        <p className="text-[#9c7349] dark:text-[#cba885] text-sm md:text-base">Define pricing, stock, and shipping parameters.</p>
                    </div>

                    {/* Responsive Progress Bar */}
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#1c140d] dark:text-white">
                            <span>Step 3 of 4</span>
                            <span>75%</span>
                        </div>
                        <div className="rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] h-1.5 md:h-2 overflow-hidden">
                            <div className="h-full bg-[#f48c25] rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
                    {/* Product Type Section */}
                    <section className="flex flex-col gap-4 px-2 md:px-0">
                        <h3 className="text-[#1c140d] dark:text-white text-lg font-bold flex items-center gap-2">
                            Product Type
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'physical', label: 'Physical', desc: 'Tangible items', icon: <Package size={20} /> },
                                { id: 'downloadable', label: 'Digital', desc: 'Files & Media', icon: <Download size={20} /> },
                                { id: 'virtual', label: 'Service', desc: 'Memberships', icon: <Terminal size={20} /> }
                            ].map((type) => (
                                <label key={type.id} className="cursor-pointer relative group">
                                    <input
                                        className="peer sr-only"
                                        name="product_type"
                                        type="radio"
                                        value={type.id}
                                        checked={formData.product_type === type.id}
                                        onChange={() => handleRadioChange('product_type', type.id)}
                                    />
                                    <div className="h-full flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-3 rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-4 transition-all peer-checked:border-[#f48c25] peer-checked:bg-[#fff8f1] dark:peer-checked:bg-[#f48c25]/10">
                                        <div className="flex-shrink-0 size-10 rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] flex items-center justify-center text-[#1c140d] dark:text-white peer-checked:text-[#f48c25]">
                                            {type.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[#1c140d] dark:text-white font-bold text-sm md:text-base">{type.label}</p>
                                            <p className="text-[#9c7349] dark:text-[#cba885] text-xs">{type.desc}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Variant Toggle Section */}
                    <section className="flex flex-col gap-4 px-2 md:px-0 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Layers className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-[#1c140d] dark:text-white font-bold text-base flex items-center gap-2">
                                        Product Options
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Create variations if your product comes in different options (e.g., sizes, colors).</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </h3>
                                    <p className="text-[#1c140d] dark:text-white font-black text-xs">Does this product have variants or attributes?</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#9c7349]">No</span>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={hasVariants}
                                        onChange={(e) => toggleVariants(e.target.checked)}
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#f48c25]/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-[#f48c25] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                                </label>
                                <span className="text-xs font-bold text-[#f48c25]">Yes</span>
                            </div>
                        </div>
                    </section>

                    {hasVariants ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            {/* Variant Manager */}
                            <section className="mx-2 md:mx-0 bg-white dark:bg-[#2d241b] border border-[#e8dbce] dark:border-[#4a3b2e] rounded-xl p-6 shadow-sm">
                                <VariantManager
                                    attributes={formData.attributes || []}
                                    variations={formData.variations || []}
                                    onAttributesChange={(attrs) => updateFormData({ attributes: attrs })}
                                    onVariationsChange={(vars) => updateFormData({ variations: vars })}
                                    readOnlyPricing={!(formData.useVariantPricing ?? true)}
                                />
                            </section>

                            <div className="mx-2 md:mx-0 pt-4 border-t border-orange-200/50 dark:border-orange-800/30 flex items-center justify-between bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl">
                                <div>
                                    <h4 className="text-[#1c140d] dark:text-white font-bold text-sm flex items-center gap-2">
                                        Use Variant Pricing & Inventory
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Toggle On: Manage price/stock per variant.<br />Toggle Off: Apply global price/stock to all variants.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </h4>
                                    <p className="text-[#9c7349] dark:text-[#cba885] text-[10px]">Enable to set unique prices/stock for each variant. Disable to use global values for all.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-[#9c7349]">No</span>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.useVariantPricing ?? true}
                                            onChange={(e) => updateFormData({ useVariantPricing: e.target.checked })}
                                        />
                                        <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#f48c25]/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-[#f48c25] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </label>
                                    <span className="text-xs font-bold text-[#f48c25]">Yes</span>
                                </div>
                            </div>

                            {/* Size Guide (Conditional - Show only if "Size" variant exists) */}
                            {formData.attributes?.some((a: any) => a.name.toLowerCase() === 'size') && (
                                <section className="mx-2 md:mx-0 animate-in fade-in zoom-in-95 duration-500">
                                    <SizeGuideBuilder
                                        value={formData.sizeGuide}
                                        onChange={(val) => updateFormData({ sizeGuide: val })}
                                        detectedSizes={formData.attributes?.find((a: any) => a.name.toLowerCase() === 'size')?.options.map((o: any) => o.name) || []}
                                        gender={formData.gender}
                                    />
                                </section>
                            )}

                            {/* Base Price Fallback hint */}
                            <p className="text-xs text-gray-500 italic px-2">
                                * Set base price and default stock for all variations below.
                            </p>
                        </div>
                    ) : null}

                    <section className={cn(
                        "flex flex-col gap-4 px-2 md:px-0 transition-all duration-300",
                        (hasVariants && (formData.useVariantPricing ?? true)) && "opacity-50 pointer-events-none scale-95 origin-top"
                    )}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">
                                {(hasVariants && (formData.useVariantPricing ?? true)) ? 'Default Values (Used for new variants)' : 'Pricing & Inventory'}
                            </h3>
                            {hasVariants && (formData.useVariantPricing ?? true) && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Variant Control Active
                                </Badge>
                            )}
                            {hasVariants && !(formData.useVariantPricing ?? true) && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Global Override Active
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="regular_price">Regular Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9c7349] font-bold">£</span>
                                    <input
                                        className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-3.5 pl-10 pr-4 text-[#1c140d] dark:text-white focus:ring-2 focus:ring-[#f48c25]/20 focus:border-[#f48c25] outline-none transition-all"
                                        id="regular_price"
                                        placeholder="0.00"
                                        type="number"
                                        value={formData.regular_price || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="sale_price">Sale Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9c7349] font-bold">£</span>
                                    <input
                                        className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-3.5 pl-10 pr-4 text-[#1c140d] dark:text-white focus:ring-2 focus:ring-[#f48c25]/20 focus:border-[#f48c25] outline-none transition-all"
                                        id="sale_price"
                                        placeholder="0.00"
                                        type="number"
                                        value={formData.sale_price || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="sku">SKU</label>
                                <input
                                    className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-3.5 px-4 text-[#1c140d] dark:text-white uppercase outline-none focus:border-[#f48c25]"
                                    id="sku"
                                    placeholder="E.g. TEE-001"
                                    type="text"
                                    value={formData.sku || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="quantity">Quantity Available</label>
                                <input
                                    className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-3.5 px-4 text-[#1c140d] dark:text-white outline-none focus:border-[#f48c25]"
                                    id="quantity"
                                    type="number"
                                    value={formData.quantity || 100}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 max-w-xs">
                            <div className="flex items-center justify-between">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="lowStockThreshold">Low Stock Alert Threshold</label>
                                <Info size={14} className="text-[#9c7349]" />
                            </div>
                            <input
                                className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-3.5 px-4 text-[#1c140d] dark:text-white outline-none focus:border-[#f48c25]"
                                id="lowStockThreshold"
                                type="number"
                                placeholder="e.g. 5"
                                value={formData.lowStockThreshold || ''}
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-[#9c7349]">System will notify you when stock falls below this level.</p>
                        </div>
                    </section>

                    {/* Conditional Shipping Section */}
                    {formData.product_type === 'physical' && (
                        (hasVariants && (formData.useVariantPricing ?? true)) ? (
                            <section className="flex flex-col gap-4 px-2 md:px-0">
                                <div className="flex items-center justify-between border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Shipping Details</h3>
                                    <span className="text-[10px] font-bold text-[#f48c25] bg-[#f48c25]/10 px-2 py-0.5 rounded uppercase">Physical Only</span>
                                </div>
                                <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                                    <p className="text-sm text-[#1c140d] dark:text-white font-medium">Shipping details are managed per variant.</p>
                                    <p className="text-xs text-[#9c7349] dark:text-[#cba885] mt-1">
                                        Since you have enabled variant pricing & inventory, please set weight and dimensions for each variation in the table above.
                                    </p>
                                </div>
                            </section>
                        ) : (
                            <section className="flex flex-col gap-4 px-2 md:px-0">
                                <div className="flex items-center justify-between border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Shipping Details</h3>
                                    <span className="text-[10px] font-bold text-[#f48c25] bg-[#f48c25]/10 px-2 py-0.5 rounded uppercase">Physical Only</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#1c140d] dark:text-white text-sm font-bold">Weight (kg)</label>
                                        <input className="w-full rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] py-3 px-4 bg-white dark:bg-[#2d241b] outline-none" placeholder="0.0" type="number" id="weight" value={formData.weight || ''} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#1c140d] dark:text-white text-sm font-bold">Dimensions (L x W x H cm)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] py-3 bg-white dark:bg-[#2d241b] text-center outline-none" placeholder="L" type="number" />
                                            <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] py-3 bg-white dark:bg-[#2d241b] text-center outline-none" placeholder="W" type="number" />
                                            <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] py-3 bg-white dark:bg-[#2d241b] text-center outline-none" placeholder="H" type="number" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                    )}

                    {/* Sticky Footer for Mobile */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1c140d] border-t border-[#e8dbce] dark:border-[#4a3b2e] md:relative md:bg-transparent md:border-none md:p-0 md:mt-8">
                        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                            <button
                                onClick={onBack}
                                className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#1c140d] dark:text-white font-bold text-sm flex items-center justify-center gap-2"
                                type="button"
                            >
                                <ArrowLeft size={18} />
                                <span className="hidden sm:inline">Previous Step</span>
                                <span className="sm:hidden">Back</span>
                            </button>
                            <button
                                className="flex-2 md:flex-none px-8 py-3.5 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 flex items-center justify-center gap-2"
                                type="submit"
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
}