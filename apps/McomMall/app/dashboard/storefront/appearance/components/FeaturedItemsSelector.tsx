'use client';

import React, { useState } from 'react';
import { useUpdateProduct } from '@/service/store/products/hook';
import { useUpdateService } from '@/service/services/hook';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, AlertCircle, ShoppingBag, Wrench, Loader2 } from 'lucide-react';
import { Product } from '@/service/listings/types';
import { Service } from '@/service/services/types';

interface FeaturedItemsSelectorProps {
  products: Product[];
  services: Service[];
}

export const FeaturedItemsSelector: React.FC<FeaturedItemsSelectorProps> = ({
  products = [],
  services = [],
}) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: updateService } = useUpdateService();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'products' | 'services'>('products');

  const featuredProducts = products.filter((p) => p.isFeatured);
  const featuredServices = services.filter((s) => s.isFeatured);

  const handleToggleProduct = async (product: Product) => {
    const isNewFeatured = !product.isFeatured;
    if (isNewFeatured && featuredProducts.length >= 6) {
      toast.error('You can only feature up to 6 products.');
      return;
    }

    setTogglingId(product.id);
    try {
      await updateProduct({
        id: product.id,
        isFeatured: isNewFeatured,
      } as any);
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast.success(isNewFeatured ? 'Product pinned to featured list!' : 'Product removed from featured list.');
    } catch {
      toast.error('Failed to update product featured status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleService = async (service: Service) => {
    const isNewFeatured = !service.isFeatured;
    if (isNewFeatured && featuredServices.length >= 6) {
      toast.error('You can only feature up to 6 services.');
      return;
    }

    setTogglingId(service.id);
    try {
      await updateService({
        id: service.id,
        isFeatured: isNewFeatured,
      } as any);
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      toast.success(isNewFeatured ? 'Service pinned to featured list!' : 'Service removed from featured list.');
    } catch {
      toast.error('Failed to update service featured status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">Featured Showcase</h3>
          <p className="text-xs text-gray-500">Select items to display at the top of your public storefront (max 6 each).</p>
        </div>
        <div className="flex border border-gray-200/80 rounded-lg p-0.5 bg-gray-50 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveSection('products')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSection === 'products' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Products ({featuredProducts.length}/6)
          </button>
          <button
            onClick={() => setActiveSection('services')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSection === 'services' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Services ({featuredServices.length}/6)
          </button>
        </div>
      </div>

      {activeSection === 'products' ? (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              No products available to feature.
            </div>
          ) : (
            <div className="grid gap-3">
              {products.map((product) => {
                const img = product.media?.[0] || product.images?.[0];
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors bg-white ${
                      product.isFeatured ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor={`featured-product-${product.id}`} className="text-sm font-semibold text-gray-900 cursor-pointer">
                          {product.title}
                        </Label>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{product.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {product.isFeatured && (
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-200/50 hover:bg-amber-50 gap-1 text-[10px]">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                        </Badge>
                      )}
                      {togglingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Switch
                          id={`featured-product-${product.id}`}
                          checked={product.isFeatured ?? false}
                          onCheckedChange={() => handleToggleProduct(product)}
                          aria-label={`Feature ${product.title}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              No services available to feature.
            </div>
          ) : (
            <div className="grid gap-3">
              {services.map((service) => {
                const img = service.media?.[0] || service.images?.[0];
                return (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors bg-white ${
                      service.isFeatured ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <Wrench className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor={`featured-service-${service.id}`} className="text-sm font-semibold text-gray-900 cursor-pointer">
                          {service.name}
                        </Label>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{service.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {service.isFeatured && (
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-200/50 hover:bg-amber-50 gap-1 text-[10px]">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                        </Badge>
                      )}
                      {togglingId === service.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Switch
                          id={`featured-service-${service.id}`}
                          checked={service.isFeatured ?? false}
                          onCheckedChange={() => handleToggleService(service)}
                          aria-label={`Feature ${service.name}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
