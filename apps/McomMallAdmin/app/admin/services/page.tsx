'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    useGetAdminServiceStats,
    useGetAllAdminServices,
    useDeleteService,
    useDeactivateService,
    useActivateService
} from '@/service/services/hook';
import { AdminService } from '@/service/services/types';
import {
    Search,
    Plus,
    Download,
    Eye,
    Briefcase,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    Archive,
    Trash2,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminServiceStatus = AdminService['status'];

function getServiceDisplayStatus(service: AdminService): AdminServiceStatus {
    if (service.approvalStatus === 'pending') return 'pending';
    if (service.approvalStatus === 'rejected') return 'rejected';
    if (service.adminDisabled) return 'delisted';
    return service.status;
}

// Status Badge
function ServiceStatusBadge({ status }: { status: AdminServiceStatus }) {
    const config = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
        pending: { label: 'Pending approval', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        delisted: { label: 'Delisted', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Archive },
    };

    const { label, className, icon: Icon } = config[status];

    return (
        <Badge variant="outline" className={cn('font-medium gap-1', className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

// Service Detail Sheet
function ServiceDetailSheet({
    service,
    open,
    onOpenChange,
    onDelete,
    onDeactivate,
    onActivate,
    isDeleting,
    isDeactivating,
    isActivating,
}: {
    service: AdminService | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (id: string) => void;
    onDeactivate: (id: string) => void;
    onActivate: (id: string) => void;
    isDeleting: boolean;
    isDeactivating: boolean;
    isActivating: boolean;
}) {
    if (!service) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 gap-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b pr-12">
                    <SheetTitle className="text-xl">{service.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-2">
                        <ServiceStatusBadge status={getServiceDisplayStatus(service)} />
                        <Badge variant="secondary">{service.category}</Badge>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Image Preview */}
                    <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden relative border">
                        {service.images?.[0] ? (
                            <img
                                src={service.images[0]}
                                alt={service.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Briefcase className="h-16 w-16 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">Price</p>
                            <p className="text-2xl font-bold text-slate-900">£{service.price.toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">Duration</p>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <p className="text-2xl font-bold text-slate-900">
                                    {service.duration} min
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Provider</h4>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 truncate">{service.businessName}</p>
                                <p className="text-xs text-slate-500 truncate">ID: {service.businessId}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-blue-600">
                                View Business
                            </Button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                            {service.description}
                        </p>
                    </div>

                    {/* Details List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Service Details</h4>
                        <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Service ID</span>
                                <span className="font-mono text-slate-700">{service.id}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Category</span>
                                <span className="font-medium text-slate-700">{service.category}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Listed On</span>
                                <span className="text-slate-700">{new Date(service.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t bg-white p-6 space-y-2">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800">
                        Edit Service
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className={service.status === 'inactive' ? 'text-emerald-700 hover:text-emerald-800 border-emerald-100 hover:bg-emerald-50' : 'text-slate-600'}
                                onClick={() => {
                                    if (!service.id) return;
                                    if (service.status === 'inactive') {
                                        onActivate(service.id);
                                    } else {
                                        onDeactivate(service.id);
                                    }
                                }}
                                disabled={isDeleting || isDeactivating || isActivating}
                            >
                                {isDeactivating || isActivating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : service.status === 'inactive' ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <Archive className="h-4 w-4 mr-2" />
                                )}
                                {service.status === 'inactive' ? 'Activate' : 'Deactivate'}
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                                onClick={() => service.id && onDelete(service.id)}
                                disabled={isDeleting || isDeactivating || isActivating}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                Delete
                            </Button>
                        </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function ServicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [selectedService, setSelectedService] = useState<AdminService | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Hooks
    const { data: stats, isLoading: statsLoading } = useGetAdminServiceStats();
    const { data: servicesData, isLoading: servicesLoading } = useGetAllAdminServices({
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page,
        limit,
    });
    const deleteMutation = useDeleteService();
    const deactivateMutation = useDeactivateService();
    const activateMutation = useActivateService();

    const servicesList = servicesData?.data || [];
    const totalPages = servicesData?.totalPages || 1;
    const sheetService = selectedService
        ? servicesList.find(s => s.id === selectedService.id) ?? selectedService
        : null;

    const handleView = (s: AdminService) => {
        setSelectedService(s);
        setSheetOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleDeactivate = (id: string) => {
        deactivateMutation.mutate(id);
    };

    const handleActivate = (id: string) => {
        activateMutation.mutate(id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                    <p className="text-slate-500">Manage professional services and bookings</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" asChild>
                        <Link href="/admin/services/add">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Service
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Briefcase className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-900">{statsLoading ? '...' : stats?.total || 0}</p>
                                <p className="text-xs text-indigo-600 font-medium lowercase">Total Services</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-900">
                                    {statsLoading ? '...' : stats?.active || 0}
                                </p>
                                <p className="text-xs text-emerald-600 font-medium lowercase">Active Services</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-900">
                                    {statsLoading ? '...' : stats?.avgDuration || 0} min
                                </p>
                                <p className="text-xs text-amber-600 font-medium lowercase">Avg. Duration</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search services, providers or IDs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending approval</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="delisted">Delisted</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Spa">Spa</SelectItem>
                                    <SelectItem value="Auto Services">Auto Services</SelectItem>
                                    <SelectItem value="Tech Services">Tech Services</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" className="text-slate-500" onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setCategoryFilter('all');
                            }}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[300px]">Service</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {servicesLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="h-10 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-8 bg-slate-100 animate-pulse rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    servicesList.map((service) => (
                                        <TableRow key={service.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {service.images?.[0] ? (
                                                            <img src={service.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium text-slate-900 truncate">{service.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono">{service.id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{service.businessName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-normal border-slate-200">
                                                    {service.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-slate-900">£{service.price.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {service.duration} min
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ServiceStatusBadge status={getServiceDisplayStatus(service)} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleView(service)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!servicesLoading && servicesList.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                                <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">No services found</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Try adjusting your search or filters to find what you&apos;re looking for.
                            </p>
                            <Button variant="link" className="text-orange-600 mt-2" onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setCategoryFilter('all');
                                setPage(1);
                            }}>
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination placeholder if needed */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-slate-500">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Service Detail Sheet */}
            <ServiceDetailSheet
                service={sheetService}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onDelete={handleDelete}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                isDeleting={deleteMutation.isPending}
                isDeactivating={deactivateMutation.isPending}
                isActivating={activateMutation.isPending}
            />
        </div>
    );
}
