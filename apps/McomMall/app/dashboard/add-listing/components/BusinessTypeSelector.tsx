'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Wrench, CheckCircle, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BusinessType {
  id: 'Product' | 'Service';
  title: string;
  description: string;
  icon: React.ElementType;
}

const businessTypes: BusinessType[] = [
  {
    id: 'Product',
    title: 'Product Seller',
    description:
      'Choose this if you sell physical or digital products (e.g., shop owners, restaurants, Amazon/eBay/Etsy/Shopify sellers). You’ll add products after publishing.',
    icon: ShoppingCart,
  },
  {
    id: 'Service',
    title: 'Service Provider',
    description:
      'Choose this if you provide services (e.g., plumber, barber, consultant, cleaner). You’ll add services/packages after publishing.',
    icon: Wrench,
  },
];

interface BusinessTypeSelectorProps {
  onNext: (selectedTypes: string[]) => void;
}

const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({
  onNext,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleSelect = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    hover: { scale: 1.03 },
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {businessTypes.map(type => {
          const isSelected = selectedTypes.includes(type.id);
          return (
            <motion.div
              key={type.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => handleSelect(type.id)}
              className="cursor-pointer"
            >
              <Card
                className={`relative h-full transition-all duration-300 ${
                  isSelected ? 'border-orange-700 shadow-lg' : 'border-border'
                }`}
              >
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <CheckCircle className="w-6 h-6 text-orange-700" />
                  ) : (
                    <Square className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <CardHeader className="flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-600/10">
                    <type.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onNext(selectedTypes)}
          disabled={selectedTypes.length === 0}
          size="lg"
          className="bg-orange-700 hover:bg-orange-800"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BusinessTypeSelector;
