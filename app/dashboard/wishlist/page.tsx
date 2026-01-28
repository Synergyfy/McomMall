'use client';

import {
  Card,
  CardContent,
  CardDescription,
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
  DollarSign,
  Info,
} from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const WishlistPage = () => {
  const { wishlist, loading, removeItemFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">
          Products that you have added to your wishlist.
        </p>
      </div>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Your Wishlisted Products</CardTitle>
          <CardDescription>
            A list of all products currently in your wishlist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!wishlist || !wishlist.items || wishlist.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
              <p className="text-muted-foreground mt-2">
                Start adding products you love to your wishlist.
              </p>
              <Button asChild className="mt-6">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Product</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Price</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date Added</span>
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wishlist.items?.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.product.imageUrl || '/placeholder.svg'}
                            alt={item.product.title}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                          />
                          <Link
                            href={`/listings/${item.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {item.product.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        £{item.product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            item.product.productStatus === 'published'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {item.product.productStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromWishlist(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
