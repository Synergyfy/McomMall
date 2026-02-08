// components/ui/PricingSidebar.tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2 } from 'lucide-react';

interface PricingSidebarProps {
  activeView: 'payg' | 'cobranded';
  setActiveView: (view: 'payg' | 'cobranded') => void;
}

export default function PricingSidebar({
  activeView,
  setActiveView,
}: PricingSidebarProps) {
  return (
    <aside className="w-full md:w-64 border-b md:border-r md:border-b-0 p-4 bg-background">
      <nav className="flex md:flex-col gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1"
        >
          <Button
            variant={activeView === 'payg' ? 'default' : 'ghost'}
            className="w-full justify-start text-left bg-blue-700 hover:bg-blue-800 md:bg-transparent md:hover:bg-transparent"
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
            className="w-full justify-start text-left bg-blue-700 hover:bg-blue-800 md:bg-transparent md:hover:bg-transparent"
            onClick={() => setActiveView('cobranded')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Co-Branded
          </Button>
        </motion.div>
      </nav>
    </aside>
  );
}
