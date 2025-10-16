
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
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const firstImageUrl = product.fileUrls?.find(isImageUrl) || product.imageUrl;
          return (
            <motion.div key={product.id} whileHover={{ y: -5 }} className="h-full">
              <Card className="flex flex-col h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <div className="relative h-56 w-full">
                    <Image
                      src={firstImageUrl || '/placeholder-image.png'}
                      alt={product.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-xl font-semibold text-gray-800 mb-2">{product.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{product.shortDescription}</p>
                </CardContent>
                <CardFooter className="p-4 bg-gray-50 flex-col items-start">
                  <div className="flex justify-between items-center w-full mb-4">
                    <p className="text-lg font-bold text-orange-600">£{product.price}</p>
                    {product.points && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {product.points} Points
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={(e) => handleOrderNow(e, product)}
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
}
