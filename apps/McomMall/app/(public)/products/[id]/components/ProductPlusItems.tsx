'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Package, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductPlusItemsProps {
  items: any[];
  onAddToCart?: (item: any) => void;
}

export default function ProductPlusItems({ items, onAddToCart }: ProductPlusItemsProps) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900">Perfectly Paired With</h3>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-bold">
          {items.length} Recommended
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden border-slate-200 hover:border-orange-300 transition-all hover:shadow-md bg-white">
            <div className="flex p-3 gap-4">
              <div className="h-24 w-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                 {/* Image placeholder logic */}
                 <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                    {item.type === 'product' ? <Package className="h-8 w-8" /> : <Store className="h-8 w-8" />}
                 </div>
                 {item.images?.[0] && <img src={item.images[0]} alt={item.title || item.name} className="absolute inset-0 w-full h-full object-cover" />}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {item.title || item.name}
                     </h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                    <span className="font-black text-slate-900">
                        {item.price ? `£${Number(item.price).toFixed(2)}` : 'Contact for Price'}
                    </span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-bold text-slate-500 hover:text-slate-900" onClick={() => router.push(`/${item.type === 'product' ? 'products' : 'services'}/${item.id}`)}>
                            View
                        </Button>
                        {item.type === 'product' && onAddToCart && (
                            <Button size="sm" className="h-8 w-8 p-0 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200" onClick={() => onAddToCart(item)}>
                                <ShoppingCart className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
