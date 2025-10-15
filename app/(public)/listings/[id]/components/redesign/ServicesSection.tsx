
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Our Services</h2>
      <p className="text-gray-700">
        Information about services will be displayed here.
      </p>
    </motion.div>
  );
}
