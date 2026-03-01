'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    useGetAllBookings,
    useRefundBooking,
} from '@/service/bookings/hook';
import { Booking } from '@/service/bookings/types';
import {
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar as CalendarIcon,
    RefreshCcw,
    PoundSterling,
    User,
    Building2,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Status Badge
function BookingStatusBadge({ status }: { status: Booking['status'] }) {
    const config: Record<string, { label: string; className: string; icon: any }> = {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
        approved: { label: 'Approved', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
        confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        declined: { label: 'Declined', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
        completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: RefreshCcw },
    };

    const style = config[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
    const Icon = style.icon;

    return (
        <Badge variant="outline" className={cn('font-medium gap-1 uppercase text-[10px]', style.className)}>
            <Icon className="h-3 w-3" />
            {style.label}
        </Badge>
    );
}

// Booking Detail Sheet
function BookingDetailSheet({
    booking,
    open,
    onOpenChange,
    onRefund,
    isRefunding,
}: {
    booking: Booking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefund: (id: string) => void;
    isRefunding: boolean;
}) {
    if (!booking) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                       <SheetTitle className="text-xl">Booking #{booking.id.slice(0,8)}</SheetTitle>
                       <BookingStatusBadge status={booking.status} />
                    </div>
                    <SheetDescription className="mt-2">
                        Created on {format(new Date(booking.createdAt), 'PPP')}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pt-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1 font-medium">Total Paid</p>
                        <p className="text-2xl font-bold text-slate-900">
                        £{(booking.totalAmount || booking.payment?.amount || 0).toFixed(2)}
                        </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">Escrow Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                {booking.payoutProcessed ? (
                                     <Badge className="bg-emerald-100 text-emerald-700">Paid Out</Badge>
                                ) : booking.refundProcessed ? (
                                     <Badge className="bg-purple-100 text-purple-700">Refunded</Badge>
                                ) : (
                                     <Badge className="bg-amber-100 text-amber-700">In Escrow</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Schedule</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{format(new Date(booking.startTime), 'PPP')}</p>
                                <p className="text-xs text-slate-500">{format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Entities */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Involved Parties</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Customer</p>
                                    <p className="font-semibold text-slate-900 text-sm">{booking.user?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Provider</p>
                                    <p className="font-semibold text-slate-900 text-sm">{booking.service?.business?.businessName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Service Info</h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <span className="font-semibold block mb-1">{booking.service?.name}</span>
                           {booking.service?.description}
                        </p>
                    </div>

                    {/* Financial Breakdown */}
                    {booking.totalAmount !== undefined && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-900">Financial Breakdown</h4>
                            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                <div className="flex items-center justify-between p-3 text-sm">
                                    <span className="text-slate-500">Gross Total</span>
                                    <span className="font-medium text-slate-700">£{booking.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 text-sm">
                                    <span className="text-slate-500">Platform Commission</span>
                                    <span className="font-medium text-red-600">- £{(booking.commissionAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 text-sm bg-slate-50">
                                    <span className="text-slate-700 font-bold">Provider Payout</span>
                                    <span className="font-bold text-emerald-600">£{(booking.providerAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-6 sticky bottom-0 bg-white pb-6 border-t mt-6">
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => onRefund(booking.id)}
                            disabled={isRefunding || booking.payoutProcessed || booking.refundProcessed || (booking.status !== 'confirmed' && booking.status !== 'cancelled')}
                        >
                            {isRefunding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                            Force Refund Customer
                        </Button>
                        <p className="text-xs text-slate-500 text-center px-4">
                            Refunding will reverse the escrow balance and return funds to the customer. This cannot be undone.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function AdminBookingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Hooks
    const { data: bookingsList = [], isLoading } = useGetAllBookings();
    const refundMutation = useRefundBooking();

    // Client-side filtering for simplicity (assuming backend doesn't paginate yet based on the hook)
    const filteredBookings = bookingsList.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleView = (b: Booking) => {
        setSelectedBooking(b);
        setSheetOpen(true);
    };

    const handleRefund = (id: string) => {
        if (window.confirm('Are you absolutely sure you want to force a refund for this booking?')) {
            refundMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bookings & Escrow</h1>
                    <p className="text-slate-500">Manage all platform service bookings and held funds</p>
                </div>
            </div>

            {/* Search & Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by ID, customer, or service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="confirmed">Confirmed (Paid)</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" className="text-slate-500" onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-8 w-20 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <span className="font-mono text-xs text-slate-600">{booking.id.slice(0,8)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-900">{booking.service?.name}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{booking.user?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                                                    <span className="text-xs text-slate-500">{format(new Date(booking.startTime), 'HH:mm')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">£{(booking.totalAmount || booking.payment?.amount || 0).toFixed(2)}</span>
                                                    {booking.payoutProcessed && <span className="text-[10px] text-emerald-600 font-bold">PAID OUT</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {booking.payment ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                                        PAID
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                        UNPAID
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <BookingStatusBadge status={booking.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleView(booking)}>
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!isLoading && filteredBookings.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                                <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">No bookings found</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Adjust your filters or search terms.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <BookingDetailSheet
                booking={selectedBooking}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onRefund={handleRefund}
                isRefunding={refundMutation.isPending}
            />
        </div>
    );
}