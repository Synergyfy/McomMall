'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Wrench,
  Sparkles,
  Stethoscope,
  BookOpen,
  Dumbbell,
  Ticket,
  Car,
  Building2,
  Megaphone,
  Dog,
  Plane,
  Factory,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// New, updated list of categories
const categories = [
  {
    name: 'Hospitality',
    count: 42,
    icon: <UtensilsCrossed />,
  },
  {
    name: 'Trades & Home Services',
    count: 58,
    icon: <Wrench />,
  },
  {
    name: 'Beauty & Wellness',
    count: 35,
    icon: <Sparkles />,
  },
  {
    name: 'Health & Medical',
    count: 28,
    icon: <Stethoscope />,
  },
  {
    name: 'Shopping & Retail',
    count: 15,
    icon: <BookOpen />,
  },
  {
    name: 'Others',
    count: 62,
    icon: <Users />,
  },
];

export function PopularCategoriesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleCategoryClick = (categoryName: string) => {
    router.push(
      `/listings?category=${encodeURIComponent(categoryName)}&showFilters=true`
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.offsetWidth * 0.8; // Scroll by 80% of the container width
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const cardVariants = {
    hover: {
      y: -10,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
  } as const;

  return (
    <div className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Popular Categories
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="h-1 w-24 rounded-full bg-orange-500" />
            </div>
          </div>

          {/* Scroll Buttons */}
          <div className="absolute inset-y-0 left-0 z-10 hidden items-center md:flex">
            <button
              onClick={() => scroll('left')}
              className="rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-10 hidden items-center md:flex">
            <button
              onClick={() => scroll('right')}
              className="rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="hide-scrollbar flex space-x-6 overflow-x-auto pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                onClick={() => handleCategoryClick(category.name)}
                className="group flex h-48 w-48 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-orange-600 transition-colors hover:bg-orange-500 hover:text-white"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="mb-3">
                  {React.cloneElement(category.icon, {
                    size: 40,
                    strokeWidth: 1.5,
                  })}
                </div>
                <p className="font-semibold text-gray-800 transition-colors group-hover:text-white">
                  {category.name}
                </p>
                <span className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm text-white transition-colors group-hover:bg-white group-hover:text-orange-500">
                  {category.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
