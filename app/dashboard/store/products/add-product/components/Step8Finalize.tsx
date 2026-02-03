import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    X,
    Trash2,
    ImagePlus,
    Settings2,
    CheckCircle2,
    UploadCloud,
    ArrowLeft
} from 'lucide-react';
import InfoIcon from '@/components/ui/lib/Tooltip';

interface Step8Props {
    formData: any;
    updateFormData: (data: any) => void;
    onBack: () => void;
    onPublish: () => void;
    onSaveDraft: () => void;
}

interface AttributeValue {
    name: string;
    image?: string | null;
}

interface Attribute {
    id: string;
    name: string;
    values: AttributeValue[];
}

export default function Step8Finalize({ formData, updateFormData, onBack, onPublish, onSaveDraft }: Step8Props) {
    const [showSuccess, setShowSuccess] = useState(false);

    // attributes: { name: string, options: { name: string, priceModifier: number }[] }[]
    const attributes = formData.attributes || [];
    const variations = formData.variations || [];

    const handlePublish = () => {
        setShowSuccess(true);
        setTimeout(() => {
            onPublish();
        }, 2000);
    };

    // Helper to group variations by the first attribute's value
    const firstAttributeName = attributes[0]?.name || '';
    const groupedVariations: Record<string, any[]> = {};

    if (firstAttributeName) {
        variations.forEach((v: any) => {
            const groupKey = v.combination[firstAttributeName] || 'Unassigned';
            if (!groupedVariations[groupKey]) groupedVariations[groupKey] = [];
            groupedVariations[groupKey].push(v);
        });
    }

    return (
        <div className="relative font-display">
            <div className="flex flex-col gap-8">
                {/* Progress Header */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#9c7349] uppercase tracking-wider">Step 8 of 8</h2>
                        <span className="text-sm font-medium text-[#1c140d] dark:text-white">Finalize & Variants</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-[#3d2e20] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f48c25] rounded-full transition-all duration-500 ease-out" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-[#1c140d] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Product Variants</h1>
                    <p className="text-[#9c7349] text-base font-normal leading-normal">Manage attributes, combinations, and specific pricing rules for this product.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Attributes Section */}
                        <div className="bg-white dark:bg-[#1a120b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#3d2e20] p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Attributes</h3>
                                    <p className="text-sm text-[#9c7349]">Define the options available for this product.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                {attributes.map((attr: any, idx: number) => {
                                    // Extract unique values from variations if options are empty
                                    let options = attr.options || [];
                                    if (options.length === 0) {
                                        const uniqueVals = Array.from(new Set(variations.map((v: any) => v.combination[attr.name]).filter(Boolean)));
                                        options = uniqueVals.map(v => ({ name: v }));
                                    }

                                    return (
                                        <div key={idx} className="p-4 rounded-lg bg-[#f8f7f5] dark:bg-[#2a1f16] border border-[#e5e7eb] dark:border-[#3d2e20]">
                                            <p className="font-bold">{attr.name}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {options.map((opt: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-[#3d2e20] text-sm">
                                                        {opt.name}
                                                    </span>
                                                ))}
                                                {options.length === 0 && <span className="text-xs text-gray-400 italic">No values selected</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {attributes.length === 0 && <p className="text-sm text-[#9c7349] italic">No attributes defined.</p>}
                            </div>
                        </div>

                        {/* Variations Table */}
                        <div className="bg-white dark:bg-[#1a120b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#3d2e20] overflow-hidden">
                            <div className="px-6 py-5 border-b border-[#e5e7eb] dark:border-[#3d2e20] flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Variations</h3>
                                    <p className="text-sm text-[#9c7349]">Adjust pricing surcharges and inventory per variant.</p>
                                </div>
                                <button className="text-xs font-bold text-[#f48c25] border border-[#f48c25]/20 bg-[#f48c25]/5 px-3 py-2 rounded-lg hover:bg-[#f48c25]/10 transition-colors">
                                    Bulk Edit
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-[#f8f7f5] dark:bg-[#2a1f16] text-[#9c7349] text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 font-semibold w-16">Image</th>
                                            <th className="px-6 py-3 font-semibold">Variant</th>
                                            <th className="px-6 py-3 font-semibold w-40">Price Surcharge</th>
                                            <th className="px-6 py-3 font-semibold">SKU</th>
                                            <th className="px-6 py-3 font-semibold w-24">Stock</th>
                                            <th className="px-6 py-3 font-semibold w-20">Reserved</th>
                                            <th className="px-6 py-3 font-semibold w-20">Sold</th>
                                            <th className="px-6 py-3 font-semibold w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#3d2e20]">
                                        {Object.entries(groupedVariations).map(([groupValue, items]) => (
                                            <React.Fragment key={groupValue}>
                                                <tr className="bg-orange-50/30 dark:bg-orange-950/20">
                                                    <td colSpan={8} className="px-6 py-3">
                                                        <span className="text-sm font-black text-orange-600 uppercase tracking-tighter flex items-center gap-2">
                                                            {firstAttributeName}: {groupValue}
                                                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] lowercase font-bold">{items.length} combinations</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                                {items.map((v: any, idx: number) => {
                                                    const otherCombos = Object.entries(v.combination)
                                                        .filter(([k]) => k !== firstAttributeName)
                                                        .map(([k, val]) => `${k}: ${val}`)
                                                        .join(' / ');

                                                    // Suggested SKU based on attribute order
                                                    const skuSuffix = attributes
                                                        .map((attr: any) => v.combination[attr.name])
                                                        .filter(Boolean)
                                                        .join('-')
                                                        .toUpperCase();

                                                    const suggestedSku = v.sku || (formData.sku ? `${formData.sku}-${skuSuffix}` : '');

                                                    return (
                                                        <VariantTableRow
                                                            key={`${groupValue}-${idx}`}
                                                            label={otherCombos || 'Base'}
                                                            sku={suggestedSku}
                                                            price={v.price}
                                                            quantity={v.stock}
                                                            reserved={v.reserved}
                                                            sold={v.sold}
                                                            image={v.image}
                                                        />
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                        {variations.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-[#9c7349] italic">
                                                    Add attributes and values to generate variations.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Other Options */}
                        <div className="rounded-xl bg-white dark:bg-[#1a120b] border border-[#e5e7eb] dark:border-[#3d2e20] p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-[#1c140d] dark:text-white flex items-center gap-2 mb-6">
                                <Settings2 className="text-[#f48c25] w-6 h-6" />
                                Other Options
                            </h2>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] bg-[#f8f7f5] dark:bg-[#2a1f16]">
                                    <div>
                                        <p className="font-bold text-[#1c140d] dark:text-white">Enable Reviews</p>
                                        <p className="text-sm text-[#9c7349]">Allow customers to leave reviews for this product.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f48c25]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="sticky top-6 rounded-xl bg-white dark:bg-[#1a120b] border border-[#e5e7eb] dark:border-[#3d2e20] p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[#1c140d] dark:text-white mb-4">Product Status</h3>
                            <div className="space-y-3">
                                {['Published', 'Draft', 'Scheduled'].map((status) => (
                                    <label key={status} className="flex items-center p-3 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] cursor-pointer hover:bg-[#f8f7f5] dark:hover:bg-[#2a1f16] transition-colors">
                                        <input type="radio" name="status" className="w-4 h-4 text-[#f48c25] focus:ring-[#f48c25] border-gray-300" defaultChecked={status === 'Published'} />
                                        <span className="ml-3 text-sm font-medium text-[#1c140d] dark:text-white">{status}</span>
                                    </label>
                                ))}
                            </div>
                            <button onClick={handlePublish} className="w-full mt-6 bg-[#f48c25] hover:bg-orange-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                {showSuccess ? <UploadCloud className="w-6 h-6 animate-bounce" /> : <CheckCircle2 className="w-5 h-5" />}
                                {showSuccess ? 'Publishing...' : 'Publish Product'}
                            </button>
                            <button onClick={onSaveDraft} className="w-full mt-3 text-[#9c7349] font-bold py-2 text-sm hover:text-[#f48c25] transition-colors">
                                Save as Draft
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#e5e7eb] dark:border-[#3d2e20] mt-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-[#1c140d] dark:text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a1f16] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Inventory
                    </button>
                    <button onClick={handlePublish} className="bg-[#f48c25] hover:bg-orange-600 text-white font-bold text-sm px-10 py-3 rounded-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center gap-2 transition-transform active:scale-95">
                        Complete Setup
                        <CheckCircle2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}


function VariantTableRow({ label, sku, price, quantity, reserved, sold, image }: any) {
    return (
        <tr className="group hover:bg-[#f8f7f5]/50 dark:hover:bg-[#2a1f16]/50 transition-colors">
            <td className="px-6 py-4">
                <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#f48c25] text-gray-400 hover:text-[#f48c25] transition-all overflow-hidden">
                    {image ? (
                        <img src={image} className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlus className="w-5 h-5" />
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="text-[#1c140d] dark:text-white font-bold text-xs">{label}</p>
            </td>
            <td className="px-6 py-4">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">£</span>
                    <input className="w-full pl-6 pr-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white focus:ring-1 focus:ring-[#f48c25]" type="text" defaultValue={price} />
                </div>
            </td>
            <td className="px-6 py-4">
                <input className="w-full px-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white font-mono uppercase" type="text" defaultValue={sku} />
            </td>
            <td className="px-6 py-4">
                <input className="w-full px-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white" type="number" defaultValue={quantity} />
            </td>
            <td className="px-6 py-4 text-xs text-[#9c7349]">
                {reserved || 0}
            </td>
            <td className="px-6 py-4 text-xs text-[#9c7349]">
                {sold || 0}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}