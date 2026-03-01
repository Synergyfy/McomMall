"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Users, ArrowRight, Globe, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGetMyPartners as useGetNetworkContacts, useSearchOwners } from "@/service/partnerships/hooks";
import { AddMemberDto } from "@/service/group-circle/types";

interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (member: AddMemberDto) => void;
}

const ROLES = [
    { id: 'CORE', name: 'CORE', description: 'Essential primary partners or internal team members who drive the core value of this circle.' },
    { id: 'PARTNER', name: 'PARTNER', description: 'Strategic collaborators with regular interaction and shared objectives.' },
    { id: 'BANKER', name: 'BANKER', description: 'Partners specifically focused on financial management, capital, or transaction processing.' },
    { id: 'PERIPHERAL', name: 'PERIPHERAL', description: 'Occasional collaborators or support businesses that provide periodic value.' },
] as const;

export const InviteMemberDialog = React.memo(({
    open,
    onOpenChange,
    onInvite
}: InviteMemberDialogProps) => {
    const [step, setStep] = useState(1);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<'CORE' | 'PERIPHERAL' | 'BANKER' | 'PARTNER'>('PERIPHERAL');
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"network" | "global">("network");
    const [selectedGlobalContact, setSelectedGlobalContact] = useState<any>(null);

    const { data: networkContactsDataRaw, isLoading: isLoadingContacts } = useGetNetworkContacts();
    const { data: globalSearchResults, isLoading: isSearchingGlobal } = useSearchOwners(activeTab === 'global' ? searchQuery : '');

    const networkContactsData = React.useMemo(() => {
        if (!networkContactsDataRaw) return { data: [] };
        return {
            data: networkContactsDataRaw.map((p: any) => ({
                id: p.partnerId,
                fullName: p.partnerName,
                businessName: p.businessName || 'Partner'
            }))
        };
    }, [networkContactsDataRaw]);

    const reset = () => {
        setStep(1);
        setSelectedContactId(null);
        setSelectedGlobalContact(null);
        setSelectedRole('PERIPHERAL');
        setSearchQuery("");
    };

    const handleInvite = () => {
        if (!selectedContact) return;
        onInvite({
            networkId: selectedContact.id,
            role: selectedRole
        });
        reset();
        onOpenChange(false);
    };

    const filteredContacts = networkContactsData?.data || [];
    const selectedContact = filteredContacts.find(c => c.id === selectedContactId);

    return (
        <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) reset(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-bold">Invite Member to Circle</DialogTitle>
                    <DialogDescription>Expand your collaborative network with real-time connectivity.</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4 px-6"
                            >
                                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-100/80 rounded-xl p-1">
                                        <TabsTrigger value="network" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-orange-600 shadow-sm transition-all">My Network</TabsTrigger>
                                        <TabsTrigger value="global" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 shadow-sm transition-all">Global Owners</TabsTrigger>
                                    </TabsList>

                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={activeTab === 'network' ? "Search My Network..." : "Search by name, email or listing..."}
                                            className="pl-9 h-11 rounded-xl"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <TabsContent value="network" className="m-0">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Network Contacts</Label>
                                            <ScrollArea className="h-[250px] -mx-2 pr-2">
                                                <div className="grid grid-cols-1 gap-1.5 px-2">
                                                    {isLoadingContacts ? (
                                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Searching...</p>
                                                        </div>
                                                    ) : filteredContacts.length > 0 ? (
                                                        filteredContacts.map((contact) => (
                                                            <div
                                                                key={contact.id}
                                                                onClick={() => setSelectedContactId(contact.id)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group",
                                                                    selectedContactId === contact.id
                                                                        ? "border-orange-500 bg-orange-50 shadow-sm"
                                                                        : "border-zinc-100 hover:border-orange-200 hover:bg-zinc-50/50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                                                        {contact.fullName[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm text-zinc-800">{contact.fullName}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">{contact.businessName || 'Independent Partner'}</p>
                                                                    </div>
                                                                </div>
                                                                {selectedContactId === contact.id ? (
                                                                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                                        <Check className="w-3 h-3 text-white" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full border border-zinc-200 group-hover:border-orange-300 transition-colors" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-10 bg-zinc-50 rounded-2xl">
                                                            <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                                            <p className="text-xs text-zinc-500 italic">No contacts found in network.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="global" className="m-0">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Available Owners</Label>
                                            <ScrollArea className="h-[250px] -mx-2 pr-2">
                                                <div className="grid grid-cols-1 gap-1.5 px-2">
                                                    {isSearchingGlobal ? (
                                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Searching Owners...</p>
                                                        </div>
                                                    ) : globalSearchResults && globalSearchResults.length > 0 ? (
                                                        globalSearchResults.map((owner: any) => (
                                                            <div
                                                                key={owner.id}
                                                                onClick={() => {
                                                                    setSelectedGlobalContact({
                                                                        id: owner.id,
                                                                        fullName: `${owner.firstName} ${owner.lastName}`,
                                                                        businessName: owner.email
                                                                    });
                                                                }}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group",
                                                                    selectedGlobalContact?.id === owner.id
                                                                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                                                        : "border-zinc-100 hover:border-emerald-200 hover:bg-zinc-50/50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                                                                        {owner.firstName[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm text-zinc-800">{owner.firstName} {owner.lastName}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">{owner.email}</p>
                                                                    </div>
                                                                </div>
                                                                {selectedGlobalContact?.id === owner.id ? (
                                                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                        <Check className="w-3 h-3 text-white" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full border border-zinc-200 group-hover:border-emerald-300 transition-colors" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : searchQuery.length >= 2 ? (
                                                        <div className="text-center py-10 bg-zinc-50 rounded-2xl">
                                                            <Globe className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                                            <p className="text-xs text-zinc-500 italic">No owners found matching "{searchQuery}"</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-10 bg-zinc-50 rounded-2xl">
                                                            <Search className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                                            <p className="text-xs text-zinc-500 italic">Type to search for business owners globally.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 px-6"
                            >
                                <div className="bg-orange-600 rounded-[28px] p-5 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 blur-3xl rounded-full" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                                            {selectedContact?.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-lg tracking-tight leading-tight">{selectedContact?.fullName}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-0.5">Define Collaboration Role</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest ml-1">Select Access Level</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <TooltipProvider delayDuration={0}>
                                            {ROLES.map((role) => (
                                                <Tooltip key={role.id}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            onClick={() => setSelectedRole(role.id)}
                                                            className={cn(
                                                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                                selectedRole === role.id
                                                                    ? "border-orange-500 bg-orange-50/50"
                                                                    : "border-zinc-100 hover:border-orange-200"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                                                    selectedRole === role.id ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-500"
                                                                )}>
                                                                    {role.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-sm text-zinc-800">{role.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[200px]">
                                                                        {role.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {selectedRole === role.id && <Check className="w-4 h-4 text-orange-600" />}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="max-w-[250px] p-3 rounded-xl border-orange-100 bg-white shadow-xl z-[10001]">
                                                        <p className="text-xs font-bold text-zinc-800 mb-1">{role.name} Status</p>
                                                        <p className="text-[10px] text-zinc-500 leading-relaxed">{role.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 flex flex-row items-center justify-between gap-3">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)} className="h-11 px-6 rounded-xl font-bold flex-1">Back</Button>
                    ) : (
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-6 rounded-xl font-bold flex-1 text-zinc-400">Cancel</Button>
                    )}

                    <Button
                        onClick={() => step === 1 ? setStep(2) : handleInvite()}
                        disabled={step === 1 && !selectedContact}
                        className="h-11 px-8 rounded-xl font-bold bg-zinc-900 text-white hover:bg-black transition-all flex-[2] shadow-lg shadow-zinc-200"
                    >
                        {step === 1 ? (
                            <span className="flex items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></span>
                        ) : (
                            <span className="flex items-center gap-2">Send Invitation <Check className="w-4 h-4" /></span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

InviteMemberDialog.displayName = "InviteMemberDialog";
