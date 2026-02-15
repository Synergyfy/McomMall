"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Gift, Users, Calendar, Search,
    Filter, LayoutGrid, List, ArrowUpRight,
    Share2, ExternalLink, Zap, Clock, CheckCircle2
} from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DistributeOfferDialog } from "./components/DistributeOfferDialog";
import { toast } from "sonner";

// Mock Marketplace Data
const MOCK_MARKETPLACE_OFFERS = [
    {
        id: "mkt-1",
        businessName: "Gourmet Garden",
        campaignName: "Farm to Table Series",
        description: "Promote our organic seasonal menu. Earn 50 matching points per new customer referral.",
        bannerUrl: "https://placehold.co/600x200?text=Gourmet+Garden",
        rewards: ["15% Off Total Bill", "Free Dessert"],
        participants: 15,
        endsAt: "2026-05-20T00:00:00Z"
    },
    {
        id: "mkt-2",
        businessName: "Tech Hub",
        campaignName: "Gadget Launch Collaboration",
        description: "Be the first to share our new gadget launch. Exclusive rewards for your top tier customers.",
        bannerUrl: "https://placehold.co/600x200?text=Tech+Hub",
        rewards: ["£50 Tech Voucher", "Free Repairs"],
        participants: 22,
        endsAt: "2026-06-10T00:00:00Z"
    },
    {
        id: "mkt-3",
        businessName: "Wellness Way",
        campaignName: "Mindful May Partnerships",
        description: "A month of wellness! Share our yoga and meditation classes with your community.",
        bannerUrl: "https://placehold.co/600x200?text=Wellness+Way",
        rewards: ["Free Yoga Session", "Health Pack"],
        participants: 31,
        endsAt: "2026-05-31T00:00:00Z"
    },
    {
        id: "mkt-4",
        businessName: "Urban Style",
        campaignName: "Streetwear Pop-up Share",
        description: "Promote our limited edition pop-up. High conversion rewards for fashion enthusiasts.",
        bannerUrl: "https://placehold.co/600x200?text=Urban+Style",
        rewards: ["Exclusive T-Shirt", "20% Discount"],
        participants: 12,
        endsAt: "2026-04-15T00:00:00Z"
    }
];

