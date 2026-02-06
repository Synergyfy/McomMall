import React from 'react';
import { Truck, ArrowLeft } from 'lucide-react';

interface Step5Props {
    onBack: () => void;
    onNext: () => void;
}

const CARRIERS = [
    {
        id: 'fedex',
        name: 'FedEx',
        description: 'Best for international express shipping. Fast, reliable delivery.',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qAaJkDFaWRsxIW6KdybCBpXLHQZsJ_mEVUCZjF9cOpDyadsFeHybw0CuG3cJb4U37SBYx-CAP-fB3jlD55ixRVnJySilmPOP3Ypqa0GabN669Omm20wPz2t77lw75GoDtEVKyu6-ILtvgCRLYw-Pct7MjoRDjO9pWJ01V8MXjfNF-GxRetV2OJxmrr-X_CvIP8KVRJEbRbxCYL_kVIhpQs1gUueQDsGbNNzyEiYwz8CSXhL5HU8NArcMzMrg8tk_LkJQVK0y9N4f'
    },
    {
        id: 'ups',
        name: 'UPS',
        description: 'Global logistics offering freight and package delivery.',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTxJiQCrPb2rBi2W02F1A22tgHpv81xdPio2cID3EsvwFSuX245AEw_86TzVXaduCnpFp0Xm1nnMoHhYGGjUzV6uiKPeI0_v8OLhwI41a2Agc4UwKbiAsmVmTopF7YTa_D1WWZNN4oUANaEqI6umvtvQnOV6K6LyI0MW9CM_gTArBQrqubeWezkmxftF7xibKShwO-s5T72UdORohxIApx6EcjaqnQZlVRdaARaNRjprMuqKJ-XfSfsXO1dKD48KooO3pnl5veiG'
    },
    {
        id: 'dhl',
        name: 'DHL Express',
        description: 'Specialists in international shipping and courier services.',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoigvkq3gS0G8xGhmqUtKk2csNUi6jwqxQobBGDdIpeRGhzuazLnALVFVxCIAt9fROcEHSOGcWq5pOSKPSnjsF8lEd2kqHsLQsh0hOfYFPUEIxVy2ZSTN4cic_tuOWBg7NcYB8T-uMtssmjkD09b5p_J_IkkYcvN_Yp5F_g8E59rsGmm7yO5-e687j42IgUWzleHO_fJ7eB9gx-TODt3l0pseKeZaIwRkvZVCyHx5qWdO6TCSOvGQ-aGDXWEjVsAxvowbTet6uw3GY'
    },
    {
        id: 'usps',
        name: 'USPS',
        description: 'Affordable option for lightweight US shipments.',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUsJsKj9y0-MccpiVx0RTWJW1MkHf-4_Q70rTd7jCz1Rx4CLdPHz45Iamh91GyIMZQEiXfe7fF0NfpjhO5-tjWZIkz-OyY_AG_HyezkNbnE1-YM-VHjIDzTYw01Y6HnRctDsVejJ-wQyoqYw173EIadPiBm0Cp5JMQNV2lBC-bH_jo0Ri3apPIIHnwcipEVJm88ayB9-PgFPMGQulWhVrItbTMkB_TKSUlkgfC6UkcU-sEtNfBVFfsqsf0Krk8plqwH91ri5FMBMUP'
    },
    {
        id: 'royal_mail',
        name: 'Royal Mail',
        description: 'Trusted delivery service across the UK and internationally.',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSE-D4nAd7DkRtvTUAfwnbdsQA1kS-yGFMkN3tdjkvryPJn7F7gots8HatBUn36qOOL9LAKo_9CNcbKtl4QWY9YHrKCSZFRIzXp4h10M3EWtUcYS_jDR66fPf79Z20gZzK_OWofXikOx2gZAk4ENeeta2WJI1Hy5D7Tex2lZgE6qQyCVaCNbskT4LzfLwXhjdbrQq4czIjI8RoJlo-Pdg-HXhi8c3IeSvWOGgu5uKtfRDf0aCv8fjtteFoxvgiICs8zH-_RDeRhMbs'
    }
];

