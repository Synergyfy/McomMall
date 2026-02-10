"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, ArrowRight, Check, Search, Filter,
    MessageSquare, Activity, Settings, Globe, MapPin, Zap,
    Briefcase, Share2, X, AlertCircle, Banknote,
    UserPlus, Wallet, ChevronDown, Users, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    useCreateGroupCircle,
    useGetGroupCircles,
    useUpdateGroupCircle,
    useRemoveGroupCircleMember,
    useGetGroupCircleMessages,
    useSendMessage,
    useAddCircleMember
} from "@/service/group-circle/hook";
import {
    CreateGroupCircleDto,
    UpdateGroupCircleDto,
    GroupCircleType,
    GroupCircleDuration,
    SendMessageDto,
    AddMemberDto
} from "@/service/group-circle/types";
import { useGetMyPartners as useGetNetworkContacts } from "@/service/partnerships/hooks";
import { useGetUserProfile as useGetBusinessProfile } from "@/service/user/hook";

interface ReferredBusiness {
    businessId: string;
    name: string;
    relationshipTag?: string;
}

// Mock for missing affiliate stats
const useAffiliateStats = () => ({
    data: {
        referredBusinesses: [] as ReferredBusiness[]
    }
});

import { MultiLayerRadialGraph, Member, OrbitLevel } from "./components/MultiLayerRadialGraph";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import { ContributionDialog } from "./ContributionDialog";
import { CircleSelector } from "./components/CircleSelector";
import { MemberSidebar } from "./components/MemberSidebar";
import { MessagingOverlay } from "./components/MessagingOverlay";
import { CircleCollaboration } from "./components/CircleCollaboration";
import { JoinCircleDialog } from "./components/JoinCircleDialog";

const GROUP_CIRCLE_TYPES = [
    { id: "MARKETING", name: "Marketing Circle", icon: Zap, color: "bg-blue-600", gradient: "from-blue-600 to-blue-800", mandatory: true },
    { id: "ADVERTISING", name: "Advertising Circle", icon: Globe, color: "bg-orange-600", gradient: "from-orange-600 to-red-600", mandatory: true },
    { id: "SMART_MONEY", name: "Smart Money Partner", icon: Briefcase, color: "bg-green-600", gradient: "from-green-600 to-emerald-700", mandatory: false },
    { id: "NEARBY", name: "Nearby Campaign", icon: MapPin, color: "bg-orange-500", gradient: "from-orange-500 to-amber-600", mandatory: false },
    { id: "HYPERLOCAL", name: "Hyperlocal Campaign", icon: MapPin, color: "bg-cyan-600", gradient: "from-cyan-600 to-blue-700", mandatory: false },
    { id: "NATIONAL", name: "National Campaign", icon: Globe, color: "bg-violet-600", gradient: "from-violet-600 to-purple-700", mandatory: false },
    { id: "GLOBAL", name: "Global Campaign", icon: Globe, color: "bg-indigo-600", gradient: "from-indigo-600 to-violet-700", mandatory: false },
];

