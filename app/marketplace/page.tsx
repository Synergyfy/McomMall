'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductSection from './components/ProductSection';
import {
  Smartphone,
  Watch,
  Laptop,
  Home,
  Shirt,
  PlusCircle,
  Heart,
  ShoppingCart,
  Percent,
  ChevronLeft,
  ChevronRight,
  Phone,
  Store,
  Truck,
  Star
} from 'lucide-react';

// Mock Data
const categories = [
  { name: 'Appliances', icon: <Home /> },
  { name: 'Phones & Tablets', icon: <Smartphone /> },
  { name: 'Health & Beauty', icon: <Heart /> },
  { name: 'Home & Office', icon: <Laptop /> },
  { name: 'Electronics', icon: <ShoppingCart /> },
  { name: 'Fashion', icon: <Shirt /> },
  { name: 'Supermarket', icon: <ShoppingCart /> },
  { name: 'Computing', icon: <Laptop /> },
  { name: 'Baby Products', icon: <PlusCircle /> },
  { name: 'Gaming', icon: <Percent /> },
  { name: 'Musical Instruments', icon: <PlusCircle /> },
  { name: 'Other categories', icon: <PlusCircle /> },
];

const promotionalItems = [
    { title: 'Do Pass Yourself', image: 'https://placehold.co/200x200/png' },
    { title: 'Awoof Deals', image: 'https://placehold.co/200x200/png' },
    { title: 'Up to 80% Off', image: 'https://placehold.co/200x200/png' },
    { title: 'Send Packages Securely', image: 'https://placehold.co/200x200/png' },
    { title: 'Unbeatable Offers', image: 'https://placehold.co/200x200/png' },
    { title: 'Earn While You Shop', image: 'https://placehold.co/200x200/png' },
    { title: 'Unlock Your Deal', image: 'https://placehold.co/200x200/png' },
    { title: 'Deals Reloaded', image: 'https://placehold.co/200x200/png' },
    { title: 'More Deals', image: 'https://placehold.co/200x200/png' },
  ];

const treasureHuntItems = [
  { name: 'Smart Watch', image: 'https://placehold.co/200x200/png', price: '₦15,000' },
  { name: 'Wireless Earbuds', image: 'https://placehold.co/200x200/png', price: '₦8,000' },
  { name: 'Laptop Stand', image: 'https://placehold.co/200x200/png', price: '₦5,000' },
  { name: 'Bluetooth Speaker', image: 'https://placehold.co/200x200/png', price: '₦12,000' },
  { name: 'Gaming Mouse', image: 'https://placehold.co/200x200/png', price: '₦7,500' },
  { name: 'Portable Charger', image: 'https://placehold.co/200x200/png', price: '₦6,000' },
  { name: 'USB-C Hub', image: 'https://placehold.co/200x200/png', price: '₦4,500' },
];

const trendingItems = [
  { name: 'Wireless Headphones', image: 'https://placehold.co/200x200/png', price: '₦25,000' },
  { name: 'Smart Fitness Tracker', image: 'https://placehold.co/200x200/png', price: '₦18,000' },
  { name: 'Portable Blender', image: 'https://placehold.co/200x200/png', price: '₦10,000' },
];

const giftCardItems = [
  { name: 'Amazon Gift Card', image: 'https://placehold.co/200x200/png', price: '$25' },
  { name: 'Steam Gift Card', image: 'https://placehold.co/200x200/png', price: '$50' },
  { name: 'Netflix Gift Card', image: 'https://placehold.co/200x200/png', price: '$15' },
];

const couponItems = [
  { name: '10% Off Electronics', image: 'https://placehold.co/200x200/png', price: 'Code: ELEC10' },
  { name: 'Free Shipping on Fashion', image: 'https://placehold.co/200x200/png', price: 'Code: SHIPIT' },
  { name: '20% Off Home Goods', image: 'https://placehold.co/200x200/png', price: 'Code: HOME20' },
];

const ITEMS_PER_VIEW = 8;
const CATEGORIES_TO_SHOW = 8;

export default function MarketplacePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const handleNext = () => {
    setCarouselIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex > promotionalItems.length - ITEMS_PER_VIEW ? prevIndex : nextIndex;
    });
  };

  const handlePrev = () => {
    setCarouselIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      return nextIndex < 0 ? 0 : nextIndex;
    });
  };

  const visibleItems = promotionalItems.slice(carouselIndex, carouselIndex + ITEMS_PER_VIEW);
  const canGoPrev = carouselIndex > 0;
  const canGoNext = carouselIndex + ITEMS_PER_VIEW < promotionalItems.length;

  return (
    <div className="bg-gray-100 pt-28">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Ad Section */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <p className="text-center font-bold">Ad Space</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Category Sidebar */}
            <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="h-96 overflow-y-auto">
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm font-medium transition-colors">
                      {category.icon}
                      <span>{category.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Treasure Hunt and Right Sidebar */}
            <div className="lg:col-span-9">
              {/* Treasure Hunt Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Treasure Hunt</h2>
                <div className="flex overflow-x-auto space-x-4">
                  {treasureHuntItems.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-48 text-center">
                      <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                        <Image src={item.image} alt={item.name} width={192} height={192} className="object-cover" />
                      </div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-lg font-bold text-blue-600">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Right Sidebar Content */}
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-4 mb-4 pb-4 border-b cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Phone size={24} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-bold">CALL TO ORDER</p>
                        <p className="text-sm text-gray-600">0700-600-0000</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mb-4 pb-4 border-b cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Store size={24} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-bold">Sell on mcom</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Truck size={24} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-bold">Send Your Packages</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black text-white p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold flex items-center justify-center">Mcom <Star className="ml-2" /></h2>
                    <h3 className="text-3xl font-extrabold">BLACK FRIDAY</h3>
                    <p className="text-sm text-gray-300">31 OCT - 01 DEC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Ad Section */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <p className="text-center font-bold">Ad Space</p>
          </div>
        </div>
      </div>

      {/* Promotional Carousel */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={handlePrev} disabled={!canGoPrev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={24} />
            </button>
            <div className="flex-grow flex justify-center space-x-4 overflow-x-auto">
            {visibleItems.map((item, index) => (
                <div key={index} className="text-center flex-shrink-0 group cursor-pointer">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <Image src={item.image} alt={item.title} width={128} height={128} className="object-cover" />
                </div>
                <p className="text-xs md:text-sm font-medium group-hover:underline">{item.title}</p>
                </div>
            ))}
            </div>
             <button onClick={handleNext} disabled={!canGoNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={24} />
            </button>
          </div>
      </div>

      {/* New Sections */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductSection title="Trending" items={trendingItems} />
        <ProductSection title="Gift Cards" items={giftCardItems} />
        <ProductSection title="Coupons" items={couponItems} />
      </div>
    </div>
    </div>
  );
}
