'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGetCategories, useGetSectors } from '@/service/taxonomy/hook';

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

// --- Business Category Menu Component ---
const BusinessCategoryMenu = () => {
  const { data: sectors = [] } = useGetSectors();
  const { data: categories = [] } = useGetCategories();

  const categoriesBySector = sectors.map(sector => ({
    name: sector.name,
    subCategories: categories
      .filter(c => c.sectorId === sector.id)
      .map(c => c.name),
  }));

  if (categoriesBySector.length === 0) {
    return <div className="p-4">Loading categories...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 p-4 md:grid-cols-4 lg:grid-cols-6 lg:p-6">
        {categoriesBySector.map(category => (
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
    title: 'Marketplace',
    href: '/marketplace',
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
];

export function NavMenu({ role }: { role?: string }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const filteredMenuItems = menuItems.filter(item => {
    if (role === 'customer' && item.title === 'Pricing') return false;
    return true;
  });

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
      {filteredMenuItems.map((item, index) => (
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
                className={`h-4 w-4 transition-transform ${hoveredItem === item.title ? 'rotate-180' : ''
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
                className={`z-50 bg-white text-gray-900 shadow-lg
                  ${item.title === 'Business Category'
                    ? 'fixed left-0 top-16 w-full border-t border-gray-100'
                    : 'absolute left-0 top-full mt-2 rounded-lg'
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
