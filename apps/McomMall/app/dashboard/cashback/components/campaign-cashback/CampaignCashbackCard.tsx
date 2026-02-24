import React from 'react';
import { CampaignCashback, CampaignDisplayType } from '@/service/campaign-cashback/types';
import VoucherCampaignCard from './VoucherCampaignCard';
import ECardCampaignCard from './ECardCampaignCard';

interface CampaignCashbackCardProps {
    campaign: CampaignCashback;
    onUnlockClick: (campaignId: string) => void;
}

export const CampaignCashbackCard: React.FC<CampaignCashbackCardProps> = ({ campaign, onUnlockClick }) => {
    return (
        <div className="relative w-full transition-all duration-300">
            {/* Campaign Cashback Badge */}
            <div className="absolute -top-3 -right-3 z-10 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-white">
                Campaign Cashback – Powered by 247GBS
            </div>

            {campaign.externalCampaign && (
                <div className="absolute -top-3 left-4 z-10 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] uppercase tracking-wider font-bold rounded-full shadow-md border border-white">
                    External Campaign
                </div>
            )}

            {campaign.displayType === CampaignDisplayType.VOUCHER ? (
                <VoucherCampaignCard campaign={campaign} onUnlockClick={onUnlockClick} />
            ) : (
                <ECardCampaignCard campaign={campaign} onUnlockClick={onUnlockClick} />
            )}
        </div>
    );
};
