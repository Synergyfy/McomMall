'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CampaignForm from './CampaignForm';
import { CampaignTypeModal } from './CampaignTypeModal';
import { Season } from '@/service/seasons/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, CalendarRange } from 'lucide-react';

export default function CreateCampaignCashbackPage() {
    const router = useRouter();
    // null = modal not yet resolved, 'regular' | season object = chosen
    const [campaignCategory, setCampaignCategory] = useState<null | 'regular' | Season>(null);

    const modalOpen = campaignCategory === null;
    const season = campaignCategory && campaignCategory !== 'regular' ? campaignCategory as Season : null;

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            {/* Type selection modal */}
            <CampaignTypeModal
                isOpen={modalOpen}
                onClose={() => router.push('/admin/campaign-cashback')}
                onSelectRegular={() => setCampaignCategory('regular')}
                onSelectSeasonal={(s) => setCampaignCategory(s)}
            />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Campaign Cashback</h2>
                    <p className="text-muted-foreground">
                        Configure a new 3-tier promotional campaign with preloaded values and locked customer contributions.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    {season && (
                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-200">
                            <CalendarRange className="w-5 h-5" />
                            <span className="font-semibold text-sm">Seasonal — {season.name}</span>
                        </div>
                    )}
                    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                        <Layers className="w-5 h-5" />
                        <span className="font-semibold text-sm">3-Part Value Splitting Engine</span>
                    </div>
                </div>
            </div>

            {campaignCategory !== null && (
                <Card className="border-t-4 border-t-emerald-600 shadow-lg">
                    <CardHeader>
                        <CardTitle>Campaign Configuration</CardTitle>
                        <CardDescription>
                            Input total amount, adjust channels, and define explanations for each value portion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CampaignForm season={season} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
