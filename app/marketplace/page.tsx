'use client';

import { useState, useEffect } from 'react';
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
  Star,
  LayoutGrid,
  Building,
  Car,
  Tag,
  Wrench,
  Users,
  Briefcase,
  Calendar,
  Utensils,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listings, categories } from '../../lib/listing-data';

const iconComponents: { [key: string]: React.ElementType } = {
  LayoutGrid,
  Home,
  Building,
  Car,
  Tag,
  Wrench,
  Smartphone,
  Users,
  Briefcase,
  Calendar,
  Utensils,
};

const CategoryIcon = ({ name }: { name: string }) => {
  const Icon = iconComponents[name];
  return Icon ? <Icon /> : <PlusCircle />;
};

const ITEMS_PER_VIEW = 8;

// Updated treasureHuntSlides with one image per slide
const treasureHuntSlides = [
  { imageSrc: 'images/landscap.jpg' },
  { imageSrc: 'images/summer.jpg' },
  { imageSrc: 'images/winter.jpg' },
];

export default function MarketplacePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % treasureHuntSlides.length);
    }, 10000); // 10 seconds
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCarouselIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex > listings.length - ITEMS_PER_VIEW ? prevIndex : nextIndex;
    });
  };

  const handlePrev = () => {
    setCarouselIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      return nextIndex < 0 ? 0 : nextIndex;
    });
  };

  const visibleItems = listings.slice(carouselIndex, carouselIndex + ITEMS_PER_VIEW);
  const canGoPrev = carouselIndex > 0;
  const canGoNext = carouselIndex + ITEMS_PER_VIEW < listings.length;

  return (
    <div className="bg-gray-100 pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Category Sidebar */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <ul className="space-y-2 h-96 overflow-y-auto">
              {categories.map((category, index) => (
                <li key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm font-medium transition-colors">
                  <CategoryIcon name={category.icon} />
                  <span>{category.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Main Content */}
          <div className="lg:col-span-7">
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
              disabled={!canGoPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-grow flex justify-center space-x-4 overflow-x-auto">
              {visibleItems.map((item, index) => (
                <div key={index} className="text-center flex-shrink-0 group cursor-pointer">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <Image src={item.imageUrl} alt={item.title} width={128} height={128} className="object-cover" />
                  </div>
                  <p className="text-xs md:text-sm font-medium group-hover:underline">{item.title}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
