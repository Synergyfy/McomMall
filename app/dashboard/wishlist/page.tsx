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
// import { useWishlist } from '@/hooks/useWishlist'; // Temporarily disabled
import Image from 'next/image';
import Link from 'next/link';

// Mock data based on user's provided structure
const mockWishlist = {
    "id": "3b2519c2-cc45-493c-b65e-71bfa186ca97",
    "createdAt": "2025-09-05T01:32:01.545Z",
    "updatedAt": "2025-09-05T01:32:01.545Z",
    "items": [
        {
            "id": "27918488-821d-4a2d-be45-48cfa12f6218",
            "createdAt": "2025-09-05T01:32:02.289Z",
            "updatedAt": "2025-09-05T01:32:02.289Z",
            "product": {
                "id": "f2d1c49e-bc0a-4338-9ad4-f23553835cbb",
                "createdAt": "2025-08-25T15:53:38.719Z",
                "updatedAt": "2025-08-28T20:32:47.570Z",
                "title": "Hic Change",
                "productType": "physical",
                "price": 577,
                "shortDescription": "Nostrum id consequa",
                "description": "Cupidatat dolores id",
                "imageUrl": "https://source.unsplash.com/random/800x600?sig=1",
                "productUrl": null,
                "fileUrls": [],
                "downloadLimit": -1,
                "downloadExpiry": -1,
                "sku": "Consectetur non cumq",
                "enableStockManagement": false,
                "weight": 28,
                "length": 78,
                "width": 100,
                "height": 34,
                "productStatus": "published",
                "visibility": "public",
                "purchaseNote": "Deserunt rem cumque ",
                "enableReviews": true,
                "tags": [
                    "Illum non reprehend"
                ],
                "category": "clothing"
            }
        },
        {
            "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "createdAt": "2025-09-04T12:00:00.000Z",
            "updatedAt": "2025-09-04T12:00:00.000Z",
            "product": {
                "id": "a1b2c3d4-e5f6-7890-1234-567890abcdea",
                "createdAt": "2025-08-25T15:53:38.719Z",
                "updatedAt": "2025-08-28T20:32:47.570Z",
                "title": "Another Product",
                "productType": "physical",
                "price": 123.45,
                "shortDescription": "A short description",
                "description": "A longer description",
                "imageUrl": "https://source.unsplash.com/random/800x600?sig=2",
                "productUrl": null,
                "fileUrls": [],
                "downloadLimit": -1,
                "downloadExpiry": -1,
                "sku": "SKU-456",
                "enableStockManagement": true,
                "weight": 1.5,
                "length": 20,
                "width": 15,
                "height": 10,
                "productStatus": "published",
                "visibility": "public",
                "purchaseNote": "A note",
                "enableReviews": true,
                "tags": ["tag1", "tag2"],
                "category": "electronics"
            }
        },
        {
            "id": "c4d5e6f7-g8h9-ijkl-mnop-qrstuvwxyz",
            "createdAt": "2025-09-03T10:30:00.000Z",
            "updatedAt": "2025-09-03T10:30:00.000Z",
            "product": {
                "id": "c4d5e6f7-g8h9-ijkl-mnop-qrstuvwxyb",
                "createdAt": "2025-08-25T15:53:38.719Z",
                "updatedAt": "2025-08-28T20:32:47.570Z",
                "title": "A Third Item",
                "productType": "digital",
                "price": 49.99,
                "shortDescription": "A digital product",
                "description": "A very useful digital product",
                "imageUrl": "https://source.unsplash.com/random/800x600?sig=3",
                "productUrl": null,
                "fileUrls": [],
                "downloadLimit": 5,
                "downloadExpiry": 365,
                "sku": "SKU-789",
                "enableStockManagement": false,
                "weight": null,
                "length": null,
                "width": null,
                "height": null,
                "productStatus": "published",
                "visibility": "public",
                "purchaseNote": "Download link will be sent to your email.",
                "enableReviews": true,
                "tags": ["digital", "software"],
                "category": "software"
            }
        }
    ]
};

const WishlistPage = () => {
  // const { wishlist, loading, removeItemFromWishlist } = useWishlist();
  const wishlist = mockWishlist; // Use mock data
  const loading = false;
  const removeItemFromWishlist = (id: string) => {
    console.log("Remove item with id:", id);
  };

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
                    <TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistPage;
