'use client';

import { motion } from 'framer-motion';
import { Product } from '@/service/listings/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useGetWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/service/wishlist/hook';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, ShoppingCart, ArrowRight, Zap, Package, Heart } from 'lucide-react';
import { useMemo } from 'react';

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
  const { data: wishlist } = useGetWishlist();
  const { mutateAsync: addToWishlist } = useAddToWishlist();
  const { mutateAsync: removeFromWishlist } = useRemoveFromWishlist();

  const handleWishlistAction = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInWishlist = wishlist?.items?.some(item => item.product?.id === productId);
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId });
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  if (!products || products.length === 0) return null;



  const handleAddToCart = (e: React.MouseEvent, product: Product) => {

    e.preventDefault();

    e.stopPropagation();

    addItemToCart({ productId: product.id, quantity: 1 });

    toast.success(`${product.title} added to cart`);

  };



  const handleBuyNow = (e: React.MouseEvent, product: Product) => {

    e.preventDefault();

    e.stopPropagation();

    addItemToCart({ productId: product.id, quantity: 1 });

    router.push('/cart');

  };



  return (

    <div className="space-y-12">

      <div>

        <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">

          <Package className="text-[#f58220]" /> Featured Products

        </h2>

        <p className="text-gray-500 font-medium">Browse our premium selection of available items.</p>

      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {products.map((product, index) => {

          const firstImageUrl = product.fileUrls?.find(isImageUrl) || product.imageUrl || '/images/placeholder-product.png';

          

          return (

            <motion.div

              key={product.id}

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ delay: index * 0.1 }}

              className="group"

            >

              <div 

                onClick={() => router.push(`/products/${product.id}`)}

                className="h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col cursor-pointer"

              >

                {/* Image Header */}

                <div className="relative aspect-square overflow-hidden bg-gray-50">

                  <Image

                    src={firstImageUrl}

                    alt={product.title}

                    fill

                    className="object-cover transition-transform duration-700 group-hover:scale-110"

                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  

                                    {product.bonusAmount && (

                  

                                      <div className="absolute top-4 left-4 z-10">

                  

                                        <span className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">

                  

                                          £{product.bonusAmount} Bonus

                  

                                        </span>

                  

                                      </div>

                  

                                    )}

                  

                  

                  

                                    <div className="absolute top-4 right-4 z-10">

                  

                                      <Button

                  

                                        size="icon"

                  

                                        variant="ghost"

                  

                                        className="bg-white/80 backdrop-blur-md hover:bg-white text-gray-900 rounded-full shadow-md"

                  

                                        onClick={(e) => handleWishlistAction(e, product.id)}

                  

                                      >

                  

                                                              <Heart 

                  

                                                                size={18} 

                  

                                                                className={wishlist?.items?.some(item => item.product?.id === product.id) ? "fill-red-500 text-red-500" : ""} 

                  

                                                              />

                  

                                      </Button>

                  

                                    </div>

                  

                  

                  

                                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">

                     <Button 

                      className="w-full bg-white text-black hover:bg-black hover:text-white font-black text-xs uppercase tracking-widest rounded-xl py-6 h-auto border-none"

                      onClick={(e) => handleAddToCart(e, product)}

                     >

                       Add To Cart

                     </Button>

                  </div>

                </div>



                {/* Content */}

                <div className="p-6 flex flex-col flex-1">

                  <div className="flex justify-between items-start mb-2">

                    <h3 className="text-xl font-black text-gray-900 group-hover:text-[#f58220] transition-colors line-clamp-1">{product.title}</h3>

                  </div>

                  

                  <p className="text-gray-400 text-xs font-bold mb-4 line-clamp-2 leading-relaxed">

                    {product.shortDescription || "Premium quality product from our collection."}

                  </p>



                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">

                     <div>

                        <p className="text-2xl font-black text-gray-900">£{product.price}</p>

                        {product.points && (

                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">

                            <Zap size={10} fill="currentColor" /> Earn {product.points} Pts

                          </span>

                        )}

                     </div>

                     <div className="flex gap-2">

                        <Button 

                          size="icon" 

                          variant="secondary" 

                          className="rounded-xl w-10 h-10 hover:bg-black hover:text-white transition-all"

                          onClick={(e) => handleBuyNow(e, product)}

                        >

                          <ShoppingCart size={18} />

                        </Button>

                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-[#f58220] transition-all">

                          <ArrowRight size={20} />

                        </div>

                     </div>

                  </div>

                </div>

              </div>

            </motion.div>

          );

        })}

      </div>

    </div>

  );

}
