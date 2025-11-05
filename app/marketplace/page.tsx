'use client';

import { useState } from 'react';
import Image from 'next/image';

// Mock Data
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 13',
    category: 'Electronics',
    description: 'The latest iPhone with a stunning display.',
    image: 'marketplace/assets/iphone13.jpg',
  },
  {
    id: 2,
    name: 'Men’s Sneakers',
    category: 'Fashion',
    description: 'Comfortable and stylish sneakers for everyday wear.',
    image: 'https://placehold.co/600x400/png',
  },
  {
    id: 3,
    name: 'Luxury Watch',
    category: 'Fashion',
    description: 'An elegant timepiece for any occasion.',
    image: 'https://placehold.co/600x400/png',
  },
  {
    id: 4,
    name: 'Wireless Headphones',
    category: 'Electronics',
    description: 'High-fidelity sound without the wires.',
    image: 'https://placehold.co/600x400/png',
  },
   {
    id: 5,
    name: 'Cozy Armchair',
    category: 'Home',
    description: 'A perfect chair for reading and relaxing.',
    image: 'https://placehold.co/600x400/png',
  },
   {
    id: 6,
    name: 'Travel Backpack',
    category: 'Travel',
    description: 'Durable and spacious backpack for your adventures.',
    image: 'https://placehold.co/600x400/png',
  },
];

const mockCategories = ['All', 'Electronics', 'Fashion', 'Home', 'Travel'];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? mockProducts
      : mockProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1. Header / Ad Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Ad 1</span>
        </div>
        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
             <span className="text-gray-500">Ad 2</span>
        </div>
      </div>

      {/* 2. Category Filter Section */}
      <div className="mb-8 flex justify-center">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          {mockCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Product Display Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
            data-category={product.category}
          >
            <div className="relative h-48 w-full bg-gray-100">
               <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
