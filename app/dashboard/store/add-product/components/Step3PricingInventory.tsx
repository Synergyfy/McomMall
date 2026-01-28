import React from 'react';

interface Step3Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step3PricingInventory({ formData, updateFormData, onNext, onBack }: Step3Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        updateFormData({ [e.target.id]: e.target.value });
    };

    const handleRadioChange = (name: string, value: string) => {
        updateFormData({ [name]: value });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs & Header - typically managed by parent/layout but included for context alignment */}
            <div className="flex flex-col gap-6 px-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#1c140d] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Pricing & Inventory</h1>
                    <p className="text-[#9c7349] dark:text-[#cba885] text-base">Define the pricing model, manage stock levels, and set shipping parameters for your new item.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-6 justify-between items-end">
                        <p className="text-[#1c140d] dark:text-white text-sm font-bold uppercase tracking-wider">Step 3 of 4</p>
                        <p className="text-[#1c140d] dark:text-white text-sm font-bold">75%</p>
                    </div>
                    <div className="rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] h-2 overflow-hidden">
                        <div className="h-full bg-[#f48c25] rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <form className="flex flex-col gap-8 px-4" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
                {/* Product Type Section */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Product Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Option 1: Physical */}
                        <label className="cursor-pointer group relative">
                            <input
                                className="peer sr-only"
                                name="product_type"
                                type="radio"
                                value="physical"
                                checked={formData.product_type === 'physical'}
                                onChange={() => handleRadioChange('product_type', 'physical')}
                            />
                            <div className="h-full flex flex-col gap-3 rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-5 transition-all hover:border-[#f48c25]/50 peer-checked:border-[#f48c25] peer-checked:bg-[#fff8f1] dark:peer-checked:bg-[#f48c25]/10">
                                <div className="size-10 rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] flex items-center justify-center text-[#1c140d] dark:text-white peer-checked:text-[#f48c25] transition-colors">
                                    <span className="material-symbols-outlined">inventory_2</span>
                                </div>
                                <div>
                                    <p className="text-[#1c140d] dark:text-white font-bold mb-1">Physical Product</p>
                                    <p className="text-[#9c7349] dark:text-[#cba885] text-sm">A tangible item that requires shipping & delivery.</p>
                                </div>
                                {formData.product_type === 'physical' && (
                                    <div className="absolute top-5 right-5 text-[#f48c25] transition-opacity">
                                        <span className="material-symbols-outlined fill-current">check_circle</span>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Option 2: Downloadable */}
                        <label className="cursor-pointer group relative">
                            <input
                                className="peer sr-only"
                                name="product_type"
                                type="radio"
                                value="downloadable"
                                checked={formData.product_type === 'downloadable'}
                                onChange={() => handleRadioChange('product_type', 'downloadable')}
                            />
                            <div className="h-full flex flex-col gap-3 rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-5 transition-all hover:border-[#f48c25]/50 peer-checked:border-[#f48c25] peer-checked:bg-[#fff8f1] dark:peer-checked:bg-[#f48c25]/10">
                                <div className="size-10 rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] flex items-center justify-center text-[#1c140d] dark:text-white peer-checked:text-[#f48c25] transition-colors">
                                    <span className="material-symbols-outlined">cloud_download</span>
                                </div>
                                <div>
                                    <p className="text-[#1c140d] dark:text-white font-bold mb-1">Downloadable</p>
                                    <p className="text-[#9c7349] dark:text-[#cba885] text-sm">Digital files like ebooks, software, or media.</p>
                                </div>
                                {formData.product_type === 'downloadable' && (
                                    <div className="absolute top-5 right-5 text-[#f48c25] transition-opacity">
                                        <span className="material-symbols-outlined fill-current">check_circle</span>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Option 3: Virtual */}
                        <label className="cursor-pointer group relative">
                            <input
                                className="peer sr-only"
                                name="product_type"
                                type="radio"
                                value="virtual"
                                checked={formData.product_type === 'virtual'}
                                onChange={() => handleRadioChange('product_type', 'virtual')}
                            />
                            <div className="h-full flex flex-col gap-3 rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-5 transition-all hover:border-[#f48c25]/50 peer-checked:border-[#f48c25] peer-checked:bg-[#fff8f1] dark:peer-checked:bg-[#f48c25]/10">
                                <div className="size-10 rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] flex items-center justify-center text-[#1c140d] dark:text-white peer-checked:text-[#f48c25] transition-colors">
                                    <span className="material-symbols-outlined">design_services</span>
                                </div>
                                <div>
                                    <p className="text-[#1c140d] dark:text-white font-bold mb-1">Virtual / Service</p>
                                    <p className="text-[#9c7349] dark:text-[#cba885] text-sm">Services, memberships, or warranties.</p>
                                </div>
                                {formData.product_type === 'virtual' && (
                                    <div className="absolute top-5 right-5 text-[#f48c25] transition-opacity">
                                        <span className="material-symbols-outlined fill-current">check_circle</span>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </section>

                <hr className="border-[#e8dbce] dark:border-[#4a3b2e]" />

                {/* Pricing Section */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="regular_price">Regular Price</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {/* Changed from $ to £ */}
                                    <span className="text-[#9c7349] font-bold">£</span>
                                </div>
                                <input
                                    className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 pl-8 pr-4 text-[#1c140d] dark:text-white placeholder-text-[#9c7349]/50 focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow"
                                    id="regular_price"
                                    placeholder="0.00"
                                    type="number"
                                    value={formData.regular_price || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="sale_price">Discounted Price <span className="text-[#9c7349] font-normal text-xs ml-1">(Optional)</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {/* Changed from $ to £ */}
                                    <span className="text-[#9c7349] font-bold">£</span>
                                </div>
                                <input
                                    className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 pl-8 pr-4 text-[#1c140d] dark:text-white placeholder-text-[#9c7349]/50 focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow"
                                    id="sale_price"
                                    placeholder="0.00"
                                    type="number"
                                    value={formData.sale_price || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inventory Section */}
                <section className="flex flex-col gap-4 rounded-xl bg-white dark:bg-[#2d241b] border border-[#e8dbce] dark:border-[#4a3b2e] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#f48c25]/10 text-[#f48c25]">
                            <span className="material-symbols-outlined">inventory</span>
                        </div>
                        <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Inventory Management</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="sku">SKU (Stock Keeping Unit)</label>
                            <input
                                className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-2.5 px-4 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow uppercase placeholder-text-[#9c7349]/50"
                                id="sku"
                                placeholder="E.g. SUMMER-TEE-01"
                                type="text"
                                value={formData.sku || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="stock_status">Stock Status</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-2.5 px-4 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow"
                                    id="stock_status"
                                    value={formData.stock_status || 'instock'}
                                    onChange={handleChange}
                                >
                                    <option value="instock">In Stock</option>
                                    <option value="outofstock">Out of Stock</option>
                                    <option value="backorder">On Backorder</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#9c7349]">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-dashed border-[#e8dbce] dark:border-[#4a3b2e] pt-4 mt-2">
                        <div className="flex flex-col">
                            <span className="text-[#1c140d] dark:text-white text-sm font-bold">Track stock quantity</span>
                            <span className="text-[#9c7349] dark:text-[#cba885] text-xs">Automatically update stock when orders are placed</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f48c25]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f48c25]"></div>
                        </label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="quantity">Quantity</label>
                        <input
                            className="w-full md:w-1/2 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-2.5 px-4 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow"
                            id="quantity"
                            type="number"
                            value={formData.quantity || 100}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* Shipping Section (Conditional Visual) */}
                {formData.product_type === 'physical' && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Shipping</h3>
                            <span className="text-xs font-bold text-[#f48c25] bg-[#f48c25]/10 px-2 py-1 rounded">PHYSICAL PRODUCT</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="weight">Weight (kg)</label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 px-4 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none transition-shadow"
                                        id="weight"
                                        placeholder="0.0"
                                        type="number"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-[#9c7349] text-sm font-medium">kg</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#1c140d] dark:text-white text-sm font-bold">Dimensions (cm)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 px-3 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none text-center" placeholder="L" type="number" />
                                    <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 px-3 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none text-center" placeholder="W" type="number" />
                                    <input className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] py-2.5 px-3 text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-1 focus:ring-[#f48c25] focus:outline-none text-center" placeholder="H" type="number" />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8 pb-10">
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#1c140d] dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-[#221910] transition-colors"
                        type="button"
                    >
                        Back
                    </button>
                    <button
                        className="px-8 py-2.5 rounded-lg bg-[#f48c25] text-white font-bold text-sm shadow-md shadow-[#f48c25]/20 hover:bg-[#f48c25]/90 transition-all flex items-center gap-2"
                        type="submit"
                    >
                        Continue
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