export default function GroupCirclesPage() {
    const { data: circlesData, isLoading: isLoadingCircles } = useGetGroupCircles();
    const { data: networkContactsDataRaw } = useGetNetworkContacts();
    const networkContactsData = useMemo(() => ({
        data: (networkContactsDataRaw || []).map((p: any) => ({
            id: p.partnerId,
            fullName: p.partnerName,
            email: p.partnerEmail,
            businessName: p.businessName
        }))
    }), [networkContactsDataRaw]);
    const { data: profile } = useGetBusinessProfile();

    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
    const [circleSearch, setCircleSearch] = useState("");
    const [activeMember, setActiveMember] = useState<Member | null>(null);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [focusedOrbits, setFocusedOrbits] = useState<number[] | null>(null);
    const [relationshipFilter, setRelationshipFilter] = useState<string | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [contributionOpen, setContributionOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"visual" | "collaboration">("visual");

    const [chatInput, setChatInput] = useState("");
    const [chatType, setChatType] = useState<'GROUP' | 'DIRECT'>('GROUP');
    const [chatMemberId, setChatMemberId] = useState<string | null>(null);
    const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [showGraphFilters, setShowGraphFilters] = useState(false);
    const [memberSelectionOpen, setMemberSelectionOpen] = useState(false);
    const [selectionType, setSelectionType] = useState<"network" | "referred">("network");
    const [selectionSearch, setSelectionSearch] = useState("");

    const [newCircleData, setNewCircleData] = useState<Partial<CreateGroupCircleDto>>({
        duration: 'Summer',
        contributionAmount: 0,
        networkIds: [],
        referredBusinessIds: []
    });

    const { data: affiliateStats } = useAffiliateStats();
    const createCircleMutation = useCreateGroupCircle();
    const updateCircleMutation = useUpdateGroupCircle();
    const removeMemberMutation = useRemoveGroupCircleMember();
    const addMemberMutation = useAddCircleMember();
    const sendMessageMutation = useSendMessage();

    const { data: messagesData, isLoading: isLoadingMessages } = useGetGroupCircleMessages(
        selectedCircleId,
        {
            type: chatType,
            memberId: chatType === 'DIRECT' ? chatMemberId || undefined : undefined,
            limit: 50
        }
    );

    const circles = useMemo(() => {
        if (!circlesData?.data) return [];
        return circlesData.data.map(circle => ({
            ...circle,
            type: (circle.type === 'SMART_MONEY' ? 'finance' : circle.type.toLowerCase()) as any,
            durationDays: circle.duration,
            members: circle.members.map(m => {
                let orbit: OrbitLevel = 6;
                const network = m.network || {};
                const loc = network.locationTag?.toLowerCase();
                if (loc === 'nearby') orbit = 1;
                else if (loc === 'hyperlocal') orbit = 3;
                else if (loc === 'national') orbit = 5;
                else if (m.role === 'OWNER') orbit = 1;

                return {
                    id: network.id || m.id,
                    memberId: m.id,
                    name: network.fullName || "Unknown Member",
                    email: network.email || "",
                    role: (m.role.charAt(0).toUpperCase() + m.role.toLowerCase().slice(1)) as any,
                    orbit,
                    status: (network.status === 'accepted' ? 'active' : 'offline') as any,
                    category: network.businessName || network.relationshipTag || "Partner",
                    avatar: undefined,
                    contributions: Number(circle.contributionAmount),
                    drawDate: m.drawDate,
                    locationTag: network.locationTag ? (network.locationTag.charAt(0).toUpperCase() + network.locationTag.slice(1)) : "Unknown",
                    relationshipTag: network.relationshipTag ? (network.relationshipTag.charAt(0).toUpperCase() + network.relationshipTag.slice(1)) : "Network"
                } as Member;
            })
        }));
    }, [circlesData]);

    const selectedCircle = useMemo(() =>
        circles.find(c => c.id === selectedCircleId),
        [circles, selectedCircleId]);

    const filteredMembers = useMemo(() => {
        if (!selectedCircle) return [];
        if (!memberSearch.trim()) return selectedCircle.members;
        return selectedCircle.members.filter(m =>
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.category?.toLowerCase().includes(memberSearch.toLowerCase())
        );
    }, [selectedCircle, memberSearch]);

    const myMemberId = useMemo(() => {
        if (!selectedCircle || !profile || !profile.email) return null;
        const myEmail = profile.email.toLowerCase().trim();
        const matchedMember = selectedCircle.members.find(m => {
            const memberEmail = m.email?.toLowerCase().trim();
            const memberName = m.name?.toLowerCase().trim();
            const businessName = m.category?.toLowerCase().trim();
            const myName = profile.name.toLowerCase().trim();

            return (memberEmail && memberEmail === myEmail) ||
                (memberName && memberName === myName) ||
                (businessName && businessName === myName);
        });
        return matchedMember?.id;
    }, [selectedCircle, profile]);

    const missingMandatory = useMemo(() => {
        const hasMarketing = circles.some(c => c.type.toLowerCase() === 'marketing');
        const hasAdvertising = circles.some(c => c.type.toLowerCase() === 'advertising');
        const missing = [];
        if (!hasMarketing) missing.push("Marketing Circle");
        if (!hasAdvertising) missing.push("Advertising Circle");
        return missing;
    }, [circles]);

    const handleCreateMandatory = useCallback((name: string) => {
        const typeKey = name.toLowerCase().includes("marketing") ? "MARKETING" : "ADVERTISING";
        const typeDef = GROUP_CIRCLE_TYPES.find(t => t.id === typeKey);
        if (!typeDef) return;

        setIsEditing(false);
        setNewCircleData({
            duration: 'Summer',
            contributionAmount: 0,
            networkIds: [],
            referredBusinessIds: [],
            type: typeDef.id as GroupCircleType
        });
        setCreateStep(1);
        setCreateOpen(true);
    }, []);

    const handleEditCircle = useCallback((circle: any) => {
        const apiCircle = circlesData?.data.find(c => c.id === circle.id);
        if (!apiCircle) return;

        setIsEditing(true);
        setNewCircleData({
            name: apiCircle.name,
            type: apiCircle.type,
            duration: apiCircle.duration as any,
            contributionAmount: Number(apiCircle.contributionAmount),
            networkIds: apiCircle.members.map(m => m.network.id),
            referredBusinessIds: []
        });
        setCreateStep(2);
        setCreateOpen(true);
    }, [circlesData]);

    const handleSubmitCircle = useCallback(async () => {
        if (!newCircleData.name || !newCircleData.type) {
            toast.error("Please fill in the required fields");
            return;
        }

        try {
            if (isEditing && selectedCircleId) {
                await updateCircleMutation.mutateAsync({
                    id: selectedCircleId,
                    data: newCircleData as UpdateGroupCircleDto
                });
                toast.success(`${newCircleData.name} updated!`);
            } else {
                await createCircleMutation.mutateAsync(newCircleData as CreateGroupCircleDto);
                toast.success(`${newCircleData.name} created!`);
            }
            setCreateOpen(false);
            setCreateStep(1);
            setNewCircleData({
                duration: 'Summer',
                contributionAmount: 0,
                networkIds: [],
                referredBusinessIds: []
            });
        } catch (error) {
            toast.error(isEditing ? "Failed to update circle" : "Failed to create circle");
        }
    }, [isEditing, selectedCircleId, newCircleData, updateCircleMutation, createCircleMutation]);

    const handleInviteMembers = useCallback(async (dto: AddMemberDto) => {
        if (!selectedCircleId) return;
        try {
            await addMemberMutation.mutateAsync({
                id: selectedCircleId,
                data: dto
            });
            toast.success("Invitation sent successfully!");
        } catch (error) {
            toast.error("Failed to send invitation");
        }
    }, [selectedCircleId, addMemberMutation]);

    const handleRemoveMember = useCallback(async () => {
        if (!selectedCircleId || !activeMember) return;
        try {
            await removeMemberMutation.mutateAsync({
                id: selectedCircleId,
                memberId: activeMember.id
            });
            toast.success("Member removed from circle");
            setActiveMember(null);
        } catch (error) {
            toast.error("Failed to remove member");
        }
    }, [selectedCircleId, removeMemberMutation, activeMember]);

    const handleSendMessage = useCallback(async () => {
        if (!chatInput.trim() || !selectedCircleId) return;

        try {
            const payload: SendMessageDto = {
                content: chatInput,
                recipientId: chatType === 'DIRECT' ? chatMemberId || undefined : undefined
            };

            await sendMessageMutation.mutateAsync({
                id: selectedCircleId,
                data: payload
            });
            setChatInput("");
        } catch (error) {
            toast.error("Failed to send message");
        }
    }, [chatInput, selectedCircleId, chatType, chatMemberId, sendMessageMutation]);

    const handleJoined = useCallback((id: string) => {
        setSelectedCircleId(id);
        setActiveTab("visual");
    }, []);

    return (
        <div className="w-full min-h-screen bg-zinc-50/20 dark:bg-zinc-950/20 p-4 md:p-6 flex flex-col gap-6 relative">
            {/* Layer 1: Page Heading & Action Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
                        Circles Visualization
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Enterprise-grade network mapping and collaboration.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-md rounded-xl flex-1 md:flex-none"
                        disabled={missingMandatory.length > 0}
                        onClick={() => {
                            setIsEditing(false);
                            setNewCircleData({ type: 'ADVERTISING', duration: 'Summer', contributionAmount: 0, networkIds: [], referredBusinessIds: [] });
                            setCreateStep(1);
                            setCreateOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create Free Circle
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden lg:flex border-zinc-200 rounded-xl"
                        disabled={missingMandatory.length > 0}
                        onClick={() => {
                            setIsEditing(false);
                            setNewCircleData({ type: 'SMART_MONEY', duration: 'Summer', contributionAmount: 0, networkIds: [], referredBusinessIds: [] });
                            setCreateStep(1);
                            setCreateOpen(true);
                        }}
                    >
                        <Briefcase className="w-4 h-4 mr-2" /> Create Paid Circle
                    </Button>

                    <Separator orientation="vertical" className="h-10 mx-2 hidden lg:block" />

                    <Button
                        variant="outline"
                        className="border-zinc-200 rounded-xl"
                        onClick={() => setJoinOpen(true)}
                    >
                        <Globe className="w-4 h-4 mr-2" /> Join Circle
                    </Button>
                </div>
            </div>

            {/* Layer 2: Circle Selector (Only show if user has groups) */}
            {circles.length > 0 && (
                <div className="flex items-center gap-3">
                    <CircleSelector
                        selectedCircle={selectedCircle}
                        circleSearch={circleSearch}
                        setCircleSearch={setCircleSearch}
                        isLoadingCircles={isLoadingCircles}
                        circles={circles}
                        selectedCircleId={selectedCircleId}
                        setSelectedCircleId={setSelectedCircleId}
                        groupCircleTypes={GROUP_CIRCLE_TYPES}
                        onCreateNew={() => { setCreateStep(1); setCreateOpen(true); }}
                        disabled={missingMandatory.length > 0}
                    />
                </div>
            )}

            {/* Layer 3: View Toggles & Filters (Only show if a circle is selected) */}
            {selectedCircle && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200/50 backdrop-blur-sm">
                    <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-2xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab("visual")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-xl transition-all",
                                activeTab === "visual"
                                    ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Visual Map
                        </button>
                        <button
                            onClick={() => setActiveTab("collaboration")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-xl transition-all",
                                activeTab === "collaboration"
                                    ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Collaboration
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto px-2">
                        <Button
                            variant="ghost"
                            className={cn(
                                "flex-1 md:flex-none items-center gap-2 rounded-xl border border-transparent transition-all",
                                showGraphFilters ? "bg-orange-50 text-orange-600 border-orange-100" : "text-zinc-600 hover:bg-zinc-100"
                            )}
                            onClick={() => setShowGraphFilters(!showGraphFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {(focusedOrbits || relationshipFilter) && (
                                <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                                    {(focusedOrbits ? 1 : 0) + (relationshipFilter ? 1 : 0)}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showGraphFilters && selectedCircle && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4 mb-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Filter Options</h3>
                                {(focusedOrbits || relationshipFilter) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setFocusedOrbits(null); setRelationshipFilter(null); }}
                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Location</Label>
                                    <Select
                                        value={focusedOrbits ? String(focusedOrbits[0]) : "all"}
                                        onValueChange={(val) => {
                                            if (val === "all") setFocusedOrbits(null);
                                            else if (val === "1") setFocusedOrbits([1, 2]);
                                            else if (val === "3") setFocusedOrbits([3, 4]);
                                            else if (val === "5") setFocusedOrbits([5, 6]);
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:ring-orange-500/20">
                                            <SelectValue placeholder="All Locations" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-orange-100 z-[10001]">
                                            <SelectItem value="all">All Locations</SelectItem>
                                            <SelectItem value="1">Nearby</SelectItem>
                                            <SelectItem value="3">Hyperlocal</SelectItem>
                                            <SelectItem value="5">National</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Relationship</Label>
                                    <Select
                                        value={relationshipFilter || "all"}
                                        onValueChange={(val) => setRelationshipFilter(val === "all" ? null : val)}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:ring-orange-500/20">
                                            <SelectValue placeholder="All Relationships" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-orange-100 z-[10001]">
                                            <SelectItem value="all">All Relationships</SelectItem>
                                            <SelectItem value="Supplier">Supplier</SelectItem>
                                            <SelectItem value="Partner">Partner</SelectItem>
                                            <SelectItem value="Affiliate">Referral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-10 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                                        onClick={() => setShowGraphFilters(false)}
                                    >
                                        <ChevronDown className="w-4 h-4 mr-2 rotate-180" />
                                        Close Panel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layer 4: Main Content Card */}
            <div className="flex-1 min-h-[1125px] flex gap-6 relative">
                <div className="flex-1 relative flex flex-col">
                    <Card className="flex-1 relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[3rem] shadow-xl shadow-orange-500/5">
                        {selectedCircle ? (
                            <>
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl text-white shadow-lg", GROUP_CIRCLE_TYPES.find(t => t.id === selectedCircle.type)?.gradient || "bg-zinc-500")}>
                                            {React.createElement(GROUP_CIRCLE_TYPES.find(t => t.id === selectedCircle.type)?.icon || Zap, { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-bold text-zinc-800 dark:text-zinc-100">{selectedCircle.name}</h2>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <Badge variant="outline" className="text-[10px] py-0 h-4 border-orange-200 text-orange-700 bg-orange-50/50">
                                                    {selectedCircle.type}
                                                </Badge>
                                                <span>•</span>
                                                <span className="font-medium">{selectedCircle.durationDays} Duration</span>
                                                <span>•</span>
                                                <span className="font-medium text-emerald-600">{selectedCircle.members.length} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setIsMemberListOpen(true)}
                                        className="h-10 w-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors shadow-sm border border-zinc-200"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <TooltipProvider>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors shadow-sm border border-zinc-200">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 bg-white/95 backdrop-blur-md border-orange-100 z-[10000] p-1 rounded-xl">
                                                <DropdownMenuItem onClick={() => handleEditCircle(selectedCircle)} className="cursor-pointer hover:bg-orange-50 text-orange-700 rounded-lg">
                                                    <Settings className="w-3.5 h-3.5 mr-2" /> Circle Settings
                                                </DropdownMenuItem>
                                                <Separator className="my-1" />
                                                <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                                                    <AlertCircle className="w-3.5 h-3.5 mr-2" /> Disband Circle
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TooltipProvider>
                                </div>

                                <div className="flex-1 overflow-hidden relative">
                                    <AnimatePresence mode="wait">
                                        {activeTab === "visual" ? (
                                            <motion.div
                                                key="visual"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.05 }}
                                                className="absolute inset-0 flex items-center justify-center p-10"
                                            >
                                                <div className="w-full h-full max-w-[800px] max-h-[800px] relative">
                                                    <MultiLayerRadialGraph
                                                        members={selectedCircle.members}
                                                        onMemberClick={setActiveMember}
                                                        currentMemberId={myMemberId}
                                                        focusedOrbits={focusedOrbits}
                                                        profileImage={profile?.profilePictureUrl}
                                                        relationshipFilter={relationshipFilter}
                                                    />
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="collaboration"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="absolute inset-0 pt-28 px-12 pb-12 overflow-y-auto"
                                            >
                                                <CircleCollaboration
                                                    circleId={selectedCircle.id}
                                                    members={selectedCircle.members}
                                                    myMemberId={myMemberId ?? null}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                                    <Button onClick={() => setInviteOpen(true)} className="rounded-full h-12 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-lg border">
                                        <UserPlus className="w-4 h-4 mr-2" /> Invite Members
                                    </Button>
                                    <Button
                                        onClick={() => { setChatType('GROUP'); setChatMemberId(null); setIsChatOverlayOpen(true); }}
                                        className="rounded-full h-12 px-6 bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Circle Chat
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                                <div className="w-32 h-32 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mb-8 relative">
                                    <Globe className="w-16 h-16 text-orange-200 animate-pulse" />
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200 animate-[spin_10s_linear_infinite]" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Select an Active Circle</h3>
                                <p className="max-w-xs mt-2 text-zinc-500">Pick a circle from the selector above to visualize your collaborative network and start collaborating.</p>
                                <Button
                                    className="mt-8 bg-zinc-900 text-white rounded-xl h-11 px-8"
                                    disabled={missingMandatory.length > 0}
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewCircleData({ type: 'ADVERTISING', duration: 'Summer', contributionAmount: 0, networkIds: [], referredBusinessIds: [] });
                                        setCreateStep(1);
                                        setCreateOpen(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Free Circle
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Sidebars & Overlays */}
            <AnimatePresence>
                {isMemberListOpen && selectedCircle && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMemberListOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[45]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-[50] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Circle Members</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsMemberListOpen(false)} className="rounded-xl">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input
                                        placeholder="Search members..."
                                        className="pl-9 h-11 rounded-xl border-zinc-200 focus:ring-orange-500/20"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-3 space-y-1">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map(member => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-900 cursor-pointer transition-all group"
                                                onClick={() => {
                                                    setActiveMember(member);
                                                    setIsMemberListOpen(false);
                                                }}
                                            >
                                                <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold shadow-sm border border-orange-200 dark:border-orange-900">
                                                    {member.name[0]}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate group-hover:text-orange-600 transition-colors">
                                                            {member.name}
                                                        </p>
                                                        {member.id === myMemberId && (
                                                            <Badge variant="outline" className="text-[9px] py-0 h-4 border-orange-200 bg-orange-50 text-orange-600">You</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate">{member.category}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
                                                <Search className="w-5 h-5 text-zinc-300" />
                                            </div>
                                            <p className="text-sm font-medium text-zinc-500">No members found</p>
                                            <p className="text-xs text-zinc-400">Try adjusting your search</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                                <Button
                                    onClick={() => { setInviteOpen(true); setIsMemberListOpen(false); }}
                                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/10 gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Invite New Partner
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeMember && (
                    <MemberSidebar
                        activeMember={activeMember}
                        onClose={() => setActiveMember(null)}
                        selectedCircle={selectedCircle}
                        myMemberId={myMemberId}
                        onSetChatType={setChatType}
                        onSetChatMemberId={setChatMemberId}
                        onSetIsChatOverlayOpen={setIsChatOverlayOpen}
                        onSetContributionOpen={setContributionOpen}
                        onRemoveMember={handleRemoveMember}
                        isRemoving={removeMemberMutation.isPending}
                    />
                )}
            </AnimatePresence>

            <MessagingOverlay
                selectedCircle={selectedCircle}
                chatType={chatType}
                chatMemberId={chatMemberId}
                isChatOverlayOpen={isChatOverlayOpen}
                onClose={() => setIsChatOverlayOpen(false)}
                onSetChatType={setChatType}
                onSetChatMemberId={setChatMemberId}
                isLoadingMessages={isLoadingMessages}
                messagesData={messagesData}
                profile={profile}
                chatInput={chatInput}
                setChatInput={setChatInput}
                onSendMessage={handleSendMessage}
                isSending={sendMessageMutation.isPending}
            />

            <InviteMemberDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                onInvite={handleInviteMembers}
            />

            <JoinCircleDialog
                open={joinOpen}
                onOpenChange={setJoinOpen}
                groupCircleTypes={GROUP_CIRCLE_TYPES}
                onJoined={handleJoined}
            />

            {selectedCircleId && myMemberId && (
                <ContributionDialog
                    open={contributionOpen}
                    onOpenChange={setContributionOpen}
                    circleId={selectedCircleId}
                    memberId={myMemberId}
                    defaultAmount={selectedCircle?.contributionAmount || 0}
                />
            )}

            {/* Circle Creation Wizard */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className={cn("transition-all duration-500", createStep === 1 ? "sm:max-w-[500px]" : "sm:max-w-[700px]")}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit Circle Details" :
                                createStep === 1 ? (newCircleData.type === 'SMART_MONEY' ? "About Smart Money Circles" : "About Collaborative Circles") :
                                    createStep === 2 ? "Circle Details" : "Select Members"}
                        </DialogTitle>
                        <DialogDescription>
                            {createStep === 1
                                ? (newCircleData.type === 'SMART_MONEY' ? "Learn how Smart Money circles empower your business network." : "Build collaborative networks to grow your reach.")
                                : createStep === 2 ? "Set the basic configuration for your new circle." : "Invite partners and referred businesses to join this circle."}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {createStep === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 py-4"
                            >
                                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center border border-orange-200">
                                    {newCircleData.type === 'SMART_MONEY' ? (
                                        <Banknote className="w-20 h-20 text-orange-500 animate-pulse" />
                                    ) : (
                                        <Users className="w-20 h-20 text-orange-500 animate-pulse" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-bold text-lg text-zinc-900">
                                        {newCircleData.type === 'SMART_MONEY' ? "What is a Smart Money Circle?" : "What are Collaborative Circles?"}
                                    </h4>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        {newCircleData.type === 'SMART_MONEY'
                                            ? "Smart Money Circles are collaborative financial networks where businesses pool contributions to support each other's growth. Members take turns receiving the total pool amount."
                                            : "Collaborative Circles allow you to group your partners and referred businesses into strategic clusters. Share campaigns, cross-promote products, and synchronize marketing efforts by season."}
                                    </p>
                                    <ul className="space-y-2">
                                        {(newCircleData.type === 'SMART_MONEY' ? [
                                            "Interest-free collaborative capital",
                                            "Strengthened B2B partnerships",
                                            "Seasonal duration alignment",
                                            "Automated contribution tracking"
                                        ] : [
                                            "Synchronized seasonal marketing",
                                            "Group-based campaign sharing",
                                            "Cross-promotion opportunities",
                                            "Streamlined partner communication"
                                        ]).map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-zinc-700">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ) : createStep === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 py-4"
                            >
                                <div className={cn("grid gap-4", newCircleData.type === 'SMART_MONEY' ? "grid-cols-2" : "grid-cols-1")}>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Circle Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Summer Campaign Group"
                                            value={newCircleData.name || ""}
                                            onChange={(e) => setNewCircleData({ ...newCircleData, name: e.target.value })}
                                        /><p className="text-[10px] text-muted-foreground">Give your circle a recognizable name for your partners.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Season / Duration</Label>
                                        <Select
                                            value={String(newCircleData.duration)}
                                            onValueChange={(val) => setNewCircleData({ ...newCircleData, duration: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Duration" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999]" position="popper" sideOffset={5}>
                                                {["Spring", "Summer", "Autumn", "Winter"].map(s => (
                                                    <SelectItem key={s} value={s}>{s} Season</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {newCircleData.type === 'SMART_MONEY' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Contribution Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                className="pl-7"
                                                placeholder="50"
                                                value={newCircleData.contributionAmount || ""}
                                                onChange={(e) => setNewCircleData({ ...newCircleData, contributionAmount: Number(e.target.value) })}
                                            />
                                        </div><p className="text-[10px] text-muted-foreground">The fixed amount each member contributes per round.</p>
                                    </div>
                                )}

                                {/* Show member selection here for 2-step flow (Normal Groups) */}
                                {newCircleData.type !== 'SMART_MONEY' && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Network Contacts</Label>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between h-11 rounded-xl border-zinc-200"
                                                onClick={() => { setSelectionType("network"); setMemberSelectionOpen(true); }}
                                            >
                                                <span className="truncate">{newCircleData.networkIds?.length || 0} Selected</span>
                                                <Users className="w-4 h-4 text-zinc-400" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Referred Business</Label>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between h-11 rounded-xl border-zinc-200"
                                                onClick={() => { setSelectionType("referred"); setMemberSelectionOpen(true); }}
                                            >
                                                <span className="truncate">{newCircleData.referredBusinessIds?.length || 0} Selected</span>
                                                <Briefcase className="w-4 h-4 text-zinc-400" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 py-4"
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase font-black text-zinc-400 tracking-[0.2em] ml-1">Network Partners</Label>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-orange-200 transition-all group"
                                            onClick={() => { setSelectionType("network"); setMemberSelectionOpen(true); }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-bold text-zinc-800">{newCircleData.networkIds?.length || 0} Contacts Selected</span>
                                                    <span className="text-[10px] text-zinc-500">From your established network list</span>
                                                </div>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase font-black text-zinc-400 tracking-[0.2em] ml-1">Referred Businesses</Label>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-indigo-200 transition-all group"
                                            onClick={() => { setSelectionType("referred"); setMemberSelectionOpen(true); }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-bold text-zinc-800">{newCircleData.referredBusinessIds?.length || 0} Businesses Selected</span>
                                                    <span className="text-[10px] text-zinc-500">From your affiliate referrals</span>
                                                </div>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
                                    <p className="text-[11px] text-orange-800 leading-relaxed italic">
                                        <strong>Pro Tip:</strong> Smart Money circles thrive on trust. Select partners you have already established a strong working relationship with in your network.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <DialogFooter className="flex justify-between items-center w-full gap-3 pt-2">
                        {createStep > 1 && (
                            <Button variant="ghost" onClick={() => setCreateStep(prev => prev - 1)} className="rounded-xl">
                                Back
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button
                            onClick={() => {
                                const maxSteps = newCircleData.type === 'SMART_MONEY' ? 3 : 2;
                                if (createStep < maxSteps) setCreateStep(prev => prev + 1);
                                else handleSubmitCircle();
                            }}
                            disabled={createCircleMutation.isPending || updateCircleMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 min-w-[120px]"
                        >
                            {createStep < (newCircleData.type === 'SMART_MONEY' ? 3 : 2) ? "Next" : (createCircleMutation.isPending || updateCircleMutation.isPending ? "Saving..." : (isEditing ? "Update Circle" : "Create Circle"))}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Member Selection Overlay */}
            <Dialog open={memberSelectionOpen} onOpenChange={setMemberSelectionOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl">
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                        <DialogTitle className="text-xl font-bold">Select {selectionType === "network" ? "Network Contacts" : "Referred Businesses"}</DialogTitle>
                        <DialogDescription className="mt-1">Choose members to add to your new circle.</DialogDescription>

                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Search by name or business..."
                                className="pl-9 h-11 bg-white border-zinc-200 rounded-xl focus:ring-orange-500/20"
                                value={selectionSearch}
                                onChange={(e) => setSelectionSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[400px]">
                        <div className="p-4 space-y-2">
                            {selectionType === "network" ? (
                                networkContactsData?.data
                                    .filter(c => c.fullName.toLowerCase().includes(selectionSearch.toLowerCase()) || c.businessName?.toLowerCase().includes(selectionSearch.toLowerCase()))
                                    .map(contact => (
                                        <div key={contact.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                    {contact.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-800">{contact.fullName}</p>
                                                    {contact.businessName && <p className="text-[10px] text-zinc-500">{contact.businessName}</p>}
                                                </div>
                                            </div>
                                            <Switch
                                                checked={newCircleData.networkIds?.includes(contact.id)}
                                                onCheckedChange={(checked) => {
                                                    const currentIds = newCircleData.networkIds || [];
                                                    setNewCircleData({
                                                        ...newCircleData,
                                                        networkIds: checked ? [...currentIds, contact.id] : currentIds.filter(id => id !== contact.id)
                                                    });
                                                }}
                                                className="data-[state=checked]:bg-orange-600"
                                            />
                                        </div>
                                    ))
                            ) : (
                                affiliateStats?.referredBusinesses
                                    .filter(b => b.name.toLowerCase().includes(selectionSearch.toLowerCase()))
                                    .map(referral => (
                                        <div key={referral.businessId} className="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {referral.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-800">{referral.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{referral.relationshipTag || 'Referred Business'}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={newCircleData.referredBusinessIds?.includes(referral.businessId)}
                                                onCheckedChange={(checked) => {
                                                    const currentIds = newCircleData.referredBusinessIds || [];
                                                    setNewCircleData({
                                                        ...newCircleData,
                                                        referredBusinessIds: checked ? [...currentIds, referral.businessId] : currentIds.filter(id => id !== referral.businessId)
                                                    });
                                                }}
                                                className="data-[state=checked]:bg-indigo-600"
                                            />
                                        </div>
                                    ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                        <Button onClick={() => setMemberSelectionOpen(false)} className="bg-zinc-900 text-white rounded-xl h-10 px-6">
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}