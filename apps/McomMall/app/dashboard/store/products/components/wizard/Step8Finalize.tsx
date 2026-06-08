import React, { useState } from 'react';
import {
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
    isPending?: boolean;
}

export default function Step8Finalize({ formData, updateFormData, onBack, onPublish, onSaveDraft, isPending }: Step8Props) {
    // attributes: { name: string, options: { name: string, priceModifier: number }[] }[]
    const attributes = formData.attributes || [];
    const variations = formData.variations || [];

    const handlePublish = () => {
        onPublish();
    };

    const updateVariation = (index: number, newData: any) => {
        const newVariations = [...variations];
        newVariations[index] = { ...newVariations[index], ...newData };
        updateFormData({ variations: newVariations });
    };

    const removeVariation = (index: number) => {
        const newVariations = variations.filter((_: any, i: number) => i !== index);
        updateFormData({ variations: newVariations });
    };

    // Helper to group variations by the first attribute's value
    const firstAttributeName = attributes[0]?.name || '';
    const groupedVariations: Record<string, { originalIndex: number, variation: any }[]> = {};

    if (firstAttributeName) {
        variations.forEach((v: any, index: number) => {
            const groupKey = v.combination[firstAttributeName] || 'Unassigned';
            if (!groupedVariations[groupKey]) groupedVariations[groupKey] = [];
            groupedVariations[groupKey].push({ originalIndex: index, variation: v });
        });
    }

    return (
        <div className="relative font-display">
            <div className="flex flex-col gap-8 pb-10">
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
                        {/* Variations Table */}
                        <div className="bg-white dark:bg-[#1a120b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#3d2e20] overflow-hidden">
                            <div className="px-6 py-5 border-b border-[#e5e7eb] dark:border-[#3d2e20] flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold flex items-center gap-2">
                                        Variations
                                        <InfoIcon tooltip="Adjust pricing and inventory per variant before completion." />
                                    </h3>
                                    <p className="text-sm text-[#9c7349]">Configure specific details for each combination.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-[#f8f7f5] dark:bg-[#2a1f16] text-[#9c7349] text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 font-semibold w-16">Image</th>
                                            <th className="px-6 py-3 font-semibold">Variant</th>
                                            <th className="px-6 py-3 font-semibold w-40">Price (£)</th>
                                            <th className="px-6 py-3 font-semibold">SKU</th>
                                            <th className="px-6 py-3 font-semibold w-24">Stock</th>
                                            <th className="px-6 py-3 font-semibold w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#3d2e20]">
                                        {Object.entries(groupedVariations).map(([groupValue, items]) => (
                                            <React.Fragment key={groupValue}>
                                                <tr className="bg-orange-50/30 dark:bg-orange-950/20">
                                                    <td colSpan={6} className="px-6 py-3 text-sm font-black text-orange-600 uppercase tracking-tighter">
                                                        {firstAttributeName}: {groupValue}
                                                    </td>
                                                </tr>
                                                {items.map(({ originalIndex, variation }) => {
                                                    const label = Object.entries(variation.combination)
                                                        .filter(([k]) => k !== firstAttributeName)
                                                        .map(([k, val]) => `${k}: ${val}`)
                                                        .join(' / ') || 'Base';

                                                    return (
                                                        <VariantTableRow
                                                            key={originalIndex}
                                                            label={label}
                                                            variation={variation}
                                                            onUpdate={(data: any) => updateVariation(originalIndex, data)}
                                                            onDelete={() => removeVariation(originalIndex)}
                                                            readOnlyPricing={!formData.useVariantPricing}
                                                        />
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                        {variations.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-[#9c7349] italic">
                                                    No variations generated.
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
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.enableReviews}
                                            onChange={(e) => updateFormData({ enableReviews: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f48c25]"></div>
                                    </label>
                                </div>

                                {/* ─── Promotion & Visibility Flags ─── */}
                                <div className="rounded-lg border border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20 overflow-hidden">
                                    <div className="px-4 pt-4 pb-2">
                                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Storefront & Platform Settings</p>
                                        <p className="text-xs text-[#9c7349] mt-0.5">Control where this product appears across the platform.</p>
                                    </div>
                                    <div className="divide-y divide-amber-100 dark:divide-amber-900">
                                        {/* Featured */}
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <p className="text-sm font-bold text-[#1c140d] dark:text-white">⭐ Featured Product</p>
                                                <p className="text-xs text-[#9c7349]">Pin at the top of your public storefront page.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!!formData.isFeatured}
                                                    onChange={(e) => updateFormData({ isFeatured: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                            </label>
                                        </div>
                                        {/* Rotator Eligible */}
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <p className="text-sm font-bold text-[#1c140d] dark:text-white">🔄 Local Mall Rotator</p>
                                                <p className="text-xs text-[#9c7349]">Show in the Borough carousel and Local Mall discovery feed.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!!formData.isRotatorEligible}
                                                    onChange={(e) => updateFormData({ isRotatorEligible: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                            </label>
                                        </div>
                                        {/* Promotion Eligible */}
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <p className="text-sm font-bold text-[#1c140d] dark:text-white">📣 Include in Campaigns</p>
                                                <p className="text-xs text-[#9c7349]">Allow this product to be used in platform deals and promotions.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!!formData.isPromotionEligible}
                                                    onChange={(e) => updateFormData({ isPromotionEligible: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 p-4 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] bg-[#f8f7f5] dark:bg-[#2a1f16]">
                                    <label className="font-bold text-[#1c140d] dark:text-white" htmlFor="purchaseNote">Purchase Note</label>
                                    <textarea
                                        id="purchaseNote"
                                        className="w-full min-h-[80px] p-3 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-sm outline-none focus:ring-1 focus:ring-[#f48c25]"
                                        placeholder="Note shown to customers after purchase..."
                                        value={formData.purchaseNote || ''}
                                        onChange={(e) => updateFormData({ purchaseNote: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 p-4 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] bg-[#f8f7f5] dark:bg-[#2a1f16]">
                                    <label className="font-bold text-[#1c140d] dark:text-white" htmlFor="visibility">Visibility</label>
                                    <select
                                        id="visibility"
                                        className="w-full p-3 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-sm outline-none focus:ring-1 focus:ring-[#f48c25]"
                                        value={formData.visibility || 'public'}
                                        onChange={(e) => updateFormData({ visibility: e.target.value })}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="password">Password Protected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="sticky top-6 rounded-xl bg-white dark:bg-[#1a120b] border border-[#e5e7eb] dark:border-[#3d2e20] p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[#1c140d] dark:text-white mb-4">Product Status</h3>
                            <div className="space-y-3">
                                {['published', 'draft', 'scheduled'].map((status) => (
                                    <label key={status} className="flex items-center p-3 rounded-lg border border-[#e5e7eb] dark:border-[#3d2e20] cursor-pointer hover:bg-[#f8f7f5] dark:hover:bg-[#2a1f16] transition-colors">
                                        <input
                                            type="radio"
                                            name="productStatus"
                                            className="w-4 h-4 text-[#f48c25] focus:ring-[#f48c25] border-gray-300"
                                            checked={formData.productStatus === status}
                                            onChange={() => updateFormData({ productStatus: status })}
                                        />
                                        <span className="ml-3 text-sm font-medium text-[#1c140d] dark:text-white capitalize">{status}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={handlePublish}
                                disabled={isPending}
                                className="w-full mt-6 bg-[#f48c25] hover:bg-orange-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? <UploadCloud className="w-6 h-6 animate-bounce" /> : <CheckCircle2 className="w-5 h-5" />}
                                {isPending ? 'Processing...' : 'Complete & Save'}
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
                        Back to Shipping
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPending}
                        className="bg-[#f48c25] hover:bg-orange-600 text-white font-bold text-sm px-10 py-3 rounded-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Processing...' : 'Finish Setup'}
                        <CheckCircle2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}


function VariantTableRow({ label, variation, onUpdate, onDelete, readOnlyPricing }: any) {
    return (
        <tr className="group hover:bg-[#f8f7f5]/50 dark:hover:bg-[#2a1f16]/50 transition-colors">
            <td className="px-6 py-4">
                <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                    {variation.image ? (
                        <img src={variation.image} className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlus className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="text-[#1c140d] dark:text-white font-bold text-xs">{label}</p>
            </td>
            <td className="px-6 py-4">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">£</span>
                    <input
                        className="w-full pl-6 pr-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white focus:ring-1 focus:ring-[#f48c25] disabled:opacity-50"
                        type="number"
                        value={variation.price}
                        onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                        disabled={readOnlyPricing}
                    />
                </div>
            </td>
            <td className="px-6 py-4">
                <input
                    className="w-full px-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white font-mono uppercase disabled:opacity-50"
                    type="text"
                    value={variation.sku || ''}
                    onChange={(e) => onUpdate({ sku: e.target.value.toUpperCase() })}
                    disabled={readOnlyPricing}
                />
            </td>
            <td className="px-6 py-4">
                <input
                    className="w-full px-2 py-1.5 text-xs rounded border border-[#e5e7eb] dark:border-[#3d2e20] bg-white dark:bg-[#1a120b] text-[#1c140d] dark:text-white disabled:opacity-50"
                    type="number"
                    value={variation.stock}
                    onChange={(e) => onUpdate({ stock: parseInt(e.target.value) || 0 })}
                    disabled={readOnlyPricing}
                />
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}