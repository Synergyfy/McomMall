import React from 'react';
import { CampaignCashback, CampaignStatus } from '@/service/campaign-cashback/types';
import { CampaignValueSection } from './CampaignValueSection';
import { CampaignChannelBalances } from './CampaignChannelBalances';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
    campaign: CampaignCashback;
    onUnlockClick: (campaignId: string) => void;
}

const gradientThemes = [
    'from-amber-400 via-orange-400 to-rose-500',
    'from-orange-400 via-amber-500 to-yellow-500',
    'from-rose-400 via-orange-400 to-amber-500',
    'from-slate-300 via-gray-300 to-zinc-400',
];

const GoldenRibbon = () => (
    <div className="absolute bottom-[40%] left-0 w-full h-2 z-10">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-md" />
    </div>
);

const GoldenBow = () => (
    <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-4px)] z-20 scale-[0.6]">
        <div className="relative w-12 h-8 flex items-center justify-center">
            <div className="absolute -left-1 w-6 h-6 border-2 border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg]" />
            <div className="absolute -right-1 w-6 h-6 border-2 border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg]" />
            <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10" />
        </div>
    </div>
);

const ECardCampaignCard: React.FC<Props> = ({ campaign, onUnlockClick }) => {
    const isFullyUsed = campaign.status === CampaignStatus.FULLY_USED;
    const isExpired = campaign.status === CampaignStatus.EXPIRED;

    const idNum = String(campaign.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = idNum % gradientThemes.length;
    const gradientClass = gradientThemes[gradientIndex];

    return (
        <div className={`relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white flex flex-col ${isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}>

            {/* Gift Card Visual */}
            <div className="relative p-6 pt-8 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <div className={cn(
                    "w-full rounded-[1.5rem] shadow-xl p-6 relative overflow-hidden transition-all duration-500 min-h-[220px]",
                    gradientClass
                )}>
                    <GoldenRibbon />
                    <GoldenBow />

                    {/* Brand Name Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 pb-12">
                        <div className="text-center max-w-full px-4">
                            <h2 className="text-3xl font-black text-white/90 tracking-[0.15em] uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] line-clamp-2 leading-tight">
                                {campaign.name}
                            </h2>
                            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-3 rounded-full opacity-60" />
                        </div>
                    </div>

                    {/* Card content */}
                    <div className="relative z-30 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                            <h4 className="text-xl font-black text-yellow-400 italic">CAMPAIGN <span className="text-yellow-300">CASHBACK</span></h4>
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </div>

                        <div className="mt-auto pt-24 text-right">
                            <span className="text-sm uppercase tracking-widest font-bold opacity-80 block mb-1">Total Value</span>
                            <span className="text-4xl font-black text-white drop-shadow-md">£{campaign.totalValue.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Glare effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none" />
                </div>

                {/* Type Badge */}
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-lg z-10 px-3 py-1">
                    <Gift className="w-3 h-3 mr-1" />
                    PREMIUM
                </Badge>
            </div>

            {/* Content Details */}
            <div className="p-6 pt-2 flex flex-col z-10 relative">
                <div className="text-sm font-medium text-slate-500 mb-4 px-2">
                    Valid thru: <span className="text-slate-800 font-bold">{new Date(campaign.expiryDate).toLocaleDateString()}</span>
                </div>

                <div className="bg-white rounded-xl mb-6">
                    <CampaignValueSection campaign={campaign} />
                    <CampaignChannelBalances wallets={campaign.wallets} />
                </div>

                <div className="mt-auto flex flex-col md:flex-row justify-between items-center pt-2">
                    <div className="mb-4 md:mb-0">
                        {isFullyUsed && (
                            <span className="px-3 py-1.5 bg-slate-700/80 text-white text-xs font-bold uppercase tracking-wider rounded border border-slate-600">
                                Fully Redeemed
                            </span>
                        )}
                        {isExpired && (
                            <span className="px-3 py-1.5 bg-red-900/50 text-red-200 text-xs font-bold uppercase tracking-wider rounded border border-red-800">
                                Expired
                            </span>
                        )}
                        {campaign.status === CampaignStatus.NOT_ACTIVE && (
                            <span className="text-sm font-medium text-slate-400 italic">Not yet active</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {campaign.externalCampaign && campaign.externalRedemptionUrl && !isFullyUsed && !isExpired && (
                            <a href={campaign.externalRedemptionUrl} target="_blank" rel="noreferrer">
                                <Button variant="secondary" className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-none shadow-md">
                                    Redeem Externally <ExternalLink className="w-4 h-4" />
                                </Button>
                            </a>
                        )}

                        {!campaign.contributionPaid && !isFullyUsed && !isExpired && (
                            <Button
                                onClick={() => onUnlockClick(campaign.id)}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg font-bold px-8 rounded-xl transition-all h-12"
                            >
                                Unlock Full Campaign Value
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ECardCampaignCard;
