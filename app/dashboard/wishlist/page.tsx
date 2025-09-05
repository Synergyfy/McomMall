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
import { User, ShoppingCart, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAdminWishlist } from '@/service/wishlist/admin-hook';

const WishlistPage = () => {
  const { wishlistItems, isLoading } = useAdminWishlist();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Products that customers have added to their wishlist.
        </p>
      </div>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Wishlisted Products</CardTitle>
          <CardDescription>
            A list of all products currently in customers&apos; wishlists.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <User className="h-4 w-4" />
                    <span>Customer</span>
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
              {wishlistItems?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product.name}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/customers/${item.user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.user.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/store/products/edit/${item.product.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Product
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistPage;
