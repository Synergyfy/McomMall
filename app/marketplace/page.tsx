'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Smartphone,
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
import { motion, AnimatePresence } from 'framer-motion';
import { promotionalItems } from '@/lib/listing-data';

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

const ITEMS_PER_VIEW = 8;

const treasureHuntSlides = [
  { imageSrc: 'images/landscap.jpg' },
  { imageSrc: 'images/summer.jpg' },
  { imageSrc: 'images/winter.jpg' },
];

export default function MarketplacePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % treasureHuntSlides.length);
    }, 10000); // 10 seconds
    return () => clearInterval(timer);
  }, []);

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

  const filteredItems = selectedCategory
    ? promotionalItems.filter((item) => item.category === selectedCategory)
    : promotionalItems;

  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 11, seconds: 1 });

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Use a separate, unfiltered list for the flash sales
  const flashSaleItems = promotionalItems.slice(0, 6);

  return (
    <div className="bg-gray-100 pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Category Sidebar */}
          <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-sm">
            <ul className="space-y-2 h-96 overflow-y-auto overflow-x-hidden">
              <li
                className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                <span>All</span>
              </li>
              {categories.map((category, index) => (
                <li
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm font-medium transition-colors ${
                    selectedCategory === category.name ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Main Content */}
          <div className="lg:col-span-6">
            {/* Treasure Hunt Section */}
            <div className="rounded-lg shadow-lg h-96 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={treasureHuntSlides[activeSlide].imageSrc}
                    alt={`Treasure hunt image ${activeSlide + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {treasureHuntSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      activeSlide === index ? 'bg-white' : 'bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
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
                  <p className="font-bold">Sell on Mcom</p>
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
              <h2 className="text-2xl font-bold flex items-center justify-center">MCom <Star className="ml-2" /></h2>
              <h3 className="text-3xl font-extrabold">BLACK FRIDAY</h3>
              <p className="text-sm text-gray-300">31 OCT - 01 DEC</p>
            </div>
          </div>
        </div>

        {/* Promotional Carousel */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={carouselIndex <= 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-grow flex justify-center space-x-4 overflow-x-auto">
              {promotionalItems.slice(carouselIndex, carouselIndex + ITEMS_PER_VIEW).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`}>
                  <div className="text-center flex-shrink-0 group cursor-pointer">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      <Image src={item.image} alt={item.title} width={128} height={128} className="object-cover" />
                    </div>
                    <p className="text-xs md:text-sm font-medium group-hover:underline">{item.title}</p>
                  </div>
                </Link>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={carouselIndex + ITEMS_PER_VIEW >= promotionalItems.length}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
         {/* Flash Sales Section */}
        <div className="bg-orange-600 text-white p-4 rounded-lg shadow-md mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">Flash Sales</h2>
              <div className="text-xl">
                Time Left: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
            <Link href="/flash-sales">
              <div className="text-white hover:underline cursor-pointer">See All &gt;</div>
            </Link>
          </div>
          <div className="mt-4 flex space-x-4 overflow-x-auto">
            {flashSaleItems.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`}>
                <div className="bg-white text-black p-2 rounded-lg flex-shrink-0 w-48 text-center group cursor-pointer">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={150}
                      height={150}
                      className="object-cover rounded-md mx-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.discountedPrice && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round(((item.price - item.discountedPrice) / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium group-hover:underline">{item.title}</p>
                  <p className="mt-1 text-lg font-bold">${(item.discountedPrice ?? item.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 line-through">${item.price.toFixed(2)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(item.items_left / 100) * 100}%` }}></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">{item.items_left} items left</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Filtered Products Grid */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">{selectedCategory || 'All Products'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer">
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={200}
                      height={200}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium group-hover:underline">{item.title}</p>
                    <p className="text-lg font-semibold mt-2">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
