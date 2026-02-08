import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2 } from 'lucide-react';

interface PricingNavProps {
  orientation: 'vertical' | 'horizontal';
  activeView: 'payg' | 'cobranded';
  setActiveView: (view: 'payg' | 'cobranded') => void;
}

export default function PricingNav({
  orientation,
  activeView,
  setActiveView,
}: PricingNavProps) {
  return (
    <nav className={`flex w-fit gap-2`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1"
      >
        <Button
          variant={activeView === 'payg' ? 'default' : 'ghost'}
          className={`w-full justify-start text-left ${
            activeView === 'payg' && 'bg-orange-600 hover:bg-orange-700'
          }`}
          onClick={() => setActiveView('payg')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Pay As You Go
        </Button>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1"
      >
        <Button
          variant={activeView === 'cobranded' ? 'default' : 'ghost'}
          className={`w-full justify-start text-left ${
            activeView === 'cobranded' && 'bg-orange-600 hover:bg-orange-700'
          }`}
          onClick={() => setActiveView('cobranded')}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Co-Branded
        </Button>
      </motion.div>
    </nav>
  );
}
