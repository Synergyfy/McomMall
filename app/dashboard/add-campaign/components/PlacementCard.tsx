'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdPlacement } from '../types';
import { cn } from '@/lib/utils';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlacementCardProps {
  placement: AdPlacement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PlacementCard = ({
  placement,
  isSelected,
  onSelect,
}: PlacementCardProps) => {
  const { id, title, price, icon: Icon } = placement;

  return (
    <motion.div
      onClick={() => onSelect(id)}
      className={cn(
        'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center gap-2',
        isSelected
          ? 'border-orange-800 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-400'
      )}
      whileTap={{ scale: 0.97 }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 right-2 text-orange-800"
          >
            <CheckCircle2 size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      <Icon className="h-16 w-16 text-gray-400 opacity-80" />

      <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
        {title}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="bg-orange-800 text-white border-orange-800">
              <p>Details about the {title.toLowerCase()} placement.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>
      <p className="text-gray-600">£{price.toFixed(2)}</p>
    </motion.div>
  );
};
