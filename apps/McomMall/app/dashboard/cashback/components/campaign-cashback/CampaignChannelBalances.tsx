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
        <div className="w-full mt-2 pt-2 border-t border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Channel Balances</h4>
            <div className="grid grid-cols-3 gap-2">
                {wallets.map((wallet, index) => {
                    let Icon = Globe;
                    if (wallet.channelType === 'HYPERLOCAL') Icon = MapPin;
                    if (wallet.channelType === 'NEARBY') Icon = Navigation;

                    const totalBalance = wallet.value1Balance + wallet.value2Balance + wallet.value3Balance;

                    return (
                        <div key={wallet.channelType + index} className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                            <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full flex items-center justify-center border border-gray-100">
                                <Icon className="w-3 h-3 opacity-70" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-[8px] font-bold uppercase opacity-60 tracking-wider truncate">
                                    {wallet.channelType}
                                </span>
                                <span className="block text-xs font-semibold">
                                    £{totalBalance.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
