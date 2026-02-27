import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useGetCampaignCashbacks } from '@/service/campaign-cashback/hook';
import { CampaignTargetType, CampaignDisplayType } from '@/service/campaign-cashback/types';
import { CampaignCashbackCard } from './CampaignCashbackCard';
import { CampaignUnlockModal } from './CampaignUnlockModal';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Ticket, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CampaignCashbackList: React.FC = () => {
    const { userRole } = useSelector((state: RootState) => state.auth);

    // Map standard auth UserRole to the new Campaign target types
    const role = userRole?.toLowerCase();
    const targetType = (role === 'owner' || role === 'admin')
        ? CampaignTargetType.B2B
        : CampaignTargetType.B2C;

    const { data, isLoading, error } = useGetCampaignCashbacks({ targetType });
    const campaigns = data?.data || [];

    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [displayFilter, setDisplayFilter] = useState<CampaignDisplayType>(CampaignDisplayType.VOUCHER);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                Failed to load Campaign Cashbacks. Please try again later.
            </div>
        );
    }

    const filteredCampaigns = campaigns.filter(c => c.displayType === displayFilter);

    return (
        <div className="space-y-6">
            {/* Filter Toggle */}
            <div className="flex items-center justify-center p-1 bg-gray-100/80 rounded-xl w-full max-w-sm mx-auto shadow-inner border border-gray-200">
                <button
                    onClick={() => setDisplayFilter(CampaignDisplayType.VOUCHER)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300",
                        displayFilter === CampaignDisplayType.VOUCHER
                            ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Ticket className="w-4 h-4" />
                    Vouchers
                </button>
                <button
                    onClick={() => setDisplayFilter(CampaignDisplayType.E_CARD)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300",
                        displayFilter === CampaignDisplayType.E_CARD
                            ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Gift className="w-4 h-4" />
                    E-Cards
                </button>
            </div>

            {filteredCampaigns.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            {displayFilter === CampaignDisplayType.VOUCHER ? (
                                <Ticket className="w-8 h-8 text-gray-400" />
                            ) : (
                                <Gift className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No {displayFilter === CampaignDisplayType.VOUCHER ? 'Voucher' : 'E-Card'} Campaigns</h3>
                        <p className="text-muted-foreground max-w-sm">
                            You don't have any active {displayFilter === CampaignDisplayType.VOUCHER ? 'Voucher' : 'E-Card'} campaigns at the moment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-6">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCashbackCard
                            key={campaign.id}
                            campaign={campaign}
                            onUnlockClick={(id) => setSelectedCampaignId(id)}
                        />
                    ))}
                </div>
            )}

            <CampaignUnlockModal
                isOpen={!!selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
                campaign={selectedCampaign}
            />
        </div>
    );
};
