'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { UserCheck, FileSearch, Star, Plus, Trash2, AlertTriangle, Loader2, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetQualityMissions,
    useGetMissionStats,
    useCreateQualityMission,
    useUpdateQualityMission,
    useDeleteQualityMission,
} from '@/service/quality/hook';
import type { MissionStatus } from '@/service/quality/types';

function statusStyle(status: MissionStatus): string {
    switch (status) {
        case 'completed':
            return 'bg-emerald-500 text-white';
        case 'in_progress':
            return 'bg-blue-500 text-white';
        case 'cancelled':
            return 'bg-slate-300 text-slate-600';
        default:
            return 'bg-amber-500 text-white';
    }
}

export default function QualityPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [assignOpen, setAssignOpen] = useState(false);
    const [businessId, setBusinessId] = useState('');
    const [shopperName, setShopperName] = useState('');
    const [notes, setNotes] = useState('');

    const { data, isLoading, isError, error, refetch } = useGetQualityMissions(
        statusFilter === 'all' ? undefined : statusFilter,
    );
    const { data: stats, isLoading: statsLoading } = useGetMissionStats();
    const { data: businessesData } = useGetAdminBusinesses({ page: 1, limit: 50 });
    const create = useCreateQualityMission();
    const update = useUpdateQualityMission();
    const remove = useDeleteQualityMission();

    const missions = data ?? [];

    const handleAssign = () => {
        if (!businessId || !shopperName.trim()) return;
        create.mutate(
            {
                businessId,
                shopperName: shopperName.trim(),
                notes: notes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setAssignOpen(false);
                    setBusinessId('');
                    setShopperName('');
                    setNotes('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quality Assurance</h1>
                    <p className="text-slate-500">Live mystery shopper missions from the API</p>
                </div>
                <Button className="bg-slate-900 text-white" onClick={() => setAssignOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Assign Mission
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Missions', value: stats?.total },
                    { label: 'Pending', value: stats?.pending },
                    { label: 'In Progress', value: stats?.inProgress },
                    { label: 'Completed', value: stats?.completed },
                    { label: 'Avg Score', value: stats?.avgScore },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-slate-900">{statsLoading ? '…' : (s.value ?? '—')}</p>
                            <p className="text-xs text-slate-500">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load missions: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mystery Shopper Missions</CardTitle>
                        <CardDescription>
                            {isLoading ? 'Loading…' : `${missions.length} missions`}
                        </CardDescription>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : missions.length === 0 ? (
                        <div className="text-center py-10">
                            <ClipboardList className="h-10 w-10 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No missions found</p>
                            <p className="text-sm text-slate-400">Assign the first mystery shopper mission.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {missions.map((mission) => (
                                <div key={mission.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <UserCheck className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                Audit: {mission.business?.businessName ?? mission.businessId.slice(0, 8)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Shopper: {mission.shopperName}
                                                {mission.created_at ? ` · Assigned: ${new Date(mission.created_at).toLocaleDateString()}` : ''}
                                            </p>
                                            {mission.notes && (
                                                <p className="text-xs text-slate-400 mt-1">{mission.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {mission.score != null && (
                                            <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                                <Star className="h-4 w-4 fill-emerald-600" />
                                                {mission.score}
                                            </div>
                                        )}
                                        <Badge className={cn('border-none', statusStyle(mission.status))}>
                                            {mission.status.replace(/_/g, ' ')}
                                        </Badge>
                                        {mission.status === 'pending' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={update.isPending}
                                                onClick={() => update.mutate({ id: mission.id, dto: { status: 'in_progress' } })}
                                            >
                                                Start
                                            </Button>
                                        )}
                                        {mission.status === 'in_progress' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={update.isPending}
                                                onClick={() => update.mutate({ id: mission.id, dto: { status: 'completed' } })}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500"
                                            disabled={remove.isPending}
                                            onClick={() => {
                                                if (confirm('Delete this mission?')) remove.mutate(mission.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-slate-500">
                    <FileSearch className="h-5 w-5 text-slate-400" />
                    Storefront content audits live under
                    <Link href="/admin/audit" className="font-bold text-blue-600">
                        Business Audits
                    </Link>
                    once that queue lands.
                </CardContent>
            </Card>

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Mission</DialogTitle>
                        <DialogDescription>Creates a live mission via POST /quality/missions.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Business *</Label>
                            <Select value={businessId} onValueChange={setBusinessId}>
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
                        <div className="space-y-2">
                            <Label>Shopper codename *</Label>
                            <Input value={shopperName} onChange={(e) => setShopperName(e.target.value)} placeholder="e.g. Agent 47" />
                        </div>
                        <div className="space-y-2">
                            <Label>Brief / notes</Label>
                            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What should the shopper check?" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!businessId || !shopperName.trim() || create.isPending} onClick={handleAssign}>
                            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
