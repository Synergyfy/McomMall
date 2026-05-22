'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    MapPin,
    Building2,
    ListChecks,
    Package,
    TrendingUp,
    Filter,
    Pin,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useGetAdminListingStats, useGetAdminListings, useUpdateListingStatus } from '@/service/listings/hook';
import { AdminListing } from '@/service/listings/types';
import { toast } from 'sonner';

// Status Badge Component
function ListingStatusBadge({ status }: { status: AdminListing['status'] }) {
    const statusConfig = {
        approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Edit },
    };

    const config = statusConfig[status] || {
        label: status || 'Unknown',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Clock,
    };
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn('font-medium gap-1', config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

// Listing Detail Sheet
function ListingDetailSheet({
    listing,
    open,
    onOpenChange,
    onApprove,
    onReject,
    updateStatusMutation,
}: {
    listing: AdminListing | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: () => void;
    onReject: () => void;
    updateStatusMutation: any;
}) {
    if (!listing) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-xl">{listing.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <ListingStatusBadge status={listing.status} />
                        {listing.featured && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                <Pin className="h-3 w-3 mr-1" />
                                Featured
                            </Badge>
                        )}
                    </SheetDescription>
                </SheetHeader>

                {/* Listing Image */}
                <div className="aspect-video rounded-lg bg-slate-100 mb-6 overflow-hidden">
                    {listing.images[0] ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Price & Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-slate-50">
                            <p className="font-bold text-lg text-slate-900">£{(listing.price ?? 0).toFixed(2)}</p>
                            <p className="text-xs text-slate-500">Price</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-slate-50">
                            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                                <Star className="h-4 w-4 fill-amber-500" />
                                <span className="font-bold">{(listing.rating ?? 0).toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-slate-500">Rating</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-slate-50">
                            <p className="font-bold text-slate-900">{listing.reviewCount ?? 0}</p>
                            <p className="text-xs text-slate-500">Reviews</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
                        <p className="text-sm text-slate-600">{listing.description}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Details</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Business</p>
                                    <p className="text-sm font-medium">{listing.businessName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <Package className="h-4 w-4 text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Category</p>
                                    <p className="text-sm font-medium">{listing.sector} → {listing.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <ListChecks className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Update Status</p>
                                        <p className="text-sm font-medium capitalise">{listing.status}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {listing.status !== 'approved' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-emerald-600 border-emerald-200"
                                            onClick={onApprove}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            Approve
                                        </Button>
                                    )}
                                    {listing.status !== 'rejected' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-red-600 border-red-200"
                                            onClick={onReject}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            Reject
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Location</p>
                                    <p className="text-sm font-medium">{listing.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {listing.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                            onClick={onApprove}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            onClick={onReject}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet >
    );
}

// Reject Dialog
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
                    <DialogTitle>Reject Listing</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this listing. This will be sent to the business owner.
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
                        Reject Listing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ListingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    // Fetch stats and listings
    const { data: statsData, isLoading: statsLoading } = useGetAdminListingStats();
    const { data: listingsData, isLoading: listingsLoading, error: listingsError } = useGetAdminListings();
    const updateStatusMutation = useUpdateListingStatus();

    const listings = listingsData?.data || [];

    // Filter listings
    const filteredListings = listings.filter((listing) => {
        const matchesSearch =
            listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Stats
    const stats = statsData || {
        total: 0,
        pending: 0,
        approved: 0,
        featured: 0,
    };

    // Get unique categories
    const categories = [...new Set(listings.map((l) => l.category))];

    const handleViewListing = (listing: AdminListing) => {
        setSelectedListing(listing);
        setSheetOpen(true);
    };

    const handleApprove = () => {
        if (!selectedListing) return;
        updateStatusMutation.mutate({
            id: selectedListing.id,
            status: 'approved',
            type: selectedListing.type as 'product' | 'service'
        });
        setSheetOpen(false);
    };

    const handleReject = () => {
        setRejectDialogOpen(true);
    };

    const handleConfirmReject = (reason: string) => {
        if (!selectedListing) return;
        updateStatusMutation.mutate({
            id: selectedListing.id,
            status: 'rejected',
            type: selectedListing.type as 'product' | 'service',
            reason
        });
        setRejectDialogOpen(false);
        setSheetOpen(false);
    };

    const handleExport = () => {
        if (!filteredListings || filteredListings.length === 0) {
            toast.error('No listing data available to export');
            return;
        }

        const exportData = filteredListings.map(l => ({
            ID: l.id,
            Title: l.title,
            Business: l.businessName,
            Category: l.category,
            Sector: l.sector,
            Price: (l.price ?? 0).toFixed(2),
            Status: l.status,
            Featured: l.featured ? 'Yes' : 'No',
            Rating: (l.rating ?? 0).toFixed(1),
            Reviews: l.reviewCount ?? 0,
            Location: l.location,
            Description: l.description,
        }));

        exportToCSV(exportData, `listings-export-${new Date().toISOString().split('T')[0]}`);
        toast.success('Listing data exported successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
                    <p className="text-slate-500">Manage and moderate all platform listings</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download listings as CSV</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <ListChecks className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total Listings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-200">
                                <Clock className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                                <p className="text-xs text-amber-700">Pending Review</p>
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
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Pin className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.featured}</p>
                                <p className="text-xs text-slate-500">Featured</p>
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
                                placeholder="Search listings..."
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
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Listings Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Listing</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredListings.map((listing) => (
                                <TableRow key={listing.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                {listing.images && listing.images[0] ? (
                                                    <img
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900">{listing.title}</p>
                                                    {listing.featured && (
                                                        <Pin className="h-3.5 w-3.5 text-orange-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">{listing.location}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{listing.businessName}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{listing.category}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">£{(listing.price ?? 0).toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <ListingStatusBadge status={listing.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleViewListing(listing)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Listing
                                                </DropdownMenuItem>
                                                {listing.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-emerald-600"
                                                            onClick={() => updateStatusMutation.mutate({
                                                                id: listing.id,
                                                                status: 'approved',
                                                                type: listing.type as 'product' | 'service'
                                                            })}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setSelectedListing(listing);
                                                                setRejectDialogOpen(true);
                                                            }}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => updateStatusMutation.mutate({
                                                        id: listing.id,
                                                        status: listing.status === 'approved' ? 'pending' : 'approved',
                                                        type: listing.type as 'product' | 'service'
                                                    })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    {updateStatusMutation.isPending &&
                                                        updateStatusMutation.variables?.id === listing.id ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 mr-2" />
                                                    )}
                                                    {listing.status === 'approved' ? 'Mark as Pending' : 'Approve Quick'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredListings.length === 0 && (
                        <div className="p-8 text-center">
                            <ListChecks className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No listings found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Listing Detail Sheet */}
            <ListingDetailSheet
                listing={selectedListing}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                updateStatusMutation={updateStatusMutation}
            />

            {/* Reject Dialog */}
            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleConfirmReject}
            />
        </div>
    );
}
