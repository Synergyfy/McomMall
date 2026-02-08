'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    QrCode,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    ShieldAlert,
    TrendingUp,
    Settings,
    FileText,
    MapPin,
    Smartphone,
    Download,
    Plus,
    ExternalLink,
    AlertTriangle,
    Info,
    ChevronRight,
    Building2,
    Ban,
    Trash2,
    Loader2,
    X,
    Target,
    BarChart3,
    PieChart,
    ArrowUpRight,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TerminalCashbackClaim, TerminalCashbackConfig, TerminalCashbackLevel, CreateTerminalConfigDto } from '@/service/terminal-cashback/types';
import { 
    useGetTerminalClaims, 
    useGetTerminalConfigs, 
    useCreateTerminalConfig, 
    useUpdateTerminalConfig, 
    useUpdateClaimStatus, 
    useGetGlobalRules,
    useGetTerminalStats
} from '@/service/terminal-cashback/hook';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import { toast } from 'sonner';

// --- Components ---

function ClaimStatusBadge({ status }: { status: TerminalCashbackClaim['status'] }) {
    const config = {
        pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
        approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
        rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
        auto_approved: { label: 'Auto-Approved', className: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle2 },
    };
    const { label, className, icon: Icon } = config[status];
    return (
        <Badge variant="outline" className={cn('font-medium gap-1 px-2 py-0.5', className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

function LevelBadge({ level }: { level: number }) {
    const labels = ['Verified (L1)', 'Fixed (L2)', 'Enterprise (L3)'];
    const colors = ['bg-purple-50 text-purple-600 border-purple-100', 'bg-blue-50 text-blue-600 border-blue-100', 'bg-slate-50 text-slate-600 border-slate-100'];
    return (
        <Badge variant="outline" className={cn('font-semibold', colors[level - 1])}>
            {labels[level - 1]}
        </Badge>
    );
}

export default function TerminalCashbackPage() {
    // --- Data Fetching ---
    const { data: stats, isLoading: isStatsLoading } = useGetTerminalStats();
    const { 
        data: claimsData, 
        isLoading: isClaimsLoading,
        isError: isClaimsError 
    } = useGetTerminalClaims();
    const { 
        data: configsData, 
        isLoading: isConfigsLoading,
        isError: isConfigsError 
    } = useGetTerminalConfigs();
    const { 
        data: businessesData, 
        isLoading: isBusinessesLoading,
        isError: isBusinessesError 
    } = useGetAdminBusinesses({ limit: 100 });

    const claims = claimsData?.data || [];
    const configs = configsData?.data || [];
    const verifiedBusinesses = businessesData?.data || [];

    // --- Mutations ---
    const createConfigMutation = useCreateTerminalConfig();
    const updateConfigMutation = useUpdateTerminalConfig();
    const updateClaimStatusMutation = useUpdateClaimStatus();

    const [selectedClaim, setSelectedClaim] = useState<TerminalCashbackClaim | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<TerminalCashbackConfig | null>(null);
    
    const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false);
    const [isConfigSheetOpen, setIsConfigSheetOpen] = useState(false);
    const [isAnalysisSheetOpen, setIsAnalysisSheetOpen] = useState(false);
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);

    // Rules States
    const [preApprovalAlertEnabled, setPreApprovalAlertEnabled] = useState(true);
    const [alertMessage, setAlertMessage] = useState("Your cashback claim #REF is pending approval. Action required within 48h.");

    // Onboarding State
    const [onboardScope, setOnboardScope] = useState<'particular' | 'all'>('particular');
    const [onboardLevels, setOnboardLevels] = useState<TerminalCashbackLevel[]>([]);
    const [onboardBusinessIds, setOnboardBusinessIds] = useState<string[]>([]);
    const [businessSearch, setOnboardBusinessSearch] = useState('');
    const [isInitializing, setIsInitializing] = useState(false);
    
    // Cap States
    const [onboardQuotaType, setOnboardQuotaType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [onboardMaxIssuance, setOnboardMaxIssuance] = useState<number>(100);

    const filteredBusinesses = verifiedBusinesses.filter(b => 
        b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
        b.id.toLowerCase().includes(businessSearch.toLowerCase())
    );

    // --- Handlers ---

    const toggleOnboardLevel = (level: TerminalCashbackLevel) => {
        setOnboardLevels(prev => 
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const toggleOnboardBusiness = (id: string) => {
        setOnboardBusinessIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleInitializeMerchant = async () => {
        if (onboardScope === 'particular' && onboardBusinessIds.length === 0) {
            toast.error("Please select at least one business.");
            return;
        }
        if (onboardLevels.length === 0) {
            toast.error("Please select at least one system level.");
            return;
        }

        setIsInitializing(true);
        
        try {
            const targets = onboardScope === 'all' 
                ? verifiedBusinesses 
                : onboardBusinessIds.map(id => verifiedBusinesses.find(b => b.id === id)).filter(Boolean);

            const promises = targets.map(biz => {
                if (!biz) return Promise.resolve();
                
                const newConfig: CreateTerminalConfigDto = {
                    businessId: biz.id,
                    businessName: biz.name,
                    level: onboardLevels[0],
                    ranges: onboardLevels.includes(1) ? [{ id: Math.random().toString(36).substr(2, 9), minSpend: 10, maxSpend: 100, rewardValue: 2, isActive: true }] : [],
                    fixedRewardValue: onboardLevels.includes(2) ? 1.00 : onboardLevels.includes(3) ? 5.00 : undefined,
                    rewardType: onboardLevels.includes(3) ? 'fixed' : undefined,
                    apiEndpoint: onboardLevels.includes(3) ? 'https://api.merchant.com/v1/verify' : undefined,
                    limits: {
                        maxPerDay: 500,
                        maxPerCustomer: 50,
                        maxPerReceipt: 10,
                        monthlyBudget: 5000,
                        maxClaimsPerUser: 3,
                    }
                };
                return createConfigMutation.mutateAsync(newConfig);
            });

            await Promise.all(promises);
            toast.success(`System initialized for ${targets.length} businesses.`);
            setIsOnboardOpen(false);
            setOnboardLevels([]);
            setOnboardBusinessIds([]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to onboard one or more merchants.");
        } finally {
            setIsInitializing(false);
        }
    };

    const handleUpdateConfigLevel = (level: TerminalCashbackLevel) => {
        if (!selectedConfig) return;
        setSelectedConfig({ ...selectedConfig, level });
    };

    const handleAddRange = () => {
        if (!selectedConfig) return;
        const newRange = {
            id: Math.random().toString(36).substr(2, 9),
            minSpend: 0,
            maxSpend: 0,
            rewardValue: 0,
            isActive: true
        };
        setSelectedConfig({
            ...selectedConfig,
            ranges: [...selectedConfig.ranges, newRange]
        });
    };

    const handleRemoveRange = (rangeId: string) => {
        if (!selectedConfig) return;
        setSelectedConfig({
            ...selectedConfig,
            ranges: selectedConfig.ranges.filter(r => r.id !== rangeId)
        });
    };

    const handleSaveProtocol = async () => {
        if (!selectedConfig) return;
        try {
            await updateConfigMutation.mutateAsync({
                businessId: selectedConfig.businessId,
                data: {
                    level: selectedConfig.level,
                    isEnabled: selectedConfig.isEnabled,
                    ranges: selectedConfig.ranges,
                    fixedRewardValue: selectedConfig.fixedRewardValue,
                    apiEndpoint: selectedConfig.apiEndpoint,
                    rewardType: selectedConfig.rewardType,
                    rewardPercentage: selectedConfig.rewardPercentage,
                    autoApprovalHours: selectedConfig.autoApprovalHours,
                    limits: selectedConfig.limits
                }
            });
            setIsConfigSheetOpen(false);
            toast.success("Protocol saved successfully.");
        } catch (error) {
            toast.error("Failed to save protocol.");
        }
    };

    const handleClaimAction = async (status: TerminalCashbackClaim['status']) => {
        if (!selectedClaim) return;
        try {
            await updateClaimStatusMutation.mutateAsync({
                id: selectedClaim.id,
                data: { status }
            });
            setIsClaimSheetOpen(false);
            toast.success(`Claim ${status === 'approved' ? 'Approved' : 'Rejected'}`);
        } catch (error) {
            toast.error("Failed to update claim status.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Terminal Cashback Control</h1>
                    <p className="text-sm text-slate-500">System governance for offline-to-digital reward flows.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-medium border-slate-200 shadow-none bg-white text-slate-600" onClick={() => toast.info("Audit log export started...")}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Audit
                    </Button>
                    <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-none">
                                <Plus className="h-4 w-4 mr-2" />
                                Onboard Merchant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                            <DialogHeader className="p-6 pb-2 border-b bg-slate-50/50">
                                <DialogTitle className="text-xl font-semibold text-slate-800">Onboard New Merchant</DialogTitle>
                                <DialogDescription>
                                    Enable Terminal Cashback systems for businesses.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* Scope Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Onboarding Scope</Label>
                                    <Select value={onboardScope} onValueChange={(val: any) => setOnboardScope(val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="particular">Select Particular Businesses</SelectItem>
                                            <SelectItem value="all">All Verified Businesses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Multi-Business Selection with Search */}
                                {onboardScope === 'particular' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Businesses</Label>
                                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none text-[10px] font-bold">
                                                {onboardBusinessIds.length} SELECTED
                                            </Badge>
                                        </div>
                                        
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input 
                                                    placeholder="Search name or ID..." 
                                                    value={businessSearch}
                                                    onChange={(e) => setOnboardBusinessSearch(e.target.value)}
                                                    className="pl-9 h-10 bg-white border-slate-200 text-sm rounded-xl"
                                                />
                                            </div>

                                            {/* Selected Pills */}
                                            {onboardBusinessIds.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pb-2">
                                                    {onboardBusinessIds.map(id => {
                                                        const biz = verifiedBusinesses.find(b => b.id === id);
                                                        return (
                                                            <Badge key={id} variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-medium py-1 pl-2 pr-1 gap-1 shadow-sm">
                                                                {biz?.name}
                                                                <button onClick={() => toggleOnboardBusiness(id)} className="hover:bg-slate-100 rounded-full p-0.5">
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                {isBusinessesLoading ? (
                                                    <div className="space-y-2 py-4">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="h-12 bg-white rounded-xl border border-slate-100 animate-pulse" />
                                                        ))}
                                                    </div>
                                                ) : isBusinessesError ? (
                                                    <div className="text-center py-8">
                                                        <p className="text-xs text-red-500 font-medium">Failed to load businesses.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {filteredBusinesses.map(biz => {
                                                            const isSelected = onboardBusinessIds.includes(biz.id);
                                                            return (
                                                                <div 
                                                                    key={biz.id}
                                                                    onClick={() => toggleOnboardBusiness(biz.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                                                                        isSelected 
                                                                            ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm" 
                                                                            : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold">{biz.name}</span>
                                                                        <span className="text-[9px] text-slate-400 font-mono">{biz.id}</span>
                                                                    </div>
                                                                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                                                </div>
                                                            );
                                                        })}
                                                        {filteredBusinesses.length === 0 && (
                                                            <p className="text-center py-8 text-xs text-slate-400 italic">No businesses match your search.</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reward Issuance Caps */}
                                {onboardScope === 'particular' && onboardBusinessIds.length > 0 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reward Distribution Limits</Label>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold">SMART CAP</Badge>
                                        </div>
                                        <div className="p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-200 grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase ml-1">Frequency</p>
                                                <Select value={onboardQuotaType} onValueChange={(val: any) => setOnboardQuotaType(val)}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 font-semibold text-slate-700 shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">PER DAY</SelectItem>
                                                        <SelectItem value="weekly">PER WEEK</SelectItem>
                                                        <SelectItem value="monthly">PER MONTH</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase ml-1">Max Issuances</p>
                                                <div className="relative">
                                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                    <Input 
                                                        type="number" 
                                                        value={onboardMaxIssuance} 
                                                        onChange={(e) => setOnboardMaxIssuance(Number(e.target.value))}
                                                        className="h-11 rounded-xl bg-white border-slate-200 pl-9 font-bold text-slate-700 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <p className="col-span-2 text-[10px] text-slate-400 font-medium italic mt-1 leading-relaxed pl-1">
                                                Selected businesses will be capped at {onboardMaxIssuance} manual rewards per {onboardQuotaType === 'daily' ? 'day' : onboardQuotaType === 'weekly' ? 'week' : 'month'}.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Permitted System Capabilities</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {([1, 2, 3] as TerminalCashbackLevel[]).map((l) => (
                                            <Button 
                                                key={l} 
                                                variant="outline" 
                                                onClick={() => toggleOnboardLevel(l)}
                                                className={cn(
                                                    "h-14 border rounded-2xl transition-all font-bold group",
                                                    onboardLevels.includes(l) ? "border-orange-400 bg-orange-50 text-orange-600 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-medium">LEVEL</span>
                                                    <span className="text-lg leading-none mt-0.5">0{l}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3">
                                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                                            Select all levels these merchants are permitted to use. The first selection becomes the initial default logic.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-6 pt-2 bg-slate-50/50 border-t gap-2">
                                <Button variant="ghost" className="font-medium text-slate-500" onClick={() => setIsOnboardOpen(false)}>Cancel</Button>
                                <Button 
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold flex-1 h-12 rounded-xl shadow-none"
                                    onClick={handleInitializeMerchant}
                                    disabled={isInitializing}
                                >
                                    {isInitializing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Complete Onboarding"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-orange-50/50 border border-orange-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wider mb-1">Pending Claims</p>
                                <p className="text-3xl font-bold text-orange-700">
                                    {isStatsLoading ? '...' : stats?.pendingCount || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50/50 border border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Approved Claims</p>
                                <p className="text-3xl font-bold text-emerald-700">
                                    {isStatsLoading ? '...' : stats?.approvedCount || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white border border-slate-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Cashback</p>
                                <p className="text-3xl font-bold text-slate-800">
                                    £{isStatsLoading ? '...' : (stats?.totalEarned || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl">
                                <TrendingUp className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="claims" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 w-fit rounded-xl border border-slate-200">
                    <TabsTrigger value="claims" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" />
                        Claims Queue
                    </TabsTrigger>
                    <TabsTrigger value="merchants" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                        <QrCode className="h-4 w-4" />
                        Merchant Setup
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                        <ShieldAlert className="h-4 w-4" />
                        Fraud & Rules
                    </TabsTrigger>
                </TabsList>

                {/* --- Claims Queue --- */}
                <TabsContent value="claims" className="space-y-4 mt-6">
                    <Card className="border-0 shadow-sm overflow-hidden rounded-2xl border border-slate-100">
                        <CardHeader className="bg-white border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-slate-800">Network Claims</CardTitle>
                                    <CardDescription className="text-slate-500">Review and override manual reward requests.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input placeholder="Search user or ID..." className="pl-9 w-64 bg-slate-50 border-slate-200 focus:bg-white text-sm" />
                                    </div>
                                    <Button variant="outline" size="icon" className="border-slate-200 bg-white"><Filter className="h-4 w-4 text-slate-500" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                                        <TableHead className="w-[120px] text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 pl-6">Claim ID</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Business</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claims.map((claim) => (
                                        <TableRow key={claim.id} className="hover:bg-slate-50/50 cursor-pointer group border-b border-slate-50" onClick={() => { setSelectedClaim(claim); setIsClaimSheetOpen(true); }}>
                                            <TableCell className="font-mono text-[11px] text-slate-400 pl-6">{claim.id}</TableCell>
                                            <TableCell className="font-semibold text-slate-700">{claim.userName}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{claim.businessName}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">£{claim.amount.toFixed(2)}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{claim.amountRange || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><ClaimStatusBadge status={claim.status} /></TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-orange-500">
                                                    Review <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Merchant Setup --- */}
                <TabsContent value="merchants" className="space-y-4 mt-6">
                    {isConfigsLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : isConfigsError ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl border border-red-100">
                            <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                            <p className="text-sm font-bold text-red-800">Failed to fetch merchant configurations.</p>
                            <Button variant="link" className="text-red-600 font-bold mt-2" onClick={() => window.location.reload()}>Retry Connection</Button>
                        </div>
                    ) : configs.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {configs.map((config) => (
                                <Card key={config.businessId} className="border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden rounded-2xl border-l-2 border-l-orange-400 bg-white border border-slate-100">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-semibold text-slate-800">{config.businessName}</CardTitle>
                                                <CardDescription className="font-mono text-[10px] text-slate-400">ID: {config.businessId}</CardDescription>
                                            </div>
                                            <LevelBadge level={config.level} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-50/50 transition-colors">
                                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <QrCode className="h-6 w-6 text-slate-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Merchant Claim Link</p>
                                                <p className="text-sm font-medium truncate text-slate-600">{config.claimUrl}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="font-bold text-orange-500 hover:bg-orange-50" onClick={(e) => { e.stopPropagation(); toast.success("Link copied to clipboard"); }}>COPY</Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto-Approval</p>
                                                <p className="font-semibold text-slate-700 text-lg">{config.autoApprovalHours}h</p>
                                            </div>
                                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Limit</p>
                                                <p className="font-semibold text-slate-700 text-lg">£{config.limits.maxPerDay}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-2 w-2 rounded-full", config.isEnabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-300")} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{config.isEnabled ? 'Active' : 'Offline'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button variant="ghost" className="text-slate-400 hover:text-blue-500 font-bold text-[10px] tracking-widest p-0 h-auto flex items-center gap-1 group/analysis" onClick={() => { setSelectedConfig(config); setIsAnalysisSheetOpen(true); }}>
                                                    <BarChart3 className="h-3.5 w-3.5 transition-transform group-hover/analysis:scale-110" /> ANALYSIS
                                                </Button>
                                                <Button variant="ghost" className="text-slate-600 hover:text-orange-500 font-bold text-[10px] tracking-widest p-0 h-auto group/btn" onClick={() => { setSelectedConfig(JSON.parse(JSON.stringify(config))); setIsConfigSheetOpen(true); }}>
                                                    CONFIGURE <ChevronRight className="h-3 w-3 ml-0.5 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-sm font-medium text-slate-500">No merchants onboarded yet.</p>
                            <Button variant="link" className="text-orange-500 font-bold mt-2" onClick={() => setIsOnboardOpen(true)}>Initialize your first merchant</Button>
                        </div>
                    )}
                </TabsContent>

                {/* --- Global Rules --- */}
                <TabsContent value="rules" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white border border-slate-100">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-slate-400" />
                                    Platform Escalation Law
                                </CardTitle>
                                <CardDescription className="text-xs">Define system behavior for non-responsive merchants.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Default Auto-Approval</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Time before Admin override</p>
                                        </div>
                                        <Select defaultValue="48">
                                            <SelectTrigger className="w-32 bg-white font-semibold text-slate-700 border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="24">24 HOURS</SelectItem>
                                                <SelectItem value="48">48 HOURS</SelectItem>
                                                <SelectItem value="168">07 DAYS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Pre-Approval Alert</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Warn merchant before auto-pay</p>
                                        </div>
                                        <Switch 
                                            checked={preApprovalAlertEnabled} 
                                            onCheckedChange={setPreApprovalAlertEnabled}
                                            className="data-[state=checked]:bg-orange-400" 
                                        />
                                    </div>
                                    {preApprovalAlertEnabled && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Merchant Alert Message</Label>
                                            <Textarea 
                                                value={alertMessage}
                                                onChange={(e) => setAlertMessage(e.target.value)}
                                                placeholder="Enter message..."
                                                className="min-h-[100px] rounded-xl border-slate-200 bg-white text-sm text-slate-600 focus:border-orange-400 focus:ring-orange-400/20"
                                            />
                                            <p className="text-[10px] text-slate-400 italic">Use #REF to include the claim reference ID.</p>
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full bg-slate-800 hover:bg-slate-900 h-11 rounded-xl font-semibold shadow-none" onClick={() => toast.success("Global escalation rules updated.")}>Update Global Dials</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-slate-900 text-white rounded-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-5">
                                <ShieldAlert className="h-48 w-48 text-orange-500" />
                            </div>
                            <CardHeader className="border-b border-white/10 pb-4 relative z-10">
                                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-orange-400" />
                                    Fraud Prevention Dials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 relative z-10">
                                <div className="space-y-4">
                                    {[
                                        { label: 'GPS Geofencing', desc: 'Match scan to merchant geofence' },
                                        { label: 'Receipt Image Hashing', desc: 'Block duplicate image uploads' },
                                        { label: 'Device Fingerprinting', desc: 'Limit claims per unique hardware' },
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <div>
                                                <p className="text-sm font-semibold text-white tracking-tight">{rule.label}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{rule.desc}</p>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-[9px] px-2 py-0.5">ACTIVE</Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
                                    <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                        Note: High sensitivity dials currently protect ~15% of the reward budget from spoofing attempts.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fraud Audit Log */}
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-100">
                        <CardHeader className="bg-white border-b pb-4">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Recent Fraud Alerts
                            </CardTitle>
                            <CardDescription className="text-xs">Automatic system flags requiring admin intervention.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-b border-slate-100">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6 text-slate-500">Severity</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">User</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Merchant</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6 text-slate-500">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-b border-slate-50 group">
                                        <TableCell className="pl-6"><Badge className="bg-red-50 text-red-600 border-red-100 font-bold text-[9px] px-2 py-0">CRITICAL</Badge></TableCell>
                                        <TableCell className="font-semibold text-slate-700 text-sm">Duplicate Receipt Hash Match</TableCell>
                                        <TableCell className="text-xs text-slate-500 font-medium">User #492</TableCell>
                                        <TableCell className="text-xs text-slate-600 font-semibold">Urban Eats</TableCell>
                                        <TableCell className="text-right pr-6"><Button variant="outline" size="sm" className="font-bold text-[10px] text-red-500 border-red-100 hover:bg-red-50" onClick={() => toast.error("User blacklisted.")}>BLACKLIST</Button></TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-slate-50 group">
                                        <TableCell className="pl-6"><Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[9px] px-2 py-0">MEDIUM</Badge></TableCell>
                                        <TableCell className="font-semibold text-slate-700 text-sm">GPS Distance Anomaly (5.2km)</TableCell>
                                        <TableCell className="text-xs text-slate-500 font-medium">User #102</TableCell>
                                        <TableCell className="text-xs text-slate-600 font-semibold">TechHub</TableCell>
                                        <TableCell className="text-right pr-6"><Button variant="outline" size="sm" className="font-bold text-[10px] text-slate-500 border-slate-200" onClick={() => toast.info("Opening map...")}>REVIEW</Button></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- Claim Detail Sheet --- */}
            <Sheet open={isClaimSheetOpen} onOpenChange={setIsClaimSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 rounded-l-3xl border-l border-slate-200">
                    {selectedClaim && (
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-8 bg-slate-50 border-b border-slate-100 relative">
                                <div className="flex items-center justify-between mb-6">
                                    <ClaimStatusBadge status={selectedClaim.status} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ref: {selectedClaim.id}</p>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Claim Review</h2>
                                <p className="text-slate-500 font-medium text-xs flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" /> Submitted {new Date(selectedClaim.submittedAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="p-8 space-y-8 flex-1">
                                {/* Proof Image */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-0.5 w-3 bg-orange-400" /> Physical Proof
                                    </h4>
                                    <div className="aspect-[3/4] rounded-3xl bg-slate-100 overflow-hidden border border-slate-100 shadow-sm relative transition-all hover:shadow-md cursor-zoom-in group">
                                        <img src={selectedClaim.proofUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="sm" className="font-bold bg-white text-slate-800 shadow-sm">
                                                <Eye className="h-4 w-4 mr-2" /> Inspect Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Value & Customer */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Cashback Value</p>
                                        <p className="text-3xl font-bold text-slate-800">£{selectedClaim.amount.toFixed(2)}</p>
                                        <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">{selectedClaim.amountRange || 'N/A'}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Requester</p>
                                        <p className="text-xl font-bold text-slate-800 truncate">{selectedClaim.userName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">ID: {selectedClaim.userId}</p>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-0.5 w-3 bg-emerald-400" /> Verification Meta
                                    </h4>
                                    <div className="grid gap-2">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 transition-colors hover:border-emerald-100">
                                            <div className="p-2.5 bg-slate-50 rounded-xl">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-700">Geofence Match</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Verified within Merchant zone.</p>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-600 font-bold text-[9px] border-emerald-100">PASS</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 transition-colors hover:border-emerald-100">
                                            <div className="p-2.5 bg-slate-50 rounded-xl">
                                                <Smartphone className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-700">Hardware Signature</p>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-tight">{selectedClaim.meta?.deviceId || 'N/A'}</p>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-600 font-bold text-[9px] border-emerald-100">VALID</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Actions */}
                                {selectedClaim.status === 'pending' && (
                                    <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-8 mt-4 border-t border-slate-100">
                                        <Button 
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 rounded-xl shadow-none"
                                            onClick={() => handleClaimAction('approved')}
                                        >
                                            Approve Cashback
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 text-red-500 border-red-100 hover:bg-red-50 font-semibold h-12 rounded-xl"
                                            onClick={() => handleClaimAction('rejected')}
                                        >
                                            Reject Claim
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* --- Merchant Config Sheet --- */}
            <Sheet open={isConfigSheetOpen} onOpenChange={setIsConfigSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 rounded-l-3xl border-l border-slate-200">
                    {selectedConfig && (
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-8 bg-orange-50/50 border-b border-orange-100 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 opacity-5">
                                    <Settings className="h-48 w-48 text-orange-500" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <LevelBadge level={selectedConfig.level} />
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedConfig.isEnabled ? 'System Active' : 'Disabled'}</span>
                                            <Switch 
                                                checked={selectedConfig.isEnabled} 
                                                onCheckedChange={(val) => setSelectedConfig({ ...selectedConfig, isEnabled: val })}
                                                className="data-[state=checked]:bg-orange-500 h-5 w-9" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedConfig.businessName}</h2>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-500 mt-1">Terminal Configuration</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 flex-1">
                                {/* Level Selection */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-0.5 w-3 bg-orange-400" /> Protocol Level
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {([1, 2, 3] as TerminalCashbackLevel[]).map((l) => (
                                            <div 
                                                key={l} 
                                                onClick={() => handleUpdateConfigLevel(l)}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 cursor-pointer transition-all text-center relative group",
                                                    selectedConfig.level === l ? "border-orange-400 bg-orange-50 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                                                )}
                                            >
                                                <p className={cn("text-xs font-bold", selectedConfig.level === l ? "text-orange-600" : "text-slate-400")}>LEVEL {l}</p>
                                                {selectedConfig.level === l && <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 absolute -top-1.5 -right-1.5 bg-white rounded-full" />}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                        {selectedConfig.level === 1 && "Verified Mode: Variable rewards based on spend range. Best for merchants with fluctuating ticket sizes."}
                                        {selectedConfig.level === 2 && "Fixed Mode: Uniform cashback for any visit. Optimal for high-frequency low-ticket shops."}
                                        {selectedConfig.level === 3 && "Enterprise Mode: Automatic cashback calculation via Merchant's own POS API."}
                                    </p>
                                </div>

                                {/* Reward Logic */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <div className="h-0.5 w-3 bg-orange-400" /> Reward Logic
                                        </h4>
                                        {selectedConfig.level === 1 && <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-orange-500 uppercase tracking-widest hover:bg-orange-50" onClick={handleAddRange}>+ Add Range</Button>}
                                    </div>

                                    {selectedConfig.level === 1 ? (
                                        <div className="space-y-2">
                                            {selectedConfig.ranges.map((range) => (
                                                <div key={range.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-orange-200 transition-all">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Spend Window</p>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-slate-400 text-xs font-semibold">£</span>
                                                                <Input 
                                                                    type="number" 
                                                                    defaultValue={range.minSpend} 
                                                                    className="h-8 w-16 p-1 font-bold text-sm bg-slate-50 border-slate-200" 
                                                                    onBlur={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const updatedRanges = selectedConfig.ranges.map(r => r.id === range.id ? { ...r, minSpend: val } : r);
                                                                        setSelectedConfig({ ...selectedConfig, ranges: updatedRanges });
                                                                    }}
                                                                />
                                                                <span className="text-slate-300">—</span>
                                                                <span className="text-slate-400 text-xs font-semibold">£</span>
                                                                <Input 
                                                                    type="number" 
                                                                    defaultValue={range.maxSpend} 
                                                                    className="h-8 w-16 p-1 font-bold text-sm bg-slate-50 border-slate-200" 
                                                                    onBlur={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const updatedRanges = selectedConfig.ranges.map(r => r.id === range.id ? { ...r, maxSpend: val } : r);
                                                                        setSelectedConfig({ ...selectedConfig, ranges: updatedRanges });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="border-l border-slate-100 pl-4">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cashback</p>
                                                            <div className="flex items-center gap-1.5 text-orange-600">
                                                                <span className="text-xs font-semibold">£</span>
                                                                <Input 
                                                                    type="number" 
                                                                    step="0.5"
                                                                    defaultValue={range.rewardValue} 
                                                                    className="h-8 w-20 p-1 font-bold text-sm bg-orange-50/50 border-orange-100 focus:border-orange-400 text-orange-600" 
                                                                    onBlur={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const updatedRanges = selectedConfig.ranges.map(r => r.id === range.id ? { ...r, rewardValue: val } : r);
                                                                        setSelectedConfig({ ...selectedConfig, ranges: updatedRanges });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-400 transition-colors" onClick={() => handleRemoveRange(range.id)}><XCircle className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : selectedConfig.level === 2 ? (
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Fixed Visit Reward</p>
                                                <div className="flex items-center gap-1.5 text-2xl font-bold text-orange-500">
                                                    <span>£</span>
                                                    <Input 
                                                        type="number" 
                                                        step="0.5"
                                                        defaultValue={selectedConfig.fixedRewardValue || 0} 
                                                        className="h-10 w-24 p-1 font-bold text-xl border-b-2 border-transparent bg-transparent focus:border-orange-400 text-orange-500" 
                                                        onBlur={(e) => setSelectedConfig({ ...selectedConfig, fixedRewardValue: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Value</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 text-white space-y-5 shadow-inner">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Enterprise API Endpoint</Label>
                                                    <Input 
                                                        placeholder="https://api.merchant.com/v1/verify" 
                                                        defaultValue={selectedConfig.apiEndpoint}
                                                        onBlur={(e) => setSelectedConfig({ ...selectedConfig, apiEndpoint: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white font-mono text-[11px] h-10 rounded-xl"
                                                    />
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Reward Model</p>
                                                        <Select 
                                                            defaultValue={selectedConfig.rewardType || 'fixed'} 
                                                            onValueChange={(val: 'fixed' | 'percentage') => setSelectedConfig({ ...selectedConfig, rewardType: val })}
                                                        >
                                                            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white font-semibold h-9 rounded-lg text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="fixed">FIXED £</SelectItem>
                                                                <SelectItem value="percentage">PERCENT %</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="text-right">
                                                        {selectedConfig.rewardType === 'percentage' ? (
                                                            <>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Cashback Rate</p>
                                                                <div className="flex items-center gap-1 text-2xl font-bold text-orange-400">
                                                                    <Input 
                                                                        type="number" 
                                                                        step="0.1"
                                                                        defaultValue={selectedConfig.rewardPercentage || 0} 
                                                                        onBlur={(e) => setSelectedConfig({ ...selectedConfig, rewardPercentage: Number(e.target.value) })}
                                                                        className="h-10 w-20 p-1 font-bold text-xl border-transparent bg-transparent text-right focus:border-orange-400 text-orange-400" 
                                                                    />
                                                                    <span className="text-lg">%</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Cashback Value</p>
                                                                <div className="flex items-center justify-end gap-1 text-2xl font-bold text-orange-400">
                                                                    <span className="text-lg">£</span>
                                                                    <Input 
                                                                        type="number" 
                                                                        step="0.5"
                                                                        defaultValue={selectedConfig.fixedRewardValue || 0} 
                                                                        onBlur={(e) => setSelectedConfig({ ...selectedConfig, fixedRewardValue: Number(e.target.value) })}
                                                                        className="h-10 w-20 p-1 font-bold text-xl border-transparent bg-transparent text-right focus:border-orange-400 text-orange-400" 
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                                <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                                                    API Mode enables automated real-time verification of purchase amounts through external POS integration.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Economic Guardrails */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-0.5 w-3 bg-orange-400" /> Economic Guardrails
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Monthly Budget (£)</Label>
                                            <Input type="number" defaultValue={selectedConfig.limits.monthlyBudget} className="h-11 rounded-xl font-semibold bg-slate-50 border-slate-200 focus:border-orange-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Daily Cap (£)</Label>
                                            <Input type="number" defaultValue={selectedConfig.limits.maxPerDay} className="h-11 rounded-xl font-semibold bg-slate-50 border-slate-200 focus:border-orange-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Auto-Approval (h)</Label>
                                            <Input type="number" defaultValue={selectedConfig.autoApprovalHours} className="h-11 rounded-xl font-semibold bg-slate-50 border-slate-200 focus:border-orange-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Claims per User</Label>
                                            <Input type="number" defaultValue={selectedConfig.limits.maxClaimsPerUser} className="h-11 rounded-xl font-semibold bg-slate-50 border-slate-200 focus:border-orange-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Final Actions */}
                                <div className="pt-6 sticky bottom-0 bg-white pb-8 mt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <Button 
                                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold h-12 rounded-xl shadow-none"
                                        onClick={handleSaveProtocol}
                                    >
                                        Save Protocol Configuration
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full text-red-500 hover:text-red-600 font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-red-50"
                                        onClick={() => toast.warning("Suspension requires confirmation.")}
                                    >
                                        Suspend Merchant Terminal
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* --- Merchant Analysis Sheet --- */}
            <Sheet open={isAnalysisSheetOpen} onOpenChange={setIsAnalysisSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto rounded-l-[2rem] border-l-8 border-l-blue-500 p-0 bg-white">
                    {selectedConfig && (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                    <BarChart3 className="h-48 w-48 text-blue-500" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-semibold text-[10px] uppercase tracking-wider">Performance Analysis</Badge>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Intel</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800">{selectedConfig.businessName}</h2>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Merchant Terminal Insights</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 flex-1">
                                {/* Core Metrics Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm text-center transition-all hover:border-blue-100">
                                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Distributed</p>
                                        <p className="text-2xl font-bold text-slate-700">£452</p>
                                        <div className="flex items-center justify-center gap-1 mt-1 text-emerald-500 font-medium text-[10px]">
                                            <TrendingUp size={12} /> +12.5%
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm text-center transition-all hover:border-blue-100">
                                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Success Rate</p>
                                        <p className="text-2xl font-bold text-slate-700">98.4%</p>
                                        <div className="flex items-center justify-center gap-1 mt-1 text-slate-400 font-medium text-[10px]">
                                            L1 Standard
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm text-center transition-all hover:border-blue-100">
                                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Avg. Ticket</p>
                                        <p className="text-2xl font-bold text-slate-700">£34.20</p>
                                        <div className="flex items-center justify-center gap-1 mt-1 text-emerald-500 font-medium text-[10px]">
                                            <ArrowUpRight size={12} /> +5%
                                        </div>
                                    </div>
                                </div>

                                {/* Volume Trend (Simple CSS Bars) */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-0.5 w-3 bg-blue-400" /> Reward Issuance Trend
                                    </h4>
                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner space-y-6">
                                        <div className="flex items-end justify-between gap-2 h-32 px-2">
                                            {[40, 65, 45, 90, 55, 80, 70, 85, 95, 60, 75, 50].map((v, i) => (
                                                <div key={i} className="flex-1 bg-white rounded-t-md relative group overflow-hidden border border-slate-100/50">
                                                    <div 
                                                        className="absolute bottom-0 w-full bg-blue-400/20 group-hover:bg-blue-400 transition-all duration-500 rounded-t-md"
                                                        style={{ height: `${v}%` }}
                                                      />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            <span>Start Period</span>
                                            <span className="text-slate-300">Last 30 Active Days</span>
                                            <span>Current</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Intel & Integrity */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <div className="h-0.5 w-3 bg-orange-400" /> Top Requesters
                                        </h4>
                                        <div className="space-y-2">
                                            {[
                                                { name: 'John Smith', count: 12, value: '£24.00' },
                                                { name: 'Sarah Wilson', count: 8, value: '£16.00' },
                                                { name: 'David Chen', count: 5, value: '£10.00' },
                                            ].map((user, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-orange-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">{user.name[0]}</div>
                                                        <span className="font-semibold text-slate-600 text-xs">{user.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-700 text-sm">{user.value}</p>
                                                        <p className="text-[9px] text-slate-400 font-semibold uppercase">{user.count} Claims</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <div className="h-0.5 w-3 bg-red-400" /> Integrity Score
                                        </h4>
                                        <div className="p-6 bg-slate-50 rounded-[2rem] text-center space-y-4 border border-slate-100">
                                            <div className="relative inline-flex items-center justify-center">
                                                <svg className="h-20 w-24 -rotate-90">
                                                    <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                                                    <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="238.64" strokeDashoffset="23.86" className="text-blue-400" strokeLinecap="round" />
                                                </svg>
                                                <span className="absolute text-xl font-bold text-slate-700">90</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Terminal Trust</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium px-2">
                                                    90% of claims pass GPS and hardware checks.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                                    <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold h-12 rounded-xl shadow-none">
                                        <Download className="h-4 w-4 mr-2" /> Download Merchant PDF Report
                                    </Button>
                                    <Button variant="ghost" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500">
                                        View Full Transaction History
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}