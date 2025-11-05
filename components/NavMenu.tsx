'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { businessCategories } from '../lib/business-categories';

// --- Reusable ListItem Component ---
export const ListItem = ({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
    >
      <div className="text-sm font-semibold leading-none text-gray-900">
        {title}
      </div>
      {children && (
        <p className="line-clamp-2 text-sm leading-snug text-gray-500">
          {children}
        </p>
      )}
    </Link>
  );
};

// --- Popular Categories Data ---
const popularCategories = [
  {
    name: 'Hospitality',
    subCategories: [
      'Restaurants',
      'Cafés / Coffee Shops',
      'Takeaways / Delivery',
      'Bakeries',
      'Bars & Pubs',
      'Breweries, Wineries & Distilleries',
      'Catering Services',
      'Dessert Shops',
      'Accommodation & Travel',
    ],
  },
  {
    name: 'Shopping & Retail',
    subCategories: [
      'Clothing & Fashion',
      'Beauty & Cosmetics',
      'Home & Garden',
      'Electronics & Appliances',
      'Books, Stationery & Gifts',
      'Health Food / Organic',
      'Pet Supplies',
      'Toys & Hobbies',
    ],
  },
  {
    name: 'Trades & Home Services',
    subCategories: [
      'Plumbing & Heating',
      'Electrical Services',
      'Builders & Construction',
      'Carpentry & Joinery',
      'Roofing & Guttering',
      'Flooring & Tiling',
      'Cleaning Services',
      'Gardening & Landscaping',
      'Pest Control',
      'Locksmith & Security',
      'Handyman Services',
      'Decorators (Painters, Wallpapering)',
    ],
  },
  {
    name: 'Beauty & Wellness',
    subCategories: [
      'Hairdressers & Barbers',
      'Nail Salons',
      'Beauty Salons',
      'Spas & Wellness Centres',
      'Massage Therapists',
      'Tattoo & Piercing',
      'Skincare Clinics',
      'Tanning (Spray, Beds)',
    ],
  },
  {
    name: 'Health & Medical',
    subCategories: [
      'General Practitioners (GP)',
      'Dentists',
      'Opticians',
      'Physiotherapists',
      'Massage Therapy',
      'Counselling & Mental Health',
      'Chiropractors',
      'Diagnostic Services',
      'Hospitals & Clinics',
      'Weight Loss & Nutrition',
    ],
  },
  {
    name: 'Others',
    subCategories: [
      'Property & Real Estate',
      'Fitness & Sports',
      'Automotive & Transport',
      'Pets & Animal Services',
      'Manufacturing & Industrial',
      'Non-Profit & Community',
      'Education & Training',
      'Arts, Entertainment & Events',
      'Media, Marketing & Professional Services',
    ],
  },
];

// --- Business Category Menu Component ---
const BusinessCategoryMenu = () => {
  return (
    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 p-4 md:grid-cols-4 lg:grid-cols-6 lg:p-6">
      {popularCategories.map(category => (
        <div key={category.name} className="space-y-3">
          <Link
            href={`/listings?category=${encodeURIComponent(category.name)}`}
          >
            <h3 className="font-bold text-gray-900 hover:text-red-500 transition-colors">
              {category.name}
            </h3>
          </Link>
          <ul className="space-y-2">
            {category.subCategories.map(subCategory => (
              <li key={subCategory}>
                <Link
                  href={`/listings?category=${encodeURIComponent(
                    category.name
                  )}&subcategory=${encodeURIComponent(subCategory)}`}
                  className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {subCategory}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// --- Menu Data ---
export const menuItems = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Seasons',
    content: (
      <div className="w-64 p-4">
        <ListItem href="/seasons/winter" title="Winter">
          Seasonal specials and winter collections.
        </ListItem>
        <ListItem href="/seasons/spring" title="Spring">
          Fresh arrivals for the spring season.
        </ListItem>
        <ListItem href="/seasons/summer" title="Summer">
          Explore our summer sales and new items.
        </ListItem>
        <ListItem href="/seasons/autumn" title="Autumn">
          Explore our autumn sales and new items.
        </ListItem>
      </div>
    ),
  },
  {
    title: 'Business Category',
    content: <BusinessCategoryMenu />,
  },
  {
    title: 'Listings',
    content: (
      <div className="w-64 p-4">
        <ListItem href="/listings" title="Claim Listing">
          Find and claim your business profile.
        </ListItem>
        <ListItem href="/dashboard/add-listing" title="Create New Listing">
          Add your business to our directory.
        </ListItem>
      </div>
    ),
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
    {
    title: 'Marketplace',
    href: '/marketplace',
  },
];

// --- Animation Variants ---
const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.2 } },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export function NavMenu() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (title: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoveredItem(title);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  };

  return (
    <nav className="hidden items-center space-x-2 md:flex">
      {menuItems.map((item, index) => (
        <div
          key={item.title}
          className="relative"
          onMouseEnter={() => handleMouseEnter(item.title)}
          onMouseLeave={handleMouseLeave}
        >
          {item.href ? (
            <Link
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              {item.title}
            </Link>
          ) : (
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700">
              {item.title}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  hoveredItem === item.title ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}

          <AnimatePresence>
            {hoveredItem === item.title && item.content && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`absolute top-full z-50 mt-2 rounded-lg bg-white text-gray-900 shadow-lg
                  ${
                    item.title === 'Business Category'
                      ? 'left-1/2 w-screen max-w-7xl -translate-x-1/2'
                      : 'left-0'
                  }`}
              >
                {item.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}
