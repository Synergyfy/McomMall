import React from 'react';
import { CampaignCashback, CampaignStatus } from '@/service/campaign-cashback/types';
import { CampaignValueSection } from './CampaignValueSection';
import { CampaignChannelBalances } from './CampaignChannelBalances';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import { CampaignTimer } from './CampaignTimer';

interface Props {
    campaign: CampaignCashback;
    onUnlockClick: (campaignId: string) => void;
}

const VerticalRedRibbon = () => (
    <div className="absolute top-0 left-[4%] bottom-0 w-2.5 z-20 pointer-events-none border-x border-black/10">
        <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[1px_0_10px_rgba(0,0,0,0.2)]" />
    </div>
);

const RedBow = () => (
    <div className="absolute top-1/2 left-[4%] -translate-x-1/2 -translate-y-1/2 z-30 scale-[0.55] sm:scale-[0.55] pointer-events-none">
        <div className="relative w-24 h-16 flex items-center justify-center">
            <div className="absolute -left-1.5 w-12 h-12 border-[3px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
            <div className="absolute -right-1.5 w-12 h-12 border-[3px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
        </div>
    </div>
);

const VoucherWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none overflow-hidden">
        <span className="text-[9rem] font-black uppercase rotate-[-15deg] select-none translate-x-8 translate-y-4">Mcom</span>
    </div>
);

const VoucherCampaignCard: React.FC<Props> = ({ campaign, onUnlockClick }) => {
    const isFullyUsed = campaign.status === CampaignStatus.FULLY_USED;
    const isExpired = campaign.status === CampaignStatus.EXPIRED;

    return (
        <div className={`group relative bg-white rounded-[1.1rem] shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row max-w-3xl mx-auto ${isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            {/* Left Section (Dark) */}
            <div className="md:w-[9%] bg-neutral-900 relative overflow-hidden flex flex-row md:flex-col items-center justify-center p-3">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />
                {/* Circular Balance Badge */}
                <div className="relative z-40 bg-red-600 w-12 h-14 md:w-14 md:h-14 rounded-full border-2 border-white/20 flex flex-col items-center justify-center shadow-xl md:mb-3 md:translate-x-1">
                    <span className="text-white text-xs md:text-sm font-black leading-none drop-shadow">£{campaign.totalValue.toFixed(0)}</span>
                    <span className="text-white text-[6px] md:text-[7px] font-bold uppercase tracking-widest mt-0.5">Value</span>
                </div>
                <div className="hidden md:block absolute bottom-2 text-center">
                    <span className="text-[5px] text-white/50 uppercase tracking-[0.2em] font-bold rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Campaign</span>
                </div>
            </div>

            {/* Right Section (Light) */}
            <div className="flex-1 bg-white relative p-4 flex flex-col overflow-hidden">
                <VoucherWatermark />
                <VerticalRedRibbon />
                <RedBow />

                <div className="relative z-10 flex justify-between items-start mb-2">
                    <div className="pl-4 md:pl-6">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-2.5 h-2.5 rounded bg-red-600 shadow-sm" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                                MCOM MALL OFFICIAL
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mt-1">{campaign.name}</h2>
                    </div>

                    {/* QR Code graphic */}
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 ml-3 flex-shrink-0">
                        <QRCode value={campaign.id} size={38} />
                    </div>
                </div>

                <div className="relative z-10 pl-4 md:pl-6 mt-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-block bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-100">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                Expires: <span className="text-red-600">{new Date(campaign.expiryDate).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <CampaignTimer
                            expiryDate={campaign.expiryDate}
                            activationTimerDate={campaign.activationTimerDate}
                            isActivationRequired={campaign.isActivationRequired}
                            activationTasks={campaign.activationTasks}
                        />
                    </div>

                    {/* 3 Values Breakdown embedded inside Voucher UI */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1.5 border border-gray-100 shadow-sm mt-2">
                        <CampaignValueSection campaign={campaign} />
                        <CampaignChannelBalances wallets={campaign.wallets} />
                    </div>
                </div>

                <div className="relative z-10 pl-4 md:pl-6 mt-4 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3">
                    <div className="w-full sm:w-auto">
                        {isFullyUsed && (
                            <span className="px-2 py-1 bg-gray-800 text-white text-[10px] font-bold uppercase rounded flex items-center gap-2">
                                Fully Redeemed
                            </span>
                        )}
                        {isExpired && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded border border-red-200">
                                Expired
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 z-20">
                        {campaign.externalCampaign && campaign.externalRedemptionUrl && !isFullyUsed && !isExpired && (
                            <a href={campaign.externalRedemptionUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 h-9 rounded-lg text-xs">
                                    Redeem <ExternalLink className="w-3 h-3" />
                                </Button>
                            </a>
                        )}

                        {!campaign.contributionPaid && !isFullyUsed && !isExpired && (
                            <Button
                                onClick={() => onUnlockClick(campaign.id)}
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-md font-bold px-4 h-9 rounded-lg text-xs"
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
