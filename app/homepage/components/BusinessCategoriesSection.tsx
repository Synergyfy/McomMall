'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
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
  Briefcase,
  Dog,
  Plane,
  Factory,
  Users,
  ShoppingBag,
  HeartHandshake,
  LucideProps,
} from 'lucide-react';
import { businessCategories } from '@/lib/business-categories';

const iconMap: { [key: string]: React.ReactElement<LucideProps> } = {
  Hospitality: <UtensilsCrossed />,
  'Shopping & Retail': <ShoppingBag />,
  'Trades & Home Services': <Wrench />,
  'Beauty & Wellness': <Sparkles />,
  'Health & Medical': <Stethoscope />,
  'Education & Training': <BookOpen />,
  'Fitness & Sports': <Dumbbell />,
  'Arts, Entertainment & Events': <Ticket />,
  'Automotive & Transport': <Car />,
  'Property & Real Estate': <Building2 />,
  'Media, Marketing & Professional Services': <Briefcase />,
  'Pets & Animal Services': <Dog />,
  'Accommodation & Travel': <Plane />,
  'Manufacturing & Industrial': <Factory />,
  'Non-Profit & Community': <HeartHandshake />,
  Others: <Users />,
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const cardVariants: Variants = {
  hover: {
    y: -5,
    transition: { type: 'spring', stiffness: 300 },
  },
};

interface SubCategory {
  name: string;
  mainCategory: string;
  icon: React.ReactElement<LucideProps>;
  items?: string[];
}

const MarqueeItem = ({
  item,
  onClick,
}: {
  item: SubCategory;
  onClick: (name: string) => void;
}) => (
  <motion.div
    onClick={() => onClick(item.name)}
    className="group flex h-48 w-60 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border bg-white p-6 text-center shadow-md transition-colors hover:bg-orange-500 hover:text-white"
    variants={cardVariants}
    whileHover="hover"
  >
    <div className="mb-4 text-orange-500 transition-colors group-hover:text-white">
      {React.cloneElement(item.icon, { size: 48, strokeWidth: 1.5 })}
    </div>
    <p className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-white">
      {item.name}
    </p>
  </motion.div>
);

export function BusinessCategoriesSection() {
  const router = useRouter();

  const allSubcategories = useMemo(() => {
    const subcategories = businessCategories.flatMap(category =>
      category.subCategories.map(sub => ({
        ...sub,
        mainCategory: category.name,
        icon: iconMap[category.name] || <Users />,
      }))
    );
    return shuffleArray(subcategories);
  }, []);

  const duplicatedCategories = useMemo(
    () => [...allSubcategories, ...allSubcategories],
    [allSubcategories]
  );

  const handleCategoryClick = (categoryName: string) => {
    router.push(
      `/listings?category=${encodeURIComponent(categoryName)}&showFilters=true`
    );
  };

  const marqueeVariants: Variants = {
    animate: {
      x: [0, -200 * allSubcategories.length],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 250, // Slower animation
          ease: 'linear',
          repeatDelay: 5, // Pause for 5 seconds
        },
      },
    },
  };

  return (
    <div className="bg-white py-20 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-full px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Explore Business Categories
          </h2>
          <div className="mt-6 flex justify-center">
            <div className="h-1.5 w-32 rounded-full bg-orange-500" />
          </div>
        </div>
      </div>
      <motion.div className="w-full" variants={marqueeVariants} animate="animate">
        <motion.div className="flex gap-4">
          {duplicatedCategories.map((item, index) => (
            <MarqueeItem
              key={index}
              item={item}
              onClick={handleCategoryClick}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
