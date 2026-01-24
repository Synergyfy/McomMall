'use client';

import { Product } from '@/service/listings/types';

interface ProductFactsProps {
  product: Product;
}

export default function ProductFacts({ product }: ProductFactsProps) {
  const facts = [
    { label: 'Status', value: product.productStatus, capitalize: true },
    { label: 'Category', value: product.category },
    { label: 'SKU', value: product.sku },
    { label: 'Stock', value: product.enableStockManagement ? (product.stock !== undefined ? `${product.stock} units` : 'Managed') : 'Available' },
    { label: 'Weight', value: product.weight ? `${product.weight} kg` : null },
    {
      label: 'Dimensions',
      value: (product.length && product.width && product.height)
        ? `${product.length} × ${product.width} × ${product.height} cm`
        : null
    },
  ];

  const validFacts = facts.filter(f => f.value !== null && f.value !== undefined && f.value !== '');

  if (validFacts.length === 0) return null;

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Product Facts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
        {validFacts.map((fact) => (
          <div key={fact.label}>
            <p className="text-sm text-gray-500 mb-1">{fact.label}</p>
            <p className={`text-base font-semibold text-gray-900 ${fact.capitalize ? 'capitalize' : ''}`}>
              {fact.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
