import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useGetCampaignCashbacks } from '@/service/campaign-cashback/hook';
import { CampaignTargetType } from '@/service/campaign-cashback/types';
import { CampaignCashbackCard } from './CampaignCashbackCard';
import { CampaignUnlockModal } from './CampaignUnlockModal';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Ticket } from 'lucide-react';

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

    if (campaigns.length === 0) {
        return (
            <Card className="border-dashed border-2 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Ticket className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Available</h3>
                    <p className="text-muted-foreground max-w-sm">
                        You don't have any active Campaign Cashbacks to redeem at the moment. Keep an eye out for new promotions!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6">
                {campaigns.map(campaign => (
                    <CampaignCashbackCard
                        key={campaign.id}
                        campaign={campaign}
                        onUnlockClick={(id) => setSelectedCampaignId(id)}
                    />
                ))}
            </div>

            <CampaignUnlockModal
                isOpen={!!selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
                campaign={selectedCampaign}
            />
        </div>
    );
};
