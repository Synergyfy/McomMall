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

const wishlistItems = [
  {
    product: 'Classic Leather Jacket',
    sku: 'P-000453',
    customer: 'John Doe',
    customerId: 'C-001',
    dateAdded: '2023-05-15',
    productUrl: '/dashboard/store/products/edit/1',
  },
  {
    product: 'Wireless Bluetooth Headphones',
    sku: 'P-000876',
    customer: 'Jane Smith',
    customerId: 'C-002',
    dateAdded: '2023-05-20',
    productUrl: '/dashboard/store/products/edit/2',
  },
  {
    product: 'Stainless Steel Water Bottle',
    sku: 'P-001234',
    customer: 'Peter Jones',
    customerId: 'C-003',
    dateAdded: '2023-06-01',
    productUrl: '/dashboard/store/products/edit/3',
  },
  {
    product: 'Smart Watch',
    sku: 'P-001567',
    customer: 'Alice Williams',
    customerId: 'C-004',
    dateAdded: '2023-06-05',
    productUrl: '/dashboard/store/products/edit/4',
  },
  {
    product: 'Yoga Mat',
    sku: 'P-001987',
    customer: 'Bob Brown',
    customerId: 'C-005',
    dateAdded: '2023-06-10',
    productUrl: '/dashboard/store/products/edit/5',
  },
  {
    product: 'Electric Kettle',
    sku: 'P-002345',
    customer: 'Charlie Davis',
    customerId: 'C-006',
    dateAdded: '2023-06-15',
    productUrl: '/dashboard/store/products/edit/6',
  },
];

const WishlistPage = () => {
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
              {wishlistItems.map(item => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/customers/${item.customerId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.customer}
                    </Link>
                  </TableCell>
                  <TableCell>{item.dateAdded}</TableCell>
                  <TableCell>
                    <Link href={item.productUrl}>
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
