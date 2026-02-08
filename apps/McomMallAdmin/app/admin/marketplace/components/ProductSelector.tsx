'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/service/products';
import { Check, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface ProductSelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function ProductSelector({ selectedIds, onChange }: ProductSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [page, setPage] = React.useState(1);
    const pageSize = 10;

    // Debounce search term
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading } = useQuery({
        queryKey: ['products', debouncedSearch, page],
        queryFn: () => getProducts({
            status: 'active',
            search: debouncedSearch,
            page: page,
            limit: pageSize
        }),
    });

    const products = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const handleToggle = (productId: string) => {
        if (selectedIds.includes(productId)) {
            onChange(selectedIds.filter(id => id !== productId));
        } else {
            onChange([...selectedIds, productId]);
        }
    };

    const handleRemove = (productId: string) => {
        onChange(selectedIds.filter(id => id !== productId));
    };

    // To display names of selected products that might not be in the current page,
    // we ideally need to fetch them. For now, we will fallback to displaying ID if not found.
    // NOTE: In a real app, you might want to fetch selected products specifically to show their names.
    // We can try to match from the current list if available.
    // Or we could persist the product objects instead of just IDs, but the props are `ids`.

    // We can optimize this later by fetching details for selected IDs.
    // For now, we rely on the fact that the user likely just selected them,
    // OR we show ID as fallback.
    // If we want to be fancy, we can keep a cache of seen products in a ref or state.

    // Let's assume for this iteration that displaying ID is acceptable if not in current view,
    // OR (better) we try to find it in the current `products` list.
    // If we really want to show names always, we'd need `useQueries` or a bulk fetch for selected IDs.

    // Use a ref to cache known products to show names even when off-page
    const productCache = React.useRef<Map<string, Product>>(new Map());

    // Update cache when we get new data
    React.useEffect(() => {
        if (products.length > 0) {
            products.forEach(p => productCache.current.set(p.id, p));
        }
    }, [products]);

    const selectedProductBadges = selectedIds.map(id => {
        const product = productCache.current.get(id) || products.find(p => p.id === id);
        return {
            id,
            name: product?.name || id
        };
    });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProductBadges.map((product) => (
                    <Badge key={product.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        <span className="truncate max-w-[200px]">{product.name}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent text-muted-foreground hover:text-foreground ml-1"
                            onClick={() => handleRemove(product.id)}
                            type="button"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    </Badge>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        data-testid="product-selector-trigger"
                    >
                        <span>{selectedIds.length > 0 ? `${selectedIds.length} products selected` : "Select products..."}</span>
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl flex flex-col h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Select Products</DialogTitle>
                        <DialogDescription>
                            Search and select products to include in this section.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 flex-1 flex flex-col min-h-0">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <div className="flex-1 border rounded-md overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Business</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                                Loading products...
                                            </TableCell>
                                        </TableRow>
                                    ) : products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No products found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => {
                                            const isSelected = selectedIds.includes(product.id);
                                            return (
                                                <TableRow
                                                    key={product.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleToggle(product.id)}
                                                >
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleToggle(product.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {/* We could add image here if available */}
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.businessName}</TableCell>
                                                    <TableCell className="text-right">${product.price}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                            <Button onClick={() => setOpen(false)} className="ml-4 bg-orange-500 hover:bg-orange-600">
                                Done
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
