"use client";

import React, { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, Globe, Loader2, Plus, Zap, Banknote, ShieldCheck, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { useGetDiscoverableCircles, useJoinGroupCircle } from "@/service/group-circle/hook";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface JoinCircleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupCircleTypes: any[];
    onJoined?: (circleId: string) => void;
}

export function JoinCircleDialog({ open, onOpenChange, groupCircleTypes, onJoined }: JoinCircleDialogProps) {
    const [search, setSearch] = useState("");
    const [step, setStep] = useState<"search" | "details" | "success">("search");
    const [selectedCircle, setSelectedCircle] = useState<any>(null);
    const [isJoining, setIsJoining] = useState(false);

    const { data: discoverableData, isLoading } = useGetDiscoverableCircles();
    const joinMutation = useJoinGroupCircle();

    const handleSelectCircle = (circle: any) => {
        setSelectedCircle(circle);
        setStep("details");
    };

    const handleJoin = async () => {
        if (!selectedCircle) return;

        setIsJoining(true);

        try {
            await joinMutation.mutateAsync(selectedCircle.id);
            setStep("success");
            toast.success(`Successfully joined ${selectedCircle.name}!`);
        } catch (error) {
            toast.error("Failed to join circle. You might already be a member.");
            setIsJoining(false);
        }
    };

    const handleClose = () => {
        const id = selectedCircle?.id;
        onOpenChange(false);
        // Reset after animation
        setTimeout(() => {
            if (step === "success" && id && onJoined) {
                onJoined(id);
            }
            setStep("search");
            setSelectedCircle(null);
            setIsJoining(false);
        }, 300);
    };

    const filteredCircles = (discoverableData?.data || []).filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.ownerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else onOpenChange(true); }}>
            <DialogContent className={cn(
                "p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl transition-all duration-500",
                step === "search" ? "sm:max-w-[550px]" : "sm:max-w-[500px]"
            )}>
                <AnimatePresence mode="wait">
                    {step === "search" && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col"
                        >
                            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                                <DialogTitle className="text-3xl font-black tracking-tight text-zinc-900">Discover Circles</DialogTitle>
                                <DialogDescription className="mt-2 text-zinc-500 font-medium">
                                    Join collaborative networks created by other businesses and expand your reach.
                                </DialogDescription>

                                <div className="relative mt-8">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <Input
                                        placeholder="Search by circle name or industry..."
                                        className="pl-12 h-14 bg-white border-zinc-200 rounded-2xl focus:ring-orange-500/20 shadow-sm text-base"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[450px]">
                                <div className="p-6 space-y-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="relative">
                                                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                                                <Globe className="w-6 h-6 text-orange-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            </div>
                                            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Scanning World Circles...</p>
                                        </div>
                                    ) : filteredCircles.length > 0 ? (
                                        filteredCircles.map((circle) => {
                                            const typeDef = groupCircleTypes.find(t => t.id === circle.type);
                                            return (
                                                <div
                                                    key={circle.id}
                                                    onClick={() => handleSelectCircle(circle)}
                                                    className="flex items-center justify-between p-5 rounded-[1.5rem] border border-zinc-100 bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500",
                                                            typeDef?.gradient || "bg-zinc-400"
                                                        )}>
                                                            {React.createElement(typeDef?.icon || Globe, { className: "w-7 h-7" })}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors text-lg">{circle.name}</h4>
                                                            </div>
                                                            <p className="text-xs text-zinc-500 mt-0.5 font-medium">Managed by <span className="text-zinc-900">{circle.ownerName}</span></p>
                                                            <div className="flex items-center gap-3 mt-3">
                                                                <Badge className="bg-zinc-100 text-zinc-600 border-none px-2 py-0 h-5 text-[9px] font-black tracking-widest uppercase">
                                                                    {circle.type.replace('_', ' ')}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                                    <Users className="w-3 h-3 text-orange-500" /> {circle.memberCount} Members
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                                            <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                                                <Globe className="w-10 h-10 text-zinc-200" />
                                            </div>
                                            <h4 className="text-xl font-bold text-zinc-900">No joinable circles found</h4>
                                            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">Try adjusting your keywords or industry filters to find new collaboration opportunities.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-center">
                                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em]">Verified Public Networks Only</p>
                            </div>
                        </motion.div>
                    )}

                    {step === "details" && selectedCircle && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col"
                        >
                            <div className={cn(
                                "h-40 w-full p-8 flex flex-col justify-end relative overflow-hidden",
                                groupCircleTypes.find(t => t.id === selectedCircle.type)?.gradient || "bg-zinc-800"
                            )}>
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                                <div className="absolute top-8 right-8">
                                    <Globe className="w-24 h-24 text-white/10 rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 mb-3 font-black text-[9px] tracking-[0.2em]">CIRCLE PREVIEW</Badge>
                                    <h3 className="text-3xl font-black text-white tracking-tight leading-none">{selectedCircle.name}</h3>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">About this circle</h5>
                                    <p className="text-zinc-600 text-sm leading-relaxed font-medium">{selectedCircle.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedCircle.tags?.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="bg-zinc-100 text-zinc-600 rounded-lg px-3 py-1 font-bold text-[10px]">#{tag}</Badge>
                                    ))}
                                </div>

                                <div className="bg-zinc-50 rounded-[1.5rem] p-6 border border-zinc-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                                        <h5 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Circle Terms & Conduct</h5>
                                    </div>
                                    <ul className="space-y-3">
                                        {selectedCircle.terms?.map((term: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-xs text-zinc-500 font-medium leading-normal">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                                                {term}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedCircle.contributionAmount > 0 && (
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                                <Banknote className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Collaborative Capital</p>
                                                <p className="text-lg font-black text-emerald-900">£{selectedCircle.contributionAmount} <span className="text-xs font-medium">/ season</span></p>
                                            </div>
                                        </div>
                                        <Info className="w-5 h-5 text-emerald-300" />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl border-zinc-200 font-bold"
                                        onClick={() => setStep("search")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xl shadow-orange-500/20"
                                        onClick={handleJoin}
                                        disabled={isJoining}
                                    >
                                        {isJoining ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            "Accept & Join Circle"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "success" && selectedCircle && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-12 text-center space-y-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border-4 border-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-zinc-900 tracking-tight">Welcome to the Circle!</h3>
                                <p className="text-zinc-500 font-medium max-w-[300px] mx-auto">
                                    You are now a member of <span className="text-zinc-900 font-bold">{selectedCircle.name}</span>. Start collaborating with your new partners.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">New Partners</p>
                                    <p className="text-xl font-black text-zinc-900">{selectedCircle.memberCount || selectedCircle.members?.length}</p>
                                </div>
                                <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xl font-black text-emerald-600 uppercase text-xs">Verified</p>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                                onClick={handleClose}
                            >
                                Enter Visualization
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
