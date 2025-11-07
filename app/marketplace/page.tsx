'use client';

import { useState } from 'react';
import Image from 'next/image';
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

const ITEMS_PER_VIEW = 8;
const CATEGORIES_TO_SHOW = 8;

export default function MarketplacePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);

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
  const visibleCategories = showAllCategories ? categories : categories.slice(0, CATEGORIES_TO_SHOW);
  const canGoPrev = carouselIndex > 0;
  const canGoNext = carouselIndex + ITEMS_PER_VIEW < promotionalItems.length;

  return (
    <div className="bg-gray-100">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Category Sidebar */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
          <ul className="space-y-2">
            {visibleCategories.map((category, index) => (
              <li key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm font-medium">
                {category.icon}
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
          {!showAllCategories && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline"
            >
              More categories
            </button>
          )}
        </div>

        {/* 2. Main Content */}
        <div className="lg:col-span-7">
          {/* Treasure Hunt Section */}
          <div className="bg-black text-white p-8 rounded-lg flex flex-col md:flex-row items-center shadow-lg h-full">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-bold flex items-center justify-center md:justify-start">Mcom <Star className="ml-2 text-yellow-400" /> BLACK FRIDAY</h2>
              <p className="text-sm text-gray-300 mb-4">31 OCT - 01 DEC</p>
              <h1 className="text-4xl font-extrabold">TREASURE HUNT</h1>
              <p className="text-lg mb-4">Find it, keep it</p>
              <p className="text-md">Aeon 90Litres Chest Freezer</p>
              <div className="bg-yellow-400 text-black font-bold text-4xl my-2 px-4 py-2 rounded-full inline-block">#1,799</div>
              <p className="text-sm">Fri dec 7th, 12pm</p>
              <p className="text-xs text-gray-500 mt-2">T&Cs apply</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center items-center relative">
              <Image src="https://placehold.co/400x300/e0e0e0/000000?text=Product" alt="Chest Freezer" width={400} height={300} className="rounded-lg object-cover" />
              <button className="absolute bottom-4 right-4 bg-white text-black px-6 py-2 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors">DISCOVER</button>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar */}
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Phone size={24} className="text-yellow-500" />
                    </div>
                    <div>
                        <p className="font-bold">CALL TO ORDER</p>
                        <p className="text-sm text-gray-600">0700-600-0000</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Store size={24} className="text-yellow-500" />
                    </div>
                    <div>
                        <p className="font-bold">Sell on Mcom</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
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

      {/* Promotional Carousel */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={handlePrev} disabled={!canGoPrev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={24} />
            </button>
            <div className="flex-grow flex justify-center space-x-4 overflow-x-auto">
            {visibleItems.map((item, index) => (
                <div key={index} className="text-center flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    <Image src={item.image} alt={item.title} width={128} height={128} className="object-cover" />
                </div>
                <p className="text-xs md:text-sm font-medium">{item.title}</p>
                </div>
            ))}
            </div>
             <button onClick={handleNext} disabled={!canGoNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={24} />
            </button>
          </div>
      </div>
    </div>
    </div>
  );
}