export default function PartnerOffersPage() {
    const [adoptedCampaigns, setAdoptedCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [distributeOpen, setDistributeOpen] = useState(false);
    const [adoptOpen, setAdoptOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    useEffect(() => {
        const loadData = () => {
            const saved = localStorage.getItem('adopted_campaigns');
            if (saved) {
                setAdoptedCampaigns(JSON.parse(saved));
            }
            setTimeout(() => setIsLoading(false), 800);
        };
        loadData();
    }, []);

    const handleDistributeClick = (campaign: any) => {
        setSelectedCampaign(campaign);
        setDistributeOpen(true);
    };

    const handleAdoptClick = (campaign: any) => {
        setSelectedCampaign(campaign);
        setAdoptOpen(true);
    };

    const confirmAdoption = () => {
        if (selectedCampaign) {
            const alreadyAdopted = adoptedCampaigns.some(c => c.id === selectedCampaign.id);
            if (alreadyAdopted) {
                toast.error("You have already adopted this campaign.");
                setAdoptOpen(false);
                return;
            }

            const newList = [...adoptedCampaigns, selectedCampaign];
            setAdoptedCampaigns(newList);
            localStorage.setItem('adopted_campaigns', JSON.stringify(newList));

            toast.success("Collaboration Confirmed!", {
                description: `You have successfully adopted "${selectedCampaign.campaignName}".`
            });
            setAdoptOpen(false);

            // Switch to adopted tab to show the result
            const adoptedTab = document.querySelector('[value="adopted"]') as HTMLButtonElement;
            adoptedTab?.click();
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/30 dark:bg-zinc-950/30 p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link
                        href="/dashboard/my-assets/group-circles"
                        className="text-orange-600 flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Circles
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Partner Offers</h1>
                    <p className="text-zinc-500 font-medium">Manage and monitor your collaborative campaign partnerships.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={cn("h-9 w-9 rounded-lg", viewMode === "grid" && "shadow-sm")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className={cn("h-9 w-9 rounded-lg", viewMode === "list" && "shadow-sm")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 px-6">
                        <Share2 className="w-4 h-4 mr-2" /> Share New Offer
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="adopted" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <TabsList className="bg-transparent h-auto p-0 gap-8">
                        <TabsTrigger
                            value="adopted"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent bg-transparent px-0 pb-4 text-base font-bold transition-all"
                        >
                            My Adopted Offers
                            <Badge className="ml-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none">{adoptedCampaigns.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="marketplace"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent bg-transparent px-0 pb-4 text-base font-bold transition-all"
                        >
                            Marketplace Opportunities
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 pb-4 md:pb-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input placeholder="Filter offers..." className="pl-9 h-10 w-[240px] rounded-xl border-zinc-200" />
                        </div>
                        <Button variant="outline" className="h-10 rounded-xl border-zinc-200 gap-2">
                            <Filter className="w-4 h-4" /> Sort
                        </Button>
                    </div>
                </div>

                <TabsContent value="adopted" className="mt-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-[400px] rounded-[2rem] bg-zinc-100 animate-pulse" />
                                ))}
                            </div>
                        ) : adoptedCampaigns.length > 0 ? (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}>
                                {adoptedCampaigns.map((campaign, idx) => (
                                    <motion.div
                                        key={campaign.id + idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group">
                                            <div className="relative h-40 w-full overflow-hidden">
                                                <Image
                                                    src={campaign.bannerUrl}
                                                    alt={campaign.campaignName}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-emerald-500 text-white border-none shadow-lg">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                                                    </Badge>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h4 className="text-white font-black text-lg leading-tight line-clamp-1">{campaign.campaignName}</h4>
                                                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest mt-1">Partner: {campaign.businessName}</p>
                                                </div>
                                            </div>
                                            <CardContent className="p-6 space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                        <span className="text-xs font-bold text-zinc-600">Active Partnership</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">ID: {campaign.id.slice(0, 8)}</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-500">Your Referrals</span>
                                                        <span className="font-bold text-zinc-900">24 Customers</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-orange-500 w-[65%] rounded-full" />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-zinc-100 flex gap-2">
                                                    <Button variant="outline" className="flex-1 h-10 rounded-xl border-zinc-200 text-xs font-bold">
                                                        Analytics
                                                    </Button>
                                                    <Button
                                                        className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-xs font-bold"
                                                        onClick={() => handleDistributeClick(campaign)}
                                                    >
                                                        Distribute
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
                                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                                    <Zap className="w-12 h-12 text-orange-200" />
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900">No Adopted Offers Yet</h3>
                                <p className="text-zinc-500 max-w-md mt-2 font-medium">
                                    Browse the Marketplace Opportunities tab to find campaigns from your partners that you can distribute to your customers.
                                </p>
                                <Button
                                    className="mt-8 bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-orange-500/20"
                                    onClick={() => {
                                        const marketplaceTab = document.querySelector('[value="marketplace"]') as HTMLButtonElement;
                                        marketplaceTab?.click();
                                    }}
                                >
                                    Explore Marketplace
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                <TabsContent value="marketplace" className="mt-0">
                    <div className={cn(
                        "grid gap-6",
                        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                    )}>
                        {MOCK_MARKETPLACE_OFFERS.map((campaign, idx) => {
                            const isAdopted = adoptedCampaigns.some(c => c.id === campaign.id);
                            return (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="overflow-hidden border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 group flex flex-col h-full">
                                        <div className="relative h-44 w-full overflow-hidden">
                                            <Image
                                                src={campaign.bannerUrl}
                                                alt={campaign.campaignName}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Badge className="bg-orange-500 text-white border-none text-[9px] font-black tracking-widest uppercase">New Opportunity</Badge>
                                                </div>
                                                <h4 className="text-white font-bold text-base leading-tight group-hover:text-orange-200 transition-colors line-clamp-1">{campaign.campaignName}</h4>
                                            </div>
                                        </div>
                                        <CardContent className="p-5 flex-1 flex flex-col gap-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-600 border border-zinc-200/50">
                                                    {campaign.businessName[0]}
                                                </div>
                                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{campaign.businessName}</span>
                                            </div>

                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic">
                                                "{campaign.description}"
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                                {campaign.rewards.map((reward, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-zinc-100/80 dark:bg-zinc-800/80 text-[10px] py-0 h-5 px-2 font-medium text-zinc-600 border-none">
                                                        <Gift className="w-2.5 h-2.5 mr-1 text-orange-500" /> {reward}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                                        <Users className="w-3 h-3 text-orange-500/70" /> {campaign.participants} Partners
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                                        <Calendar className="w-3 h-3 text-orange-500/70" /> {new Date(campaign.endsAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    disabled={isAdopted}
                                                    onClick={() => handleAdoptClick(campaign)}
                                                    className={cn(
                                                        "rounded-xl h-9 px-4 transition-all duration-300 font-bold text-xs",
                                                        isAdopted
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/20"
                                                    )}
                                                >
                                                    {isAdopted ? "Adopted" : "Adopt"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            <DistributeOfferDialog
                open={distributeOpen}
                onOpenChange={setDistributeOpen}
                campaign={selectedCampaign}
            />

            {/* Adopt Confirmation Dialog */}
            <Dialog open={adoptOpen} onOpenChange={setAdoptOpen}>
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
                                You are about to collaborate with <span className="font-bold text-zinc-900">{selectedCampaign?.businessName}</span>.
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
                                onClick={() => setAdoptOpen(false)}
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
