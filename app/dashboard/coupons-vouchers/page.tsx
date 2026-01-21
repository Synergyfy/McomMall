'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    QrCode,
    ScanLine,
    Maximize,
} from 'lucide-react';
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useGetMyVouchers, useTransferMoney, useGiveCashback, usePurchaseVoucher, useGetBusinessStats, useGetOwnerRewardDefinitions, useGetCustomerStats, useGetPublicRewardDefinitions, useSpendVoucher } from '@/service/money-engine/hook';
import { useCreateStripeIntent, useCreatePaypalOrder } from '@/service/payment/hook';
import { useGetUserProfile } from '@/service/user/hook';

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
    // const [activeTab, setActiveTab] = useState('overview'); // Removed unused state
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
        return myVouchersResponse.map(v => ({
            id: v.id,
            name: v.definition.name,
            balance: v.totalBalance,
            status: v.state === 'active' ? 'Active' : 'Inactive',
            totalValue: v.totalBalance,
            description: v.definition.description,
            split: v.definition.splitRatio ? `${v.definition.splitRatio.real * 100}/${v.definition.splitRatio.reward * 100}` : '50/50',
            scope: v.definition.scopeType === 'any_shop' ? 'Any Shop' : (v.definition.scopeType || 'Any Shop'),
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
                            Reward Hub
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your spending power and reward network.</p>
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
                            <StatCard title="Rewards Earned" value={`£${customerStats?.totalCurrentBalance ? (customerStats.totalCurrentBalance / 2).toFixed(2) : '0.00'}`} icon={Gift} description="Cashback value" />
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
                                            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center gap-2"><PlusCircle className="w-4 h-4" />Inject Cashback</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader><DialogTitle>Inject Cashback</DialogTitle></DialogHeader>
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
                                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl" disabled={cashbackMutation.isPending}>{cashbackMutation.isPending ? 'Processing...' : 'Inject Cashback'}</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
                                    <CardHeader className="border-b border-gray-100 bg-gray-50/50"><CardTitle>{isBusiness ? 'Voucher Definitions' : 'My Active Vouchers'}</CardTitle></CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-gray-50/30">
                                                <TableRow>
                                                    <TableHead className="w-[200px]">Name</TableHead>
                                                    <TableHead>Voucher ID</TableHead>
                                                    <TableHead>{isBusiness ? 'Split' : 'Balance'}</TableHead>
                                                    <TableHead className="hidden md:table-cell">Scope</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                    {!isBusiness && <TableHead className="text-right">Actions</TableHead>}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isBusiness ? (
                                                    voucherTypes.map((vt) => (
                                                        <TableRow key={vt.id}>
                                                            <TableCell className="font-bold py-4">{vt.name}</TableCell>
                                                            <TableCell className="text-xs text-gray-400 font-mono">{vt.id}</TableCell>
                                                            <TableCell className="text-blue-700">{vt.split}</TableCell>
                                                            <TableCell className="hidden md:table-cell text-gray-500">{vt.usageScope}</TableCell>
                                                            <TableCell className="text-right"><Badge className="bg-green-100 text-green-700 border-none">{vt.status}</Badge></TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    myVouchers.map((cv) => (
                                                        <TableRow key={cv.id}>
                                                            <TableCell className="font-bold py-4">{cv.name}</TableCell>
                                                            <TableCell className="text-xs text-gray-400 font-mono">{cv.id}</TableCell>
                                                            <TableCell><span className="text-lg font-bold text-green-600">£{cv.balance}</span></TableCell>
                                                            <TableCell className="hidden md:table-cell text-gray-500">{cv.scope}</TableCell>
                                                            <TableCell className="text-right"><Badge className="bg-green-100 text-green-700 border-none">{cv.status}</Badge></TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={() => { setSelectedVoucherForQR(cv); setIsQRModalOpen(true); }}><QrCode className="w-4 h-4" />Pay</Button>
                                                                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setSelectedVoucherForDetails(cv); setIsDetailsModalOpen(true); }}>Details</Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-none shadow-lg bg-orange-600 text-white rounded-2xl relative">
                                    <div className="absolute top-0 right-0 p-4"><Zap className="w-6 h-6 text-orange-300 opacity-50" /></div>
                                    <CardHeader><CardTitle>Rewards Sidebar</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm">Manage your vouchers and sharing options here.</p>
                                        {!isBusiness && (
                                            <div className="flex flex-col gap-2">
                                                <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-bold" onClick={() => setIsTopUpModalOpen(true)}>Purchase Voucher</Button>
                                                <Button className="w-full bg-orange-500 text-white hover:bg-orange-400 rounded-xl font-bold flex items-center justify-center gap-2" onClick={() => setIsCustomerSpendModalOpen(true)}><ScanLine className="w-4 h-4" />Spend Voucher</Button>
                                                <Button className="w-full border-2 border-white/30 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2" onClick={() => setIsTransferModalOpen(true)}><Send className="w-4 h-4" />Transfer Funds</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
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
                                    <p className="text-[10px] text-orange-600 font-bold">Total Power: £{Number(topUpAmount) * 2}</p>
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
                                        {myVouchers.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
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
                                        {myVouchers.map(v => <SelectItem key={v.id} value={v.id}>{v.name} (£{v.balance})</SelectItem>)}
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
                    <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden bg-white">
                        <div className="bg-orange-600 p-8 text-center text-white"><QrCode className="w-10 h-10 mx-auto mb-2" /><h3 className="text-xl font-bold">{selectedVoucherForQR?.name}</h3><p className="text-xs opacity-70">Merchant Scan</p></div>
                        <div className="p-8 text-center">{selectedVoucherForQR && <div className="bg-white p-4 shadow-xl inline-block rounded-xl border"><QRCode value={selectedVoucherForQR.id} size={200} /></div>}<div className="mt-4"><div className="text-2xl font-black">£{selectedVoucherForQR?.balance?.toFixed(2)}</div><div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Balance</div></div></div>
                        <div className="p-4 bg-gray-50"><Button className="w-full rounded-xl" onClick={() => setIsQRModalOpen(false)}>Done</Button></div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden bg-white">
                        <div className="bg-blue-800 p-8 text-white relative"><div className="absolute top-0 right-0 p-8 opacity-10"><Maximize className="w-24 h-24" /></div><Badge className="bg-blue-500/30 mb-2">Voucher Info</Badge><h3 className="text-2xl font-black">{selectedVoucherForDetails?.name}</h3><p className="text-sm opacity-80">{selectedVoucherForDetails?.description || "Matching reward voucher."}</p></div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4"><div className="p-4 bg-gray-50 rounded-xl"><span>Balance</span><div className="text-xl font-bold text-blue-900">£{selectedVoucherForDetails?.balance?.toFixed(2)}</div></div><div className="p-4 bg-gray-50 rounded-xl"><span>Split Ratio</span><div className="text-xl font-bold text-blue-900">{selectedVoucherForDetails?.split}</div></div></div>
                            <div className="space-y-2"><div className="p-4 bg-orange-50 rounded-xl flex gap-3 items-center"><Zap className="w-5 h-5 text-orange-600" /><div><div className="text-xs font-bold text-orange-800">Reward Power</div><div className="text-sm">Matched by {selectedVoucherForDetails?.split?.split('/')[1] || '50'}%</div></div></div><div className="p-4 bg-green-50 rounded-xl flex gap-3 items-center"><Gift className="w-5 h-5 text-green-600" /><div><div className="text-xs font-bold text-green-800">Cashback Eligible</div><div className="text-sm">Active on network.</div></div></div></div>
                            <div className="pt-4 border-t flex justify-between items-center"><span className="text-xs text-gray-400 font-mono">ID: {selectedVoucherForDetails?.id}</span><Badge className="bg-green-100 text-green-700">{selectedVoucherForDetails?.status}</Badge></div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-2"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDetailsModalOpen(false)}>Close</Button><Button className="flex-1 bg-orange-600 rounded-xl gap-2" onClick={() => { setIsDetailsModalOpen(false); setSelectedVoucherForQR(selectedVoucherForDetails); setIsQRModalOpen(true); }}><QrCode className="w-4 h-4" />Pay Now</Button></div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}><DialogContent className="sm:max-w-[400px] rounded-3xl p-6 bg-white"><div className="text-center space-y-4"><div className="w-12 h-12 bg-orange-100 text-orange-600 mx-auto rounded-xl flex items-center justify-center"><QrCode /></div><DialogTitle>Scan Voucher QR</DialogTitle><DialogDescription>Capture voucher ID automatically.</DialogDescription><div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed relative overflow-hidden"><div id="reward-hub-scanner" className="w-full h-full" /></div><Button variant="outline" className="w-full" onClick={() => setIsScannerOpen(false)}>Cancel</Button></div></DialogContent></Dialog>
            </div>
        </TooltipProvider>
    );
}
