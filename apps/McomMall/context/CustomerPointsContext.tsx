'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetStats } from '@/service/stats';
import { CustomerStatsDto } from '@/service/stats/types';

interface CustomerPointsContextType {
  points: number;
  addPoints: (amount: number) => void;
  redeemPoints: (cost: number) => boolean;
  isLoading: boolean;
}

const CustomerPointsContext = createContext<CustomerPointsContextType | undefined>(undefined);

export const CustomerPointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: stats, isLoading } = useGetStats<CustomerStatsDto>();
  // The API reports the real spendable balance. Optimistic adjustments are
  // kept only until /stats refetches, then discarded in favour of the server.
  const [override, setOverride] = useState<number | null>(null);

  const balance = stats?.pointsBalance ?? 0;
  const currentPoints = override ?? balance;

  useEffect(() => {
    setOverride(null);
  }, [balance]);

  const addPoints = (amount: number) => {
    setOverride(currentPoints + amount);
  };

  const redeemPoints = (cost: number): boolean => {
    if (currentPoints >= cost) {
      setOverride(currentPoints - cost);
      return true;
    }
    return false;
  };

  return (
    <CustomerPointsContext.Provider
      value={{
        points: currentPoints,
        addPoints,
        redeemPoints,
        isLoading,
      }}
    >
      {children}
    </CustomerPointsContext.Provider>
  );
};

export const useCustomerPoints = () => {
  const context = useContext(CustomerPointsContext);
  if (context === undefined) {
    throw new Error('useCustomerPoints must be used within a CustomerPointsProvider');
  }
  return context;
};
