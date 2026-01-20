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
import { useGetMyVouchers, useTransferMoney, useGiveCashback, usePurchaseVoucher, useGetBusinessStats, useGetOwnerRewardDefinitions, useGetCustomerStats, useGetPublicRewardDefinitions } from '@/service/money-engine/hook';
import { useCreateStripeIntent, useCreatePaypalOrder } from '@/service/payment/hook';
import { useGetUserProfile } from '@/service/user/hook';

import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

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
    const { data: userProfile } = useGetUserProfile();
    const { data: myVouchersResponse, isLoading: isLoadingVouchers } = useGetMyVouchers(isCustomer);
    const { data: businessStats } = useGetBusinessStats(isBusiness);
    const { data: definitionsResponse, isLoading: isLoadingDefinitions } = useGetOwnerRewardDefinitions(isBusiness);
    const { data: customerStats } = useGetCustomerStats(isCustomer);
    // Always fetch public definitions to ensure dropdown populates
    const { data: publicDefinitionsResponse, isLoading: isLoadingPublicDefinitions, error: definitionsError } = useGetPublicRewardDefinitions(true);



    const transferMutation = useTransferMoney();
    const cashbackMutation = useGiveCashback();
    const purchaseMutation = usePurchaseVoucher();
    const createStripeIntentMutation = useCreateStripeIntent();
    const createPaypalOrderMutation = useCreatePaypalOrder();

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

    const voucherTypes = useMemo(() => {
        if (!definitionsResponse?.data) return [];
        return definitionsResponse.data.map(d => ({
            id: d.id,
            name: d.name,
            totalValue: 100, // Default display value
            split: d.splitRatio ? `${d.splitRatio.real * 100}/${d.splitRatio.reward * 100}` : '50/50',
            cashbackLimit: 5,
            seasonalLabel: d.seasonalLabels?.[0] || 'General',
            status: d.isActive ? 'Active' : 'Inactive',
            usageScope: d.scopeType === 'any_shop' ? 'Any Shop' : (d.scopeType || 'Any Shop'),
            utilization: d.utilization || 0,
        }));
    }, [definitionsResponse]);


    const availableVouchersForPurchase = useMemo(() => {
        if (!publicDefinitionsResponse?.data) return [];
        return publicDefinitionsResponse.data.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            // Assuming simplified mock values for now until backend provides exact purchase metadata if needed
            totalValue: 'Variable',
        }));
    }, [publicDefinitionsResponse]);


    // Form states
    const [topUpAmount, setTopUpAmount] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [purchaseStep, setPurchaseStep] = useState<'select' | 'payment'>('select');
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

    const handleGiveCashback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserVoucher || !cashbackAmount || !userProfile?.id) {
            toast.error('Please Select a voucher and amount');
            return;
        }

        try {
            await cashbackMutation.mutateAsync({
                userVoucherId: selectedUserVoucher,
                amount: Number(cashbackAmount),
                shopId: userProfile?.id || ''
            });

            toast.success(`Successfully injected £${cashbackAmount} cashback`);
            setIsCashbackModalOpen(false);
            setCashbackAmount('');
            setSelectedUserVoucher('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to inject cashback');
        }
    };

    const handlePurchaseVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVoucher || !topUpAmount) {
            toast.error('Please select a voucher and enter an amount');
            return;
        }

        try {
            if (paymentMethod === 'STRIPE') {
                const intent = await createStripeIntentMutation.mutateAsync({ amount: Number(topUpAmount) });
                setStripeClientSecret(intent.clientSecret);
                setPurchaseStep('payment');
            } else {
                const order = await createPaypalOrderMutation.mutateAsync({ amount: Number(topUpAmount) });
                setPaypalOrderId(order.orderId);
                setPurchaseStep('payment');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to initiate payment');
        }
    };

    const handlePaymentSuccess = async (transactionId: string) => {
        try {
            await purchaseMutation.mutateAsync({
                rewardDefinitionId: selectedVoucher,
                paymentAmount: Number(topUpAmount),
                transactionId: transactionId,
                paymentGateway: paymentMethod
            });

            toast.success(`Successfully purchased voucher for £${topUpAmount}`);
            setIsTopUpModalOpen(false);
            // Reset state
            setTopUpAmount('');
            setSelectedVoucher('');
            setPurchaseStep('select');
            setStripeClientSecret(null);
            setPaypalOrderId(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to finalize purchase. Please contact support.');
        }
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
                <div className={`grid gap-6 ${isCustomer ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                    {isBusiness ? (
                        <>
                            <StatCard
                                title="Total Revenue"
                                value={`£${businessStats?.totalSpentInShop?.toFixed(2) ?? '0.00'}`}
                                icon={TrendingUp}
                                description="Total revenue from vouchers"
                                trend="up"
                            />
                            <StatCard
                                title="Cashback Given"
                                value={businessStats?.cashbackGivenCount ?? 0}
                                icon={Wallet}
                                description="Total rewards distributed"
                            />
                            <StatCard
                                title="Customers Served"
                                value={businessStats?.customersCount ?? 0}
                                icon={Users}
                                description="Unique voucher customers"
                            />
                            <StatCard
                                title="Avg. Customer Spend"
                                value={`£${businessStats?.customersCount ? (businessStats.totalSpentInShop / businessStats.customersCount).toFixed(2) : '0.00'}`}
                                icon={Zap}
                                description="Average revenue per customer"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Active Vouchers"
                                value={customerStats?.activeVouchersCount ?? 0}
                                icon={Zap}
                                description="Ready to use"
                            />
                            <StatCard
                                title="Total Balance"
                                value={`£${customerStats?.totalCurrentBalance?.toFixed(2) ?? '0.00'}`}
                                icon={Wallet}
                                description="Total spending power"
                            />
                            <StatCard
                                title="Real Balance"
                                value={`£${customerStats?.currentRealBalance?.toFixed(2) ?? '0.00'}`}
                                icon={TrendingUp}
                                description="Your contributed funds"
                            />
                            <StatCard
                                title="Reward Balance"
                                value={`£${customerStats?.currentRewardBalance?.toFixed(2) ?? '0.00'}`}
                                icon={Gift}
                                description="Bonus from businesses"
                            />
                            <StatCard
                                title="Rewards Received"
                                value={`£${customerStats?.totalBusinessRewardsReceived?.toFixed(2) ?? '0.00'}`}
                                icon={Users}
                                description="Total cashback earned"
                            />
                            <StatCard
                                title="Total Spent"
                                value={`£${customerStats?.totalSpent?.toFixed(2) ?? '0.00'}`}
                                icon={ArrowUpRight}
                                description="Lifetime spending"
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
                                        Inject Cashback
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Inject Cashback</DialogTitle>
                                        <DialogDescription>
                                            Inject reward value to a customer's Coupon Voucher.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleGiveCashback} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                Select My Coupon-Voucher
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Select the voucher type to inject rewards into</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <Select value={selectedUserVoucher} onValueChange={setSelectedUserVoucher}>
                                                <SelectTrigger className="rounded-xl border-gray-200">
                                                    <SelectValue placeholder="Select coupon-voucher" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="z-[1001]">
                                                    {voucherTypes.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
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
                                                {cashbackMutation.isPending ? 'Processing...' : 'Inject Cashback'}
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
                                                {isBusiness ? (definitionsResponse?.count ?? 0) : myVouchers.length} Items
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
                                                    voucherTypes.map((vt) => (
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
                                                                    className={`rounded-full px-3 py-0.5 border-none font-medium ${vt.status === 'Active'
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
                                                {isBusiness && isLoadingDefinitions && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                                            Loading definitions...
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {isBusiness && !isLoadingDefinitions && voucherTypes.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                                            No voucher definitions found for your shop.
                                                        </TableCell>
                                                    </TableRow>
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
                                                <Dialog open={isTopUpModalOpen} onOpenChange={(open) => {
                                                    setIsTopUpModalOpen(open);
                                                    if (!open) {
                                                        setPurchaseStep('select');
                                                        setStripeClientSecret(null);
                                                        setPaypalOrderId(null);
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button className="flex-1 bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-semibold border-none">
                                                            Purchase Voucher
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>{purchaseStep === 'select' ? 'Purchase Voucher' : 'Complete Payment'}</DialogTitle>
                                                            <DialogDescription>
                                                                {purchaseStep === 'select'
                                                                    ? 'Buy "Spending Power" and get matched rewards.'
                                                                    : `Secure payment via ${paymentMethod === 'STRIPE' ? 'Card' : 'PayPal'}`
                                                                }
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handlePurchaseVoucher} className="space-y-4 py-4">
                                                            {purchaseStep === 'select' ? (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <Label>Select Voucher Type</Label>
                                                                        <Select value={selectedVoucher || ''} onValueChange={setSelectedVoucher}>
                                                                            <SelectTrigger className="rounded-xl">
                                                                                <SelectValue placeholder="Choose a voucher package" />
                                                                            </SelectTrigger>
                                                                            <SelectContent
                                                                                position="popper"
                                                                                className="max-h-[200px] bg-white border border-gray-200 shadow-xl"
                                                                                style={{ zIndex: 99999, pointerEvents: 'auto' }}
                                                                            >
                                                                                {isLoadingPublicDefinitions ? (
                                                                                    <div className="p-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                                                                                        <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                                                                                        Loading vouchers...
                                                                                    </div>
                                                                                ) : definitionsError ? (
                                                                                    <div className="p-4 text-xs text-red-500 text-center">
                                                                                        Failed to load vouchers.
                                                                                    </div>
                                                                                ) : availableVouchersForPurchase.length > 0 ? (
                                                                                    availableVouchersForPurchase.map(vt => (
                                                                                        <SelectItem key={vt.id} value={vt.id} className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50">
                                                                                            {vt.name}
                                                                                        </SelectItem>
                                                                                    ))
                                                                                ) : (
                                                                                    <div className="p-4 text-sm text-gray-500 text-center">
                                                                                        No vouchers found.
                                                                                    </div>
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <p className="text-xs text-gray-500">
                                                                            Select a voucher package to configure your purchase.
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Payment Amount (£)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="e.g. 50"
                                                                            value={topUpAmount}
                                                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                                                            className="rounded-xl"
                                                                        />
                                                                        <p className="text-xs text-orange-600 font-medium">
                                                                            Tip: A £{topUpAmount || '50'} payment gets you £{Number(topUpAmount || 50) * 2} in value!
                                                                        </p>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label>Payment Method</Label>
                                                                        <div className="flex gap-4">
                                                                            <div
                                                                                onClick={() => setPaymentMethod('STRIPE')}
                                                                                className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'STRIPE' ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium ring-2 ring-orange-500/20' : 'border-gray-200 hover:bg-gray-50'}`}
                                                                            >
                                                                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                                                                    {paymentMethod === 'STRIPE' && <div className="w-2 h-2 rounded-full bg-current" />}
                                                                                </div>
                                                                                Card (Stripe)
                                                                            </div>
                                                                            <div
                                                                                onClick={() => setPaymentMethod('PAYPAL')}
                                                                                className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'PAYPAL' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-2 ring-blue-500/20' : 'border-gray-200 hover:bg-gray-50'}`}
                                                                            >
                                                                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                                                                    {paymentMethod === 'PAYPAL' && <div className="w-2 h-2 rounded-full bg-current" />}
                                                                                </div>
                                                                                PayPal
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-2">
                                                                        <Button
                                                                            type="submit"
                                                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                                                                            disabled={purchaseMutation.isPending || createStripeIntentMutation.isPending || createPaypalOrderMutation.isPending}
                                                                        >
                                                                            {createStripeIntentMutation.isPending || createPaypalOrderMutation.isPending
                                                                                ? 'Initiating...'
                                                                                : `Review & Pay £${topUpAmount || '0'}`
                                                                            }
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="space-y-4 min-h-[300px]">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setPurchaseStep('select');
                                                                            setStripeClientSecret(null);
                                                                            setPaypalOrderId(null);
                                                                        }}
                                                                        className="text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
                                                                    >
                                                                        <span>←</span> Back to selection
                                                                    </Button>

                                                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                                                        <div className="text-sm text-orange-800 font-medium">Order Summary</div>
                                                                        <div className="flex justify-between text-sm mt-1">
                                                                            <span className="text-orange-600">Total Value:</span>
                                                                            <span className="font-bold">£{Number(topUpAmount) * 2}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm mt-1 border-t border-orange-200 pt-1">
                                                                            <span className="text-orange-600 font-medium">Payment Due:</span>
                                                                            <span className="font-bold text-lg">£{topUpAmount}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-2">
                                                                        {paymentMethod === 'STRIPE' && stripeClientSecret && (
                                                                            <StripeCheckoutForm
                                                                                clientSecret={stripeClientSecret}
                                                                                onPaymentSuccess={handlePaymentSuccess}
                                                                            />
                                                                        )}
                                                                        {paymentMethod === 'PAYPAL' && paypalOrderId && (
                                                                            <PayPalCheckoutButton
                                                                                orderID={paypalOrderId}
                                                                                onPaymentSuccess={handlePaymentSuccess}
                                                                            />
                                                                        )}
                                                                        {purchaseMutation.isPending && (
                                                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-50">
                                                                                <div className="flex flex-col items-center gap-2">
                                                                                    <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                                                                                    <p className="text-sm font-medium text-orange-600">Finalizing your voucher...</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                                    <SelectContent position="popper" className="z-[99999]">
                                                                        {availableVouchersForPurchase.length > 0 ? (
                                                                            availableVouchersForPurchase.map(vt => (
                                                                                <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-2 text-sm text-gray-500 text-center">No vouchers available</div>
                                                                        )}
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
