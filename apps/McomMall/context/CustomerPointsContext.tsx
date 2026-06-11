'use client';

import React, { createContext, useContext, useState } from 'react';
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
  const [points, setPoints] = useState<number | null>(null);

  // Derive points cleanly from stats when loaded, falling back to 1240 default
  const currentPoints = points !== null 
    ? points 
    : (stats?.totalNumberOfPointsEarned !== undefined ? stats.totalNumberOfPointsEarned : 1240);

  const addPoints = (amount: number) => {
    setPoints(() => currentPoints + amount);
  };

  const redeemPoints = (cost: number): boolean => {
    if (currentPoints >= cost) {
      setPoints(() => currentPoints - cost);
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
        isLoading 
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
