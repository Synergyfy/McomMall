'use client';

import { useState } from 'react';
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
    useGetAdminProductStats,
    useGetAllAdminProducts,
    useDeactivateProduct,
    useDeleteProduct
} from '@/service/product/hook';
import { AdminProduct } from '@/service/product/types';
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
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, FormProvider } from 'react-hook-form';
import { VariantManager } from '@/app/admin/components/products/VariantManager';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Status Badge
function ProductStatusBadge({ status }: { status: AdminProduct['status'] }) {
    const config = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
        out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
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
    onDeactivate,
    onDelete,
    isDeactivating,
    isDeleting,
}: {
    product: AdminProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeactivate: (id: string) => void;
    onDelete: (id: string) => void;
    isDeactivating: boolean;
    isDeleting: boolean;
}) {
    if (!product) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="text-xl">{product.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-2">
                        <ProductStatusBadge status={product.status} />
                        <Badge variant="secondary">{product.category}</Badge>
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pt-6">
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
                            <div>
                                <p className="font-semibold text-slate-900">{product.businessName}</p>
                                <p className="text-xs text-slate-500">ID: {product.businessId}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto text-orange-600">
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

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-6 sticky bottom-0 bg-white pb-6 border-t mt-6">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800">
                            Edit Product
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="text-slate-600"
                                onClick={() => product.id && onDeactivate(product.id)}
                                disabled={isDeactivating || isDeleting || product.status === 'inactive'}
                            >
                                {isDeactivating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
                                Deactivate
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                                onClick={() => product.id && onDelete(product.id)}
                                disabled={isDeactivating || isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [createSheetOpen, setCreateSheetOpen] = useState(false);

    // Create Product Form
    const createMethods = useForm({
        defaultValues: {
            title: '',
            description: '',
            basePrice: 0,
            attributes: [],
            variations: []
        }
    });

    const handleCreateProduct = (data: any) => {
        // In a real app, this would call a mutation
        console.log('Creating product:', data);
        setCreateSheetOpen(false);
        createMethods.reset();
    };

    // Hooks
    const { data: stats, isLoading: statsLoading } = useGetAdminProductStats();
    const { data: productsData, isLoading: productsLoading } = useGetAllAdminProducts({
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page,
        limit,
    });
    const deactivateMutation = useDeactivateProduct();
    const deleteMutation = useDeleteProduct();

    const productsList = productsData?.data || [];
    const totalPages = productsData?.totalPages || 1;

    const handleView = (p: AdminProduct) => {
        setSelectedProduct(p);
        setSheetOpen(true);
    };

    const handleDeactivate = (id: string) => {
        deactivateMutation.mutate(id);
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
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => setCreateSheetOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
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

            {/* Search & Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search products, businesses or IDs..."
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
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Fashion">Fashion</SelectItem>
                                    <SelectItem value="Home">Home</SelectItem>
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

            {/* Products Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[300px]">Product</TableHead>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsLoading ? (
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
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{product.businessName}</span>
                                                </div>
                                            </TableCell>
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
                                                <ProductStatusBadge status={product.status} />
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

                    {!productsLoading && productsList.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                                <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
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

            {/* Product Detail Sheet */}
            <ProductDetailSheet
                product={selectedProduct}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
                isDeactivating={deactivateMutation.isPending}
                isDeleting={deleteMutation.isPending}
            />

            {/* Create Product Sheet */}
            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader className="pb-6 border-b">
                        <SheetTitle>Create New Product</SheetTitle>
                        <SheetDescription>
                            Add a new product with multiple variations to the catalog.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6">
                        <FormProvider {...createMethods}>
                            <form onSubmit={createMethods.handleSubmit(handleCreateProduct)} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Basic Information</h3>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label>Product Title</Label>
                                            <Input {...createMethods.register('title')} placeholder="e.g. Premium Cotton T-Shirt" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea {...createMethods.register('description')} placeholder="Product description..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Base Price (£)</Label>
                                            <Input type="number" {...createMethods.register('basePrice')} className="w-32" />
                                        </div>
                                    </div>
                                </div>

                                {/* Variants */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Variants & Inventory</h3>
                                    </div>
                                    <VariantManager />
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <Button variant="outline" type="button" onClick={() => setCreateSheetOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                                        Create Product
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
