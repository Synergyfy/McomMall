"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Star, Share2, Banknote, Wallet, MessageSquare, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member } from "./MultiLayerRadialGraph";

interface MemberSidebarProps {
    activeMember: Member;
    onClose: () => void;
    selectedCircle: any;
    myMemberId: string | null | undefined;
    onSetChatType: (type: 'GROUP' | 'DIRECT') => void;
    onSetChatMemberId: (id: string | null) => void;
    onSetIsChatOverlayOpen: (open: boolean) => void;
    onSetContributionOpen: (open: boolean) => void;
    onRemoveMember: () => void;
    isRemoving: boolean;
}

export const MemberSidebar = React.memo(({
    activeMember,
    onClose,
    selectedCircle,
    myMemberId,
    onSetChatType,
    onSetChatMemberId,
    onSetIsChatOverlayOpen,
    onSetContributionOpen,
    onRemoveMember,
    isRemoving
}: MemberSidebarProps) => {
    return (
        <motion.div
            initial={{ width: 0, opacity: 0, x: 20 }}
            animate={{ width: 340, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 20 }}
            className="flex-none overflow-hidden h-full z-20"
        >
            <Card className="w-full h-full border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
                <div className="h-32 bg-gradient-to-br from-orange-400 to-red-600 relative p-6 flex justify-between items-start">
                    <Badge className="bg-white/20 backdrop-blur text-white border-white/30 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                        Member Node
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl h-9 w-9" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <CardContent className="flex-1 overflow-y-auto px-6 -mt-10 space-y-6 pb-20">
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-xl overflow-hidden p-1.5 animate-in zoom-in-50 duration-500">
                                <Avatar className="w-full h-full rounded-2xl">
                                    <AvatarImage src={activeMember.avatar} />
                                    <AvatarFallback className="text-3xl font-black bg-orange-50 text-orange-600 uppercase">{activeMember.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex gap-2 pb-1">
                                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 border-zinc-100 shadow-sm"><Star className="w-4 h-4 text-zinc-300" /></Button>
                                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 border-zinc-100 shadow-sm"><Share2 className="w-4 h-4 text-zinc-300" /></Button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{activeMember.name}</h2>
                                {activeMember.status === 'active' && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                )}
                            </div>
                            <p className="text-orange-600 font-bold text-sm tracking-wide">{activeMember.category}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-2">Location</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeMember.locationTag}</span>
                        </div>
                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-2">Relationship</span>
                            <span className="font-bold text-orange-600">{activeMember.relationshipTag}</span>
                        </div>
                    </div>

                    {selectedCircle?.type === 'finance' && (
                        <div className="p-5 bg-zinc-900 dark:bg-black rounded-3xl border border-zinc-800 text-white relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-orange-600/10 blur-3xl rounded-full" />
                            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
                                <Banknote className="w-4 h-4 text-orange-500" /> Financial Standing
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                    <span className="text-xs opacity-60">Total Contribution</span>
                                    <span className="font-black text-sm uppercase">£{activeMember.contributions || 0}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                    <span className="text-xs opacity-60">Cycle Draw</span>
                                    <span className="font-black text-sm uppercase">{activeMember.drawDate ? new Date(activeMember.drawDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {myMemberId && (
                        <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                    <Wallet className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold">Your Wallet</span>    
                            </div>
                            <Button
                                size="sm"
                                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 h-8 rounded-lg font-bold text-[10px]"
                                onClick={() => onSetContributionOpen(true)}
                            >
                                MAKE CONTRIBUTION
                            </Button>
                        </div>
                    )}

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            className="w-full h-12 bg-orange-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
                            onClick={() => {
                                onSetChatType('GROUP');
                                onSetChatMemberId(null);
                                onSetIsChatOverlayOpen(true);
                            }}
                        >
                            <Users className="w-4 h-4" /> Circle Broadcast
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 border-zinc-200 text-zinc-700 rounded-2xl font-bold flex items-center justify-center gap-2"
                            onClick={() => {
                                onSetChatType('DIRECT');
                                onSetChatMemberId(activeMember.id);
                                onSetIsChatOverlayOpen(true);
                            }}
                        >
                            <MessageSquare className="w-4 h-4" /> Direct Message     
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-12 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl font-bold"
                            onClick={onRemoveMember}
                            disabled={isRemoving}
                        >
                            {isRemoving ? "Removing..." : "Remove Member"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});

MemberSidebar.displayName = "MemberSidebar";