export default function Step5SelectCarrier({ onBack, onNext }: Step5Props) {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#1c140d] relative pb-10">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-hide">
                <div className="max-w-[960px] mx-auto flex flex-col gap-8 pb-10">
                    {/* ProgressBar */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-6 justify-between items-end">
                            <div>
                                <p className="text-[#f48c25] text-sm font-bold uppercase tracking-wide mb-1">Shipping Integration</p>
                                <p className="text-[#1c140d] dark:text-white text-base font-medium leading-normal">Step 5.1: Select Carrier</p>
                            </div>
                            <p className="text-[#9c7349] dark:text-[#a08b7d] text-sm font-medium leading-normal">Step 5 of 8</p>
                        </div>
                        <div className="rounded-full bg-[#e8dbce] dark:bg-[#3a2e26] h-2 w-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#f48c25]" style={{ width: '62.5%' }}></div>
                        </div>
                    </div>

                    {/* PageHeading */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[#1c140d] dark:text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">Select Your Shipping Carrier</h2>
                        <p className="text-[#9c7349] dark:text-[#a08b7d] text-base lg:text-lg font-normal leading-normal max-w-2xl">Integrate directly to calculate real-time rates, generate labels automatically, and track shipments from a single dashboard.</p>
                    </div>

                    {/* Carrier Grid */}
                    <div className="flex flex-col gap-6">
                        {/* Partner Carriers (Coming Soon) */}
                        <div className="flex flex-col gap-4 opacity-60 grayscale pointer-events-none relative">
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <span className="bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-1">Coming Soon</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#1c140d] dark:text-white">Connect Existing Carriers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CARRIERS.map((carrier) => (
                                    <div key={carrier.id} className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl bg-white dark:bg-[#2c241b] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#3a2e26]">
                                        <div className="shrink-0 w-16 h-16 bg-[#fcfaf8] dark:bg-[#3a2e26] rounded-lg p-2 flex items-center justify-center border border-[#f4ede7] dark:border-[#4a3e36]">
                                            <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${carrier.logoUrl}")` }}></div>
                                        </div>
                                        <div className="flex flex-col flex-1 gap-1">
                                            <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">{carrier.name}</h3>
                                            <p className="text-[#9c7349] dark:text-[#a08b7d] text-sm font-normal leading-relaxed mb-3">{carrier.description}</p>
                                            <button disabled className="mt-auto w-full sm:w-auto self-start px-4 h-9 rounded-lg bg-[#e8dbce] text-[#9c7349] text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-[#e8dbce] dark:bg-[#3a2e26] w-full my-2"></div>

                        {/* Custom Carrier Card */}
                        <div className="relative flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl bg-[#f4ede7] dark:bg-[#2a221a] shadow-none border border-transparent dark:border-[#3a2e26] transition-all group opacity-60 grayscale pointer-events-none">
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <span className="bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-1">Coming Soon</span>
                            </div>
                            <div className="shrink-0 w-16 h-16 bg-white dark:bg-[#3a2e26] rounded-lg p-2 flex items-center justify-center border border-white/50 dark:border-[#4a3e36]">
                                <Truck className="text-3xl text-[#9c7349] dark:text-[#a08b7d]" size={32} />
                            </div>
                            <div className="flex flex-col flex-1 gap-1">
                                <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Custom Carrier</h3>
                                <p className="text-[#9c7349] dark:text-[#a08b7d] text-sm font-normal leading-relaxed mb-3">Set up shipping rates manually if your preferred carrier isn't listed here.</p>
                                <button
                                    disabled
                                    className="mt-auto w-full sm:w-auto self-start px-4 h-9 rounded-lg bg-transparent border border-[#9c7349] text-[#1c140d] dark:text-white text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    Configure
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#f4ede7] dark:border-[#3a2e26]">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-[#9c7349] dark:text-[#a08b7d] hover:text-[#1c140d] dark:hover:text-white transition-colors text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#f4ede7] dark:hover:bg-[#3a2e26]"
                        >
                            <ArrowLeft size={18} />
                            Back to Inventory
                        </button>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <p className="text-sm font-medium text-[#9c7349] dark:text-[#a08b7d]">
                                Don't see your carrier? <a href="#" className="text-[#f48c25] hover:underline">Request integration</a>
                            </p>
                            <button className="bg-[#1c140d] dark:bg-white text-white dark:text-[#1c140d] px-6 py-3 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
