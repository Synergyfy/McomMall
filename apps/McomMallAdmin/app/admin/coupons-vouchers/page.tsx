'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Ticket,
    Wallet,
    Gift,
    TrendingUp,
    Store,
    Info,
    Calendar,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Activity,
    Users,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    LucideIcon,
    Loader2,
    X,
    Check,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useCreateRewardDefinition, useGetRewardDefinitions, useGetMoneyEngineAnalytics, useDeleteRewardDefinition } from '@/service/money-engine/hook';
import { CreateRewardDefinitionDto, RewardDefinition } from '@/service/money-engine/types';
import { useGetAdminListings } from '@/service/listings/hook';
import { AdminListing } from '@/service/listings/types';

// --- Form Schema ---

const couponVoucherSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    faceValue: z.coerce.number().min(1, 'Value must be at least 1'),
    splitRatio: z.string(),
    scopeType: z.enum(['any_shop', 'specific_shops', 'expo_only', 'campaign_only']),
    visualType: z.enum(['coupon', 'voucher']).default('voucher'),
    functionalType: z.enum(['price_reducer', 'spending_power']).default('spending_power'),
    burnStrategy: z.enum(['reward_first', 'real_first', 'proportional']).default('reward_first'),
    seasonalLabel: z.string(),
    validShopIds: z.array(z.string()).optional().default([]),
    isActive: z.boolean().default(true),
});

type CouponVoucherFormValues = z.infer<typeof couponVoucherSchema>;

// --- Components ---

