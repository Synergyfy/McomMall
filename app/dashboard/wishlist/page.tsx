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

const wishlistItems = [
  {
    product: 'Classic Leather Jacket',
    sku: 'P-000453',
    customer: 'John Doe',
    dateAdded: '2023-05-15',
  },
  {
    product: 'Wireless Bluetooth Headphones',
    sku: 'P-000876',
    customer: 'Jane Smith',
    dateAdded: '2023-05-20',
  },
  {
    product: 'Stainless Steel Water Bottle',
    sku: 'P-001234',
    customer: 'Peter Jones',
    dateAdded: '2023-06-01',
  },
  {
    product: 'Smart Watch',
    sku: 'P-001567',
    customer: 'Alice Williams',
    dateAdded: '2023-06-05',
  },
  {
    product: 'Yoga Mat',
    sku: 'P-001987',
    customer: 'Bob Brown',
    dateAdded: '2023-06-10',
  },
  {
    product: 'Electric Kettle',
    sku: 'P-002345',
    customer: 'Charlie Davis',
    dateAdded: '2023-06-15',
  },
];

const WishlistPage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wishlist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Wishlist</CardTitle>
          <CardDescription>
            Products that customers have added to their wishlist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistItems.map(item => (
                <TableRow key={item.sku}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.dateAdded}</TableCell>
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
