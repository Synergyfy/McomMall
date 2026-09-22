'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    Plus,
    Trash2,
    Handshake,
    QrCode,
    Users,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    Calendar,
    XCircle,
    LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useGetPartners,
    useGetPartnerStats,
    useCreatePartner,
    useUpdatePartner,
    useDeletePartner,
} from '@/service/partnerships/hook';
import type { PartnerStatus } from '@/service/partnerships/types';

function PartnershipStatusBadge({ status }: { status: PartnerStatus }) {
    const config: Record<PartnerStatus, { label: string; className: string; icon: LucideIcon }> = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Calendar },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status];
    return (
        <Badge variant="outline" className={cn('font-medium gap-1', className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

export default function PartnershipsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState('');

    const { data, isLoading, isError, error, refetch } = useGetPartners({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
    });
    const { data: stats, isLoading: statsLoading } = useGetPartnerStats();
    const create = useCreatePartner();
    const update = useUpdatePartner();
    const remove = useDeletePartner();

    const partners = data ?? [];

    const onSearch = (value: string) => {
        setSearchQuery(value);
        window.clearTimeout((window as unknown as { __ps?: number }).__ps);
        (window as unknown as { __ps?: number }).__ps = window.setTimeout(
            () => setDebouncedSearch(value.trim()),
            400,
        );
    };

    const handleCreate = () => {
        if (!name.trim()) return;
        create.mutate(
            {
                name: name.trim(),
                contactPerson: contactPerson.trim() || undefined,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                type: type.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setDialogOpen(false);
                    setName('');
                    setContactPerson('');
                    setEmail('');
                    setPhone('');
                    setType('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Partnerships</h1>
                    <p className="text-slate-500">Live institutional partners from the API</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Partners', value: stats?.total, icon: Handshake, tone: 'bg-orange-100 text-orange-600' },
                    { label: 'Active Plaques', value: stats?.totalPlaques, icon: QrCode, tone: 'bg-blue-100 text-blue-600' },
                    { label: 'Partner Businesses', value: stats?.totalBusinesses, icon: Users, tone: 'bg-emerald-100 text-emerald-600' },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg', s.tone)}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {statsLoading ? '…' : (s.value?.toLocaleString?.() ?? s.value ?? '—')}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load partners: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search partners or contact people..."
                                value={searchQuery}
                                onChange={(e) => onSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Partners</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="p-12 text-center">
                            <Handshake className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No partners found</p>
                            <p className="text-sm text-slate-400">Add your first institutional partner.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Partner Organization</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-center">Plaques</TableHead>
                                    <TableHead className="text-center">Businesses</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{p.name}</span>
                                                <span className="text-xs text-slate-500 font-mono">{p.id.slice(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700">{p.contactPerson || '—'}</span>
                                                <span className="text-xs text-slate-500">{p.email || p.phone || ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-600">{p.type || '—'}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                                {(p.plaqueCount ?? 0).toLocaleString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {(p.businessCount ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={p.status}
                                                onValueChange={(v) =>
                                                    update.mutate({ id: p.id, dto: { status: v as PartnerStatus } })
                                                }
                                            >
                                                <SelectTrigger className="w-32 h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500"
                                                disabled={remove.isPending}
                                                onClick={() => {
                                                    if (confirm(`Delete partner "${p.name}"?`)) remove.mutate(p.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Partner</DialogTitle>
                        <DialogDescription>Creates a live partner via POST /institutional-partners.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Organization Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Commerce Association" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Person</Label>
                                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Partner Type</Label>
                                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Regional Partner" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!name.trim() || create.isPending} onClick={handleCreate}>
                            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Partner
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
