'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useGetDisputeStats,
    useGetAllDisputes,
    useResolveDispute
} from '@/service/dispute/hook';
import { Dispute, DisputeStatus, DisputeReason } from '@/service/dispute/types';
import {
    Search,
    Download,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    User,
    Building2,
    DollarSign,
    ArrowRight,
    Send,
    Scale,
    FileText,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Status Badge
function DisputeStatusBadge({ status }: { status: Dispute['status'] }) {
    const config: Record<DisputeStatus, { label: string, className: string }> = {
        new: { label: 'New', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        mediated: { label: 'Mediated', className: 'bg-purple-100 text-purple-700 border-purple-200' },
        resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        escalated: { label: 'Escalated', className: 'bg-red-100 text-red-700 border-red-200' },
    };

    const item = config[status] || { label: status, className: 'bg-slate-100 text-slate-700' };

    return (
        <Badge variant="outline" className={cn('font-medium', item.className)}>
            {item.label}
        </Badge>
    );
}

// Reason Badge
function ReasonBadge({ reason }: { reason: DisputeReason }) {
    const labels: Record<DisputeReason, string> = {
        not_received: 'Not Received',
        not_as_described: 'Not as Described',
        defective: 'Defective',
        wrong_item: 'Wrong Item',
        seller_unresponsive: 'Seller Unresponsive',
        other: 'Other',
    };

    return (
        <Badge variant="secondary" className="font-medium">
            {labels[reason] || reason}
        </Badge>
    );
}

// Dispute Detail Sheet
function DisputeDetailSheet({
    dispute,
    open,
    onOpenChange,
}: {
    dispute: Dispute | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [response, setResponse] = useState('');
    const resolveMutation = useResolveDispute();

    if (!dispute) return null;

    const handleResolve = () => {
        resolveMutation.mutate(dispute.id, {
            onSuccess: () => {
                onOpenChange(false);
                setResponse('');
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-lg">Dispute #{dispute.id}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <DisputeStatusBadge status={dispute.status} />
                        <ReasonBadge reason={dispute.reason} />
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-2">BUYER</p>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                                        {dispute.customerName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{dispute.customerName}</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium mb-2">SELLER</p>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-purple-500 text-white">
                                        {dispute.businessName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'S'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{dispute.businessName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="text-center p-4 rounded-lg bg-slate-50">
                        <p className="text-sm text-slate-500 mb-1">Disputed Amount</p>
                        <p className="text-3xl font-bold text-slate-900">£{dispute.amount?.toFixed(2)}</p>
                        {dispute.orderId && (
                            <p className="text-xs text-slate-500 mt-2">Order: {dispute.orderId}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Buyer&apos;s Complaint</h4>
                        <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50">
                            {dispute.description}
                        </p>
                    </div>

                    {/* Evidence */}
                    {dispute.evidence && dispute.evidence.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Evidence Provided</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {dispute.evidence.map((e, i) => (
                                    <a
                                        key={i}
                                        href={e}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                                    >
                                        <FileText className="h-6 w-6 text-slate-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline (Simplified as we don't have timeline data in the new API yet) */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Timeline</h4>
                        <div className="space-y-3">
                            {[
                                { action: 'Dispute opened', time: new Date(dispute.createdAt).toLocaleString(), user: dispute.customerName },
                                { action: dispute.status === 'new' ? 'Awaiting Review' : 'Currently ' + dispute.status.replace('_', ' '), time: '-', user: 'System' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                        <p className="text-xs text-slate-500">{item.time} • {item.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin Response */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Resolution</h4>
                        <Textarea
                            placeholder="Enter resolution notes or decision..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                            <Button
                                onClick={handleResolve}
                                disabled={resolveMutation.isPending}
                                className="flex-1 bg-blue-500 hover:bg-blue-600"
                            >
                                {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                                Resolve Dispute
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Note: This will mark the dispute as resolved in the system.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function DisputesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [reasonFilter, setReasonFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Queries
    const { data: stats, isLoading: statsLoading } = useGetDisputeStats();
    const { data: disputesData, isLoading: disputesLoading } = useGetAllDisputes({
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter as DisputeStatus,
        reason: reasonFilter === 'all' ? undefined : reasonFilter as DisputeReason,
        page,
        limit,
    });

    const handleView = (d: Dispute) => {
        setSelectedDispute(d);
        setSheetOpen(true);
    };

    const handleExport = () => {
        toast.info('Export started...');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
                    <p className="text-slate-500">Manage customer complaints and dispute resolutions</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.total || 0}</p>
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.open || 0}</p>
                                <p className="text-xs text-slate-500">Open</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.underReview || 0}</p>
                                <p className="text-xs text-slate-500">Under Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-200">
                                <AlertTriangle className="h-5 w-5 text-red-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-700">{statsLoading ? '...' : stats?.escalated || 0}</p>
                                <p className="text-xs text-red-600">Escalated</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by ID..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="mediated">Mediated</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="escalated">Escalated</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={reasonFilter} onValueChange={(val) => { setReasonFilter(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Reasons</SelectItem>
                                <SelectItem value="not_received">Not Received</SelectItem>
                                <SelectItem value="not_as_described">Not as Described</SelectItem>
                                <SelectItem value="defective">Defective</SelectItem>
                                <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                <SelectItem value="seller_unresponsive">Seller Unresponsive</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="relative">
                        {disputesLoading && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            </div>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dispute</TableHead>
                                    <TableHead>Parties</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputesData?.data.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">#{d.id}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(d.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="text-blue-600 truncate max-w-[100px]">{d.customerName}</span>
                                                <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                                <span className="text-purple-600 truncate max-w-[100px]">{d.businessName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ReasonBadge reason={d.reason} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">£{d.amount?.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <DisputeStatusBadge status={d.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleView(d)}>
                                                <Scale className="h-4 w-4 mr-2" />
                                                Resolve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {!disputesLoading && disputesData?.data.length === 0 && (
                        <div className="p-8 text-center">
                            <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No disputes found</h3>
                            <p className="text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {disputesData && disputesData.totalPages > 1 && (
                        <div className="p-4 border-t flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing Page {disputesData.page} of {disputesData.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= disputesData.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <DisputeDetailSheet
                dispute={selectedDispute}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
