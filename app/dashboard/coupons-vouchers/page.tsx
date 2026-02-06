'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';
import {
    Card,
    CardContent,
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    Badge,
} from '@/components/ui/badge';
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
    Send,
    PlusCircle,
    Zap,
    QrCode,
    ScanLine,
    Maximize,
    Copy,
    Check,
    Globe,
    Download, // Added Download icon
} from 'lucide-react';
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from 'sonner';
import { toPng } from 'html-to-image'; // Added html-to-image import
import { useGetMyVouchers, useTransferMoney, useGiveCashback, usePurchaseVoucher, useGetBusinessStats, useGetOwnerRewardDefinitions, useGetCustomerStats, useGetPublicRewardDefinitions, useSpendVoucher } from '@/service/money-engine/hook';
import { useCreateStripeIntent, useCreatePaypalOrder } from '@/service/payment/hook';
import { useGetUserProfile } from '@/service/user/hook';
import { UserVoucherResponseDto } from '@/service/money-engine/types';

import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

// --- TYPES ---
interface ApiError {
    response?: {
        data?: {
            message?: string;
        }
    }
}
interface Shop {
    id?: string;
    name?: string;
}

interface VoucherDisplayData {
    id: string;
    name: string;
    balance: number;
    status: string;
    totalValue: number;
    description?: string;
    split?: string;
    scope?: string;
    transactions: unknown[];
    rewardRatio?: number;
    realRatio?: number;
    shops?: (string | { name?: string; id?: string | number })[];
}

// --- COMPONENTS ---

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: 'up' | 'down';
}

