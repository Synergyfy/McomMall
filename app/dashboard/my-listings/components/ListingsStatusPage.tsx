'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { List, LayoutDashboard } from 'lucide-react';

interface ListingsStatusPageProps {
  title: string;
  description: string;
}

const ListingsStatusPage: React.FC<ListingsStatusPageProps> = ({ title, description }) => {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6"
      >
        <List className="h-24 w-24 text-gray-300" />
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 15, -10, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          <LayoutDashboard className="h-8 w-8 text-pink-500" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-3 text-4xl font-bold tracking-tight text-gray-800"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="max-w-md text-lg text-gray-600"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.6,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="mt-8 flex items-center space-x-2"
      >
        <div className="h-2 w-16 animate-pulse rounded-full bg-pink-300"></div>
        <div className="h-2 w-8 animate-pulse rounded-full bg-gray-300"></div>
        <div className="h-2 w-12 animate-pulse rounded-full bg-pink-300"></div>
      </motion.div>
    </div>
  );
};

export default ListingsStatusPage;
