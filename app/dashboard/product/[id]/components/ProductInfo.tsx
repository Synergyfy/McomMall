'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Star } from 'lucide-react';
import { Product } from '@/service/store/products/types';
import { cn } from '@/lib/utils';
import { useGetServicesByProductId } from '@/service/partnerships/hooks';
import ServiceList from '@/components/ServiceList';

interface ProductInfoProps {
  product: Product;
  onAddPartner: () => void;
}

export default function ProductInfo({ product, onAddPartner }: ProductInfoProps) {
  const { data: services, isLoading: servicesLoading } = useGetServicesByProductId(product.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{product.title}</h1>
        <Badge
          className={cn(
            'text-sm font-medium',
            product.productStatus === 'Online'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          )}
        >
          {product.productStatus}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn('h-5 w-5', i < 4 ? 'text-yellow-400' : 'text-gray-300')}
              fill="currentColor"
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">(12 customer reviews)</span>
      </div>

      <p className="text-gray-600 text-base leading-relaxed">{product.shortDescription}</p>

      <div className="text-5xl font-extrabold text-gray-800">
        £{product.price.toFixed(2)}
      </div>

      <Card className="bg-gray-50 border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Service Plus</CardTitle>
          <Button size="sm" variant="outline" onClick={onAddPartner} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Partner
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Enhance customer satisfaction by recommending a trusted service provider for this product.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Associated Services</h2>
        {servicesLoading ? (
          <div className="text-center py-12">Loading services...</div>
        ) : (
          <ServiceList services={services || []} isDashboardView={true} />
        )}
      </div>
    </div>
  );
}