function StatCard({ stat }: { stat: { title: string, value: string, change: string, changeType: string, icon: LucideIcon, color: string } }) {
    const Icon = stat.icon;
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        <div className="flex items-center mt-2">
                            {stat.changeType === 'up' ? (
                                <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={cn(
                                "text-xs font-semibold",
                                stat.changeType === 'up' ? "text-emerald-500" : "text-red-500"
                            )}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-slate-400 ml-1.5">vs last month</span>
                        </div>
                    </div>
                    <div className={cn("p-3 rounded-2xl text-white", stat.color)}>
                        <Icon size={24} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CouponVoucherControl() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { definitions, isLoading: isDefinitionsLoading } = useGetRewardDefinitions();
    const { analytics, isLoading: isAnalyticsLoading } = useGetMoneyEngineAnalytics();
    const { data: listingsData, isLoading: isListingsLoading } = useGetAdminListings({ limit: 100 });
    const createRewardDefinition = useCreateRewardDefinition();
    const deleteRewardDefinition = useDeleteRewardDefinition();

    const listings = listingsData?.data || [];

    const form = useForm<CouponVoucherFormValues>({
        resolver: zodResolver(couponVoucherSchema),
        defaultValues: {
            name: '',
            description: '',
            faceValue: 100,
            splitRatio: '50-50',
            scopeType: 'any_shop',
            visualType: 'voucher',
            functionalType: 'spending_power',
            burnStrategy: 'reward_first',
            seasonalLabel: 'Spring',
            validShopIds: [],
            isActive: true,
        }
    });

    const watchScopeType = form.watch('scopeType');
    const [shopSearch, setShopSearch] = useState('');
    const selectedShopIds = form.watch('validShopIds') || [];

    const filteredShops = listings.filter(shop =>
        (shop.title?.toLowerCase().includes(shopSearch.toLowerCase()) ||
            shop.businessName?.toLowerCase().includes(shopSearch.toLowerCase())) &&
        !selectedShopIds.includes(shop.id)
    );

    const toggleShop = (shopId: string) => {
        const current = form.getValues('validShopIds') || [];
        if (current.includes(shopId)) {
            form.setValue('validShopIds', current.filter(id => id !== shopId));
        } else {
            form.setValue('validShopIds', [...current, shopId]);
        }
    };

    const onSubmit = async (values: CouponVoucherFormValues) => {
        try {
            const [realStr, rewardStr] = values.splitRatio.split('-');
            const real = parseInt(realStr) / 100;
            const reward = parseInt(rewardStr) / 100;

            const payload: CreateRewardDefinitionDto = {
                name: `${values.name} £${values.faceValue}`,
                description: values.description || `${values.splitRatio} Split voucher for ${values.seasonalLabel} campaign`,
                visualType: values.visualType,
                functionalType: values.functionalType,
                burnStrategy: values.burnStrategy,
                splitRatio: {
                    real,
                    reward,
                },
                scopeType: values.scopeType,
                validShopIds: values.scopeType === 'specific_shops' ? values.validShopIds : undefined,
                seasonalLabels: [values.seasonalLabel, new Date().getFullYear().toString()],
                isActive: values.isActive,
            };

            await createRewardDefinition(payload);
            toast.success('Coupon Voucher definition created successfully!');
            setIsCreateModalOpen(false);
            form.reset();
        } catch (error: any) {
            console.error('Failed to create reward definition:', error);
            toast.error(error.response?.data?.message || 'Failed to create Coupon Voucher. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to retire this reward definition? This cannot be undone.')) return;

        try {
            await deleteRewardDefinition(id);
            toast.success('Reward definition retired successfully.');
        } catch (error: any) {
            console.error('Failed to delete reward definition:', error);
            toast.error(error.response?.data?.message || 'Failed to retire reward. Please try again.');
        }
    };

    const formatValue = (key: string, value: number) => {
        if (key === 'activeVouchers') return value.toLocaleString();
        if (key === 'networkUtilization') return `${value}%`;
        return `£${value.toLocaleString()}`;
    };

    const STATS = [
        {
            title: 'Active Vouchers',
            value: isAnalyticsLoading ? '...' : (analytics ? formatValue('activeVouchers', analytics.activeVouchers.value) : '0'),
            change: isAnalyticsLoading ? '' : (analytics ? `${analytics.activeVouchers.percentageChange >= 0 ? '+' : ''}${analytics.activeVouchers.percentageChange}%` : '0%'),
            changeType: (analytics?.activeVouchers.percentageChange || 0) >= 0 ? 'up' : 'down',
            icon: Ticket,
            color: 'bg-orange-500',
        },
        {
            title: 'Real Money Input',
            value: isAnalyticsLoading ? '...' : (analytics ? formatValue('realMoneyInput', analytics.realMoneyInput.value) : '£0'),
            change: isAnalyticsLoading ? '' : (analytics ? `${analytics.realMoneyInput.percentageChange >= 0 ? '+' : ''}${analytics.realMoneyInput.percentageChange}%` : '0%'),
            changeType: (analytics?.realMoneyInput.percentageChange || 0) >= 0 ? 'up' : 'down',
            icon: Wallet,
            color: 'bg-blue-500',
        },
        {
            title: 'Reward Value Given',
            value: isAnalyticsLoading ? '...' : (analytics ? formatValue('rewardValueGiven', analytics.rewardValueGiven.value) : '£0'),
            change: isAnalyticsLoading ? '' : (analytics ? `${analytics.rewardValueGiven.percentageChange >= 0 ? '+' : ''}${analytics.rewardValueGiven.percentageChange}%` : '0%'),
            changeType: (analytics?.rewardValueGiven.percentageChange || 0) >= 0 ? 'up' : 'down',
            icon: Gift,
            color: 'bg-purple-500',
        },
        {
            title: 'Network Utilization',
            value: isAnalyticsLoading ? '...' : (analytics ? formatValue('networkUtilization', analytics.networkUtilization.value) : '0%'),
            change: isAnalyticsLoading ? '' : (analytics ? `${analytics.networkUtilization.percentageChange >= 0 ? '+' : ''}${analytics.networkUtilization.percentageChange}%` : '0%'),
            changeType: (analytics?.networkUtilization.percentageChange || 0) >= 0 ? 'up' : 'down',
            icon: Activity,
            color: 'bg-emerald-500',
        },
    ];

    return (
        <TooltipProvider>
            <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Ticket className="h-8 w-8 text-orange-600" />
                            Coupon-Voucher Control
                        </h1>
                        <p className="text-slate-500 mt-1">Manage and issue controlled spending value within the network.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="hidden sm:flex" onClick={() => toast.info('Export started...')}>
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200">
                                    <Plus className="mr-2 h-4 w-4" /> Create New Coupon-Voucher
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
                                <DialogHeader className="p-6 pb-2">
                                    <DialogTitle className="text-2xl">Create Coupon Voucher</DialogTitle>
                                    <DialogDescription>
                                        Define the parameters for a new spending reward.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden bg-slate-50/30">
                                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar min-h-0 pb-10">
                                        {/* Section 1: Identity & Value */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-1 bg-orange-500 rounded-full" />
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Identity & Value</h4>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="name">Voucher Name</Label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="w-64">The public name of the voucher helps customers identify the campaign (e.g., "Spring Expo").</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Spring Expo Voucher"
                                                    className={cn("bg-white border-slate-200 focus:ring-orange-500 h-10 shadow-sm", form.formState.errors.name && "border-red-500")}
                                                    {...form.register('name')}
                                                />
                                                {form.formState.errors.name && <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-1">
                                                {/* Total Value */}
                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="faceValue">Total Face Value (£)</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64">The total amount the customer will see in their wallet.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Input
                                                        id="faceValue"
                                                        type="number"
                                                        placeholder="100"
                                                        {...form.register('faceValue')}
                                                    />
                                                    {form.formState.errors.faceValue && <p className="text-xs text-red-500">{form.formState.errors.faceValue.message}</p>}
                                                </div>

                                                {/* Split Ratio */}
                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="splitRatio">Split Ratio</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64">How the value is generated: Real Money (Customer/Bank) vs Reward Value (System).</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Select
                                                        onValueChange={(val) => form.setValue('splitRatio', val)}
                                                        defaultValue={form.getValues('splitRatio')}
                                                    >
                                                        <SelectTrigger id="splitRatio" className="bg-white border-slate-200 h-10 shadow-sm">
                                                            <SelectValue placeholder="Select split" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="50-50">50/50 (Balanced)</SelectItem>
                                                            <SelectItem value="70-30">70/30 (High Real)</SelectItem>
                                                            <SelectItem value="80-20">80/20 (Maximum Real)</SelectItem>
                                                            <SelectItem value="20-80">20/80 (High Reward)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Scope & Timing */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 pt-2">
                                                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scope & Duration</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 font-medium">
                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="scopeType">Usage Scope</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64">Where this voucher can be spent. Restrict to specific businesses or events.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Select
                                                        onValueChange={(val) => form.setValue('scopeType', val as any)}
                                                        defaultValue={form.getValues('scopeType')}
                                                    >
                                                        <SelectTrigger id="scopeType">
                                                            <SelectValue placeholder="Select scope" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="any_shop">All Shops</SelectItem>
                                                            <SelectItem value="specific_shops">Certain Shops</SelectItem>
                                                            <SelectItem value="expo_only">Expo Only</SelectItem>
                                                            <SelectItem value="campaign_only">Campaign Only</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="seasonalLabel">Seasonal Label</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64">Category label for seasonal campaigns.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Select
                                                        onValueChange={(val) => form.setValue('seasonalLabel', val)}
                                                        defaultValue={form.getValues('seasonalLabel')}
                                                    >
                                                        <SelectTrigger id="seasonalLabel" className="bg-white border-slate-200 h-10 shadow-sm">
                                                            <SelectValue placeholder="Select season" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Spring">Spring Campaign</SelectItem>
                                                            <SelectItem value="Summer">Summer Campaign</SelectItem>
                                                            <SelectItem value="Autumn">Autumn Campaign</SelectItem>
                                                            <SelectItem value="Winter">Winter Campaign</SelectItem>
                                                            <SelectItem value="Expo">Expo Exclusive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specific Shops Selection Detail - Enhanced UI */}
                                        {watchScopeType === 'specific_shops' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid gap-3 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm ring-1 ring-slate-100"
                                            >
                                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-orange-500" />
                                                        <Label className="text-sm font-bold text-slate-800">Target Businesses</Label>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] bg-slate-50 font-mono font-bold">
                                                        {selectedShopIds.length} Selected
                                                    </Badge>
                                                </div>

                                                <div className="relative pt-1">
                                                    <Search className="absolute left-3 top-[calc(50%+2px)] -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Quick search by name..."
                                                        className="pl-9 bg-slate-50/50 border-slate-100 focus:ring-orange-500 h-10 rounded-xl"
                                                        value={shopSearch}
                                                        onChange={(e) => setShopSearch(e.target.value)}
                                                    />
                                                </div>

                                                {/* Selected Shops Badges Grid */}
                                                {selectedShopIds.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 py-2 max-h-[100px] overflow-y-auto custom-scrollbar border-b border-slate-50 mb-1">
                                                        {selectedShopIds.map(id => {
                                                            const shop = listings.find(s => s.id === id);
                                                            return (
                                                                <motion.div key={id} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-none flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] group">
                                                                        <span className="max-w-[120px] truncate">{shop?.businessName}</span>
                                                                        <X
                                                                            size={14}
                                                                            className="cursor-pointer hover:bg-orange-200 rounded-full transition-colors ml-0.5"
                                                                            onClick={() => toggleShop(id)}
                                                                        />
                                                                    </Badge>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar pt-1">
                                                    {isListingsLoading ? (
                                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                                            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Fetching Businesses...</p>
                                                        </div>
                                                    ) : filteredShops.length === 0 ? (
                                                        <div className="text-center py-6">
                                                            <p className="text-xs text-slate-400 font-medium italic">No businesses match your search.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-1.5">
                                                            {filteredShops.map(shop => (
                                                                <motion.div
                                                                    key={shop.id}
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                    onClick={() => toggleShop(shop.id)}
                                                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50/50 cursor-pointer transition-all border border-slate-50 hover:border-orange-100 group shadow-sm bg-white/50"
                                                                >
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-sm text-slate-900 group-hover:text-orange-700 font-bold truncate tracking-tight">{shop.businessName}</span>
                                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium italic">
                                                                            <Info size={10} className="text-slate-300" /> {shop.title}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Badge variant="outline" className="text-[9px] h-5 bg-white border-slate-100 text-slate-400 group-hover:text-orange-600 transition-colors uppercase font-bold">
                                                                            {shop.category}
                                                                        </Badge>
                                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                                            <Plus size={14} className="group-hover:stroke-[3px]" />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Section 3: Banking Physics (Laws of Physics) */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 pt-2">
                                                <div className="h-8 w-1 bg-purple-500 rounded-full" />
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">The Laws of Physics</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Visual Type */}
                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Label htmlFor="visualType">Physical Look</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64 font-normal">Decide if this is presented as a spending Voucher or a discount Coupon.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Select
                                                        onValueChange={(val) => form.setValue('visualType', val as any)}
                                                        defaultValue={form.getValues('visualType')}
                                                    >
                                                        <SelectTrigger id="visualType" className="bg-white border-slate-200 h-10 shadow-sm">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="voucher">Spending Voucher</SelectItem>
                                                            <SelectItem value="coupon">Discount Coupon</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Functional Type */}
                                                <div className="grid gap-2 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="functionalType">Functional Flow</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64 font-normal">Spending Power acts like cash; Price Reducer acts like a discount.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Select
                                                        onValueChange={(val) => form.setValue('functionalType', val as any)}
                                                        defaultValue={form.getValues('functionalType')}
                                                    >
                                                        <SelectTrigger id="functionalType" className="bg-white border-slate-200 h-10 shadow-sm">
                                                            <SelectValue placeholder="Select function" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="spending_power">Spending Power</SelectItem>
                                                            <SelectItem value="price_reducer">Price Reducer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Burn Strategy */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Label htmlFor="burnStrategy">Burn Strategy (Banking Policy)</Label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="w-64 font-normal">Determines whose pocket is spent first: Charlie's cash or the System bonus.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select
                                                    onValueChange={(val) => form.setValue('burnStrategy', val as any)}
                                                    defaultValue={form.getValues('burnStrategy')}
                                                >
                                                    <SelectTrigger id="burnStrategy" className="bg-orange-50 border-orange-100 text-orange-900 font-bold h-11 shadow-sm ring-1 ring-orange-200/50">
                                                        <SelectValue placeholder="Select strategy" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-orange-100 shadow-xl">
                                                        <SelectItem value="reward_first" className="focus:bg-orange-50 focus:text-orange-900">Reward First (Good for Platform)</SelectItem>
                                                        <SelectItem value="real_first" className="focus:bg-orange-50 focus:text-orange-900">Real Money First (Good for Customer)</SelectItem>
                                                        <SelectItem value="proportional" className="focus:bg-orange-50 focus:text-orange-900">Balanced (Proportional)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1">
                                                    <Activity size={10} className="text-orange-400" /> Alice's Law: This defines how value is deducted during transactions.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Toggle - Final Control */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        </div>
                                                        <Label className="text-base font-bold text-slate-800 tracking-tight">Activate Immediately</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-64 font-normal">Set this voucher to active state immediately upon creation.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium">System will begin awarding cashback matching rewards for applicable transactions.</p>
                                                </div>
                                                <Switch
                                                    checked={form.watch('isActive')}
                                                    onCheckedChange={(val) => form.setValue('isActive', val)}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50 rounded-b-3xl">
                                        <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                        <Button
                                            type="submit"
                                            className="bg-orange-600 hover:bg-orange-700 text-white"
                                            disabled={form.formState.isSubmitting}
                                        >
                                            {form.formState.isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : 'Create Voucher'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, i) => (
                        <StatCard key={i} stat={stat} />
                    ))}
                </div>

                {/* Main Content */}
                <Tabs defaultValue="vouchers" className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <TabsList className="bg-slate-100 p-1 rounded-xl">
                            <TabsTrigger value="vouchers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Active Vouchers</TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Insights</TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Global Settings</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search vouchers..." className="pl-9 w-full sm:w-64 border-slate-200" />
                            </div>
                            <Button variant="outline" size="icon" className="shrink-0 border-slate-200">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="vouchers" className="mt-0 space-y-4">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-b border-slate-100 italic">
                                        <TableHead className="w-[300px] font-semibold text-slate-700">Voucher Details</TableHead>
                                        <TableHead className="font-semibold text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                Split Ratio
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Real/Reward split</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-700">Scope</TableHead>
                                        <TableHead className="font-semibold text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                Actual Inc.
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Sales increase trend for businesses</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-700 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                Utilization
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Value spent vs total issued</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isDefinitionsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                Loading vouchers...
                                            </TableCell>
                                        </TableRow>
                                    ) : definitions?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                                                No vouchers found. Create one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        definitions?.map((voucher: RewardDefinition) => (
                                            <TableRow key={voucher.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                            <Ticket size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{voucher.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono line-clamp-1">{voucher.description}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="w-fit bg-slate-50 text-slate-600 border-slate-200">
                                                            {voucher.splitRatio.real * 100}/{voucher.splitRatio.reward * 100}
                                                        </Badge>
                                                        <Badge variant="outline" className="w-fit bg-slate-50 text-slate-600 border-slate-200 uppercase text-[9px] font-bold">
                                                            {voucher.visualType} | {voucher.functionalType?.replace('_', ' ')}
                                                        </Badge>
                                                        <p className="text-[10px] text-slate-400">
                                                            Labels: {voucher.seasonalLabels?.join(', ')}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Store className="h-3.5 w-3.5" />
                                                        {voucher.scopeType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                                        <TrendingUp size={14} />
                                                        +24%
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-end text-sm gap-2">
                                                            <span className="font-medium text-slate-900">£0</span>
                                                            <span className="text-slate-300">/</span>
                                                            <span className="text-slate-500">£0</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 ml-auto max-w-[120px]">
                                                            <div
                                                                className="bg-orange-500 h-1.5 rounded-full"
                                                                style={{ width: `0%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "rounded-full px-2.5 py-0.5",
                                                        "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                    )}>
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full mr-1.5",
                                                            "bg-emerald-500"
                                                        )} />
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 border-none">
                                                                <MoreVertical size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <Activity className="mr-2 h-4 w-4 text-slate-400" />
                                                                View Usage Log
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-slate-400" />
                                                                Pause Campaign
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                onClick={() => handleDelete(voucher.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Retire Reward
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Burn Velocity Chart (Alice's Primary Metric) */}
                            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-lg font-bold text-slate-900">System Burn Velocity</CardTitle>
                                        <CardDescription className="text-xs">Cashback Awarded vs. Burned Value over time</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 text-[10px] font-bold text-orange-600 border border-orange-100 uppercase tracking-tighter">Cashback</div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter">Burned</div>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[350px] flex items-center justify-center relative p-6">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/30" />
                                    <div className="relative text-center space-y-4">
                                        <div className="flex items-end justify-center gap-2 h-48 w-full max-w-md mx-auto">
                                            {[40, 65, 45, 90, 55, 80, 70, 85, 95, 60, 75, 50].map((v, i) => (
                                                <div key={i} className="flex flex-col items-center gap-1 w-full">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${v}%` }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="w-full bg-orange-400/20 rounded-t-sm border-t-2 border-orange-400 relative group"
                                                    >
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${v * 0.4}%` }}
                                                            className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm border-t-2 border-blue-600"
                                                        />
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-800">42% Average Recirculation Rate</p>
                                            <p className="text-xs text-slate-500">System health is <span className="text-emerald-500 font-bold uppercase">Optimal</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seasonal Value Distribution */}
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-bold text-slate-900">Value by Season</CardTitle>
                                    <CardDescription className="text-xs">Distribution of active vouchers</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4">
                                    {[
                                        { label: 'Spring', value: 45, color: 'bg-emerald-400' },
                                        { label: 'Summer', value: 25, color: 'bg-orange-400' },
                                        { label: 'Autumn', value: 15, color: 'bg-amber-600' },
                                        { label: 'Winter', value: 10, color: 'bg-blue-400' },
                                        { label: 'Expo', value: 5, color: 'bg-purple-500' },
                                    ].map((season, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-700">{season.label} Campaign</span>
                                                <span className="text-slate-500 font-mono">{season.value}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${season.value}%` }}
                                                    className={cn("h-full rounded-full", season.color)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Network Activity Ledger */}
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-900">Network Integrity Ledger</CardTitle>
                                        <CardDescription className="text-xs">Real-time spending & minting events</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-[10px] font-bold h-7 uppercase tracking-wider">Download CSV</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <Table>
                                        <TableHeader className="bg-white sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-b border-slate-50">
                                                <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 pl-6 text-slate-400">Timestamp</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-slate-400">Event Type</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-slate-400">Merchant/User</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-slate-400">Asset</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-right pr-6 text-slate-400">Value Delta</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-white">
                                            {[
                                                { time: '2 mins ago', type: 'BURN', target: 'The Gourmet Kitchen', asset: 'Spring Expo Voucher', value: '-£25.00', status: 'success' },
                                                { time: '5 mins ago', type: 'MINT', target: 'Charlie (User #492)', asset: 'Autumn Savings', value: '+£50.00', status: 'success' },
                                                { time: '12 mins ago', type: 'BURN', target: 'Boutique Blooms', asset: 'Member Monthly Reward', value: '-£10.00', status: 'success' },
                                                { time: '18 mins ago', type: 'RETIRE', target: 'Summer 2023 Law', asset: 'Definition #892', value: 'SYSTEM', status: 'archived' },
                                                { time: '45 mins ago', type: 'MINT', target: 'Charlie (User #102)', asset: 'Spring Expo Voucher', value: '+£25.00', status: 'success' },
                                            ].map((event, i) => (
                                                <TableRow key={i} className="group border-b border-slate-50">
                                                    <TableCell className="pl-6 py-4 text-xs font-medium text-slate-500">{event.time}</TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge className={cn(
                                                            "text-[9px] font-bold px-2 py-0.5 rounded-md border shadow-none",
                                                            event.type === 'BURN' ? "bg-red-50 text-red-700 border-red-100" :
                                                                event.type === 'MINT' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                                        )}>
                                                            {event.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm font-bold text-slate-800">{event.target}</TableCell>
                                                    <TableCell className="py-4 text-xs italic text-slate-500">{event.asset}</TableCell>
                                                    <TableCell className={cn(
                                                        "py-4 text-right pr-6 font-mono font-bold text-sm",
                                                        event.value.startsWith('-') ? "text-red-600" :
                                                            event.value.startsWith('+') ? "text-emerald-600" : "text-slate-400"
                                                    )}>
                                                        {event.value}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Treasury Dials */}
                            <Card className="lg:col-span-2 border-none shadow-sm">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/20">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-orange-600" />
                                        <CardTitle className="text-xl font-bold">Treasury Dials</CardTitle>
                                    </div>
                                    <CardDescription>Adjust the global economic parameters of the Money Engine.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 p-6">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-bold text-slate-700">Global Matching Multiplier</Label>
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 shadow-none">1.5x Active</Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Input defaultValue="1.5" type="number" step="0.1" className="bg-slate-50 border-slate-200" />
                                                <p className="text-[10px] text-slate-400 italic font-medium leading-tight">Controls the rate at which points are minted relative to spend.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-bold text-slate-700">System Transaction Tax</Label>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none">2.0% Active</Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Input defaultValue="2.0" type="number" step="0.5" className="bg-slate-50 border-slate-200" />
                                                <p className="text-[10px] text-slate-400 italic font-medium leading-tight">The platform fee taken during voucher redemptions.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-bold text-slate-700">Daily Minting Cap (£)</Label>
                                                <Badge variant="outline" className="border-slate-200">£5,000.00 Limit</Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Input defaultValue="5000" type="number" className="bg-slate-50 border-slate-200" />
                                                <p className="text-[10px] text-slate-400 italic font-medium leading-tight">Anti-runaway mechanism. Stops minting if daily limit exceeded.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-bold text-slate-700">Default Banking Strategy</Label>
                                            </div>
                                            <Select defaultValue="reward_first">
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                                    <SelectValue placeholder="Select strategy" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="reward_first">Reward First</SelectItem>
                                                    <SelectItem value="real_first">Real Money First</SelectItem>
                                                    <SelectItem value="proportional">Balanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                                        <Button variant="ghost" className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Reset Defaults</Button>
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100 px-8">Save Economic Rules</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seasonal State Control */}
                            <Card className="border-none shadow-sm bg-white overflow-hidden">
                                <div className="bg-indigo-600 p-6 text-white text-center space-y-4">
                                    <Calendar className="h-10 w-10 mx-auto opacity-20" />
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">Active System Season</h3>
                                        <p className="text-xs text-indigo-100 opacity-80">Sets the global theme for all new minting.</p>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button className="bg-white/20 hover:bg-white/30 text-white border-none font-bold text-sm h-12 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 mr-3 animate-pulse" />
                                            SPRING CAMPAIGN
                                        </Button>
                                        <p className="text-[10px] font-medium text-white/60">Started: Jan 1st - End: April 30th</p>
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Switch Governance</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Summer', 'Autumn', 'Winter', 'Expo'].map((s) => (
                                            <Button key={s} variant="outline" className="text-xs h-10 border-slate-100 hover:bg-slate-50 hover:border-slate-200">{s}</Button>
                                        ))}
                                    </div>
                                    <div className="pt-4 flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-amber-700 leading-normal"><strong>Alice's Note:</strong> Changing the active season will label all new vouchers minted from this moment forward with the new identifier.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider >
    );
}

