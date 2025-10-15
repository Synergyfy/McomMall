
'use client';

import { motion } from 'framer-motion';

export default function PromotionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Promotions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Vouchers</h3>
          <p className="text-gray-700">
            Details about available vouchers will be shown here.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Loyalty & Rewards</h3>
          <p className="text-gray-700">
            Information on our loyalty program and rewards.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Gift Cards</h3>
          <p className="text-gray-700">
            Purchase and use our gift cards.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
