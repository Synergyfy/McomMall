'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Building2,
    ShieldCheck,
    Rocket,
    Trash2,
    AlertTriangle,
    Loader2,
    Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    useGetBorough,
    useGetBoroughCampaigns,
    useUpdateBorough,
    useDeleteBorough,
} from '@/service/boroughs/hook';

export default function BoroughProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: borough, isLoading, isError, error, refetch } = useGetBorough(id);
    const { data: campaigns, isLoading: campaignsLoading } = useGetBoroughCampaigns(id);
    const update = useUpdateBorough();
    const remove = useDeleteBorough();

    const [editOpen, setEditOpen] = useState(false);
    const [managerName, setManagerName] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    const openEdit = () => {
        setManagerName(borough?.managerName ?? '');
        setActivityLevel(borough?.activityLevel ?? '');
        setEditOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/boroughs">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Borough Profile{borough ? ` / ${borough.name}` : ''}
                </p>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
            )}

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-6 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load borough: {(error as Error)?.message ?? 'Not found'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isError && borough && (
                <>
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-50">
                                    <Building2 className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {borough.name} Borough
                                        </h1>
                                        <Badge
                                            className={cn(
                                                'border-none',
                                                borough.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
                                            )}
                                        >
                                            {borough.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" /> Manager: {borough.managerName || 'Unassigned'}
                                        {borough.activityLevel ? ` · Activity: ${borough.activityLevel}` : ''}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Onboarded {borough.created_at ? new Date(borough.created_at).toLocaleDateString() : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={openEdit}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600"
                                    disabled={remove.isPending}
                                    onClick={() => {
                                        if (confirm(`Remove borough "${borough.name}"?`)) {
                                            remove.mutate(borough.id, {
                                                onSuccess: () => router.push('/admin/boroughs'),
                                            });
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                </Button>
                                <Button
                                    variant={borough.isActive ? 'outline' : 'default'}
                                    disabled={update.isPending}
                                    onClick={() =>
                                        update.mutate({ id: borough.id, dto: { isActive: !borough.isActive } })
                                    }
                                >
                                    {borough.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-orange-500" /> Linked Campaigns
                            </CardTitle>
                            <CardDescription>
                                Borough campaigns linked via boroughId · {(campaigns ?? []).length} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {campaignsLoading ? (
                                <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                            ) : (campaigns ?? []).length === 0 ? (
                                <p className="text-sm text-slate-400 py-6 text-center">
                                    No campaigns linked to this borough yet.
                                </p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {(campaigns ?? []).map((c) => (
                                        <li key={c.id} className="py-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-slate-900">{c.name}</p>
                                                <p className="text-sm text-slate-500 mt-0.5">{c.description}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Reach {c.reach.toLocaleString()} · {c.impressions.toLocaleString()} impressions ·{' '}
                                                    {c.merchantCount} merchants · {c.progress}% progress
                                                </p>
                                            </div>
                                            <Badge variant="outline">{c.daysLeft}d left</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit borough</DialogTitle>
                        <DialogDescription>Updates the live borough record.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Manager</Label>
                            <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="e.g. Sarah Chen" />
                        </div>
                        <div className="space-y-2">
                            <Label>Activity Level</Label>
                            <Input value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} placeholder="e.g. High" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={update.isPending}
                            onClick={() =>
                                update.mutate(
                                    {
                                        id,
                                        dto: {
                                            managerName: managerName.trim() || undefined,
                                            activityLevel: activityLevel.trim() || undefined,
                                        },
                                    },
                                    { onSuccess: () => setEditOpen(false) },
                                )
                            }
                        >
                            {update.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
