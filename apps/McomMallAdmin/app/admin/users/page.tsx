'use client';

import { useState } from 'react';
import { Search, Users, UserCheck, UserX, Clock, AlertTriangle, Loader2, Eye } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useGetAdminUsers, useGetUserStats } from '@/service/admin/hook';
import type { AdminUser, UserStatus, UserAccountType } from '@/service/admin/types';

const PAGE_SIZE = 10;

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function CustomerManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
    const [typeFilter, setTypeFilter] = useState<UserAccountType>('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<AdminUser | null>(null);

    const { data: stats, isLoading: statsLoading } = useGetUserStats();
    const { data, isLoading, isError, error, refetch } = useGetAdminUsers({
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        page,
        limit: PAGE_SIZE,
    });

    const users = data?.data ?? [];
    const totalPages = data?.totalPages ?? 1;
    const total = data?.total ?? 0;

    const onSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1);
        window.clearTimeout((window as unknown as { __us?: number }).__us);
        (window as unknown as { __us?: number }).__us = window.setTimeout(
            () => setDebouncedSearch(value.trim()),
            400,
        );
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">Live platform users from the API.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Users', value: stats?.total, icon: Users },
                    { title: 'Active', value: stats?.active, icon: UserCheck },
                    { title: 'Suspended', value: stats?.suspended, icon: UserX },
                    { title: 'Pending', value: stats?.pending, icon: Clock },
                ].map((kpi) => (
                    <Card key={kpi.title} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                <p className="text-2xl font-black text-slate-900">{statsLoading ? '…' : (kpi.value ?? '—')}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">User Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                                {isLoading ? 'Loading…' : `${total} users found`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-11 h-12 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => onSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v as UserStatus);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-40 h-12 bg-white rounded-xl">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={typeFilter}
                                onValueChange={(v) => {
                                    setTypeFilter(v as UserAccountType);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-40 h-12 bg-white rounded-xl">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    )}
                    {isError && (
                        <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                            <AlertTriangle className="h-4 w-4" />
                            Failed to load users: {(error as Error)?.message ?? 'Unknown error'}
                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {!isLoading && !isError && users.length === 0 && (
                        <div className="p-12 text-center">
                            <Users className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No users found</p>
                            <p className="text-sm text-slate-400">Try adjusting search or filters.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                    setPage(1);
                                }}
                            >
                                Reset filters
                            </Button>
                        </div>
                    )}
                    {users.length > 0 && (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="pl-8">User</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead className="text-center">Type</TableHead>
                                        <TableHead className="text-right">Wallet</TableHead>
                                        <TableHead className="text-center">Verified</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} className="hover:bg-blue-50/30">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600">
                                                        {initials(u.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{u.name}</p>
                                                        <p className="text-[11px] text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-slate-600">{u.phone || '—'}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="capitalize">{u.accountType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-black">£{u.walletBalance?.toLocaleString?.() ?? u.walletBalance}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'border-none text-[10px] font-black uppercase',
                                                        u.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                                                    )}
                                                >
                                                    {u.verified ? 'Verified' : 'Unverified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        'border-none text-[10px] font-black uppercase capitalize',
                                                        u.status === 'active'
                                                            ? 'bg-emerald-500 text-white'
                                                            : u.status === 'pending'
                                                              ? 'bg-amber-500 text-white'
                                                              : 'bg-red-600 text-white',
                                                    )}
                                                >
                                                    {u.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="sm" onClick={() => setSelected(u)}>
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
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

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selected?.name}</DialogTitle>
                        <DialogDescription>Live user record from the API.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Email</dt><dd>{selected.email}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Phone</dt><dd>{selected.phone || '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Type</dt><dd className="capitalize">{selected.accountType}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Status</dt><dd className="capitalize">{selected.status}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Wallet</dt><dd>£{selected.walletBalance}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Verified</dt><dd>{selected.verified ? 'Yes' : 'No'}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Last login</dt><dd>{selected.lastLogin ? new Date(selected.lastLogin).toLocaleString() : '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Signed up</dt><dd>{selected.signupDate ? new Date(selected.signupDate).toLocaleDateString() : '—'}</dd></div>
                            {selected.notes && (
                                <div className="pt-2"><dt className="text-slate-500 font-bold">Notes</dt><dd className="mt-1 text-slate-700">{selected.notes}</dd></div>
                            )}
                        </dl>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
