import React from 'react';
import { ArrowLeft, ArrowRight, Package, Download, Terminal, Info, ChevronDown } from 'lucide-react';

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
                            { id: 'physical', label: 'Physical', desc: 'Tangible items', icon: <Package size={20}/> },
                            { id: 'downloadable', label: 'Digital', desc: 'Files & Media', icon: <Download size={20}/> },
                            { id: 'virtual', label: 'Service', desc: 'Memberships', icon: <Terminal size={20}/> }
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

                {/* Pricing Section */}
                <section className="flex flex-col gap-4 px-2 md:px-0">
                    <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Pricing</h3>
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
                </section>

                {/* Inventory Card */}
                <section className="mx-2 md:mx-0 flex flex-col gap-6 rounded-2xl bg-white dark:bg-[#2d241b] border border-[#e8dbce] dark:border-[#4a3b2e] p-5 md:p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="sku">SKU</label>
                            <input
                                className="w-full rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-3 px-4 text-[#1c140d] dark:text-white uppercase outline-none focus:border-[#f48c25]"
                                id="sku"
                                placeholder="E.g. TEE-001"
                                type="text"
                                value={formData.sku || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="stock_status">Stock Status</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-3 px-4 text-[#1c140d] dark:text-white outline-none focus:border-[#f48c25]"
                                    id="stock_status"
                                    value={formData.stock_status || 'instock'}
                                    onChange={handleChange}
                                >
                                    <option value="instock">In Stock</option>
                                    <option value="outofstock">Out of Stock</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9c7349]" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-dashed border-[#e8dbce] dark:border-[#4a3b2e]">
                        <div className="flex flex-col pr-4">
                            <span className="text-[#1c140d] dark:text-white text-sm font-bold">Track Stock</span>
                            <span className="text-[#9c7349] dark:text-[#cba885] text-xs">Manage inventory levels</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#f48c25]/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-[#f48c25] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-white text-sm font-bold" htmlFor="quantity">Quantity Available</label>
                        <input
                            className="w-full sm:w-1/3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcfaf8] dark:bg-[#221910] py-3 px-4 text-[#1c140d] dark:text-white outline-none focus:border-[#f48c25]"
                            id="quantity"
                            type="number"
                            value={formData.quantity || 100}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* Conditional Shipping Section */}
                {formData.product_type === 'physical' && (
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
    );
}