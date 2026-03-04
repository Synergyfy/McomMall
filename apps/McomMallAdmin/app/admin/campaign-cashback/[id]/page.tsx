'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCampaignCashbackById, useDeleteCampaignCashback } from '@/service/campaign-cashback/hook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft,
    Calendar,
    Users,
    ShieldCheck,
    Layers,
    Trash2,
    Gift,
    Globe,
    Smartphone,
    CheckCircle2,
    History,
    Timer,
    ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function CampaignDetailAdminPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: uc, isLoading, error } = useGetCampaignCashbackById(id);
    const deleteMutation = useDeleteCampaignCashback();

    if (isLoading) return <CampaignDetailSkeleton />;

    if (error || !uc) return (
        <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Campaign Not Found</h2>
            <p className="text-slate-500">The specific campaign instance may have been deleted.</p>
            <Button onClick={() => router.push('/admin/campaign-cashback')}>Back to List</Button>
        </div>
    );

    const campaign = uc.campaign;

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-slate-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{campaign.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                {uc.status}
                            </Badge>
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-slate-500 text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Ends {new Date(campaign.endDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => {
                            if (confirm('Delete this campaign template?')) {
                                deleteMutation.mutate(campaign.id, {
                                    onSuccess: () => router.push('/admin/campaign-cashback')
                                });
                            }
                        }}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 className="w-4 h-4" /> Delete Template
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Config */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Value Breakdown */}
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layers className="w-5 h-5 text-emerald-500" /> 3-Tier Value Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3].map((v) => {
                                    const title = (campaign as any)[`value${v}Title`];
                                    const desc = (campaign as any)[`value${v}Description`];
                                    const usage = (campaign as any)[`value${v}UsageText`];
                                    const channels = (campaign as any)[`value${v}Channels`] || [];

                                    return (
                                        <div key={v} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">
                                                            V{v}
                                                        </span>
                                                        {title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 mt-1">{desc}</p>
                                                </div>
                                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                                                    £{campaign.levelValue.toFixed(2)} Base
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Channels</span>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {channels.length > 0 ? channels.map((c: string) => (
                                                            <Badge key={c} variant="outline" className="bg-white text-[10px]">{c}</Badge>
                                                        )) : <span className="text-xs text-slate-400">Any Channel</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage Logic</span>
                                                    <p className="text-xs text-slate-600 font-medium">{usage}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activation & Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-md flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-emerald-500" /> Activation Timer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Loyalty Timer</span>
                                    <span className="font-bold text-slate-900">{campaign.activationTimerDays || 0} Days</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Tasks</span>
                                    {campaign.activationTasks?.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {campaign.activationTasks.map((t: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-400">No activation tasks required.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-md flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Unlock Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mode</span>
                                    <span className="text-sm font-bold text-blue-900 uppercase">{campaign.unlockMode.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                    {campaign.unlockMode === 'REQUIRE_FULL_UNLOCK'
                                        ? "Users must pay their contribution before any platform preloaded values can be used."
                                        : "Users can spend the platform preloaded values immediately while working to unlock the total value."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: User Context */}
                <div className="space-y-6">
                    {/* Wallet Balances (For this specific user instance) */}
                    <Card className="border-0 shadow-sm bg-slate-900 text-white overflow-hidden">
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                                <History className="w-5 h-5 text-emerald-400" /> Real-time Instance Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {uc.wallets?.map((w: any) => (
                                <div key={w.channelType} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className="text-white border-white/20 uppercase text-[10px]">
                                            {w.channelType}
                                        </Badge>
                                        <span className="text-lg font-black text-emerald-400">
                                            £{(Number(w.value1Balance) + Number(w.value2Balance) + Number(w.value3Balance)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 h-1.5">
                                        <div className={cn("rounded-full", Number(w.value1Balance) > 0 ? "bg-emerald-500" : "bg-white/10")} title="Value 1" />
                                        <div className={cn("rounded-full", Number(w.value2Balance) > 0 ? "bg-emerald-500" : "bg-white/10")} title="Value 2" />
                                        <div className={cn("rounded-full", Number(w.value3Balance) > 0 ? "bg-emerald-500" : "bg-white/10")} title="Value 3" />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-white/10 mt-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Contribution Status</span>
                                    <span className={cn("text-xs font-black px-2 py-0.5 rounded", uc.contributionPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400")}>
                                        {uc.contributionPaid ? "PAID" : "PENDING"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* External Link if exists */}
                    {campaign.externalCampaign && (
                        <Card className="border-0 shadow-sm border-l-4 border-purple-500 bg-purple-50/30">
                            <CardContent className="p-6 space-y-3">
                                <h4 className="font-bold text-purple-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> External Redemption
                                </h4>
                                <p className="text-xs text-purple-700 font-medium">This campaign is managed externally. Spending via platform wallets is disabled.</p>
                                <Button variant="outline" className="w-full bg-white border-purple-100 text-purple-700 hover:bg-purple-100 gap-2 h-9 text-xs font-bold" onClick={() => window.open(campaign.externalRedemptionUrl, '_blank')}>
                                    Redemption URL <ExternalLink className="w-3 h-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Target Group */}
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b pb-4">
                            <CardTitle className="text-md flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" /> Targeting Group
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{campaign.targetType}</p>
                                    <p className="text-xs text-slate-500">Eligibility defined at template level.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function CampaignDetailSkeleton() {
    return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}
