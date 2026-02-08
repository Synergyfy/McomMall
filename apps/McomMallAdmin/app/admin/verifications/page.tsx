'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { verifications } from '../data/mock-data';
import { Verification } from '../types';
import {
    Search,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    FileText,
    Eye,
    User,
    Building2,
    Calendar,
    AlertCircle,
    ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Status Badge
function StatusBadge({ status }: { status: Verification['status'] }) {
    const config = {
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        more_info_needed: { label: 'Info Required', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: AlertCircle },
    };

    const { label, className, icon: Icon } = config[status];

    return (
        <Badge variant="outline" className={cn('font-medium gap-1', className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

// Document Type Badge
function DocTypeBadge({ type }: { type: Verification['documentType'] }) {
    const labels: Record<string, string> = {
        id_card: 'ID Card',
        passport: 'Passport',
        business_license: 'Business License',
        address_proof: 'Address Proof',
        tax_document: 'Tax Document',
    };

    return (
        <Badge variant="secondary" className="font-medium">
            {labels[type]}
        </Badge>
    );
}

// Verification Detail Sheet
function VerificationDetailSheet({
    verification,
    open,
    onOpenChange,
    onApprove,
    onReject,
    onRequestInfo,
}: {
    verification: Verification | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: () => void;
    onReject: () => void;
    onRequestInfo: () => void;
}) {
    if (!verification) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-lg">Verification Request</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <StatusBadge status={verification.status} />
                        <DocTypeBadge type={verification.documentType} />
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Submitter Info */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                {verification.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{verification.userName}</p>
                            <p className="text-sm text-slate-500 capitalize">{verification.type}</p>
                        </div>
                    </div>

                    {/* Document Preview */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Document Preview</h4>
                        <div className="aspect-video rounded-lg bg-slate-100 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                            <div className="text-center">
                                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Document Image</p>
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="secondary" size="sm">
                                    <ZoomIn className="h-4 w-4 mr-2" />
                                    View Full Size
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Details</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">Submitted</span>
                                <span className="text-sm font-medium">
                                    {new Date(verification.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">Document Type</span>
                                <DocTypeBadge type={verification.documentType} />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">Reference ID</span>
                                <code className="text-sm font-mono">{verification.id}</code>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {verification.notes && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Submitted Notes</h4>
                            <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50">
                                {verification.notes}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    {verification.status === 'pending' && (
                        <div className="space-y-3 pt-4 border-t">
                            <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600"
                                onClick={onApprove}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Verification
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onRequestInfo}
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Request Info
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onReject}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Rejection Dialog
function RejectDialog({
    open,
    onOpenChange,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState('');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Verification</DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting this verification request.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    placeholder="Enter rejection reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm(reason);
                            setReason('');
                        }}
                        disabled={!reason.trim()}
                    >
                        Reject
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function VerificationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    // Filter verifications
    const filteredVerifications = verifications.filter((v) => {
        const matchesSearch =
            v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        const matchesType = typeFilter === 'all' || v.documentType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Stats
    const stats = {
        total: verifications.length,
        pending: verifications.filter((v) => v.status === 'pending').length,
        approved: verifications.filter((v) => v.status === 'approved').length,
        rejected: verifications.filter((v) => v.status === 'rejected').length,
    };

    const handleView = (v: Verification) => {
        setSelectedVerification(v);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifications</h1>
                    <p className="text-slate-500">Review and approve identity verification requests</p>
                </div>
                <Button variant="outline">
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
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-200">
                                <Clock className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                                <p className="text-xs text-amber-700">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                                <p className="text-xs text-slate-500">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                                <p className="text-xs text-slate-500">Rejected</p>
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
                                placeholder="Search by name or ID..."
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
                                <SelectItem value="more_info_needed">Info Required</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Document Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="id_card">ID Card</SelectItem>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="business_license">Business License</SelectItem>
                                <SelectItem value="address_proof">Address Proof</SelectItem>
                                <SelectItem value="tax_document">Tax Document</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
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
                            {filteredVerifications.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-slate-400 to-slate-500 text-white">
                                                    {v.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900">{v.userName}</p>
                                                <p className="text-xs text-slate-500 capitalize">{v.type}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {v.type === 'business' ? (
                                            <Building2 className="h-4 w-4 text-purple-500" />
                                        ) : (
                                            <User className="h-4 w-4 text-blue-500" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DocTypeBadge type={v.documentType} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={v.status} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-500">
                                            {new Date(v.submittedAt).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleView(v)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredVerifications.length === 0 && (
                        <div className="p-8 text-center">
                            <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No verifications found</h3>
                            <p className="text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <VerificationDetailSheet
                verification={selectedVerification}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={() => setSheetOpen(false)}
                onReject={() => {
                    setRejectDialogOpen(true);
                }}
                onRequestInfo={() => setSheetOpen(false)}
            />

            {/* Reject Dialog */}
            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={() => {
                    setRejectDialogOpen(false);
                    setSheetOpen(false);
                }}
            />
        </div>
    );
}
