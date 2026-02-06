"use client";

import React, { useState } from 'react';
import { 
  Truck, 
  ExternalLink, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  ArrowRight, 
  Link2Off, 
  Bolt,
  ArrowLeft
} from 'lucide-react';

interface Step5bProps {
    onBack: () => void;
    onNext: () => void;
}

export default function Step5bConnectShipStation({ onBack, onNext }: Step5bProps) {
    const [showKey, setShowKey] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Progress Stepper */}
            <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#2c2219] rounded-xl shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f]">
                <div className="flex gap-6 justify-between items-center">
                    <div>
                        <p className="text-[#1c140d] dark:text-white text-base font-bold leading-normal">Step 5: Connect ShipStation</p>
                        <p className="text-[#9c7349] dark:text-gray-400 text-xs font-normal leading-normal">Integration Setup</p>
                    </div>
                    <p className="text-[#f48c25] font-bold text-sm bg-[#f48c25]/10 px-3 py-1 rounded-full">5 of 8</p>
                </div>
                <div className="rounded-full bg-[#e8dbce] dark:bg-[#4a3b2f] h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25]" style={{ width: '62.5%' }}></div>
                </div>
            </div>

            {/* Page Header */}
            <div className="flex flex-col gap-2 p-4">
                <h1 className="text-[#1c140d] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Connect ShipStation</h1>
                <p className="text-[#9c7349] dark:text-gray-400 text-base md:text-lg max-w-2xl">Enter your API credentials to sync orders and fulfillment data automatically. Securely connect your store in seconds.</p>
            </div>

            {/* Promo Banner */}
            <div className="mx-4 p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-[#fff8f2] dark:from-[#2c2219] dark:to-[#2e231b] border border-[#e8dbce] dark:border-[#4a3b2f] shadow-sm relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#f48c25]/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex gap-4">
                        <div className="hidden md:flex size-12 items-center justify-center rounded-full bg-[#f48c25]/10 text-[#f48c25] shrink-0">
                            <Truck size={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-[#1c140d] dark:text-white text-lg font-bold">Don't have an account?</h3>
                            <p className="text-[#9c7349] dark:text-gray-400 text-sm">Start your 30-day free trial today to streamline your shipping workflow.</p>
                        </div>
                    </div>
                    <a 
                        href="https://www.shipstation.com/start-a-free-trial/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="whitespace-nowrap flex items-center justify-center rounded-lg h-10 px-5 bg-white dark:bg-transparent dark:border dark:border-[#f48c25] text-[#f48c25] border border-[#f48c25]/20 hover:bg-[#f48c25] hover:text-white transition-all duration-200 text-sm font-bold shadow-sm"
                    >
                        Create ShipStation Account
                        <ExternalLink size={16} className="ml-2" />
                    </a>
                </div>
            </div>

            {/* Main Form Section */}
            <div className="bg-white dark:bg-[#2c2219] rounded-xl border border-[#e8dbce] dark:border-[#4a3b2f] shadow-sm p-6 md:p-8 mx-4">
                <div className="flex flex-col gap-6">
                    {/* Input: API Key */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-white text-sm font-semibold flex items-center gap-2" htmlFor="api-key">
                            API Key
                            <HelpCircle size={14} className="text-[#9c7349] dark:text-gray-500 cursor-help" />
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={18} className="text-[#9c7349] dark:text-gray-500" />
                            </div>
                            <input
                                id="api-key"
                                type={showKey ? "text" : "password"}
                                placeholder="Enter your API Key"
                                className="block w-full pl-10 pr-10 py-3 rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#221910] text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-[#f48c25] sm:text-sm shadow-inner transition-colors outline-none"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c7349] dark:text-gray-500 hover:text-[#f48c25] transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Input: API Secret */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-white text-sm font-semibold flex items-center gap-2" htmlFor="api-secret">
                            API Secret
                            <HelpCircle size={14} className="text-[#9c7349] dark:text-gray-500 cursor-help" />
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-[#9c7349] dark:text-gray-500" />
                            </div>
                            <input
                                id="api-secret"
                                type={showSecret ? "text" : "password"}
                                placeholder="Enter your API Secret"
                                className="block w-full pl-10 pr-10 py-3 rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#221910] text-[#1c140d] dark:text-white focus:border-[#f48c25] focus:ring-[#f48c25] sm:text-sm shadow-inner transition-colors outline-none"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c7349] dark:text-gray-500 hover:text-[#f48c25] transition-colors"
                            >
                                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Helper Link */}
                    <div className="flex justify-end">
                        <a href="#" className="text-[#f48c25] text-sm font-medium hover:underline flex items-center gap-1 group">
                            Where do I find my API keys?
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>

                    <div className="h-px bg-[#e8dbce] dark:bg-[#4a3b2f] my-2"></div>

                    {/* Connection Status */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[#9c7349] dark:text-gray-400 text-xs uppercase tracking-wider font-bold">Connection Status</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 w-fit">
                                <Link2Off size={16} className="text-red-600 dark:text-red-400" />
                                <span className="text-red-700 dark:text-red-300 text-sm font-bold">Disconnected</span>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 flex-1 justify-end mt-2 sm:mt-0">
                            <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-lg text-[#1c140d] dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <button onClick={onNext} className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#f48c25] hover:bg-[#f48c25]/90 text-white shadow-lg shadow-[#f48c25]/20 transition-all text-sm font-bold min-w-[180px] group">
                                <span>Validate & Connect</span>
                                <Bolt size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <p className="text-center text-[#9c7349] dark:text-gray-500 text-sm mt-4 pb-12">
                By connecting, you agree to ShipStation's <a href="#" className="underline hover:text-[#f48c25]">Terms of Service</a> and <a href="#" className="underline hover:text-[#f48c25]">Privacy Policy</a>.
            </p>
        </div>
    );
}