'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
    Calendar,
    Users,
    Plus,
    AlertTriangle,
    Loader2,
    Trash2,
    Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useGetExpos,
    useGetExpoStats,
    useCreateExpo,
    useUpdateExpo,
    useDeleteExpo,
} from '@/service/expos/hook';
import { useGetBoroughs } from '@/service/boroughs/hook';
import type { ExpoStatus } from '@/service/expos/types';

function statusStyle(status: ExpoStatus): string {
    switch (status) {
        case 'active':
            return 'text-emerald-600 border-emerald-200 bg-emerald-50';
        case 'upcoming':
            return 'text-blue-600 border-blue-200 bg-blue-50';
        case 'planning':
            return 'text-amber-600 border-amber-200 bg-amber-50';
        case 'ended':
            return 'text-slate-500 border-slate-200 bg-slate-50';
        default:
            return 'text-slate-500 border-slate-200 bg-slate-50';
    }
}

function formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function ExpoPromoPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [venue, setVenue] = useState('');
    const [description, setDescription] = useState('');
    const [boroughId, setBoroughId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data, isLoading, isError, error, refetch } = useGetExpos(
        statusFilter === 'all' ? undefined : { status: statusFilter },
    );
    const { data: stats, isLoading: statsLoading } = useGetExpoStats();
    const { data: boroughs } = useGetBoroughs();
    const create = useCreateExpo();
    const update = useUpdateExpo();
    const remove = useDeleteExpo();

    const expos = useMemo(() => data ?? [], [data]);

    const handleCreate = () => {
        if (!name.trim()) return;
        create.mutate(
            {
                name: name.trim(),
                venue: venue.trim() || undefined,
                description: description.trim() || undefined,
                boroughId: boroughId || undefined,
                status: 'planning',
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            },
            {
                onSuccess: () => {
                    setDialogOpen(false);
                    setName('');
                    setVenue('');
                    setDescription('');
                    setBoroughId('');
                    setStartDate('');
                    setEndDate('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Expo &amp; Promo Management</h1>
                    <p className="text-slate-500">Live expos from the API</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Expo
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Expos', value: stats?.total },
                    { label: 'Planning', value: stats?.planning },
                    { label: 'Upcoming', value: stats?.upcoming },
                    { label: 'Active Expos', value: stats?.active },
                    { label: 'Ended', value: stats?.ended },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{statsLoading ? '…' : (s.value ?? '—')}</p>
                                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load expos: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Expos &amp; Promotions</CardTitle>
                        <CardDescription>
                            {isLoading ? 'Loading…' : `${expos.length} expos`}
                        </CardDescription>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : expos.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No expos found</p>
                            <p className="text-sm text-slate-400">Create your first expo to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Event Name</TableHead>
                                    <TableHead>Borough</TableHead>
                                    <TableHead>Venue</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expos.map((expo) => (
                                    <TableRow key={expo.id}>
                                        <TableCell>
                                            <p className="font-medium text-slate-900">{expo.name}</p>
                                            {expo.description && (
                                                <p className="text-xs text-slate-400 truncate max-w-64">{expo.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-600">{expo.borough?.name ?? '—'}</TableCell>
                                        <TableCell className="text-slate-600">{expo.venue ?? '—'}</TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {formatDate(expo.startDate)} → {formatDate(expo.endDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn('capitalize', statusStyle(expo.status))}>
                                                {expo.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Select
                                                    value={expo.status}
                                                    onValueChange={(v) =>
                                                        update.mutate({ id: expo.id, dto: { status: v as ExpoStatus } })
                                                    }
                                                >
                                                    <SelectTrigger className="w-32 h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="planning">Planning</SelectItem>
                                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="ended">Ended</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    disabled={remove.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Delete expo "${expo.name}"?`)) remove.mutate(expo.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="h-3 w-3" /> Business participation and attendance tracking need an
                expo-participation model — not available in the API yet.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Expo</DialogTitle>
                        <DialogDescription>Creates a live expo via POST /expos.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Night Market" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Venue</Label>
                                <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Camden Lock Plaza" />
                            </div>
                            <div className="space-y-2">
                                <Label>Borough</Label>
                                <Select value={boroughId} onValueChange={setBoroughId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select borough" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(boroughs ?? []).map((b) => (
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
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!name.trim() || create.isPending} onClick={handleCreate}>
                            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
