'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useGetAdminReviews, usePublishReview, useUnpublishReview } from '@/service/reviews/hook';
import { Review } from '@/service/reviews/types';
import {
    Search,
    MoreHorizontal,
    Star,
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageSquare,
    Store,
    ShoppingCart,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Status Badge Component
function StatusBadge({ status }: { status: string | undefined }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        PUBLISHED: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        UNPUBLISHED: { label: 'Unpublished', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        unpublished: { label: 'Unpublished', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        ARCHIVED: { label: 'Archived', className: 'bg-red-100 text-red-700 border-red-200' },
        archived: { label: 'Archived', className: 'bg-red-100 text-red-700 border-red-200' },
    };

    const config = statusConfig[status || 'PENDING'] || { label: status || 'Unknown', className: 'bg-slate-100 text-slate-700 border-slate-200' };

    return (
        <Badge variant="outline" className={cn('font-medium', config.className)}>
            {config.label}
        </Badge>
    );
}

export default function ReviewsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Queries
    const { data: reviewsResponse, isLoading: reviewsLoading } = useGetAdminReviews(page, limit, searchQuery);
    const publishMutation = usePublishReview();
    const unpublishMutation = useUnpublishReview();

    const reviews = reviewsResponse?.data || [];
    const totalPages = reviewsResponse?.meta?.totalPages || 1;
    const totalReviews = reviewsResponse?.meta?.totalItems || 0;

    const handlePublish = (id: string) => {
        publishMutation.mutate(id, {
            onSuccess: () => toast.success('Review published successfully'),
            onError: () => toast.error('Failed to publish review'),
        });
    };

    const handleUnpublish = (id: string) => {
        unpublishMutation.mutate(id, {
            onSuccess: () => toast.success('Review unpublished successfully'),
            onError: () => toast.error('Failed to unpublish review'),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
                    <p className="text-slate-500">Manage customer reviews and ratings</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by content or author..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="w-[30%]">Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviewsLoading ? (
                                    Array(limit).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="h-10 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-full bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : reviews.map((review) => (
                                    <TableRow key={review.id} className="hover:bg-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={review.user?.profilePictureUrl || undefined} />
                                                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                                        {review.user?.name?.slice(0, 2).toUpperCase() || 'NA'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm text-slate-900">{review.user?.name || 'Anonymous'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {review.business && (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Store className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium">{review.business.businessName}</span>
                                                    </div>
                                                )}
                                                {review.product && (
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium">{review.product.title}</span>
                                                    </div>
                                                )}
                                                {review.service && (
                                                    <div className="flex items-center gap-2 text-orange-600">
                                                        <Briefcase className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium">{review.service.name}</span>
                                                    </div>
                                                )}
                                                {!review.business && !review.product && !review.service && (
                                                    <span className="text-xs text-slate-400">General</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                <span className="font-medium text-slate-900">{review.rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-slate-600 line-clamp-2" title={review.comment}>
                                                {review.comment}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={review.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                                            </div>
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
                                                    <DropdownMenuItem onClick={() => handlePublish(review.id)}>
                                                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                                        Publish
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUnpublish(review.id)}>
                                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                        Unpublish
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {!reviewsLoading && reviews.length === 0 && (
                        <div className="p-8 text-center border-t">
                            <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No reviews found</h3>
                            <p className="text-slate-500">Try adjusting your search</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{reviews.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(page * limit, totalReviews)}</span> of <span className="font-medium">{totalReviews}</span> reviews
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || reviewsLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className={cn("w-8 h-8 p-0", page === pageNum && "bg-orange-500 hover:bg-orange-600")}
                                            onClick={() => setPage(pageNum)}
                                            disabled={reviewsLoading}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || reviewsLoading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
