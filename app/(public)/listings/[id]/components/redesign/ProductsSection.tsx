
'use client';

import { motion } from 'framer-motion';
import { Product } from '@/service/listings/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductsSectionProps {
  products: Product[];
}

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const router = useRouter();
  const { addItemToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({ productId: product.id, quantity: 1 });
    toast.success(`${product.title} has been added to your cart.`);
  };

  const handleOrderNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/checkout?productId=${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Our <span className="text-orange-600">Products</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const firstImageUrl =
              product.fileUrls?.find(isImageUrl) || product.imageUrl;
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Card
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="flex flex-col h-full overflow-hidden border border-orange-200/80 hover:border-orange-400 transition-all duration-300 bg-white cursor-pointer"
                >
                  <CardHeader className="p-0 border-b border-orange-200/80">
                    <div className="relative h-48 w-full">
                      <Image
                        src={firstImageUrl || '/placeholder-image.png'}
                        alt={product.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {product.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {product.shortDescription}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50/50 flex-col items-start space-y-2">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-xl font-extrabold text-orange-600">
                        £{product.price}
                      </p>
                      {product.points && (
                        <Badge
                          variant="default"
                          className="bg-orange-100 text-orange-800 border-orange-300 text-sm font-semibold"
                        >
                          Earn {product.points} points
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-orange-600 text-orange-600 bg-transparent hover:bg-orange-600 hover:text-white transition-all duration-300 font-bold"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                        onClick={(e) => handleOrderNow(e, product)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
