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
import { ShoppingCart, Calendar, Trash2, Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import Image from 'next/image';
import Link from 'next/link';

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
          {!wishlist || wishlist.items.length === 0 ? (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Product</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date Added</span>
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlist.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.product.imageUrl || '/placeholder.svg'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                        <Link
                          href={`/listings/${item.product.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistPage;
