'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Badge,
} from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Gift,
    TrendingUp,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Info,
    History,
    Send,
    PlusCircle,
    Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useGetMyVouchers, useTransferMoney, useGiveCashback } from '@/service/money-engine/hook';

// --- MOCK DATA ---

const MOCK_VOUCHER_TYPES = [
    {
        id: 'vt-1',
        name: '£100 Spring Expo Voucher',
        totalValue: 100,
        split: '50/50',
        cashbackLimit: 5,
        seasonalLabel: 'Spring',
        status: 'Active',
        usageScope: 'Expo Only',
        utilization: 65,
    },
    {
        id: 'vt-2',
        name: '£50 Summer Travel Perk',
        totalValue: 50,
        split: '70/30',
        cashbackLimit: 3,
        seasonalLabel: 'Summer',
        status: 'Active',
        usageScope: 'All Shops',
        utilization: 42,
    },
    {
        id: 'vt-3',
        name: '£200 Platinum Reward',
        totalValue: 200,
        split: '80/20',
        cashbackLimit: 10,
        seasonalLabel: 'General',
        status: 'Inactive',
        usageScope: 'Premium Partners',
        utilization: 0,
    },
];

const MOCK_CUSTOMER_VOUCHERS = [
    {
        id: 'cv-101',
        typeId: 'vt-1',
        name: '£100 Spring Expo Voucher',
        balance: 85,
        totalValue: 100,
        status: 'Active',
        transactions: [
            { id: 't1', date: '2024-03-15', shop: 'Gourmet Kitchen', amount: 5, type: 'cashback' },
            { id: 't2', date: '2024-03-14', shop: 'Expo Entry', amount: -20, type: 'spend' },
        ],
    },
    {
        id: 'cv-102',
        typeId: 'vt-2',
        name: '£50 Summer Travel Perk',
        balance: 50,
        totalValue: 50,
        status: 'Active',
        transactions: [],
    },
];

const MOCK_SHOPS = [
    { id: 'shop-1', name: 'Gourmet Kitchen' },
    { id: 'shop-2', name: 'Eco Entry' },
    { id: 'shop-3', name: 'Premium Partners' },
];

const MOCK_USER_VOUCHERS = [
    { id: 'uv-1', name: 'John Doe - Spring Voucher' },
    { id: 'uv-2', name: 'Jane Smith - Summer Perk' },
];

const MOCK_BUSINESS_STATS = {
    activeVouchers: 12,
    cashbackDistributed: 450,
    customersServed: 89,
    salesIncrease: 24, // percentage
};

