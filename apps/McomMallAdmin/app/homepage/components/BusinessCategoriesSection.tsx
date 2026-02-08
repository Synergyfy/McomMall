'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  Variants,
  useMotionValue,
  animate,
  AnimationPlaybackControls,
} from 'framer-motion';
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
  onMouseEnter,
}: {
  item: SubCategory;
  onClick: (name: string) => void;
  onMouseEnter: () => void;
}) => (
  <motion.div
    onClick={() => onClick(item.name)}
    onMouseEnter={onMouseEnter}
    className="group flex h-48 w-48 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-orange-600 transition-colors hover:bg-orange-500 hover:text-white"
    variants={cardVariants}
    whileHover="hover"
  >
    <div className="mb-3 text-orange-600 transition-colors group-hover:text-white">
      {React.cloneElement(item.icon, {
        size: 40,
        strokeWidth: 1.5,
      })}
    </div>
    <p className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-white">
      {item.name}
    </p>
  </motion.div>
);

const GridItem = ({
  item,
  onClick,
}: {
  item: SubCategory;
  onClick: (name: string) => void;
}) => (
  <motion.div
    onClick={() => onClick(item.name)}
    className="group flex h-40 w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-orange-600 transition-colors hover:bg-orange-500 hover:text-white"
    variants={cardVariants}
    whileHover="hover"
  >
    <div className="mb-3 text-orange-600 transition-colors group-hover:text-white">
      {React.cloneElement(item.icon, {
        size: 32,
        strokeWidth: 1.5,
      })}
    </div>
    <p className="font-semibold text-gray-800 transition-colors group-hover:text-white">
      {item.name}
    </p>
  </motion.div>
);

export function BusinessCategoriesSection() {
  const router = useRouter();
  const x = useMotionValue(0);
  const [controls, setControls] = useState<AnimationPlaybackControls | null>(
    null
  );

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

  useEffect(() => {
    const newControls = animate(x, [0, -208 * allSubcategories.length], {
      repeat: Infinity,
      repeatType: 'loop',
      duration: 350,
      ease: 'linear',
      repeatDelay: 5,
    });
    setControls(newControls);

    return () => {
      newControls.stop();
    };
  }, [x, allSubcategories]);

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
      <div className="hidden md:block">
        <motion.div className="w-full">
          <motion.div
            className="flex gap-4"
            style={{ x }}
            onMouseLeave={() => controls?.play()}
          >
            {duplicatedCategories.map((item, index) => (
              <MarqueeItem
                key={index}
                item={item}
                onClick={handleCategoryClick}
                onMouseEnter={() => controls?.pause()}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="md:hidden px-6">
        <div className="grid grid-cols-2 gap-4">
          {allSubcategories.slice(0, 6).map((item, index) => (
            <GridItem key={index} item={item} onClick={handleCategoryClick} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/listings?showFilters=true')}
            className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg"
          >
            View All Categories
          </button>
        </div>
      </div>
    </div>
  );
}
