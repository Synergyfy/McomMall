import React from 'react';

interface Step4Props {
    onSelectOption: (option: 'existing' | 'shipstation') => void;
    onBack: () => void;
}

export default function Step4ShippingOptions({ onSelectOption, onBack }: Step4Props) {
    return (
        <div className="flex flex-col gap-8">
            {/* Progress Bar */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-end">
                    <p className="text-[#1c140d] dark:text-white text-base font-bold leading-normal">Step 4: Shipping Integration</p>
                    <p className="text-[#9c7349] dark:text-[#cba885] text-sm font-medium leading-normal">Next: Select Provider</p>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500 ease-out" style={{ width: '83%' }}></div>
                </div>
            </div>

            {/* Page Heading */}
            <div className="flex flex-col gap-4 mt-2">
                <h1 className="text-[#1c140d] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Shipping Integration</h1>
                <p className="text-[#594a3d] dark:text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                    Choose how you want to handle shipping for this product. You can link your existing carrier accounts or use our partner integration for better rates.
                </p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Card 1: Existing Carriers */}
                <div className="group relative flex flex-col rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-8 hover:border-[#f48c25]/50 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-6 right-6 text-gray-400 group-hover:text-[#f48c25] transition-colors">
                        <span className="material-symbols-outlined text-3xl">local_shipping</span>
                    </div>
                    <div className="mb-6 h-12 flex items-center gap-4 opacity-80 grayscale group-hover:grayscale-0 transition-all duration-300">
                        {/* Logos Simulation */}
                        <div className="h-8 w-auto px-2 border border-dashed border-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-500">FEDEX</div>
                        <div className="h-8 w-auto px-2 border border-dashed border-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-500">UPS</div>
                        <div className="h-8 w-auto px-2 border border-dashed border-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-500">DHL</div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <h2 className="text-[#1c140d] dark:text-white text-xl font-bold leading-tight">Connect Your Existing Shipping</h2>
                        <p className="text-[#594a3d] dark:text-gray-400 text-base font-normal leading-relaxed">
                            Link your own accounts directly with carriers like FedEx, UPS, or DHL. Ideal if you already have negotiated rates.
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#f4ede7] dark:border-[#4a3b2e]">
                        <button
                            onClick={() => onSelectOption('existing')}
                            className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-5 border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-transparent text-[#1c140d] dark:text-white hover:border-[#f48c25] hover:text-[#f48c25] transition-colors text-base font-bold leading-normal"
                        >
                            Select Carrier
                        </button>
                    </div>
                </div>

                {/* Card 2: ShipStation */}
                <div className="group relative flex flex-col rounded-xl border-2 border-transparent bg-white dark:bg-[#2d241b] p-8 shadow-sm ring-1 ring-[#e8dbce] dark:ring-[#4a3b2e] hover:ring-[#f48c25] hover:shadow-xl transition-all duration-300">
                    {/* Recommended Badge */}
                    <div className="absolute -top-3 left-8 bg-[#f48c25] text-[#1c140d] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Recommended
                    </div>
                    <div className="mb-6 h-12 flex items-center">
                        {/* ShipStation Logo Placeholder */}
                        <div className="h-10 w-40 bg-gray-200 dark:bg-[#3a2e26] rounded relative overflow-hidden flex items-center justify-center">
                            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">ShipStation</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <h2 className="text-[#1c140d] dark:text-white text-xl font-bold leading-tight">Power with ShipStation</h2>
                        <p className="text-[#594a3d] dark:text-gray-400 text-base font-normal leading-relaxed">
                            Connect your ShipStation account for advanced automation, label printing, and pre-negotiated rates up to 40% off.
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#f4ede7] dark:border-[#4a3b2e]">
                        <button
                            onClick={() => onSelectOption('shipstation')}
                            className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-[#f48c25] text-white hover:bg-[#d6761b] transition-colors text-base font-bold leading-normal shadow-md hover:shadow-lg"
                        >
                            <span className="mr-2 material-symbols-outlined text-lg">link</span>
                            Connect ShipStation
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e8dbce] dark:border-[#4a3b2e]">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#594a3d] dark:text-gray-400 hover:text-[#1c140d] dark:hover:text-white font-medium transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back
                </button>
                <button className="text-[#594a3d] dark:text-gray-400 hover:text-[#f48c25] font-medium text-sm transition-colors decoration-1 underline-offset-4 hover:underline">
                    Skip for now
                </button>
            </div>
        </div>
    );
}