const MOCK_CUSTOMER_STATS = {
    totalBalance: 135,
    rewardValueEarned: 25,
    vouchersOwned: 2,
};

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                            {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />}
                            {trend === 'down' && <ArrowDownLeft className="w-3 h-3 text-red-500 mr-1" />}
                            {description}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-orange-100 rounded-2xl">
                    <Icon className="w-6 h-6 text-orange-600" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function CouponsVouchersPage() {
    const { userRole } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');
    const [cashbackAmount, setCashbackAmount] = useState('');
    const [selectedUserVoucher, setSelectedUserVoucher] = useState('');
    const [selectedShopId, setSelectedShopId] = useState('');
    const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const isBusiness = userRole === UserRole.OWNER;
    const isCustomer = userRole === UserRole.CUSTOMER;

    // API Hooks
    const { data: myVouchersResponse, isLoading: isLoadingVouchers } = useGetMyVouchers(isCustomer);
    const transferMutation = useTransferMoney();
    const cashbackMutation = useGiveCashback();

    const myVouchers = useMemo(() => {
        if (!myVouchersResponse) return [];
        return myVouchersResponse.map(v => ({
            id: v.id,
            name: v.definition.name,
            balance: v.totalBalance,
            status: v.state === 'active' ? 'Active' : 'Inactive',
            totalValue: v.totalBalance, // Simplified for now
            transactions: [] // History tab needs separate implementation
        }));
    }, [myVouchersResponse]);

    const customerStats = useMemo(() => {
        const totalBalance = myVouchers.reduce((sum, v) => sum + v.balance, 0);
        const vouchersOwned = myVouchers.length;
        return {
            totalBalance,
            vouchersOwned,
            rewardValueEarned: 25 // Keep mock for now as it's not in the DTO
        };
    }, [myVouchers]);

    // Form states
    const [topUpAmount, setTopUpAmount] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const handleGiveCashback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserVoucher || !cashbackAmount || !selectedShopId) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await cashbackMutation.mutateAsync({
                userVoucherId: selectedUserVoucher,
                amount: Number(cashbackAmount),
                shopId: selectedShopId
            });
            toast.success(`Successfully added £${cashbackAmount} cashback`);
            setIsCashbackModalOpen(false);
            setCashbackAmount('');
            setSelectedUserVoucher('');
            setSelectedShopId('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to give cashback');
        }
    };

    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVoucher || !topUpAmount) {
            toast.error('Please select a voucher and amount');
            return;
        }
        toast.success(`Successfully topped up £${topUpAmount} to voucher ${selectedVoucher}`);
        setIsTopUpModalOpen(false);
        setTopUpAmount('');
        setSelectedVoucher('');
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVoucher || !transferRecipient || !transferAmount) {
            toast.error('Please fill in all transfer details');
            return;
        }

        try {
            await transferMutation.mutateAsync({
                fromVoucherId: selectedVoucher,
                toVoucherId: transferRecipient,
                amount: Number(transferAmount)
            });
            toast.success(`Successfully transferred £${transferAmount} to ${transferRecipient}`);
            setIsTransferModalOpen(false);
            setTransferAmount('');
            setTransferRecipient('');
            setSelectedVoucher('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Transfer failed');
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-transparent space-y-8 pb-10">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="w-8 h-8 text-orange-600" />
                            Reward Hub
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage your spending power and reward network.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 gap-2">
                                    <Info className="w-4 h-4" />
                                    How it works
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-orange-600">The Reward Network Guide</DialogTitle>
                                    <DialogDescription>
                                        Understanding Coupon‑Vouchers and Voucher‑Coupons.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                                <PlusCircle className="w-4 h-4" />
                                                Coupon Vouchers
                                            </h4>
                                            <p className="text-xs text-orange-700 leading-relaxed">
                                                These <strong>create value</strong>. When you top up or receive a gift, the network matches it to give you more spending power.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                                <Zap className="w-4 h-4" />
                                                Voucher Coupons
                                            </h4>
                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                These <strong>control spending</strong>. They ensure rewards stay within our partner network, benefiting businesses and users alike.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Why Use This?</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                                <span><strong>Businesses:</strong> Reward customers without losing real cash. Increase sales by up to 24%.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                                <span><strong>Customers:</strong> Get £100 of value for only £50 input. Keep spending as businesses add "cashback" to your voucher.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Breadcrumb className="hidden lg:block">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Coupons & Vouchers</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isBusiness ? (
                        <>
                            <StatCard
                                title="Active Vouchers"
                                value={MOCK_BUSINESS_STATS.activeVouchers}
                                icon={Zap}
                                description="Currently in circulation"
                            />
                            <StatCard
                                title="Cashback Given"
                                value={`£${MOCK_BUSINESS_STATS.cashbackDistributed}`}
                                icon={Wallet}
                                description="+12% from last month"
                                trend="up"
                            />
                            <StatCard
                                title="Customers Served"
                                value={MOCK_BUSINESS_STATS.customersServed}
                                icon={Users}
                                description="Unique voucher users"
                            />
                            <StatCard
                                title="Growth Engine"
                                value={`${MOCK_BUSINESS_STATS.salesIncrease}%`}
                                icon={TrendingUp}
                                description="Estimated sales increase"
                                trend="up"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Wallet Balance"
                                value={`£${customerStats.totalBalance}`}
                                icon={Wallet}
                                description="Total spending power"
                            />
                            <StatCard
                                title="Reward Value"
                                value={`£${customerStats.rewardValueEarned}`}
                                icon={Gift}
                                description="Value given by businesses"
                            />
                            <StatCard
                                title="Active Vouchers"
                                value={customerStats.vouchersOwned}
                                icon={Zap}
                                description="Ready to use"
                            />
                            <StatCard
                                title="Network Status"
                                value="Global"
                                icon={TrendingUp}
                                description="Usable at all partners"
                            />
                        </>
                    )}
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="w-full space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <TabsList className="bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-inner border border-white/20">
                            <TabsTrigger
                                value="overview"
                                className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="transactions"
                                className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                            >
                                History
                            </TabsTrigger>
                            {isBusiness && (
                                <TabsTrigger
                                    value="settings"
                                    className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                                >
                                    Campaigns
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {isBusiness && (
                            <Dialog open={isCashbackModalOpen} onOpenChange={setIsCashbackModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        Give Cashback
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Reward Customer</DialogTitle>
                                        <DialogDescription>
                                            Add reward value to a customer's Coupon Voucher.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleGiveCashback} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                Select User Voucher
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Select the customer's voucher to reward</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <Select value={selectedUserVoucher} onValueChange={setSelectedUserVoucher}>
                                                <SelectTrigger className="rounded-xl border-gray-200">
                                                    <SelectValue placeholder="Select customer voucher" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="z-[1001]">
                                                    {MOCK_USER_VOUCHERS.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Select Business / Shop</Label>
                                            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                                                <SelectTrigger className="rounded-xl border-gray-200">
                                                    <SelectValue placeholder="Select participating shop" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="z-[1001]">
                                                    {MOCK_SHOPS.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Reward Amount (£)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="e.g. 5.00"
                                                value={cashbackAmount}
                                                onChange={(e) => setCashbackAmount(e.target.value)}
                                                className="rounded-xl border-gray-200"
                                            />
                                            <p className="text-xs text-gray-500 italic">
                                                Businesses never pay real money. You are giving reward value.
                                            </p>
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button
                                                type="submit"
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                                                disabled={cashbackMutation.isPending}
                                            >
                                                {cashbackMutation.isPending ? 'Processing...' : 'Apply Reward'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main List */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
                                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {isBusiness ? 'Available Vouchers' : 'My Active Vouchers'}
                                                </CardTitle>
                                                <CardDescription>
                                                    {isBusiness
                                                        ? 'The vouchers you are allowed to participate in.'
                                                        : 'Manage and use your currently active vouchers.'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 rounded-full px-4 py-1">
                                                {isBusiness ? MOCK_VOUCHER_TYPES.length : myVouchers.length} Items
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-gray-50/30">
                                                <TableRow>
                                                    <TableHead className="w-[250px] font-semibold text-gray-700">Name / Label</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">
                                                        {isBusiness ? 'Split Ratio' : 'Balance'}
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Scope</TableHead>
                                                    <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isBusiness ? (
                                                    MOCK_VOUCHER_TYPES.map((vt) => (
                                                        <TableRow key={vt.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <TableCell className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-900">{vt.name}</span>
                                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                        <Badge variant="secondary" className="text-[10px] h-4 rounded-sm bg-orange-100/50 text-orange-800 border-none">
                                                                            {vt.seasonalLabel}
                                                                        </Badge>
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-blue-700">{vt.split}</span>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <Info className="w-3.5 h-3.5 text-blue-400" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Customer pays part, rewarding network pays rest.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-gray-600">{vt.usageScope}</TableCell>
                                                            <TableCell className="py-4 text-right">
                                                                <Badge
                                                                    className={`rounded-full px-3 py-0.5 border-none ${vt.status === 'Active'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-500'
                                                                        }`}
                                                                >
                                                                    {vt.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    myVouchers.map((cv) => (
                                                        <TableRow key={cv.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <TableCell className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-900">{cv.name}</span>
                                                                    <span className="text-xs text-gray-500">{cv.id}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xl font-bold text-green-600">£{cv.balance}</span>
                                                                    <span className="text-xs text-gray-500">of £{cv.totalValue} total</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <span className="text-sm text-gray-600 italic">Universal Use</span>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right">
                                                                <Button size="sm" variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50">
                                                                    Details
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                                {isCustomer && isLoadingVouchers && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                                            Loading vouchers...
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {isCustomer && !isLoadingVouchers && myVouchers.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                                            No vouchers found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Info / Actions */}
                            <div className="space-y-6">
                                <Card className="border-none shadow-lg bg-orange-600 text-white rounded-2xl overflow-hidden overflow-visible relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Zap className="w-6 h-6 text-orange-300 opacity-50" />
                                        </motion.div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Pro Tip</CardTitle>
                                        <CardDescription className="text-orange-100">
                                            How to maximize value.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm leading-relaxed">
                                            {isBusiness
                                                ? "Attach vouchers to your 'Expo Special' campaign to attract 3x more customers. Each reward you give builds customer loyalty without hitting your cash flow."
                                                : "Ask businesses for cashback whenever you shop! Your voucher balance can grow every time you spend at a participating partner."}
                                        </p>
                                        {!isBusiness && (
                                            <div className="flex gap-2">
                                                <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button className="flex-1 bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-semibold border-none">
                                                            Top Up
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Top Up Voucher</DialogTitle>
                                                            <DialogDescription>
                                                                Add funds to your Coupon Voucher and get matched rewards.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleTopUp} className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Select Voucher</Label>
                                                                <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue placeholder="Choose a voucher" />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="popper" className="z-[1001]">
                                                                        {myVouchers.map(v => (
                                                                            <SelectItem key={v.id} value={v.id}>{v.name} (Bal: £{v.balance})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Amount to Add (£)</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g. 50"
                                                                    value={topUpAmount}
                                                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                                <p className="text-xs text-orange-600 font-medium">
                                                                    Tip: A £50 top-up will give you £100 total spending power!
                                                                </p>
                                                            </div>
                                                            <div className="pt-2">
                                                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                                                                    Confirm Payment
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button className="flex-1 bg-orange-500/50 text-white hover:bg-orange-500/70 rounded-xl font-semibold border-none">
                                                            Transfer
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Transfer Funds</DialogTitle>
                                                            <DialogDescription>
                                                                Send voucher value to family or friends.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleTransfer} className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Recipient Email or ID</Label>
                                                                <Input
                                                                    placeholder="user@example.com"
                                                                    value={transferRecipient}
                                                                    onChange={(e) => setTransferRecipient(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Select Source Voucher</Label>
                                                                <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue placeholder="Choose a voucher" />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="popper" className="z-[1001]">
                                                                        {myVouchers.map(v => (
                                                                            <SelectItem key={v.id} value={v.id}>{v.name} (Bal: £{v.balance})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Transfer Amount (£)</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g. 20"
                                                                    value={transferAmount}
                                                                    onChange={(e) => setTransferAmount(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="pt-2">
                                                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                                                                    Send Gift
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Network Health</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <span>Network Utilization</span>
                                                    <Tooltip>
                                                        <TooltipTrigger><Info className="w-3.5 h-3.5" /></TooltipTrigger>
                                                        <TooltipContent><p>Percentage of vouchers currently being used in active transactions.</p></TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-bold text-gray-900">78%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500 w-[78%] rounded-full shadow-inner" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <span>Reward Flow Rate</span>
                                                    <Tooltip>
                                                        <TooltipTrigger><Info className="w-3.5 h-3.5" /></TooltipTrigger>
                                                        <TooltipContent><p>How fast reward value is moving from businesses to customers.</p></TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-bold text-gray-900">Moderate</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[55%] rounded-full shadow-inner" />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="ghost" className="w-full text-sm text-gray-500 flex items-center justify-center gap-2">
                                                <History className="w-4 h-4" />
                                                View Full Network Insights
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TRANSACTIONS TAB */}
                    <TabsContent value="transactions">
                        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>All activity related to your coupons and vouchers.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Entity</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isCustomer && myVouchers.length > 0 && myVouchers[0].transactions?.map((t: any) => (
                                            <TableRow key={t.id}>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`rounded-full px-3 py-0.5 border-none ${t.type === 'cashback'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        {t.type === 'cashback' ? 'Reward' : 'Spend'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">{t.shop}</TableCell>
                                                <TableCell className="text-gray-500 font-mono text-xs">{t.date}</TableCell>
                                                <TableCell className={`text-right font-bold ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {t.amount > 0 ? '+' : ''}£{Math.abs(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {isBusiness && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-gray-500 italic">
                                                    Loading business distribution logs...
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SETTINGS / CAMPAIGNS TAB (Business only shown in triggers) */}
                    {isBusiness && (
                        <TabsContent value="settings">
                            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
                                <CardHeader>
                                    <CardTitle>Active Participation</CardTitle>
                                    <CardDescription>Toggle which voucher types are active in your store.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {MOCK_VOUCHER_TYPES.map(vt => (
                                        <div key={vt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{vt.name}</span>
                                                <span className="text-xs text-gray-500">Utilization: {vt.utilization}% among your customers</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge className="bg-blue-100 text-blue-700 border-none">
                                                            Limit: £{vt.cashbackLimit}/customer
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Max reward you can give to a single voucher</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Button variant="outline" size="sm" className={`rounded-xl ${vt.status === 'Active' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                                                    {vt.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </TooltipProvider>
    );
}
