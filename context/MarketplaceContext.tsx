'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PromotionalItem } from '@/lib/listing-data';

interface MarketplaceContextType {
  selectedItem: PromotionalItem | null;
  setSelectedItem: (item: PromotionalItem | null) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<PromotionalItem | null>(null);

  return (
    <MarketplaceContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplaceContext must be used within a MarketplaceProvider');
  }
  return context;
}
