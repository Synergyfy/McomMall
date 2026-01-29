import React from 'react';

interface Step7Props {
    onBack: () => void;
    onFinish: () => void;
}

export default function Step7ServiceMapping({ onBack, onFinish }: Step7Props) {
    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Progress Bar Section */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-end">
                    <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] text-[#1c140d] dark:text-white">Service Mapping</h1>
                    <p className="text-[#1c140d] dark:text-gray-300 text-base font-medium whitespace-nowrap">Step 7 of 7</p>
                </div>
                <div className="w-full rounded-full bg-[#e8dbce] dark:bg-[#3a2e25] h-2.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25]" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[#9c7349] dark:text-[#ccaa85] text-base font-normal">Configure how your store's shipping methods translate to carrier services.</p>
            </div>

            {/* Default Logic Card */}
            <div className="bg-[#fcfaf8] dark:bg-[#2c2219] rounded-xl shadow-sm border border-[#e8dbce] dark:border-[#3a2e25] overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#f48c25]">inventory_2</span>
                            <h3 className="text-xl font-bold text-[#1c140d] dark:text-white">Default Logic</h3>
                        </div>
                        <p className="text-[#9c7349] dark:text-[#b0967a] text-sm">Define the fallback package type used when product dimensions are missing from the order data.</p>
                    </div>
                    <div className="w-full md:w-auto min-w-[300px]">
                        <label className="block mb-2 text-sm font-medium text-[#1c140d] dark:text-gray-200">Default Package Type</label>
                        <div className="relative">
                            <select className="appearance-none w-full bg-white dark:bg-[#1c140d] border border-[#e8dbce] dark:border-[#4a3b30] text-[#1c140d] dark:text-white rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#f48c25] focus:border-transparent transition-shadow cursor-pointer">
                                <option>Package (12x12x12)</option>
                                <option>Medium Box (18x14x10)</option>
                                <option>Large Box (24x24x24)</option>
                                <option>Letter Envelope</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9c7349]">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Mapping Table Section */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#1c140d] dark:text-white">Shipping Method Mappings</h3>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#f48c25] border border-[#f48c25]/30 bg-[#f48c25]/5 hover:bg-[#f48c25]/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add New Mapping
                    </button>
                </div>
                <div className="bg-white dark:bg-[#2c2219] rounded-xl shadow-sm border border-[#e8dbce] dark:border-[#3a2e25] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fcfaf8] dark:bg-[#251c14] border-b border-[#e8dbce] dark:border-[#3a2e25]">
                                    <th className="p-4 text-sm font-semibold text-[#9c7349] dark:text-[#ccaa85] uppercase tracking-wider w-1/3">Store Shipping Method</th>
                                    <th className="p-4 text-sm font-semibold text-[#9c7349] dark:text-[#ccaa85] uppercase tracking-wider w-1/3">ShipStation Service</th>
                                    <th className="p-4 text-sm font-semibold text-[#9c7349] dark:text-[#ccaa85] uppercase tracking-wider text-right w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8dbce] dark:divide-[#3a2e25]">
                                {/* Row 1 */}
                                <tr className="group hover:bg-[#fcfaf8] dark:hover:bg-[#332920] transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-[#1c140d] dark:text-white">Standard Shipping</div>
                                        <div className="text-xs text-[#9c7349] mt-0.5">Domestic Ground</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative w-full max-w-xs">
                                            <select className="appearance-none w-full bg-[#f8f7f5] dark:bg-[#1c140d] border border-[#e8dbce] dark:border-[#4a3b30] text-[#1c140d] dark:text-white rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#f48c25] focus:border-[#f48c25] cursor-pointer">
                                                <option>USPS Ground Advantage</option>
                                                <option>UPS Ground</option>
                                                <option>FedEx Ground</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9c7349]">
                                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#9c7349] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove Mapping">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="group hover:bg-[#fcfaf8] dark:hover:bg-[#332920] transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-[#1c140d] dark:text-white">Express Delivery</div>
                                        <div className="text-xs text-[#9c7349] mt-0.5">Next Day Air</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative w-full max-w-xs">
                                            <select className="appearance-none w-full bg-[#f8f7f5] dark:bg-[#1c140d] border border-[#e8dbce] dark:border-[#4a3b30] text-[#1c140d] dark:text-white rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#f48c25] focus:border-[#f48c25] cursor-pointer">
                                                <option>FedEx Priority Overnight</option>
                                                <option>UPS Next Day Air</option>
                                                <option>USPS Priority Mail Express</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9c7349]">
                                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#9c7349] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove Mapping">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="group hover:bg-[#fcfaf8] dark:hover:bg-[#332920] transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-[#1c140d] dark:text-white">International Saver</div>
                                        <div className="text-xs text-[#9c7349] mt-0.5">Worldwide</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative w-full max-w-xs">
                                            <select className="appearance-none w-full bg-[#f8f7f5] dark:bg-[#1c140d] border border-[#e8dbce] dark:border-[#4a3b30] text-[#1c140d] dark:text-white rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#f48c25] focus:border-[#f48c25] cursor-pointer">
                                                <option>UPS Worldwide Saver</option>
                                                <option>DHL Express Worldwide</option>
                                                <option>FedEx International Priority</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9c7349]">
                                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#9c7349] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove Mapping">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-[#e8dbce] dark:border-[#3a2e25] mt-auto">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b30] text-[#1c140d] dark:text-white font-bold hover:bg-[#e8dbce] dark:hover:bg-[#332920] transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back
                </button>
                <button
                    onClick={onFinish}
                    className="px-8 py-3 rounded-lg bg-[#f48c25] hover:bg-[#e07b1a] text-white font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    Finish & Save
                    <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
            </div>
        </div>
    );
}
