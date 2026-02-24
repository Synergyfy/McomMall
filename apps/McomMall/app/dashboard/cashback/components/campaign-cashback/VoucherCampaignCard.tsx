import React from 'react';
import { CampaignCashback, CampaignStatus } from '@/service/campaign-cashback/types';
import { CampaignValueSection } from './CampaignValueSection';
import { CampaignChannelBalances } from './CampaignChannelBalances';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';

interface Props {
    campaign: CampaignCashback;
    onUnlockClick: (campaignId: string) => void;
}

const VerticalRedRibbon = () => (
    <div className="absolute top-0 left-[25%] md:left-[20%] bottom-0 w-3 z-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
    </div>
);

const RedBow = () => (
    <div className="absolute top-1/2 left-[25%] md:left-[20%] -translate-x-1/2 -translate-y-1/2 z-30 scale-50 sm:scale-[0.6] pointer-events-none">
        <div className="relative w-24 h-16 flex items-center justify-center">
            <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
            <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
        </div>
    </div>
);

const VoucherWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <span className="text-[10rem] font-black uppercase rotate-[-15deg] select-none translate-x-8 translate-y-4">Mcom</span>
    </div>
);

const VoucherCampaignCard: React.FC<Props> = ({ campaign, onUnlockClick }) => {
    const isFullyUsed = campaign.status === CampaignStatus.FULLY_USED;
    const isExpired = campaign.status === CampaignStatus.EXPIRED;

    return (
        <div className={`group relative bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row ${isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            {/* Left Section (Dark) */}
            <div className="md:w-[20%] bg-neutral-900 relative overflow-hidden flex flex-row md:flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />
                {/* Circular Balance Badge */}
                <div className="relative z-40 bg-red-600 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl md:mb-8 md:translate-x-4">
                    <span className="text-white text-xs md:text-sm font-black leading-none drop-shadow">£{campaign.totalValue.toFixed(0)}</span>
                    <span className="text-white text-[6px] md:text-[8px] font-bold uppercase tracking-widest mt-0.5">Value</span>
                </div>
                <div className="hidden md:block absolute bottom-4 text-center">
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Campaign</span>
                </div>
            </div>

            {/* Right Section (Light) */}
            <div className="flex-1 bg-white relative p-6 flex flex-col overflow-hidden">
                <VoucherWatermark />
                <VerticalRedRibbon />
                <RedBow />

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="pl-6 md:pl-8">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded bg-red-600" />
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-900">
                                MCOM MALL OFFICIAL
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mt-2">{campaign.name}</h2>
                    </div>

                    {/* QR Code graphic */}
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 ml-4 flex-shrink-0">
                        <QRCode value={campaign.id} size={50} />
                    </div>
                </div>

                <div className="relative z-10 pl-6 md:pl-8 mt-2 space-y-4">
                    <div className="inline-block bg-gray-100 rounded-lg px-3 py-1.5">
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                            Expires: <span className="text-red-600">{new Date(campaign.expiryDate).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {/* 3 Values Breakdown embedded inside Voucher UI */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-100 shadow-sm mt-4">
                        <CampaignValueSection campaign={campaign} />
                        <CampaignChannelBalances wallets={campaign.wallets} />
                    </div>
                </div>

                <div className="relative z-10 pl-6 md:pl-8 mt-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                    <div className="w-full sm:w-auto">
                        {isFullyUsed && (
                            <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold uppercase rounded flex items-center gap-2">
                                Fully Redeemed
                            </span>
                        )}
                        {isExpired && (
                            <span className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold uppercase rounded border border-red-200">
                                Expired
                            </span>
                        )}
                        {campaign.status === CampaignStatus.NOT_ACTIVE && (
                            <span className="text-xs font-bold text-gray-500 italic uppercase">Campaign Not Active</span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0 z-20">
                        {campaign.externalCampaign && campaign.externalRedemptionUrl && !isFullyUsed && !isExpired && (
                            <a href={campaign.externalRedemptionUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-11 rounded-xl">
                                    Redeem <ExternalLink className="w-4 h-4" />
                                </Button>
                            </a>
                        )}

                        {!campaign.contributionPaid && !isFullyUsed && !isExpired && (
                            <Button
                                onClick={() => onUnlockClick(campaign.id)}
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg font-bold px-6 h-11 rounded-xl"
                            >
                                Unlock Full Value
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherCampaignCard;
