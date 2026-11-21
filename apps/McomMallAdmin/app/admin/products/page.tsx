'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    useGetAdminProductStats,
    useGetAllAdminProducts,
    useDeactivateProduct,
    useActivateProduct,
    useDeleteProduct
} from '@/service/product/hook';
import { AdminProduct } from '@/service/product/types';
import { clearAuthCookies } from '@/lib/auth-cookies';
import {
    useApproveModeration,
    useRejectModeration,
} from '@/service/moderation/hook';
import { moderationApi } from '@/service/moderation/api';
import {
    Search,
    Plus,
    Download,
    Eye,
    MoreHorizontal,
    Package,
    Building2,
    Tag,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Archive,
    Trash2,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdminCreatedProduct } from '@/lib/platform-business';

type ProductOrigin = 'admin' | 'business';

const PAGE_SIZE = 10;

function getProductDisplayStatus(product: AdminProduct): string {
    if (product.approvalStatus === 'pending') return 'pending';
    if (product.approvalStatus === 'rejected') return 'rejected';
    if (product.adminDisabled) return 'delisted';
    return product.status;
}

// Status Badge
function ProductStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
        out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
        pending: { label: 'Pending approval', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle },
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

// Product Detail Sheet
function ProductDetailSheet({
    product,
    open,
    onOpenChange,
    onApprove,
    onReject,
    onDeactivate,
    onActivate,
    onDelete,
    isApproving,
    isRejecting,
    isDeactivating,
    isActivating,
    isDeleting,
}: {
    product: AdminProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDeactivate: (id: string) => void;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
    isDeactivating: boolean;
    isActivating: boolean;
    isDeleting: boolean;
}) {
    if (!product) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 gap-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b pr-12">
                    <SheetTitle className="text-xl">{product.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-2">
                        <ProductStatusBadge status={getProductDisplayStatus(product)} />
                        <Badge variant="secondary">{product.category}</Badge>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Image Preview */}
                    <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative border">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-16 w-16 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">Price</p>
                            <p className="text-2xl font-bold text-slate-900">£{product.price.toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">Stock Level</p>
                            <p className={cn(
                                "text-2xl font-bold",
                                product.stock <= 10 ? "text-red-600" : "text-slate-900"
                            )}>
                                {product.stock} units
                            </p>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Sold by</h4>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 truncate">{product.businessName}</p>
                                <p className="text-xs text-slate-500 truncate">ID: {product.businessId}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-orange-600">
                                View Business
                            </Button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                            {product.description}
                        </p>
                    </div>

                    {/* Details List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Product Details</h4>
                        <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Product ID</span>
                                <span className="font-mono text-slate-700">{product.id}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Category</span>
                                <span className="font-medium text-slate-700">{product.category}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 text-sm">
                                <span className="text-slate-500">Created At</span>
                                <span className="text-slate-700">{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t bg-white p-6 space-y-2">
                    {product.approvalStatus === 'pending' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => onApprove(product.id)}
                                disabled={isApproving || isRejecting || isDeactivating || isActivating || isDeleting}
                            >
                                {isApproving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Approve
                            </Button>
                            <Button
                                variant="outline"
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                onClick={() => onReject(product.id)}
                                disabled={isApproving || isRejecting || isDeactivating || isActivating || isDeleting}
                            >
                                {isRejecting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Reject
                            </Button>
                        </div>
                    )}
                    <Button className="w-full bg-slate-900 hover:bg-slate-800">
                        Edit Product
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className={product.status === 'inactive' ? 'text-emerald-700 hover:text-emerald-800 border-emerald-100 hover:bg-emerald-50' : 'text-slate-600'}
                                onClick={() => {
                                    if (!product.id) return;
                                    if (product.status === 'inactive') {
                                        onActivate(product.id);
                                    } else {
                                        onDeactivate(product.id);
                                    }
                                }}
                                disabled={isDeactivating || isActivating || isDeleting}
                            >
                                {isDeactivating || isActivating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : product.status === 'inactive' ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <Archive className="h-4 w-4 mr-2" />
                                )}
                                {product.status === 'inactive' ? 'Activate' : 'Deactivate'}
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                                onClick={() => product.id && onDelete(product.id)}
                                disabled={isDeactivating || isActivating || isDeleting}
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

export default function ProductsPage() {
    const router = useRouter();
    const [origin, setOrigin] = useState<ProductOrigin>('business');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
    const [bulkPhase, setBulkPhase] = useState<'idle' | 'approving'>('idle');
    const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

    useEffect(() => {
        setPage(1);
    }, [origin, searchQuery, statusFilter, categoryFilter]);

    // Hooks
    const queryClient = useQueryClient();
    const {
        data: stats,
        isLoading: statsLoading,
        isError: statsError,
        refetch: refetchStats,
    } = useGetAdminProductStats();
    const approveProduct = useApproveModeration();
    const rejectProduct = useRejectModeration();

    const bulkRunning = bulkPhase !== 'idle';

    // Fetch the filtered catalog in one page so the side filter counts and local
    // pagination stay accurate without changing the admin API.
    const catalogLimit = Math.max(stats?.total ?? 100, 1);
    const {
        data: productsData,
        isLoading: productsLoading,
        isError: productsError,
        refetch: refetchProducts,
    } = useGetAllAdminProducts({
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page: 1,
        limit: catalogLimit,
    });
    const deactivateMutation = useDeactivateProduct();
    const activateMutation = useActivateProduct();
    const deleteMutation = useDeleteProduct();

    const catalogLoadError = statsError || productsError;
    const tableColSpan = origin === 'business' ? 7 : 6;

    const retryCatalog = () => {
        void refetchStats();
        void refetchProducts();
    };

    const signInAgain = () => {
        clearAuthCookies();
        router.replace('/');
    };

    const allProducts = productsData?.data ?? [];
    const adminProducts = allProducts.filter((product) => isAdminCreatedProduct(product.businessId));
    const businessProducts = allProducts.filter((product) => !isAdminCreatedProduct(product.businessId));
    const originCounts: Record<ProductOrigin, number> = {
        admin: adminProducts.length,
        business: businessProducts.length,
    };
    const originProducts = origin === 'admin' ? adminProducts : businessProducts;
    const pendingProductsInScope = originProducts.filter(
        (product) => product.approvalStatus === 'pending',
    );
    const pendingInScopeCount = pendingProductsInScope.length;
    const scopeLabel = [
        origin === 'admin' ? 'Admin-created' : 'Business-created',
        searchQuery.trim() ? `search "${searchQuery.trim()}"` : null,
        categoryFilter !== 'all' ? `category ${categoryFilter}` : null,
        statusFilter !== 'all' ? `status ${statusFilter}` : null,
    ].filter(Boolean).join(' · ');
    const totalPages = Math.max(1, Math.ceil(originProducts.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const productsList = originProducts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const sheetProduct = selectedProduct
        ? productsList.find(p => p.id === selectedProduct.id) ?? selectedProduct
        : null;

    const handleView = (p: AdminProduct) => {
        setSelectedProduct(p);
        setSheetOpen(true);
    };

    const invalidateProductQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_PRODUCTS'] });
        queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_PRODUCT_STATS'] });
    };

    const handleApprove = (id: string) => {
        approveProduct.mutate(
            { resource: 'products', id },
            {
                onSuccess: () => {
                    invalidateProductQueries();
                    setSheetOpen(false);
                },
            },
        );
    };

    const handleReject = (id: string) => {
        rejectProduct.mutate(
            { resource: 'products', id },
            {
                onSuccess: () => {
                    invalidateProductQueries();
                    setSheetOpen(false);
                },
            },
        );
    };

    const handleBulkApprove = async () => {
        const ids = pendingProductsInScope.map((product) => product.id);
        if (ids.length === 0) {
            setBulkConfirmOpen(false);
            return;
        }

        setBulkPhase('approving');
        setBulkProgress({ done: 0, total: ids.length });
        let done = 0;
        const concurrency = 8;

        try {
            for (let index = 0; index < ids.length; index += concurrency) {
                const batch = ids.slice(index, index + concurrency);
                await Promise.all(
                    batch.map((id) => moderationApi.approve('products', id)),
                );
                done += batch.length;
                setBulkProgress({ done, total: ids.length });
            }
            invalidateProductQueries();
            queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
            toast.success(`Approved ${done} ${done === 1 ? 'product' : 'products'}.`);
            setBulkConfirmOpen(false);
        } catch (error) {
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            toast.error(
                err.response?.data?.message || err.message || 'Bulk approval failed.',
            );
        } finally {
            setBulkPhase('idle');
            setBulkProgress(null);
        }
    };

    const handleDeactivate = (id: string) => {
        deactivateMutation.mutate(id);
    };

    const handleActivate = (id: string) => {
        activateMutation.mutate(id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                    <p className="text-slate-500">Manage all catalog products across the platform</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setBulkConfirmOpen(true)}
                        disabled={pendingInScopeCount === 0 || bulkRunning}
                    >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        {bulkPhase === 'approving' && bulkProgress
                            ? `Approving ${bulkProgress.done}/${bulkProgress.total}`
                            : `Approve all products (${pendingInScopeCount})`}
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        asChild
                    >
                        <Link href="/admin/products/add">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{statsLoading ? '...' : stats?.total || 0}</p>
                                <p className="text-xs text-blue-600 font-medium lowercase">Total Products</p>
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
                                <p className="text-xs text-emerald-600 font-medium lowercase">Active Items</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-900">
                                    {statsLoading ? '...' : stats?.outOfStock || 0}
                                </p>
                                <p className="text-xs text-red-600 font-medium lowercase">Out of Stock</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {catalogLoadError && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">
                                    Products could not be loaded
                                </p>
                                <p className="text-sm text-red-700">
                                    Your admin session may have expired. The catalog data is still available; retry or sign in again.
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button variant="outline" onClick={retryCatalog}>
                                Retry
                            </Button>
                            <Button onClick={signInAgain}>Sign in again</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search & Filters — no wrapper background, just the controls themselves */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search products, businesses or IDs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-10"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending approval</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="delisted">Delisted</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9 w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Home">Home</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" className="h-9 text-slate-500" onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                    }}>
                        Reset
                    </Button>
                </div>
            </div>

            {/* Products Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex">
                        {/* Side filter — lives inside the table, not above it */}
                        <aside className="w-[168px] shrink-0 border-r border-slate-100 bg-slate-50/80 p-3">
                            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Product source
                            </p>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setOrigin('business')}
                                    aria-pressed={origin === 'business'}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                                        origin === 'business'
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-orange-200'
                                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                                    )}
                                >
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 text-left">Business</span>
                                    <span className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        origin === 'business'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-slate-200 text-slate-600'
                                    )}>
                                        {originCounts.business}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOrigin('admin')}
                                    aria-pressed={origin === 'admin'}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                                        origin === 'admin'
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-orange-200'
                                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                                    )}
                                >
                                    <Package className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 text-left">Admin</span>
                                    <span className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        origin === 'admin'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-slate-200 text-slate-600'
                                    )}>
                                        {originCounts.admin}
                                    </span>
                                </button>
                            </div>
                        </aside>

                        <div className="min-w-0 flex-1">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="w-[240px]">Product</TableHead>
                                            {origin === 'business' && <TableHead>Business</TableHead>}
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {catalogLoadError ? (
                                            <TableRow>
                                                <TableCell colSpan={tableColSpan} className="py-16 text-center text-sm text-slate-500">
                                                    Unable to load products. Use the retry action above.
                                                </TableCell>
                                            </TableRow>
                                        ) : productsLoading ? (
                                            Array.from({ length: tableColSpan }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={1}>
                                                        <div className="h-6 bg-slate-100 animate-pulse rounded" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            productsList.map((product) => (
                                                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {product.images?.[0] ? (
                                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-medium text-slate-900 truncate">{product.name}</span>
                                                                <span className="text-xs text-slate-500 font-mono">{product.id}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {origin === 'business' && (
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                                <span className="text-sm text-slate-700">{product.businessName}</span>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs font-normal border-slate-200">
                                                            {product.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-slate-900">£{product.price.toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className={cn(
                                                                "text-sm font-medium",
                                                                product.stock <= 10 ? "text-red-600" : "text-slate-700"
                                                            )}>
                                                                {product.stock}
                                                            </span>
                                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full",
                                                                        product.stock <= 10 ? "bg-red-500" : "bg-emerald-500"
                                                                    )}
                                                                    style={{ width: `${Math.min(product.stock, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ProductStatusBadge status={getProductDisplayStatus(product)} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleView(product)}>
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
        
                            {!catalogLoadError && !productsLoading && productsList.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                                        <Search className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        No {origin === 'admin' ? 'admin-created' : 'business-created'} products found
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Try adjusting your filters, or switch the product source on the left.
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination placeholder if needed */}
            {!catalogLoadError && totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-slate-500">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Bulk approve confirmation */}
            <Dialog
                open={bulkConfirmOpen}
                onOpenChange={(open) => {
                    if (!open && !bulkRunning) setBulkConfirmOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve all products</DialogTitle>
                        <DialogDescription>
                            This will approve {pendingInScopeCount} pending{' '}
                            {pendingInScopeCount === 1 ? 'product' : 'products'} in{' '}
                            <span className="font-semibold text-slate-700">{scopeLabel}</span>.
                            Products that are already approved are skipped. It runs through the
                            existing single-item approval action, so large sets may take a while.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkConfirmOpen(false)}
                            disabled={bulkRunning}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleBulkApprove}
                            disabled={bulkRunning}
                        >
                            {bulkRunning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Approve {pendingInScopeCount}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Detail Sheet */}
            <ProductDetailSheet
                product={sheetProduct}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                onDelete={handleDelete}
                isApproving={approveProduct.isPending}
                isRejecting={rejectProduct.isPending}
                isDeactivating={deactivateMutation.isPending}
                isActivating={activateMutation.isPending}
                isDeleting={deleteMutation.isPending}
            />

        </div>
    );
}
