'use client';

import { useState } from 'react';
import {
    Search,
    MoreVertical,
    Eye,
    Ban,
    CheckCircle2,
    ShieldAlert,
    Star,
    Building2,
    MapPin,
    ShieldCheck,
    AlertTriangle,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    useGetAdminBusinesses,
    useGetBusinessStats,
    useGetBusinessDetail,
    useGetBusinessListings,
    useVerifyBusiness,
    useUpdateBusiness,
} from '@/service/admin/hook';
import type { AdminBusiness } from '@/service/admin/types';

const PAGE_SIZE = 10;

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function BusinessManagementDashboard() {
    const [view, setView] = useState<'list' | 'profile' | 'verification'>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: stats, isLoading: statsLoading } = useGetBusinessStats();
    const {
        data: businessesData,
        isLoading: listLoading,
        isError: listError,
        error: listErr,
        refetch,
    } = useGetAdminBusinesses({
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
    });

    const businesses = businessesData?.data ?? [];
    const totalPages = businessesData?.totalPages ?? 1;
    const total = businessesData?.total ?? 0;

    const openProfile = (b: AdminBusiness) => {
        setSelectedId(b.id);
        setView('profile');
    };
    const openVerification = (b: AdminBusiness) => {
        setSelectedId(b.id);
        setView('verification');
    };
    const backToList = () => {
        setSelectedId(null);
        setView('list');
    };

    if (view === 'profile' && selectedId) {
        return <BusinessProfileView businessId={selectedId} onBack={backToList} />;
    }
    if (view === 'verification' && selectedId) {
        return <BusinessVerificationView businessId={selectedId} onBack={backToList} />;
    }

    const kpis = [
        { title: 'Total Businesses', value: statsLoading ? '…' : String(stats?.total ?? '—'), icon: Building2 },
        { title: 'Active', value: statsLoading ? '…' : String(stats?.active ?? '—'), icon: CheckCircle2 },
        { title: 'Pending Approvals', value: statsLoading ? '…' : String(stats?.pending ?? '—'), icon: ShieldAlert },
        { title: 'Verified', value: statsLoading ? '…' : String(stats?.verified ?? '—'), icon: ShieldCheck },
    ];

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">
                        Live directory of marketplace businesses from the platform API.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.title} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {kpi.title}
                                </p>
                                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Entity Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                                {listLoading ? 'Loading businesses…' : `${total} businesses found`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search business or owner…"
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 bg-white rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                        window.clearTimeout((window as unknown as { __bt?: number }).__bt);
                                        (window as unknown as { __bt?: number }).__bt = window.setTimeout(
                                            () => setDebouncedSearch(e.target.value.trim()),
                                            400,
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                    {listLoading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    )}
                    {listError && (
                        <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                            <AlertTriangle className="h-4 w-4" />
                            Failed to load businesses: {(listErr as Error)?.message ?? 'Unknown error'}
                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {!listLoading && !listError && businesses.length === 0 && (
                        <div className="p-12 text-center">
                            <Building2 className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No businesses found</p>
                            <p className="text-sm text-slate-400">Try adjusting your search.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                    setPage(1);
                                }}
                            >
                                Clear search
                            </Button>
                        </div>
                    )}
                    {businesses.length > 0 && (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">
                                            Business / Category
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Sector
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Location
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">
                                            Listings
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">
                                            Rating
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">
                                            Verification
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right pr-8 h-14" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {businesses.map((b) => (
                                        <TableRow
                                            key={b.id}
                                            className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                                            onClick={() => openProfile(b)}
                                        >
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[12px] font-black text-slate-600 border border-slate-200">
                                                        {initials(b.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                                            {b.name}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                            {b.category || 'Uncategorized'} • {b.owner || 'No owner'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 font-bold text-xs text-slate-600">
                                                {b.sector || '—'}
                                            </TableCell>
                                            <TableCell className="py-5 font-bold text-xs text-slate-600">
                                                <span className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {b.address || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-5 font-black text-sm text-slate-800">
                                                {b.listingCount}
                                            </TableCell>
                                            <TableCell className="text-center py-5">
                                                <span className="inline-flex items-center gap-1 text-xs font-black text-slate-700">
                                                    <Star className="w-3.5 h-3.5 text-amber-500" />
                                                    {b.rating?.toFixed?.(1) ?? b.rating} ({b.reviewCount})
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest border-none px-3 py-1',
                                                        b.verified
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700',
                                                    )}
                                                >
                                                    {b.verified ? 'Verified' : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Badge
                                                    className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 capitalize',
                                                        b.status === 'active' || b.status === 'published'
                                                            ? 'bg-emerald-500 text-white'
                                                            : b.status === 'suspended'
                                                              ? 'bg-red-600 text-white'
                                                              : 'bg-slate-200 text-slate-600',
                                                    )}
                                                >
                                                    {b.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-xl"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
                                                            Entity Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openProfile(b);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-500" /> View Detailed Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-emerald-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openVerification(b);
                                                            }}
                                                        >
                                                            <ShieldCheck className="w-4 h-4" /> Verify Business
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                        <SuspendAction business={b} />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500">
                                        Page {page} of {totalPages} · {total} total
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        >
                                            Next <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function SuspendAction({ business }: { business: AdminBusiness }) {
    const update = useUpdateBusiness();
    const isSuspended = business.status === 'suspended';
    return (
        <DropdownMenuItem
            className={cn(
                'gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs',
                isSuspended ? 'text-emerald-600' : 'text-red-600',
            )}
            onClick={(e) => {
                e.stopPropagation();
                if (confirm(`${isSuspended ? 'Reactivate' : 'Suspend'} "${business.name}"?`)) {
                    update.mutate({
                        id: business.id,
                        data: { status: isSuspended ? 'active' : 'suspended' },
                    });
                }
            }}
        >
            <Ban className="w-4 h-4" /> {update.isPending ? 'Saving…' : isSuspended ? 'Reactivate' : 'Suspend Operations'}
        </DropdownMenuItem>
    );
}

function BusinessProfileView({ businessId, onBack }: { businessId: string; onBack: () => void }) {
    const { data: detail, isLoading, isError, error, refetch } = useGetBusinessDetail(businessId);
    const { data: listings, isLoading: listingsLoading } = useGetBusinessListings(businessId);

    return (
        <div className="bg-white min-h-screen p-8 space-y-6">
            <Button variant="ghost" onClick={onBack} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to directory
            </Button>
            {isLoading ? (
                <div className="space-y-4">
                    <div className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />
                    <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
            ) : isError || !detail ? (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-6 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load business: {(error as Error)?.message ?? 'Not found'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-10 text-white">
                        <h1 className="text-3xl font-black tracking-tight">{detail.businessName}</h1>
                        <p className="text-sm text-slate-300 mt-2">{detail.shortDescription || detail.about || 'No description'}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Badge className="bg-white/10 border-white/20 capitalize">{detail.status}</Badge>
                            {(detail.listingType ?? []).map((t) => (
                                <Badge key={t} variant="outline" className="text-white border-white/20 capitalize">
                                    {t}
                                </Badge>
                            ))}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Contact</p>
                                <p className="font-bold">{detail.businessEmail || '—'}</p>
                                <p className="text-slate-300">{detail.businessPhone || ''}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Legal name</p>
                                <p className="font-bold">{detail.legalName || '—'}</p>
                                <p className="text-slate-300">{detail.website || ''}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Listings</p>
                                <p className="font-bold">{listingsLoading ? '…' : (listings?.length ?? 0)}</p>
                            </div>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Listings</CardTitle>
                            <CardDescription>Live listings for this business</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {listingsLoading ? (
                                <div className="h-20 rounded bg-slate-100 animate-pulse" />
                            ) : (listings ?? []).length === 0 ? (
                                <p className="text-sm text-slate-400">No listings for this business.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {(listings ?? []).map((l) => (
                                        <li key={l.id} className="py-3 flex items-center justify-between text-sm">
                                            <span className="font-bold text-slate-800">{l.name}</span>
                                            <span className="text-slate-500">
                                                £{l.price} · <span className="capitalize">{l.status}</span> ·{' '}
                                                <span className="capitalize">{l.type}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function BusinessVerificationView({ businessId, onBack }: { businessId: string; onBack: () => void }) {
    const { data: detail, isLoading, isError, error, refetch } = useGetBusinessDetail(businessId);
    const verify = useVerifyBusiness();

    return (
        <div className="bg-white min-h-screen p-8 space-y-6">
            <Button variant="ghost" onClick={onBack} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to directory
            </Button>
            <div>
                <h1 className="text-2xl font-black text-slate-900">Business Verification</h1>
                <p className="text-sm text-slate-500">Review live business record and approve or revoke verification.</p>
            </div>
            {isLoading ? (
                <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
            ) : isError || !detail ? (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-6 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load business: {(error as Error)?.message ?? 'Not found'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-lg font-black text-slate-900">{detail.businessName}</p>
                                <p className="text-xs text-slate-500">
                                    {detail.legalName} · {detail.businessEmail} · {detail.businessPhone}
                                </p>
                            </div>
                            <Badge className="capitalize">{detail.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{detail.about || detail.shortDescription || 'No description provided.'}</p>
                        <div className="flex gap-3 pt-2">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={verify.isPending}
                                onClick={() => verify.mutate({ id: businessId, isVerified: true })}
                            >
                                {verify.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                Approve verification
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600"
                                disabled={verify.isPending}
                                onClick={() => verify.mutate({ id: businessId, isVerified: false })}
                            >
                                <Ban className="h-4 w-4 mr-2" /> Revoke verification
                            </Button>
                        </div>
                        <p className="text-xs text-slate-400">
                            Document-level KYC review (identity, business proofs, risk scoring) will live under the
                            dedicated verifications queue once that backend module lands (Batch 3).
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
