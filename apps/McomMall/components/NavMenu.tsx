'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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

// --- Menu Data ---
interface NavMenuItem {
  title: string;
  href?: string;
  content?: React.ReactNode;
}

export const menuItems: NavMenuItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
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
