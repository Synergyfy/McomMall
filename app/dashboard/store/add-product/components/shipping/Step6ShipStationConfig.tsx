import React from 'react';

interface Step6Props {
    onBack: () => void;
    onNext: () => void;
}

export default function Step6ShipStationConfig({ onBack, onNext }: Step6Props) {
    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 px-4 py-2">
                <span className="text-[#9c7349] text-sm font-medium leading-normal">Products</span>
                <span className="text-[#9c7349] text-sm font-medium leading-normal">/</span>
                <span className="text-[#9c7349] text-sm font-medium leading-normal">Add New Product</span>
                <span className="text-[#9c7349] text-sm font-medium leading-normal">/</span>
                <span className="text-[#1c140d] dark:text-white text-sm font-medium leading-normal">Shipping Config</span>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-3 px-4 py-4">
                <div className="flex gap-6 justify-between items-end">
                    <p className="text-[#1c140d] dark:text-white text-base font-medium leading-normal">Step 6 of 7</p>
                    <span className="text-[#9c7349] text-xs font-semibold uppercase tracking-wider">85% Completed</span>
                </div>
                <div className="rounded-full bg-[#e8dbce] dark:bg-[#3a2d20] h-2 w-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 px-4 pb-2 pt-4">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#1c140d] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Shipping Configuration</h1>
                    <p className="text-[#9c7349] text-base font-normal leading-normal max-w-2xl">Configure how this product interacts with your ShipStation integration and define package dimensions for accurate rate calculation.</p>
                </div>
            </div>

            {/* Main Settings Content */}
            <div className="flex flex-col gap-6 p-4">
                {/* Settings Card */}
                <div className="flex flex-col rounded-xl border border-[#e8dbce] dark:border-[#3a2d20] bg-white dark:bg-[#1a120b] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#e8dbce] dark:border-[#3a2d20] bg-gray-50/50 dark:bg-[#2c2016]/30">
                        <h2 className="text-[#1c140d] dark:text-white text-lg font-bold leading-tight">Integration Settings</h2>
                    </div>
                    <div className="flex flex-col divide-y divide-[#e8dbce] dark:divide-[#3a2d20]">
                        {/* Toggle Item 1 */}
                        <div className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#2c2016]/20 transition-colors">
                            <div className="flex flex-col gap-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#1c140d] dark:text-white font-semibold text-base">Auto-push orders</span>
                                    <span className="material-symbols-outlined text-[#9c7349] text-[18px] cursor-help" title="Automatically sends paid orders to ShipStation">info</span>
                                </div>
                                <p className="text-[#9c7349] text-sm">Automatically send orders to ShipStation when status is marked as 'Paid'.</p>
                            </div>
                            {/* Toggle Switch ON */}
                            <button aria-checked="true" className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#f48c25] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#f48c25] focus:ring-offset-2" role="switch">
                                <span className="sr-only">Use setting</span>
                                <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                            </button>
                        </div>
                        {/* Toggle Item 2 */}
                        <div className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#2c2016]/20 transition-colors">
                            <div className="flex flex-col gap-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#1c140d] dark:text-white font-semibold text-base">Sync tracking numbers</span>
                                    <span className="material-symbols-outlined text-[#9c7349] text-[18px] cursor-help" title="Updates local order status when label is created">info</span>
                                </div>
                                <p className="text-[#9c7349] text-sm">Update local order status to 'Shipped' when ShipStation generates a label.</p>
                            </div>
                            {/* Toggle Switch ON */}
                            <button aria-checked="true" className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#f48c25] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#f48c25] focus:ring-offset-2" role="switch">
                                <span className="sr-only">Use setting</span>
                                <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Package Presets Section */}
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[#1c140d] dark:text-white text-xl font-bold leading-tight">Package Presets</h2>
                            <p className="text-[#9c7349] text-sm mt-1">Manage standard box sizes for faster checkout calculations.</p>
                        </div>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f48c25] hover:bg-[#f48c25]/90 text-white rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add New Preset
                        </button>
                    </div>
                    <div className="w-full overflow-hidden rounded-xl border border-[#e8dbce] dark:border-[#3a2d20] bg-white dark:bg-[#1a120b] shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-[#2c2016]/30 border-b border-[#e8dbce] dark:border-[#3a2d20]">
                                        <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#9c7349]">Preset Name</th>
                                        <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#9c7349]">Dimensions (L x W x H)</th>
                                        <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#9c7349]">Max Weight</th>
                                        <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#9c7349] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e8dbce] dark:divide-[#3a2d20] text-sm">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2c2016]/20 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-[#1c140d] dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                                                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                                </div>
                                                Small Standard Box
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">10 x 8 x 4 in</td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">2.5 lbs</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-[#9c7349] hover:text-[#f48c25] hover:bg-[#f48c25]/10 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button className="p-1.5 text-[#9c7349] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2c2016]/20 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-[#1c140d] dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                                                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                                </div>
                                                Medium Parcel
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">14 x 10 x 6 in</td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">5.0 lbs</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-[#9c7349] hover:text-[#f48c25] hover:bg-[#f48c25]/10 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button className="p-1.5 text-[#9c7349] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2c2016]/20 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-[#1c140d] dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                                                    <span className="material-symbols-outlined text-[18px]">deployed_code</span>
                                                </div>
                                                Long Tube
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">36 x 4 x 4 in</td>
                                        <td className="py-4 px-6 text-[#1c140d] dark:text-gray-300 font-mono">3.2 lbs</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-[#9c7349] hover:text-[#f48c25] hover:bg-[#f48c25]/10 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button className="p-1.5 text-[#9c7349] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50/50 dark:bg-[#2c2016]/30 px-6 py-3 border-t border-[#e8dbce] dark:border-[#3a2d20] flex justify-center">
                            <button className="text-xs font-bold text-[#f48c25] hover:text-[#f48c25]/80 uppercase tracking-wide">View all presets</button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 mb-12 flex justify-between border-t border-[#f4ede7] dark:border-[#3a2d20] pt-6 px-4">
                    <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-[#1c140d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2016] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        Previous Step
                    </button>
                    <button onClick={onNext} className="flex items-center gap-2 rounded-lg bg-[#f48c25] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#f48c25]/30 hover:bg-[#f48c25]/90 transition-all active:scale-95">
                        Save & Continue
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
