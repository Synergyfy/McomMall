import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { PricingTier } from '../types/index';

interface PricingCardProps {
  tier: PricingTier;
  isPayg?: boolean;
  listingId: string | null;
  onPayNow: (tier: PricingTier) => void;
  onStartTrial: (tier: PricingTier) => void;
}

export default function PricingCard({
  tier,
  isPayg,
  listingId,
  onPayNow,
  onStartTrial,
}: PricingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePayNow = () => {
    onPayNow(tier);
  };

  const handleStartTrial = () => {
    onStartTrial(tier);
  };

  const accent = tier.accent || 'teal';
  const customColor = tier.colorCode;

  const accentClasses = {
    teal: '',
    purple: 'border-orange-500',
    yellow: '',
  };

  const priceColor = {
    teal: 'text-blue-900',
    purple: 'text-orange-700',
    yellow: 'text-blue-900',
  };

  const checkColor = {
    teal: 'text-blue-900',
    purple: 'text-orange-700',
    yellow: 'text-blue-900',
  };

  const buttonColor = {
    teal: 'bg-orange-600 hover:bg-orange-700',
    purple: 'bg-orange-600 hover:bg-orange-700',
    yellow: 'bg-orange-600 hover:bg-orange-700',
  };

  const outlineButtonColor = {
    teal: 'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white',
    purple:
      'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white',
    yellow:
      'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white',
  };

  // Styles overrides if customColor is present
  const cardStyle = customColor ? { borderColor: customColor } : {};
  const priceStyle = customColor ? { color: customColor } : {};
  const checkStyle = customColor ? { color: customColor } : {};
  const buttonStyle = customColor ? { backgroundColor: customColor } : {};
  const outlineButtonStyle = customColor ? { borderColor: customColor, color: customColor } : {};

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={`flex flex-col h-full bg-white ${
          !customColor ? accentClasses[accent] : ''
        } border-2 shadow-md`}
        style={cardStyle}
      >
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
            {tier.name}
          </CardTitle>
          <h3
            className={`text-2xl sm:text-3xl font-extrabold ${
              !customColor ? priceColor[accent] : ''
            }`}
            style={priceStyle}
          >
            {tier.price}
          </h3>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {isPayg && (
            <CardFooter className="flex flex-col sm:flex-row gap-2 p-0">
              <Button
                onClick={handlePayNow}
                className={`w-full sm:w-1/2 text-white cursor-pointer ${
                  !customColor ? buttonColor[accent] : ''
                } `}
                style={buttonStyle}
              >
                Pay Now
              </Button>
              <Button
                onClick={handleStartTrial}
                className={`w-full sm:w-1/2 border bg-white cursor-pointer ${
                  !customColor ? outlineButtonColor[accent] : ''
                }`}
                style={outlineButtonStyle}
              >
                Start Trial
              </Button>
            </CardFooter>
          )}
          {tier.inherits && (
            <p className="text-sm font-semibold text-gray-600">
              Everything in {tier.inherits}, plus:
            </p>
          )}
          <ul className="space-y-2">
            {tier.primaryFeatures.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start text-sm text-gray-700"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    !customColor ? checkColor[accent] : ''
                  } flex-shrink-0 mt-1`}
                  style={checkStyle}
                />
                {feature}
              </li>
            ))}
          </ul>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ul className="space-y-2 pt-4 border-t border-gray-200/80">
                  {tier.secondaryFeatures?.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          !customColor ? checkColor[accent] : ''
                        } flex-shrink-0 mt-1`}
                        style={checkStyle}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          {tier.secondaryFeatures && tier.secondaryFeatures.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center font-semibold text-orange-800 text-lg`}
            >
              {isExpanded ? 'See less features' : 'See more features'}
              {isExpanded ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
