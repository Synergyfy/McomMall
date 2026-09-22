'use client';

import { useMemo, useState } from 'react';
import {
    Search,
    MoreVertical,
    Pause,
    Play,
    Trash2,
    QrCode as QrCodeIcon,
    Globe,
    MousePointer2,
    BadgeCheck,
    Store,
    AlertTriangle,
    Loader2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import { useGetQrCodesByBusiness, useUpdateQrCode, useDeleteQrCode } from '@/service/qlinks/hook';

export default function QLinksManagementDashboard() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const businesses = useMemo(() => businessesData?.data ?? [], [businessesData]);

    const { data, isLoading, isError, error, refetch } = useGetQrCodesByBusiness(businessId);
    const update = useUpdateQrCode(businessId);
    const remove = useDeleteQrCode(businessId);

    const links = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return links;
        return links.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.id.toLowerCase().includes(q) ||
                l.qrType.toLowerCase().includes(q),
        );
    }, [links, searchQuery]);

    const totalScans = links.reduce((acc, l) => acc + (l.scanCount ?? 0), 0);
    const activeCount = links.filter((l) => l.status === 'active').length;

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">QLinks Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Live QR codes per business from the API.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    <Select value={businessId ?? ''} onValueChange={(v) => setBusinessId(v || undefined)}>
                        <SelectTrigger className="w-64 bg-white">
                            <SelectValue placeholder={businessesLoading ? 'Loading businesses…' : 'Select a business'} />
                        </SelectTrigger>
                        <SelectContent>
                            {businesses.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!businessId && (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center text-sm text-slate-500">
                        Select a business above to load its live QR codes and scan counts.
                    </CardContent>
                </Card>
            )}

            {businessId && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Total QLinks', value: links.length, icon: QrCodeIcon },
                            { title: 'Total Scans', value: totalScans.toLocaleString(), icon: MousePointer2 },
                            { title: 'Active Links', value: activeCount, icon: BadgeCheck },
                        ].map((kpi) => (
                            <Card key={kpi.title} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                                        <kpi.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                        <p className="text-2xl font-black text-slate-900">{isLoading ? '…' : kpi.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {isError && (
                        <Card className="border-rose-200 bg-rose-50">
                            <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                                <AlertTriangle className="h-4 w-4" />
                                Failed to load QLinks: {(error as Error)?.message ?? 'Unknown error'}
                                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900">Active Destinations</CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                                        {isLoading ? 'Loading…' : `${filtered.length} links`}
                                    </CardDescription>
                                </div>
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search name, ID, or type..."
                                        className="pl-11 h-12 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 relative">
                            {isLoading && (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            )}
                            {!isLoading && !isError && filtered.length === 0 && (
                                <p className="p-12 text-center text-sm text-slate-400">No QR codes for this business.</p>
                            )}
                            {filtered.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="pl-8">QLink Name / ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead className="text-center">Scans</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right pr-8" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map((q) => (
                                            <TableRow key={q.id}>
                                                <TableCell className="pl-8 py-5">
                                                    <p className="text-sm font-black text-slate-900">{q.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{q.id.slice(0, 8)}…</p>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge variant="outline" className="capitalize">{q.qrType}</Badge>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg w-fit max-w-56 truncate">
                                                        <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        {q.shortUrl || q.targetId || '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-5 font-black text-sm">
                                                    {(q.scanCount ?? 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge
                                                        className={cn(
                                                            'text-[9px] font-black uppercase border-none px-3 py-1',
                                                            q.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
                                                        )}
                                                    >
                                                        {q.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8 py-5">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                                                <MoreVertical className="w-5 h-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl">
                                                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase px-3 py-2">
                                                                QLink Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs"
                                                                disabled={update.isPending}
                                                                onClick={() =>
                                                                    update.mutate({
                                                                        id: q.id,
                                                                        dto: { status: q.status === 'active' ? 'paused' : 'active' },
                                                                    })
                                                                }
                                                            >
                                                                {q.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                                                                {q.status === 'active' ? 'Pause Link' : 'Resume Link'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-red-600"
                                                                disabled={remove.isPending}
                                                                onClick={() => {
                                                                    if (confirm(`Delete QLink "${q.name}"?`)) remove.mutate(q.id);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