const StatCard = ({ title, value, icon: Icon, description, trend }: StatCardProps) => (
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
    const [cashbackAmount, setCashbackAmount] = useState('');
    const [selectedUserVoucher, setSelectedUserVoucher] = useState('');
    const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedVoucherForQR, setSelectedVoucherForQR] = useState<VoucherDisplayData | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedVoucherForDetails, setSelectedVoucherForDetails] = useState<VoucherDisplayData | null>(null);

    const [shopIdInput, setShopIdInput] = useState('');
    const [isCustomerSpendModalOpen, setIsCustomerSpendModalOpen] = useState(false);

    // Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannerTarget, setScannerTarget] = useState<'CASHBACK' | 'SPEND' | 'MERCHANT' | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const isBusiness = userRole === UserRole.OWNER;
    const isCustomer = userRole === UserRole.CUSTOMER;

    // API Hooks
    const { data: userProfile } = useGetUserProfile();
    const { data: myVouchersResponse } = useGetMyVouchers(isCustomer);
    const { data: businessStats } = useGetBusinessStats(isBusiness);
    const { data: definitionsResponse } = useGetOwnerRewardDefinitions(isBusiness);
    const { data: customerStats } = useGetCustomerStats(isCustomer);
    const { data: publicDefinitionsResponse } = useGetPublicRewardDefinitions(true);

    const transferMutation = useTransferMoney();
    const cashbackMutation = useGiveCashback();
    const purchaseMutation = usePurchaseVoucher();
    const createStripeIntentMutation = useCreateStripeIntent();
    const createPaypalOrderMutation = useCreatePaypalOrder();
    const spendMutation = useSpendVoucher();

    // Form states
    const [topUpAmount, setTopUpAmount] = useState('50');
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [spendVoucherId, setSpendVoucherId] = useState('');
    const [spendAmount, setSpendAmount] = useState('');
    const [purchaseStep, setPurchaseStep] = useState<'select' | 'payment'>('select');
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownloadCard = async (voucherId: string, voucherName: string) => {
        const element = document.getElementById(`voucher-card-${voucherId}`);
        if (!element) return;

        try {
            const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 3 });
            const link = document.createElement('a');
            link.download = `${voucherName.replace(/\s+/g, '-').toLowerCase()}-${voucherId.slice(0, 6)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success('Voucher card downloaded');
        } catch (err) {
            console.error(err);
            toast.error('Failed to download card');
        }
    };

    useEffect(() => {
        if (isScannerOpen) {
            const scanner = new Html5QrcodeScanner(
                "reward-hub-scanner",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scannerRef.current = scanner;

            const onScanSuccess = (decodedText: string) => {
                if (scannerTarget === 'CASHBACK') {
                    setSelectedUserVoucher(decodedText);
                    toast.success('Voucher ID scanned successfully');
                } else if (scannerTarget === 'SPEND') {
                    setSpendVoucherId(decodedText);
                    toast.success('Voucher ID scanned successfully');
                } else if (scannerTarget === 'MERCHANT') {
                    setShopIdInput(decodedText);
                    toast.success('Shop ID scanned successfully');
                }
                setIsScannerOpen(false);
                setScannerTarget(null);
            };

            scanner.render(onScanSuccess, () => { });
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
                scannerRef.current = null;
            }
        }
        return () => { if (scannerRef.current) scannerRef.current.clear().catch(() => { }); };
    }, [isScannerOpen, scannerTarget]);

    const myVouchers = useMemo(() => {
        if (!myVouchersResponse) return [];
        return myVouchersResponse.map((v: UserVoucherResponseDto) => ({
            id: v.id,
            name: v.definition.name,
            balance: v.totalBalance,
            status: v.state === 'active' ? 'Active' : 'Inactive',
            totalValue: v.totalBalance,
            description: v.definition.description,
            split: v.definition.splitRatio ? `${v.definition.splitRatio.real * 100}/${v.definition.splitRatio.reward * 100}` : '50/50',
            rewardRatio: (v.definition.splitRatio?.reward || 0.5) * 100,
            realRatio: (v.definition.splitRatio?.real || 0.5) * 100,
            scope: v.definition.scopeType === 'any_shop' ? 'Any Shop' : (v.definition.scopeType || 'Any Shop'),
            shops: v.definition.validShops || [],
            transactions: []
        }));
    }, [myVouchersResponse]);

    const voucherTypes = useMemo(() => {
        if (!definitionsResponse?.data) return [];
        return definitionsResponse.data.map(d => ({
            id: d.id,
            name: d.name,
            split: d.splitRatio ? `${d.splitRatio.real * 100}/${d.splitRatio.reward * 100}` : '50/50',
            seasonalLabel: d.seasonalLabels?.[0] || 'General',
            status: d.isActive ? 'Active' : 'Inactive',
            usageScope: d.scopeType === 'any_shop' ? 'Any Shop' : (d.scopeType || 'Any Shop'),
        }));
    }, [definitionsResponse]);

    const availableVouchersForPurchase = useMemo(() => {
        if (!publicDefinitionsResponse?.data) return [];
        return publicDefinitionsResponse.data;
    }, [publicDefinitionsResponse]);

    const selectedVoucherDefinition = useMemo(() => {
        return availableVouchersForPurchase.find(v => v.id === selectedVoucher);
    }, [availableVouchersForPurchase, selectedVoucher]);

    const totalPower = useMemo(() => {
        if (!selectedVoucherDefinition || !topUpAmount) return 0;
        const realRatio = selectedVoucherDefinition.splitRatio?.real || 0.5;
        return Number(topUpAmount) / realRatio;
    }, [selectedVoucherDefinition, topUpAmount]);

    const rewardRatioPercent = useMemo(() => {
        if (!selectedVoucherDefinition) return 50;
        return (selectedVoucherDefinition.splitRatio?.reward || 0.5) * 100;
    }, [selectedVoucherDefinition]);

    const handleGiveCashback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserVoucher || !cashbackAmount || !userProfile?.id) {
            toast.error('Please enter customer voucher ID and amount');
            return;
        }
        try {
            await cashbackMutation.mutateAsync({ userVoucherId: selectedUserVoucher, amount: Number(cashbackAmount), shopId: userProfile?.id || '' });
            toast.success(`Successfully injected £${cashbackAmount} cashback`);
            setIsCashbackModalOpen(false);
            setCashbackAmount('');
            setSelectedUserVoucher('');
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Failed to inject cashback');
        }
    };

    const handleSpendVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spendVoucherId || !spendAmount || !userProfile?.id) {
            toast.error('Please enter voucher ID and amount');
            return;
        }
        try {
            await spendMutation.mutateAsync({ userVoucherId: spendVoucherId, amount: Number(spendAmount), shopId: userProfile?.id || '' });
            toast.success(`Successfully charged £${spendAmount} from voucher`);
            setIsSpendModalOpen(false);
            setSpendAmount('');
            setSpendVoucherId('');
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Failed to charge voucher');
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
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Failed to initiate payment');
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
            setTopUpAmount('50');
            setSelectedVoucher('');
            setPurchaseStep('select');
            setStripeClientSecret(null);
            setPaypalOrderId(null);
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Failed to finalize purchase');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVoucher || !transferRecipient || !transferAmount) {
            toast.error('Please fill in all transfer details');
            return;
        }
        try {
            await transferMutation.mutateAsync({ fromVoucherId: selectedVoucher, toVoucherId: transferRecipient, amount: Number(transferAmount) });
            toast.success(`Successfully transferred £${transferAmount}`);
            setIsTransferModalOpen(false);
            setTransferAmount('');
            setTransferRecipient('');
            setSelectedVoucher('');
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Transfer failed');
        }
    };

    const handleCustomerSpend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVoucher || !spendAmount || !shopIdInput) {
            toast.error('Please fill in all details');
            return;
        }
        try {
            await spendMutation.mutateAsync({
                userVoucherId: selectedVoucher,
                amount: Number(spendAmount),
                shopId: shopIdInput
            });
            toast.success(`Successfully paid £${spendAmount}`);
            setIsCustomerSpendModalOpen(false);
            setSpendAmount('');
            setShopIdInput('');
            setSelectedVoucher('');
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.response?.data?.message || 'Payment failed');
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-transparent space-y-8 pb-10">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="w-8 h-8 text-orange-600" />
                            Coupon-voucher
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your spending power and reward network...</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isBusiness ? (
                        <>
                            <StatCard title="Total Revenue" value={`£${businessStats?.totalSpentInShop?.toFixed(2) ?? '0.00'}`} icon={TrendingUp} description="Revenue from vouchers" trend="up" />
                            <StatCard title="Cashback Given" value={businessStats?.cashbackGivenCount ?? 0} icon={Wallet} description="Distributed rewards" />
                            <StatCard title="Customers" value={businessStats?.customersCount ?? 0} icon={Users} description="Unique customers" />
                            <StatCard title="Avg. Spend" value={`£${businessStats?.customersCount ? (businessStats.totalSpentInShop / businessStats.customersCount).toFixed(2) : '0.00'}`} icon={Zap} description="Per customer" />
                            <StatCard title="Active Network" value="12" icon={Send} description="Connected shops" />
                            <StatCard title="Growth" value="+15%" icon={ArrowUpRight} description="Last 30 days" trend="up" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Active Vouchers" value={customerStats?.activeVouchersCount ?? 0} icon={Zap} description="Available now" />
                            <StatCard title="Total Balance" value={`£${customerStats?.totalCurrentBalance?.toFixed(2) ?? '0.00'}`} icon={Wallet} description="Spending power" />
                            <StatCard title="Total Spent" value={`£${customerStats?.totalSpent?.toFixed(2) ?? '0.00'}`} icon={ArrowUpRight} description="Lifetime spend" trend="up" />
                            <StatCard title="Rewards Earned" value={`£${customerStats ? customerStats.currentRewardBalance.toFixed(2) : '0.00'}`} icon={Gift} description="Cashback value" />
                            <StatCard title="Real Money" value={`£${customerStats?.currentRealBalance?.toFixed(2) ?? '0.00'}`} icon={TrendingUp} description="Your personal funds" />
                            <StatCard title="Rewards from Business" value={`£${customerStats?.totalBusinessRewardsReceived?.toFixed(2) ?? '0.00'}`} icon={Send} description="Total rewards received" />
                        </>
                    )}
                </div>

                <Tabs defaultValue="overview" className="w-full space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <TabsList className="bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-inner border border-white/20">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Overview</TabsTrigger>
                            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">History</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            {isBusiness && (
                                <>
                                    <Dialog open={isSpendModalOpen} onOpenChange={setIsSpendModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-2"><ScanLine className="w-4 h-4" />Charge Client</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader><DialogTitle>Charge Client</DialogTitle></DialogHeader>
                                            <form onSubmit={handleSpendVoucher} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Voucher ID</Label>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="uv-123" value={spendVoucherId} onChange={(e) => setSpendVoucherId(e.target.value)} className="rounded-xl" />
                                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setScannerTarget('SPEND'); setIsScannerOpen(true); }}><QrCode className="w-4 h-4" /></Button>
                                                    </div>
                                                    <button type="button" onClick={() => { setScannerTarget('SPEND'); setIsScannerOpen(true); }} className="text-[11px] text-orange-600 font-bold hover:underline">Scan to capture ID</button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount (£)</Label>
                                                    <Input type="number" placeholder="0.00" value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} className="rounded-xl" />
                                                </div>
                                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl" disabled={spendMutation.isPending}>{spendMutation.isPending ? 'Processing...' : 'Confirm Charge'}</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog open={isCashbackModalOpen} onOpenChange={setIsCashbackModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center gap-2"><PlusCircle className="w-4 h-4" />Inject C-V</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader><DialogTitle>Inject C-V</DialogTitle></DialogHeader>
                                            <form onSubmit={handleGiveCashback} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Voucher ID</Label>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="uv-123" value={selectedUserVoucher} onChange={(e) => setSelectedUserVoucher(e.target.value)} className="rounded-xl" />
                                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setScannerTarget('CASHBACK'); setIsScannerOpen(true); }}><QrCode className="w-4 h-4" /></Button>
                                                    </div>
                                                    <button type="button" onClick={() => { setScannerTarget('CASHBACK'); setIsScannerOpen(true); }} className="text-[11px] text-orange-600 font-bold hover:underline">Scan to capture ID</button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount (£)</Label>
                                                    <Input type="number" placeholder="0.00" value={cashbackAmount} onChange={(e) => setCashbackAmount(e.target.value)} className="rounded-xl" />
                                                </div>
                                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl" disabled={cashbackMutation.isPending}>{cashbackMutation.isPending ? 'Processing...' : 'Inject C-V'}</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Quick Actions Bar - Only for customer */}
                        {!isBusiness && (
                            <div className="flex flex-wrap items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
                                <Button className="bg-white text-orange-600 border border-orange-100 hover:bg-orange-50 rounded-xl font-bold shadow-sm" onClick={() => setIsTopUpModalOpen(true)}>
                                    <PlusCircle className="w-4 h-4 mr-2" /> Purchase Voucher
                                </Button>
                                <Button className="bg-orange-600 text-white hover:bg-orange-700 rounded-xl font-bold shadow-md shadow-orange-200" onClick={() => setIsCustomerSpendModalOpen(true)}>
                                    <ScanLine className="w-4 h-4 mr-2" /> Spend Voucher
                                </Button>
                                <Button variant="outline" className="border-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold" onClick={() => setIsTransferModalOpen(true)}>
                                    <Send className="w-4 h-4 mr-2" /> Transfer Funds
                                </Button>
                            </div>
                        )}

                                                <div className="w-full">
                                                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
                                                        <CardHeader className="border-b border-gray-100 bg-gray-50/50"><CardTitle>{isBusiness ? 'Voucher Definitions' : 'My Active Vouchers'}</CardTitle></CardHeader>
                                                        <CardContent className="p-6">
                                                                                                {isBusiness ? (
                                                                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                                                                        {voucherTypes.map((vt) => (
                                                                                                            <div key={vt.id} className="flex flex-col gap-4 group">
                                                                                                                {/* Realistic Pale Card - Business Definition */}
                                                                                                                <div
                                                                                                                    id={`voucher-def-card-${vt.id}`}
                                                                                                                    className="relative w-full aspect-[1.6/1] min-h-[280px] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800 p-8 flex flex-col justify-between border border-slate-200/50"
                                                                                                                >
                                                                                                                    {/* Background decoration */}
                                                                                                                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
                                                                                                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-slate-200/40 rounded-full blur-3xl pointer-events-none"></div>
                                                            
                                                                                                                    {/* Header */}
                                                                                                                    <div className="flex justify-between items-center relative z-10">
                                                                                                                        <div className="flex items-center gap-3">
                                                                                                                            <div className="bg-slate-800 p-2 rounded-xl shadow-sm">
                                                                                                                                <Zap className="w-4 h-4 text-white" />
                                                                                                                            </div>
                                                                                                                            <span className="font-bold text-xs tracking-[0.2em] uppercase text-slate-500">Definition</span>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                            <Badge className={`${vt.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'} border backdrop-blur-sm text-[10px] px-3 py-1 rounded-full font-bold`}>
                                                                                                                                {vt.status}
                                                                                                                            </Badge>
                                                                                                                        </div>
                                                                                                                    </div>
                                                            
                                                                                                                    {/* Info Row */}
                                                                                                                    <div className="relative z-10 mt-8 flex justify-between items-end">
                                                                                                                        <div>
                                                                                                                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Split Ratio</p>
                                                                                                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">{vt.split}</h3>
                                                                                                                        </div>
                                                                                                                        <div className="text-right">
                                                                                                                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Label</p>
                                                                                                                             <div className="text-xs font-black bg-white/90 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm backdrop-blur-md truncate max-w-[140px]">
                                                                                                                                {vt.seasonalLabel}
                                                                                                                             </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                            
                                                                                                                    {/* Footer Info */}
                                                                                                                    <div className="flex justify-between items-end relative z-10 mt-auto pt-6 border-t border-slate-200/50">
                                                                                                                        <div className="flex-1 min-w-0 mr-6">
                                                                                                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Definition Name</p>
                                                                                                                            <p className="font-extrabold tracking-tight truncate text-base uppercase text-slate-700">{vt.name}</p>
                                                                                                                             <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-2 group/id">
                                                                                                                                {vt.id.slice(0, 20)}... 
                                                                                                                                <Copy 
                                                                                                                                    className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600 transition-colors" 
                                                                                                                                    onClick={(e) => { e.stopPropagation(); handleCopy(vt.id); }} 
                                                                                                                                />
                                                                                                                             </p>
                                                                                                                        </div>
                                                                                                                        <div className="text-right shrink-0">
                                                                                                                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Usage Scope</p>
                                                                                                                            <p className="text-[10px] font-black bg-slate-800 text-white px-3 py-1.5 rounded-xl backdrop-blur-sm inline-block shadow-sm">
                                                                                                                                {vt.usageScope}
                                                                                                                            </p>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                ) : (                                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                                    {myVouchers.map((cv) => (
                                                                        <div key={cv.id} className="flex flex-col gap-4 group">
                                                                            {/* Realistic Pale Card - Gift Card Style */}
                                                                            <div
                                                                                id={`voucher-card-${cv.id}`}
                                                                                className="relative w-full aspect-[1.6/1] min-h-[280px] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-orange-50 via-white to-orange-100 text-slate-800 p-8 flex flex-col justify-between border border-orange-200/50"
                                                                            >
                                                                                {/* Background decoration - Abstract soft shapes */}
                                                                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
                                                                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
                                                                                <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>
                                                                                
                                                                                {/* Wave pattern overlay */}
                                                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                                                                                {/* Header */}
                                                                                <div className="flex justify-between items-center relative z-10">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="bg-orange-600 p-2 rounded-xl shadow-sm">
                                                                                            <Gift className="w-4 h-4 text-white" />
                                                                                        </div>
                                                                                        <span className="font-bold text-xs tracking-[0.2em] uppercase text-slate-500">McomMall</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                         {/* Download Button */}
                                                                                         <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-9 w-9 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                                                                                            onClick={(e) => { e.stopPropagation(); handleDownloadCard(cv.id, cv.name); }}
                                                                                            title="Download Card"
                                                                                        >
                                                                                            <Download className="w-5 h-5" />
                                                                                        </Button>
                                                                                        <Badge className="bg-white/80 text-orange-600 border border-orange-200 shadow-sm backdrop-blur-sm text-[10px] px-3 py-1 rounded-full font-bold">
                                                                                            {cv.status}
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                        
                                                                                {/* Chip Replacement: QR Code & Contactless */}
                                                                                <div className="flex items-center gap-5 mt-4 relative z-10">
                                                                                    <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
                                                                                        <QRCode value={cv.id} size={56} className="w-14 h-14" />
                                                                                    </div>
                                                                                    <ScanLine className="w-8 h-8 text-slate-300 rotate-90" />
                                                                                </div>
                        
                                                                                {/* Balance Section */}
                                                                                <div className="relative z-10 mt-4 flex justify-between items-end">
                                                                                    <div>
                                                                                        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1.5">Current Balance</p>
                                                                                        <h3 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
                                                                                            £{typeof cv.balance === 'number' ? cv.balance.toFixed(2) : cv.balance}
                                                                                        </h3>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                         <p className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Split</p>
                                                                                         <div className="text-sm font-black bg-white/90 text-orange-600 px-4 py-2 rounded-xl border border-orange-100 shadow-sm backdrop-blur-md">
                                                                                            {cv.split}
                                                                                         </div>
                                                                                    </div>
                                                                                </div>
                        
                                                                                {/* Footer Info */}
                                                                                <div className="flex justify-between items-end relative z-10 mt-auto pt-6 border-t border-slate-200/50">
                                                                                    <div className="flex-1 min-w-0 mr-6">
                                                                                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Voucher Name</p>
                                                                                        <p className="font-extrabold tracking-tight truncate text-lg uppercase text-slate-700">{cv.name}</p>
                                                                                         <p className="text-[11px] font-mono text-slate-400 mt-1.5 flex items-center gap-2 group/id">
                                                                                            {cv.id.slice(0, 16)}... 
                                                                                            <Copy 
                                                                                                className="w-4 h-4 cursor-pointer hover:text-orange-600 transition-colors" 
                                                                                                onClick={(e) => { e.stopPropagation(); handleCopy(cv.id); }} 
                                                                                            />
                                                                                         </p>
                                                                                    </div>
                                                                                    <div className="text-right shrink-0">
                                                                                         <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Usage Range</p>
                                                                                        <p className="text-[11px] font-black bg-orange-600/10 text-orange-700 px-3 py-1.5 rounded-xl backdrop-blur-sm inline-block border border-orange-200/50 shadow-sm">
                                                                                            {cv.scope}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                        
                                                                            {/* Actions Below Card */}
                                                                            <div className="grid grid-cols-2 gap-3 mt-1">
                                                                                <Button 
                                                                                    className="h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md hover:shadow-orange-600/30 transition-all font-bold text-base"
                                                                                    onClick={() => { setSelectedVoucherForQR(cv); setIsQRModalOpen(true); }}
                                                                                >
                                                                                    <QrCode className="w-5 h-5 mr-2" /> Pay
                                                                                </Button>
                                                                                <Button 
                                                                                    variant="outline" 
                                                                                    className="h-12 border-gray-200 hover:bg-gray-50 hover:border-orange-400 hover:text-orange-600 text-gray-700 rounded-xl shadow-sm transition-all font-bold text-base"
                                                                                    onClick={() => { setSelectedVoucherForDetails(cv); setIsDetailsModalOpen(true); }}
                                                                                >
                                                                                    Details
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </div>                    </TabsContent>
                </Tabs>

                {/* MODALS */}
                <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
                    <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{purchaseStep === 'select' ? 'Purchase Voucher' : 'Complete Payment'}</DialogTitle></DialogHeader>
                        {purchaseStep === 'select' ? (
                            <form onSubmit={handlePurchaseVoucher} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Package</Label>
                                    <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose a voucher type" /></SelectTrigger>
                                        <SelectContent className="z-[1000]" position="popper">
                                            {availableVouchersForPurchase.map(vt => (
                                                <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Amount (£)</Label>
                                    <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="rounded-xl" />
                                    {selectedVoucherDefinition && (
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-orange-600 font-bold">Total Power: £{totalPower.toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Matching: {rewardRatioPercent}%</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Method</Label>
                                    <div className="flex gap-2">
                                        <div onClick={() => setPaymentMethod('STRIPE')} className={`flex-1 p-3 rounded-xl border cursor-pointer text-center text-xs font-bold ${paymentMethod === 'STRIPE' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>Stripe (Card)</div>
                                        <div onClick={() => setPaymentMethod('PAYPAL')} className={`flex-1 p-3 rounded-xl border cursor-pointer text-center text-xs font-bold ${paymentMethod === 'PAYPAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>PayPal</div>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-orange-600 rounded-xl">Pay £{topUpAmount}</Button>
                            </form>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-gray-50 rounded-xl flex justify-between"><span>Due:</span><span className="font-bold">£{topUpAmount}</span></div>
                                {paymentMethod === 'STRIPE' && stripeClientSecret && <StripeCheckoutForm clientSecret={stripeClientSecret} onPaymentSuccess={handlePaymentSuccess} />}
                                {paymentMethod === 'PAYPAL' && paypalOrderId && <PayPalCheckoutButton orderID={paypalOrderId} onPaymentSuccess={handlePaymentSuccess} />}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader><DialogTitle>Transfer Funds</DialogTitle></DialogHeader>
                        <form onSubmit={handleTransfer} className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Recipient Email/ID</Label><Input placeholder="user@id" value={transferRecipient} onChange={e => setTransferRecipient(e.target.value)} className="rounded-xl" /></div>
                            <div className="space-y-2">
                                <Label>Source Voucher</Label>
                                <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select source" /></SelectTrigger>
                                    <SelectContent position="popper">
                                        {myVouchers.filter(v => v.id).map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Amount (£)</Label><Input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="rounded-xl" /></div>
                            <Button type="submit" className="w-full bg-orange-600 rounded-xl">Send Gift</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCustomerSpendModalOpen} onOpenChange={setIsCustomerSpendModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader><DialogTitle>Pay Merchant</DialogTitle></DialogHeader>
                        <form onSubmit={handleCustomerSpend} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Voucher</Label>
                                <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose source" /></SelectTrigger>
                                    <SelectContent position="popper" className="z-[1000]">
                                        {myVouchers.filter(v => v.id).map(v => <SelectItem key={v.id} value={v.id}>{v.name} (£{v.balance})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Merchant ID</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="shop-xyz" value={shopIdInput} onChange={(e) => setShopIdInput(e.target.value)} className="rounded-xl" />
                                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setScannerTarget('MERCHANT'); setIsScannerOpen(true); }}><QrCode className="w-4 h-4" /></Button>
                                </div>
                                <button type="button" onClick={() => { setScannerTarget('MERCHANT'); setIsScannerOpen(true); }} className="text-[11px] text-orange-600 font-bold hover:underline">Scan Shop QR</button>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (£)</Label>
                                <Input type="number" placeholder="0.00" value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} className="rounded-xl" />
                            </div>
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl" disabled={spendMutation.isPending}>{spendMutation.isPending ? 'Processing...' : 'Confirm Payment'}</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                    <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-0 overflow-hidden bg-white border-none shadow-2xl">
                        <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-white p-10 text-center relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl"></div>
                            <QrCode className="w-12 h-12 mx-auto mb-4 text-orange-600 relative z-10" />
                            <h3 className="text-2xl font-black text-slate-800 relative z-10">{selectedVoucherForQR?.name}</h3>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-600/60 mt-1 relative z-10">Merchant Scan Required</p>
                        </div>
                        <div className="p-10 text-center -mt-6 relative z-20">
                            {selectedVoucherForQR && (
                                <div className="bg-white p-6 shadow-2xl inline-block rounded-[2rem] border border-orange-100">
                                    <QRCode value={selectedVoucherForQR.id} size={200} />
                                </div>
                            )}
                            <div className="mt-8">
                                <div className="text-4xl font-black text-slate-900 tracking-tighter">£{selectedVoucherForQR?.balance?.toFixed(2)}</div>
                                <div className="text-[11px] text-slate-400 font-black tracking-[0.3em] uppercase mt-1">Available Balance</div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                            <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-lg" onClick={() => setIsQRModalOpen(false)}>Done</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden bg-white border-none shadow-2xl">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10"><Maximize className="w-32 h-32" /></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
                            <Badge className="bg-white/10 hover:bg-white/20 text-white border-none mb-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Voucher Intelligence</Badge>
                            <h3 className="text-3xl font-black tracking-tight relative z-10">{selectedVoucherForDetails?.name}</h3>
                            <p className="text-slate-300 text-sm mt-2 max-w-[80%] relative z-10">{selectedVoucherForDetails?.description || "High-utility matching reward voucher for McomMall network."}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                                    <div className="text-2xl font-black text-slate-900 mt-1">£{selectedVoucherForDetails?.balance?.toFixed(2)}</div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Split Ratio</span>
                                    <div className="text-2xl font-black text-slate-900 mt-1">{selectedVoucherForDetails?.split}</div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="p-5 bg-orange-50/50 rounded-3xl flex gap-4 items-center border border-orange-100/50">
                                    <div className="bg-orange-600 p-2.5 rounded-2xl shadow-orange-200 shadow-lg text-white">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Reward Matching</div>
                                        <div className="text-sm font-bold text-slate-700">Matching Power: {selectedVoucherForDetails?.rewardRatio || '50'}%</div>
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-blue-50/50 rounded-3xl flex gap-4 items-start border border-blue-100/50">
                                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-blue-200 shadow-lg text-white mt-0.5">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Network Scope</div>
                                        <div className="text-sm font-bold text-slate-700">{selectedVoucherForDetails?.scope || 'Global Network'}</div>
                                        {selectedVoucherForDetails?.scope !== 'Any Shop' && (selectedVoucherForDetails?.shops?.length || 0) > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {selectedVoucherForDetails?.shops?.map((shop: any, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="bg-white text-blue-700 border border-blue-100 shadow-sm text-[9px] font-bold px-2 py-0.5">
                                                        {typeof shop === 'string' ? shop : (shop.name || shop.id)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-green-50/50 rounded-3xl flex gap-4 items-center border border-green-100/50">
                                    <div className="bg-green-600 p-2.5 rounded-2xl shadow-green-200 shadow-lg text-white">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-green-800 uppercase tracking-widest">Reward Status</div>
                                        <div className="text-sm font-bold text-slate-700">Fully Eligible for Network Cashback</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200">
                                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-tighter">ID: {selectedVoucherForDetails?.id.slice(0, 16)}...</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 text-slate-400 hover:text-orange-600 transition-colors"
                                            onClick={() => selectedVoucherForDetails?.id && handleCopy(selectedVoucherForDetails.id)}
                                        >
                                            {copiedId === selectedVoucherForDetails?.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedVoucherForDetails?.status}</Badge>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 flex gap-4">
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-white transition-all shadow-sm" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
                            <Button className="flex-1 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 gap-2 transition-all" onClick={() => { setIsDetailsModalOpen(false); setSelectedVoucherForQR(selectedVoucherForDetails); setIsQRModalOpen(true); }}>
                                <QrCode className="w-5 h-5" /> Pay Now
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}><DialogContent className="sm:max-w-[400px] rounded-3xl p-6 bg-white"><div className="text-center space-y-4"><div className="w-12 h-12 bg-orange-100 text-orange-600 mx-auto rounded-xl flex items-center justify-center"><QrCode /></div><DialogTitle>Scan Voucher QR</DialogTitle><DialogDescription>Capture voucher ID automatically.</DialogDescription><div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed relative overflow-hidden"><div id="reward-hub-scanner" className="w-full h-full" /></div><Button variant="outline" className="w-full" onClick={() => setIsScannerOpen(false)}>Cancel</Button></div></DialogContent></Dialog>
            </div>
        </TooltipProvider>
    );
}
