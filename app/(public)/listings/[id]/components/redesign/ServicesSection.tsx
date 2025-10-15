
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ServicesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Services</h2>
      <Card className="rounded-lg overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Book Our Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            We offer a range of professional services. Please contact us to book an appointment or request a quote.
          </p>
          <Button className="bg-orange-600 text-white hover:bg-orange-700">
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
