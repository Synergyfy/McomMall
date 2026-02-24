import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Plus } from 'lucide-react';

export default function CampaignCashbackAdminPage() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Campaign Cashback</h2>
                    <p className="text-muted-foreground">
                        Manage your promotional 3-tier cashback campaigns.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/campaign-cashback/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Create New Campaign
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-dashed border-2 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <Gift className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Created Yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Get started by creating your first promotional Campaign Cashback. You can configure total values, display types, and granular lock settings.
                    </p>
                    <Link href="/admin/campaign-cashback/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Create Campaign
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
