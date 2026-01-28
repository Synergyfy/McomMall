import React, { useState } from 'react';

interface Step8Props {
    formData: any;
    updateFormData: (data: any) => void;
    onBack: () => void;
    onPublish: () => void;
    onSaveDraft: () => void;
}

export default function Step8Finalize({ formData, updateFormData, onBack, onPublish, onSaveDraft }: Step8Props) {
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePublish = () => {
        // In a real app, you would submit data first
        setShowSuccess(true);
        setTimeout(() => {
            onPublish();
        }, 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        updateFormData({ [e.target.name || e.target.id]: e.target.value });
    }

    return (
        <div className="relative">
            <div className="flex flex-col gap-8">
                {/* Header & Stepper */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1c140d] dark:text-[#f0e6dd] mb-2">
                                Finalize Product Settings
                            </h1>
                            <p className="text-[#9c7349] dark:text-[#bca080] text-base">
                                Review details, manage variants, and set visibility.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-64">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-[#f48c25]">Final Step</span>
                                <span className="text-[#9c7349] dark:text-[#bca080]">100%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#e8dbce] dark:bg-[#4a3b2f] overflow-hidden">
                                <div className="h-full bg-[#f48c25] rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Variants & Details (8 Cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Variants Section */}
                        <div className="rounded-xl bg-white dark:bg-[#2a221b] border border-[#e8dbce] dark:border-[#4a3b2f] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#1c140d] dark:text-[#f0e6dd] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#f48c25]">style</span>
                                    Product Variants & Attributes
                                </h2>
                                <button className="text-sm font-bold text-[#f48c25] hover:text-orange-600 transition-colors">
                                    + Add Custom Attribute
                                </button>
                            </div>
                            {/* Attributes Input */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#1c140d] dark:text-[#f0e6dd]">Attribute Name</label>
                                    <input className="w-full rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-3 text-[#1c140d] dark:text-[#f0e6dd] focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] outline-none transition-colors" placeholder="e.g. Color" type="text" defaultValue="Color" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#1c140d] dark:text-[#f0e6dd]">Attribute Values</label>
                                    <input className="w-full rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-3 text-[#1c140d] dark:text-[#f0e6dd] focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] outline-none transition-colors" placeholder="e.g. Red, Blue, Green" type="text" defaultValue="Red, Blue, Green" />
                                    <p className="text-xs text-[#9c7349] dark:text-[#bca080]">Separate values with commas.</p>
                                </div>
                            </div>
                            {/* Variants Table */}
                            <div className="overflow-hidden rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f]">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px] text-left">
                                        <thead className="bg-[#f8f7f5] dark:bg-[#221910] border-b border-[#e8dbce] dark:border-[#4a3b2f]">
                                            <tr>
                                                <th className="px-4 py-3 text-xs uppercase font-bold text-[#9c7349] dark:text-[#bca080]">Variant</th>
                                                <th className="px-4 py-3 text-xs uppercase font-bold text-[#9c7349] dark:text-[#bca080]">SKU</th>
                                                <th className="px-4 py-3 text-xs uppercase font-bold text-[#9c7349] dark:text-[#bca080]">Price</th>
                                                <th className="px-4 py-3 text-xs uppercase font-bold text-[#9c7349] dark:text-[#bca080]">Stock</th>
                                                <th className="px-4 py-3 text-xs uppercase font-bold text-[#9c7349] dark:text-[#bca080] text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e8dbce] dark:divide-[#4a3b2f]">
                                            {/* Rows would be mapped here */}
                                            {/* Row 1 */}
                                            <tr className="group hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors">
                                                <td className="px-4 py-4 font-medium text-[#1c140d] dark:text-[#f0e6dd] flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full bg-red-500 border border-[#e8dbce] dark:border-[#4a3b2f] shadow-sm"></div>
                                                    Color: Red
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input className="w-full bg-transparent border-b border-transparent focus:border-[#f48c25] outline-none text-[#9c7349] dark:text-[#bca080] text-sm py-1" type="text" defaultValue="SKU-RD-001" />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="relative">
                                                        <span className="absolute left-0 top-1 text-[#9c7349] dark:text-[#bca080] text-sm">£</span>
                                                        <input className="w-24 pl-4 bg-transparent border-b border-transparent focus:border-[#f48c25] outline-none text-[#1c140d] dark:text-[#f0e6dd] text-sm py-1 font-medium" type="number" defaultValue="25.00" />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input className="w-16 bg-transparent border-b border-transparent focus:border-[#f48c25] outline-none text-[#9c7349] dark:text-[#bca080] text-sm py-1" type="number" defaultValue="45" />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button className="text-[#9c7349] dark:text-[#bca080] hover:text-[#f48c25] p-1 rounded-md transition-colors">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Other Options */}
                        <div className="rounded-xl bg-white dark:bg-[#2a221b] border border-[#e8dbce] dark:border-[#4a3b2f] p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-[#1c140d] dark:text-[#f0e6dd] flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-[#f48c25]">tune</span>
                                Other Options
                            </h2>
                            <div className="flex flex-col gap-6">
                                {/* Enable Reviews Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] bg-[#f8f7f5] dark:bg-[#221910]">
                                    <div>
                                        <p className="font-bold text-[#1c140d] dark:text-[#f0e6dd]">Enable Reviews</p>
                                        <p className="text-sm text-[#9c7349] dark:text-[#bca080]">Allow customers to leave reviews for this product.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#f48c25]"></div>
                                    </label>
                                </div>
                                {/* Purchase Note */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#1c140d] dark:text-[#f0e6dd]">Purchase Note</label>
                                    <textarea className="w-full resize-none rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-3 text-[#1c140d] dark:text-[#f0e6dd] focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] outline-none transition-colors" placeholder="Thank you for your purchase! Here is a special note..." rows={4}></textarea>
                                    <p className="text-xs text-[#9c7349] dark:text-[#bca080]">This note will be sent to the customer in their purchase confirmation email.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Publishing Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Status Card */}
                        <div className="rounded-xl bg-white dark:bg-[#2a221b] border border-[#e8dbce] dark:border-[#4a3b2f] p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[#1c140d] dark:text-[#f0e6dd] mb-4">Product Status</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] cursor-pointer hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors group has-[:checked]:border-[#f48c25] has-[:checked]:bg-[#f48c25]/5">
                                    <input type="radio" name="status" className="w-5 h-5 text-[#f48c25] border-gray-300 focus:ring-[#f48c25] focus:ring-2 bg-transparent" defaultChecked />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-[#1c140d] dark:text-[#f0e6dd] group-has-[:checked]:text-[#f48c25]">Published</span>
                                        <span className="block text-xs text-[#9c7349] dark:text-[#bca080]">Product will be visible immediately.</span>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] cursor-pointer hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors group has-[:checked]:border-[#f48c25] has-[:checked]:bg-[#f48c25]/5">
                                    <input type="radio" name="status" className="w-5 h-5 text-[#f48c25] border-gray-300 focus:ring-[#f48c25] focus:ring-2 bg-transparent" />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-[#1c140d] dark:text-[#f0e6dd] group-has-[:checked]:text-[#f48c25]">Draft</span>
                                        <span className="block text-xs text-[#9c7349] dark:text-[#bca080]">Hidden from store, edit later.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Visibility Card */}
                        <div className="rounded-xl bg-white dark:bg-[#2a221b] border border-[#e8dbce] dark:border-[#4a3b2f] p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[#1c140d] dark:text-[#f0e6dd] mb-4">Visibility</h3>
                            <div className="relative mb-4">
                                <select className="w-full appearance-none rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-3 pr-10 text-[#1c140d] dark:text-[#f0e6dd] focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] outline-none transition-colors">
                                    <option>Public</option>
                                    <option>Private</option>
                                    <option>Password Protected</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9c7349] dark:text-[#bca080]">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                            <p className="text-xs text-[#9c7349] dark:text-[#bca080] flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Visible to all site visitors and indexed by search engines.
                            </p>
                        </div>

                        {/* Tags Card */}
                        <div className="rounded-xl bg-white dark:bg-[#2a221b] border border-[#e8dbce] dark:border-[#4a3b2f] p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-[#1c140d] dark:text-[#f0e6dd] mb-4">Tags</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f48c25]/10 px-3 py-1 text-xs font-bold text-[#f48c25]">
                                        Fashion
                                        <button className="hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f48c25]/10 px-3 py-1 text-xs font-bold text-[#f48c25]">
                                        Summer
                                        <button className="hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </span>
                                </div>
                                <input className="w-full rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-3 text-[#1c140d] dark:text-[#f0e6dd] focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] outline-none transition-colors text-sm" placeholder="Add a tag..." type="text" />
                            </div>
                        </div>

                        {/* Helper Tip */}
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                                <div>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Before you publish</p>
                                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">Ensure all images have alt text and stock levels are accurate to prevent overselling.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="sticky bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2a221b] border-t border-[#e8dbce] dark:border-[#4a3b2f] px-4 py-4 md:px-10 lg:px-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mx-4 md:-mx-10 lg:-mx-20">
                    <div className="mx-auto max-w-7xl flex items-center justify-between">
                        <button onClick={onBack} className="px-6 py-3 rounded-lg text-[#1c140d] dark:text-[#f0e6dd] font-bold text-sm hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors border border-transparent hover:border-[#e8dbce] dark:hover:border-[#4a3b2f] flex items-center gap-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <div className="flex gap-4">
                            <button onClick={onSaveDraft} className="hidden md:block px-6 py-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] text-[#1c140d] dark:text-[#f0e6dd] font-bold text-sm hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors">
                                Save as Draft
                            </button>
                            <button onClick={handlePublish} className="px-8 py-3 rounded-lg bg-[#f48c25] text-white font-bold text-sm shadow-md hover:bg-orange-600 hover:shadow-lg transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">rocket_launch</span>
                                Publish Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1c140d]/60 backdrop-blur-[2px] transition-opacity"></div>
                    <div className="relative w-full max-w-[480px] transform overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl transition-all md:p-10 flex flex-col items-center">
                        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#f48c25]/10 text-[#f48c25]">
                            <span className="material-symbols-outlined text-[40px] font-bold">check</span>
                        </div>
                        <h2 className="mb-3 text-2xl font-black leading-tight text-[#1c140d] md:text-3xl tracking-[-0.02em]">Product Created Successfully!</h2>
                        <p className="mb-8 text-[#9c7349] leading-relaxed">Your product has been added to your store and is now live.</p>
                        <div className="flex w-full flex-col gap-3">
                            <button className="w-full rounded-xl bg-[#f48c25] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#f48c25]/25 hover:bg-[#f48c25]/90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" type="button">View Product</button>
                            <button className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-bold text-[#f48c25] ring-2 ring-inset ring-[#f48c25] hover:bg-[#f48c25]/5 transition-all duration-200" type="button">Add Another Product</button>
                            <button className="w-full rounded-xl bg-transparent px-6 py-3.5 text-base font-bold text-[#9c7349] hover:text-[#1c140d] hover:bg-black/5 transition-all duration-200" type="button">Go to Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
