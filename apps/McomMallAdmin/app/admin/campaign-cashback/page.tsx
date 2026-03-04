'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Plus, Users, Building2, Crown, Navigation, Loader2, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useGetCampaignCashbacks, useDeleteCampaignCashback } from '@/service/campaign-cashback/hook';
import { CampaignTargetType } from '@/service/campaign-cashback/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export default function CampaignCashbackAdminPage() {
    const [activeTab, setActiveTab] = useState<CampaignTargetType | 'ALL'>('ALL');
    const deleteMutation = useDeleteCampaignCashback();
    const router = useRouter();

    const { data: campaigns, isLoading } = useGetCampaignCashbacks(
        activeTab === 'ALL' ? undefined : activeTab as CampaignTargetType
    );

    const tabs = [
        { id: 'ALL', label: 'All Eligibility', icon: Gift },
        { id: CampaignTargetType.CUSTOMER, label: 'B2C (Customers)', icon: Users },
        { id: CampaignTargetType.BUSINESS, label: 'B2B (Businesses)', icon: Building2 },
    ];

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Campaign Cashback</h2>
                    <p className="text-muted-foreground mt-1">
                        View and manage active promotional campaign cards eligible for users.
                    </p>
                </div>
                <Link href="/admin/campaign-cashback/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-100 h-11 px-6">
                        <Plus className="w-4 h-4" /> Create New Template
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
                            activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-emerald-400" : "text-slate-400")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    <p className="font-medium animate-pulse">Syncing campaign data...</p>
                </div>
            ) : !campaigns || campaigns.length === 0 ? (
                <Card className="border-dashed border-2 bg-white/50 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <Gift className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Campaigns Found</h3>
                        <p className="text-slate-500 max-w-sm mb-8">
                            There are currently no campaign cards matching your criteria. Create a template to launch a new promotional event.
                        </p>
                        <Link href="/admin/campaign-cashback/create">
                            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 h-11 px-8">
                                <Plus className="w-4 h-4" /> Launch First Campaign
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((uc: any) => (
                        <Card key={uc.id} className="overflow-hidden border-slate-200 hover:shadow-xl transition-all group border-0 shadow-md">
                            <div className="h-2 bg-emerald-500" />
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors">
                                            {uc.campaign.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 font-medium">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                                {uc.status}
                                            </Badge>
                                            {uc.contributionPaid && (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                                    Fully Unlocked
                                                </Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Wallet className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Total Card Value</span>
                                        <span className="font-bold text-slate-900 text-lg">£{uc.campaign.totalValue}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="h-1.5 bg-emerald-400 rounded-full" />
                                        <div className="h-1.5 bg-emerald-400 rounded-full" />
                                        <div className={cn("h-1.5 rounded-full transition-colors", uc.contributionPaid ? "bg-emerald-400" : "bg-slate-200")} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                        {uc.contributionPaid ? "All 3 value tiers active" : "Waiting for 1/3 contribution"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Channels</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {uc.wallets?.map((w: any, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 bg-white border-slate-200 text-slate-600 font-bold">
                                                {w.channelType}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg gap-2"
                                        onClick={() => router.push(`/admin/campaign-cashback/${uc.id}`)}
                                    >
                                        Manage <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this campaign template? This will remove it for all users.')) {
                                                deleteMutation.mutate(uc.campaign.id);
                                            }
                                        }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
