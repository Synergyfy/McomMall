import React from 'react';
import CampaignForm from './CampaignForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export default function CreateCampaignCashbackPage() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Campaign Cashback</h2>
                    <p className="text-muted-foreground">
                        Configure a new 3-tier promotional campaign with preloaded values and locked customer contributions.
                    </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                    <Layers className="w-5 h-5" />
                    <span className="font-semibold text-sm">3-Part Value Splitting Engine</span>
                </div>
            </div>

            <Card className="border-t-4 border-t-emerald-600 shadow-lg">
                <CardHeader>
                    <CardTitle>Campaign Configuration</CardTitle>
                    <CardDescription>
                        Input total amount, adjust channels, and define explanations for each value portion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CampaignForm />
                </CardContent>
            </Card>
        </div>
    );
}
