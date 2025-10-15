
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Star, Gift } from 'lucide-react';

export default function PromotionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Promotions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-lg shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Vouchers</CardTitle>
            <Ticket className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Details about available vouchers will be shown here.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Loyalty & Rewards</CardTitle>
            <Star className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Information on our loyalty program and rewards.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Gift Cards</CardTitle>
            <Gift className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Purchase and use our gift cards.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
