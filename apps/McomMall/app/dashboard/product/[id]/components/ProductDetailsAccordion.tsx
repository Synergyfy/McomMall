'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Product } from '@/service/store/products/types';
import { richTextHTML } from '@/lib/utils';

interface ProductDetailsAccordionProps {
  product: Product;
}

export default function ProductDetailsAccordion({ product }: ProductDetailsAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue="description" className="w-full">
      <AccordionItem value="description">
        <AccordionTrigger className="text-lg font-medium">Description</AccordionTrigger>
        <AccordionContent className="text-base text-gray-600">
          <div className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" dangerouslySetInnerHTML={richTextHTML(product.description)} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="specs">
        <AccordionTrigger className="text-lg font-medium">Specifications</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><span className="font-semibold">SKU:</span> {product.sku}</li>
            <li><span className="font-semibold">Category:</span> {product.category}</li>
            <li><span className="font-semibold">Type:</span> {product.productType}</li>
            <li><span className="font-semibold">Stock:</span> {product.stock} units</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="reviews">
        <AccordionTrigger className="text-lg font-medium">Customer Reviews</AccordionTrigger>
        <AccordionContent className="text-gray-600">
          There are no reviews for this product yet.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}