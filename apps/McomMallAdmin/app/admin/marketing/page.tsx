'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Plus,
    Trash2,
    Copy,
    Tag,
    Gift,
    Ticket,
    Megaphone,
    Star,
    TrendingUp,
    Percent,
    DollarSign,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGetAllCoupons, useAddCoupon, useDeleteCoupon } from '@/service/coupons/hook';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import type { Coupon } from '@/service/coupons/types';

const PAGE_SIZE = 10;

function isExpired(coupon: Coupon): boolean {
    const t = new Date(coupon.expiryDate).getTime();
    return !isNaN(t) && t < Date.now();
}

function usagePct(coupon: Coupon): number | null {
    if (coupon.usageLimitPerCoupon == null || coupon.usageLimitPerCoupon <= 0) return null;
    return Math.min(100, ((coupon.usageCount ?? 0) / coupon.usageLimitPerCoupon) * 100);
}

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('coupons');
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error, refetch } = useGetAllCoupons({ page, limit: PAGE_SIZE });
    const deleteCoupon = useDeleteCoupon();

    const coupons = useMemo(() => data?.data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return coupons;
        return coupons.filter(
            (c) =>
                c.couponCode.toLowerCase().includes(q) ||
                (c.couponDescription ?? '').toLowerCase().includes(q),
        );
    }, [coupons, searchQuery]);

    const totalItems = data?.meta.totalItems ?? 0;
    const totalPages = data?.meta.totalPages ?? 1;
    const activeCount = coupons.filter((c) => !isExpired(c)).length;
    const totalUsage = coupons.reduce((acc, c) => acc + (c.usageCount ?? 0), 0);

    const handleDelete = async (coupon: Coupon) => {
        if (!confirm(`Delete coupon "${coupon.couponCode}"?`)) return;
        try {
            await deleteCoupon(coupon.id);
            toast.success('Coupon deleted');
        } catch {
            toast.error('Failed to delete coupon');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
                    <p className="text-slate-500">Live coupons from the API, plus shortcuts to gift cards, vouchers and campaigns</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Tag className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isLoading ? '…' : totalItems}</p>
                                <p className="text-xs text-slate-500">Total Coupons</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isLoading ? '…' : activeCount}</p>
                                <p className="text-xs text-slate-500">Unexpired (this page)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Ticket className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isLoading ? '…' : totalUsage.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Total Uses (this page)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="coupons" className="gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline">Coupons</span>
                    </TabsTrigger>
                    <TabsTrigger value="giftcards" className="gap-2">
                        <Gift className="h-4 w-4" />
                        <span className="hidden sm:inline">Gift Cards</span>
                    </TabsTrigger>
                    <TabsTrigger value="vouchers" className="gap-2">
                        <Ticket className="h-4 w-4" />
                        <span className="hidden sm:inline">Vouchers</span>
                    </TabsTrigger>
                    <TabsTrigger value="featured" className="gap-2">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">Featured</span>
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="gap-2">
                        <Megaphone className="h-4 w-4" />
                        <span className="hidden sm:inline">Campaigns</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coupons" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search coupon code or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            {isLoading && (
                                <div className="p-6 space-y-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                            )}
                            {isError && (
                                <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    Failed to load coupons: {(error as Error)?.message ?? 'Unknown error'}
                                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                        Retry
                                    </Button>
                                </div>
                            )}
                            {!isLoading && !isError && filtered.length === 0 && (
                                <div className="p-12 text-center">
                                    <Tag className="h-8 w-8 mx-auto text-slate-300" />
                                    <p className="mt-3 font-bold text-slate-700">No coupons found</p>
                                    <p className="text-sm text-slate-400">Create one to get started.</p>
                                </div>
                            )}
                            {filtered.length > 0 && (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coupon</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>Usage</TableHead>
                                                <TableHead>Expiry</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((coupon) => {
                                                const pct = usagePct(coupon);
                                                const expired = isExpired(coupon);
                                                return (
                                                    <TableRow key={coupon.id}>
                                                        <TableCell>
                                                            <p className="font-medium text-slate-900">
                                                                {coupon.couponDescription || coupon.couponCode}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {(coupon.businesses ?? []).map((b) => b.businessName).join(', ') || 'Platform coupon'}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
                                                                    {coupon.couponCode}
                                                                </code>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => {
                                                                        navigator.clipboard?.writeText(coupon.couponCode);
                                                                        toast.success('Code copied');
                                                                    }}
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                {coupon.discountType === 'percentage' ? (
                                                                    <Percent className="h-4 w-4 text-slate-500" />
                                                                ) : (
                                                                    <DollarSign className="h-4 w-4 text-slate-500" />
                                                                )}
                                                                <span className="font-medium">
                                                                    {coupon.discountType === 'percentage'
                                                                        ? `${coupon.couponAmount}%`
                                                                        : `£${coupon.couponAmount}`}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm font-medium">
                                                                {coupon.usageCount ?? 0}
                                                                {coupon.usageLimitPerCoupon != null ? ` / ${coupon.usageLimitPerCoupon}` : ''}
                                                            </p>
                                                            {pct != null && (
                                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'font-medium',
                                                                    expired
                                                                        ? 'bg-red-100 text-red-700 border-red-200'
                                                                        : 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                                )}
                                                            >
                                                                {expired ? 'Expired' : 'Active'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(coupon)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-500">
                                                Page {page} of {totalPages} · {totalItems} total
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                                    Previous
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="giftcards">
                    <ShortcutCard
                        icon={<Gift className="h-16 w-16 mx-auto text-slate-300 mb-4" />}
                        title="Gift Cards"
                        description="Manage gift card templates and denominations in the dedicated section."
                        href="/admin/gift-cards/templates/new"
                        action="Manage gift cards"
                    />
                </TabsContent>

                <TabsContent value="vouchers">
                    <ShortcutCard
                        icon={<Ticket className="h-16 w-16 mx-auto text-slate-300 mb-4" />}
                        title="Vouchers"
                        description="Create and allocate vouchers in the dedicated vouchers section."
                        href="/admin/vouchers/products/new"
                        action="Manage vouchers"
                    />
                </TabsContent>

                <TabsContent value="featured">
                    <ShortcutCard
                        icon={<Star className="h-16 w-16 mx-auto text-slate-300 mb-4" />}
                        title="Featured Listings"
                        description="Manage featured placements from the listings section."
                        href="/admin/listings"
                        action="Go to listings"
                    />
                </TabsContent>

                <TabsContent value="campaigns">
                    <ShortcutCard
                        icon={<Megaphone className="h-16 w-16 mx-auto text-slate-300 mb-4" />}
                        title="Campaigns"
                        description="Launch and track platform marketing campaigns."
                        href="/admin/campaigns"
                        action="Go to campaigns"
                    />
                </TabsContent>
            </Tabs>

            <CreateCouponDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </div>
    );
}

function ShortcutCard({ icon, title, description, href, action }: { icon: React.ReactNode; title: string; description: string; href: string; action: string }) {
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12">
                    {icon}
                    <div className="mt-2">
                        <Link href={href}>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="h-4 w-4 mr-2" />
                                {action}
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CreateCouponDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const addCoupon = useAddCoupon();
    const { data: businessesData } = useGetAdminBusinesses({ page: 1, limit: 50 });
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        couponCode: '',
        couponDescription: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        couponAmount: '10',
        expiryDate: '',
        usageLimitPerCoupon: '',
        businessId: '',
    });

    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const handleCreate = async () => {
        if (!form.couponCode.trim() || !form.couponAmount || !form.expiryDate || !form.businessId) {
            toast.error('Code, amount, expiry and business are required');
            return;
        }
        setSaving(true);
        try {
            await addCoupon({
                couponCode: form.couponCode.trim().toUpperCase(),
                couponDescription: form.couponDescription || undefined,
                discountType: form.discountType,
                couponAmount: Number(form.couponAmount),
                expiryDate: new Date(form.expiryDate).getTime(),
                usageLimitPerCoupon: form.usageLimitPerCoupon ? Number(form.usageLimitPerCoupon) : undefined,
                businessIds: [form.businessId],
            });
            toast.success('Coupon created');
            onOpenChange(false);
            setForm({ couponCode: '', couponDescription: '', discountType: 'percentage', couponAmount: '10', expiryDate: '', usageLimitPerCoupon: '', businessId: '' });
        } catch (e: unknown) {
            toast.error((e as Error)?.message ?? 'Failed to create coupon');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>Creates a live coupon via POST /coupons.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Code *</Label>
                            <Input placeholder="SUMMER20" value={form.couponCode} onChange={(e) => set('couponCode', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Business *</Label>
                            <Select value={form.businessId} onValueChange={(v) => set('businessId', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select business" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(businessesData?.data ?? []).map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Customer-facing description..." value={form.couponDescription} onChange={(e) => set('couponDescription', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select value={form.discountType} onValueChange={(v) => set('discountType', v as 'percentage' | 'fixed')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage Off</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Value *</Label>
                            <Input type="number" min="0" value={form.couponAmount} onChange={(e) => set('couponAmount', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Expiry Date *</Label>
                            <Input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Uses (Overall)</Label>
                            <Input type="number" min="0" placeholder="Unlimited" value={form.usageLimitPerCoupon} onChange={(e) => set('usageLimitPerCoupon', e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" disabled={saving} onClick={handleCreate}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Coupon
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
