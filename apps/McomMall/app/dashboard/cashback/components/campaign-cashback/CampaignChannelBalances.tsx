import React from 'react';
import { CampaignWallet } from '@/service/campaign-cashback/types';
import { MapPin, Navigation, Globe } from 'lucide-react';

interface Props {
    wallets: CampaignWallet[];
}

export const CampaignChannelBalances: React.FC<Props> = ({ wallets }) => {
    if (!wallets || wallets.length === 0) return null;

    // We map the array of wallets to individual components
    return (
        <div className="w-full mt-4 pt-4 border-t border-gray-100/20">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Channel Balances</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {wallets.map((wallet, index) => {
                    let Icon = Globe;
                    if (wallet.channelType === 'HYPERLOCAL') Icon = MapPin;
                    if (wallet.channelType === 'NEARBY') Icon = Navigation;

                    const totalBalance = wallet.value1Balance + wallet.value2Balance + wallet.value3Balance;

                    return (
                        <div key={wallet.channelType + index} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-gray-200/50">
                            <div className="w-8 h-8 flex-shrink-0 bg-gray-100/10 rounded-full flex items-center justify-center border border-gray-300/30">
                                <Icon className="w-4 h-4 opacity-70" />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[10px] font-bold uppercase opacity-60 tracking-wider">
                                    {wallet.channelType}
                                </span>
                                <span className="block text-sm font-semibold">
                                    £{totalBalance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
