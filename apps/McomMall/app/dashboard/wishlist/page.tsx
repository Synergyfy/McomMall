'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Calendar,
  Trash2,
  Heart,
  PoundSterling,
  Info,
  Loader2,
  Sparkles,
  ChevronRight,
  RefreshCcw,
  Package,
  Wrench
} from 'lucide-react';
import { useGetWishlist, useRemoveFromWishlist } from '@/service/wishlist/hook';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getProductMainImage } from '@/lib/utils';

const WishlistPage = () => {
  const { data: wishlist, isLoading, isError, refetch, isFetching } = useGetWishlist();
  const { mutateAsync: removeItem, isPending: isRemoving } = useRemoveFromWishlist();

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Product removed from your wishlist.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  if (isLoading && !wishlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium text-lg">Fetching your wishlist...</p>
      </div>
    );
  }

  if (isError && !wishlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-3xl mb-6">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-2 opacity-50" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Failed to load wishlist</h2>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Something went wrong while retrieving your saved items.
          </p>
        </div>
        <Button onClick={() => refetch()} className="gap-2 rounded-2xl px-8 h-12 shadow-lg">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const wishlistItems = wishlist?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              My <span className="text-primary">Wishlist</span>
            </h1>
            {isFetching && <Loader2 className="h-6 w-6 animate-spin text-primary/60" />}
          </div>
          <p className="text-lg text-muted-foreground max-w-xl font-medium">
            Keep track of the products you love. Manifest your next purchase.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-2xl h-12 px-6 shadow-sm hover:shadow-md transition-all gap-2 font-bold border-2">
          <Link href="/marketplace">
            <ShoppingCart className="h-5 w-5" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden ring-1 ring-gray-100 dark:ring-zinc-800">
        <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                <Heart className="h-7 w-7 text-primary" fill="currentColor" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">Wishlisted Products</CardTitle>
                <p className="text-base text-muted-foreground mt-1">You have {wishlistItems.length} curated item{wishlistItems.length !== 1 ? 's' : ''}.</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 px-8 text-center bg-white dark:bg-zinc-950">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-primary-foreground p-10 rounded-[2.5rem] shadow-2xl group-hover:scale-105 transition-transform duration-700">
                  <Heart className="h-20 w-20 text-white" fill="white" />
                </div>
                <Sparkles className="absolute -top-4 -right-4 h-12 w-12 text-yellow-400 animate-bounce" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Your wishlist is empty</h3>
              <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed font-medium">
                Manifest your desires. Start exploring our collections and add products you love to this space.
              </p>
              <Button asChild size="lg" className="rounded-2xl h-16 px-12 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all gap-3 text-xl font-bold">
                <Link href="/marketplace">
                  Start Exploring
                  <ChevronRight className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/30 dark:bg-zinc-900/30">
                  <TableRow className="border-b border-gray-100 dark:border-zinc-800">
                    <TableHead className="py-8 px-10 font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Item</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-8 font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <PoundSterling className="h-4 w-4 text-primary" />
                        <span>Price</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-8 font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell py-8 font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Added On</span>
                      </div>
                    </TableHead>
                    <TableHead className="py-8 px-10 text-right font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wishlistItems.map(item => {
                    const isService = !!item.service;
                    const displayProduct = isService ? item.service : item.product;

                    if (!displayProduct) return null; // Skip items with no product/service data

                    const title = isService ? displayProduct.name : displayProduct.title;
                    const price = isService
                      ? (displayProduct.fixedPrice || displayProduct.pricePerHour || displayProduct.pricePerUnit || 0)
                      : displayProduct.price;
                    const status = isService ? displayProduct.status : displayProduct.productStatus;
                    const detailUrl = isService ? `/services/${displayProduct.id}` : `/products/${displayProduct.id}`;

                    return (
                      <TableRow key={item.id} className="group border-b border-gray-50 dark:border-zinc-900 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-all">
                        <TableCell className="py-8 px-10">
                          <div className="flex items-center gap-6">
                            <div className="relative h-24 w-24 rounded-[1.5rem] overflow-hidden ring-1 ring-gray-100 dark:ring-zinc-800 shadow-xl group-hover:scale-105 transition-transform duration-500">
                              <img
                                src={getProductMainImage(displayProduct) || '/placeholder.svg'}
                                alt={title || 'Product Image'}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm p-1 rounded-bl-xl shadow-sm">
                                {isService ? <Wrench size={12} className="text-blue-500" /> : <Package size={12} className="text-orange-500" />}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Link
                                href={detailUrl}
                                className="font-bold text-xl text-gray-900 dark:text-gray-100 hover:text-primary transition-colors block leading-tight line-clamp-1"
                              >
                                {title}
                              </Link>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isService ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {isService ? 'Service' : 'Product'}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                                  ID: {displayProduct.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-black text-lg text-gray-900 dark:text-gray-100">
                          £{Number(price).toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={
                              status === 'published'
                                ? 'default'
                                : 'destructive'
                            }
                            className="rounded-xl px-4 py-1.5 font-black tracking-widest uppercase text-[10px] shadow-sm"
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground font-bold text-sm">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="py-8 px-10 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isRemoving}
                            onClick={() => handleRemove(displayProduct.id)}
                            className="h-12 w-12 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all hover:scale-110 active:scale-95"
                          >
                            {isRemoving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-6 w-6" />}
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistPage;
