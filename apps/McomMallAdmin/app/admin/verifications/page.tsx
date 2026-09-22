'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Building2,
    User,
    AlertTriangle,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useGetVerifications,
    useGetVerificationStats,
    useApproveVerification,
    useRejectVerification,
} from '@/service/verifications/hook';
import type { Verification, VerificationStatus } from '@/service/verifications/types';

function StatusBadge({ status }: { status: VerificationStatus }) {
    const styles: Record<VerificationStatus, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <Badge variant="outline" className={cn('font-medium capitalize', styles[status])}>
            {status}
        </Badge>
    );
}

export default function VerificationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selected, setSelected] = useState<Verification | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [approveNote, setApproveNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const { data, isLoading, isError, error, refetch } = useGetVerifications({
        status: statusFilter === 'all' ? undefined : statusFilter,
        subjectType: typeFilter === 'all' ? undefined : typeFilter,
    });
    const { data: stats, isLoading: statsLoading } = useGetVerificationStats();
    const approve = useApproveVerification();
    const reject = useRejectVerification();

    const verifications = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return verifications;
        return verifications.filter(
            (v) =>
                v.subjectName.toLowerCase().includes(q) ||
                v.id.toLowerCase().includes(q) ||
                v.documentType.toLowerCase().includes(q),
        );
    }, [verifications, searchQuery]);

    const handleApprove = () => {
        if (!selected) return;
        approve.mutate(
            { id: selected.id, dto: { reviewNote: approveNote || undefined } },
            {
                onSuccess: () => {
                    setSheetOpen(false);
                    setSelected(null);
                    setApproveNote('');
                },
            },
        );
    };

    const handleReject = () => {
        if (!selected || !rejectReason.trim()) return;
        reject.mutate(
            { id: selected.id, dto: { reviewNote: rejectReason.trim() } },
            {
                onSuccess: () => {
                    setRejectOpen(false);
                    setSheetOpen(false);
                    setSelected(null);
                    setRejectReason('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifications</h1>
                    <p className="text-slate-500">Live identity and business verification queue</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats?.total, icon: Shield, tone: 'bg-blue-100 text-blue-600' },
                    { label: 'Pending', value: stats?.pending, icon: Clock, tone: 'bg-amber-100 text-amber-700' },
                    { label: 'Approved', value: stats?.approved, icon: CheckCircle, tone: 'bg-emerald-100 text-emerald-600' },
                    { label: 'Rejected', value: stats?.rejected, icon: XCircle, tone: 'bg-red-100 text-red-600' },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg', s.tone)}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{statsLoading ? '…' : (s.value ?? '—')}</p>
                                    <p className="text-xs text-slate-500">{s.label}</p>
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
                        Failed to load verifications: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, document or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Subject Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="identity">Identity</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Submitter</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="text-xs bg-slate-200 text-slate-600">
                                                        {v.subjectName.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">{v.subjectName}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{v.subjectType}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {v.subjectType === 'business' ? (
                                                <Building2 className="h-4 w-4 text-purple-500" />
                                            ) : (
                                                <User className="h-4 w-4 text-blue-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[11px]">
                                                {v.documentType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={v.status} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-500">
                                                {v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelected(v);
                                                    setSheetOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="p-8 text-center">
                            <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No verifications found</h3>
                            <p className="text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Review Verification</SheetTitle>
                        <SheetDescription>
                            Approving a business verification marks the business verified.
                        </SheetDescription>
                    </SheetHeader>
                    {selected && (
                        <div className="mt-4 space-y-4">
                            <div className="rounded-xl border border-slate-100 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold">Subject</span>
                                    <span className="font-black">{selected.subjectName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold">Type</span>
                                    <span className="capitalize">{selected.subjectType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold">Document</span>
                                    <span className="font-mono text-xs">{selected.documentType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold">Status</span>
                                    <StatusBadge status={selected.status} />
                                </div>
                                {selected.documentUrl && (
                                    <a
                                        href={selected.documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 font-bold"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" /> Open document
                                    </a>
                                )}
                                {selected.reviewNote && (
                                    <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                                        Review note: {selected.reviewNote}
                                    </p>
                                )}
                            </div>
                            {selected.status === 'pending' && (
                                <>
                                    <Textarea
                                        placeholder="Approval note (optional)..."
                                        value={approveNote}
                                        onChange={(e) => setApproveNote(e.target.value)}
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                            disabled={approve.isPending}
                                            onClick={handleApprove}
                                        >
                                            {approve.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => setRejectOpen(true)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification</DialogTitle>
                        <DialogDescription>Provide a reason for rejecting this request.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" disabled={!rejectReason.trim() || reject.isPending} onClick={handleReject}>
                            {reject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
