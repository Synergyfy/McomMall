"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Megaphone, Plus, Share2, ArrowUpRight,
    Calendar, Users, Gift, Loader2, Search, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useGetMyCreatedCampaigns } from "@/service/campaigns/hook";
import { MyCampaign } from "@/service/campaigns/types";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CircleCollaborationProps {
    circleId: string;
    members: any[];
    myMemberId: string | null;
}

export function CircleCollaboration({ circleId, members, myMemberId }: CircleCollaborationProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
    const [selectedCampaignToAdopt, setSelectedCampaignToAdopt] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // We use all the campaigns the user has created or has access to as a baseline for collaboration.
    // In a fully built out system, this would be a specific hook like useGetCircleCampaigns(circleId)
    const { data: myCampaigns, isLoading: isLoadingMyCampaigns } = useGetMyCreatedCampaigns(1, 20);

    const handleAdoptClick = (campaign: any) => {
        setSelectedCampaignToAdopt(campaign);
        setIsAdoptModalOpen(true);
    };

    const confirmAdoption = () => {
        if (selectedCampaignToAdopt) {
            // Placeholder for API integration
            // e.g., await adoptCampaignMutation.mutateAsync(selectedCampaignToAdopt.id);
            toast.success(`Collaboration Confirmed!`, {
                description: `You have successfully adopted "${selectedCampaignToAdopt.name || selectedCampaignToAdopt.campaignName}".`
            });
            setIsAdoptModalOpen(false);
            setSelectedCampaignToAdopt(null);
        }
    };

    const displayCampaigns = myCampaigns?.data || [];
    const filteredCampaigns = displayCampaigns.filter((c: any) => 
        (c.name || c.campaignName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Marketplace & Collaboration</h3>
                    <p className="text-sm text-muted-foreground">Collaborate with circle members by sharing and promoting campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/dashboard/group-circles/partner-offers'}
                                    className="rounded-xl border-zinc-200"
                                >
                                    <Gift className="w-4 h-4 mr-2 text-orange-500" /> View Partner Offers
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Browse campaigns you've adopted from circle members.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Share My Campaign
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Share one of your active campaigns with this circle for collaborative promotion.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    placeholder="Search shared campaigns..."
                    className="pl-10 h-12 rounded-2xl border-zinc-200 bg-white/50 backdrop-blur-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {isLoadingMyCampaigns ? (
                    <div className="col-span-full flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No shared campaigns found. Be the first to share one!
                    </div>
                ) : (
                    filteredCampaigns.map((campaign: any) => (
                        <Card key={campaign.id} className="overflow-hidden border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 group flex flex-col">
                            <div className="relative h-44 w-full overflow-hidden">
                                <Image
                                    src={campaign.campaign_image || "https://placehold.co/600x200?text=Campaign"}
                                    alt={campaign.name || "Campaign"}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Live Offer</span>
                                    </div>
                                    <h4 className="text-white font-bold text-base leading-tight group-hover:text-orange-200 transition-colors line-clamp-1">{campaign.name || campaign.campaignName}</h4>
                                </div>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col gap-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-[10px] font-black text-orange-600 border border-orange-200/50">
                                        {(campaign.businessName || "Partner")[0]}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{campaign.businessName || "Partner Business"}</span>
                                </div>

                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic">
                                    "{campaign.campaign_message || campaign.description || 'No description provided.'}"
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {(campaign.rewards || ["Reward"]).map((reward: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-zinc-100/80 dark:bg-zinc-800/80 text-[10px] py-0 h-5 px-2 font-medium text-zinc-600 border-none">
                                            <Gift className="w-2.5 h-2.5 mr-1 text-orange-500" /> {reward}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                            <Users className="w-3 h-3 text-orange-500/70" /> {campaign.participants || 0} Partners
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                            <Calendar className="w-3 h-3 text-orange-500/70" /> {new Date(campaign.endDate || campaign.endsAt || Date.now()).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleAdoptClick(campaign)}
                                                    className="rounded-xl h-9 px-4 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 font-bold text-xs"
                                                >
                                                    Adopt
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Add this partner's campaign to your offers and earn rewards for referrals.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Share Campaign Dialog */}
            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Share Campaign to Circle</DialogTitle>
                        <DialogDescription>
                            Select one of your active campaigns to share with your circle partners.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <ScrollArea className="h-[300px] pr-4">
                            {isLoadingMyCampaigns ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                </div>
                            ) : myCampaigns?.data && myCampaigns.data.length > 0 ? (
                                <div className="space-y-3">
                                    {(myCampaigns?.data || []).map((campaign: MyCampaign) => (
                                        <div
                                            key={campaign.id}
                                            onClick={() => {
                                                toast.success(`${campaign.name} shared with the circle!`);
                                                setIsShareModalOpen(false);
                                            }}
                                            className="p-4 border rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-bold text-zinc-900 group-hover:text-orange-700">{campaign.name}</h5>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">{campaign.campaign_message}</p>
                                                </div>
                                                <Megaphone className="w-4 h-4 text-zinc-300 group-hover:text-orange-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-sm text-muted-foreground">No active campaigns found. Create one first!</p>
                                    <Button variant="link" className="text-orange-600 mt-2">Go to Campaigns</Button>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsShareModalOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Adopt Confirmation Dialog */}
            <Dialog open={isAdoptModalOpen} onOpenChange={setIsAdoptModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem]">
                    <div className="relative h-32 w-full bg-orange-600 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <Share2 className="w-16 h-16 text-white/20 absolute -right-4 -top-4 rotate-12" />
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl relative z-10">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-bold text-zinc-900">Adopt Campaign Offer</DialogTitle>
                            <DialogDescription className="text-zinc-500">
                                You are about to collaborate with <span className="font-bold text-zinc-900">{selectedCampaignToAdopt?.businessName}</span>.
                            </DialogDescription>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-3">
                            <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Partnership Terms</h5>
                            <ul className="space-y-2.5">
                                {[
                                    "Campaign rewards will be issued to your customers.",
                                    "You earn matching points for successful referrals.",
                                    "Real-time analytics shared between both partners.",
                                    "One-click distribution to your network enabled."
                                ].map((term, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-zinc-600 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                                        {term}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-zinc-200 font-bold"
                                onClick={() => setIsAdoptModalOpen(false)}
                            >
                                Decline
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20"
                                onClick={confirmAdoption}
                            >
                                Accept & Connect
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const Separator = ({ className }: { className?: string }) => (
    <div className={cn("h-[1px] w-full bg-zinc-200", className)} />
);
