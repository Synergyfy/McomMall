'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useGeoIntelligence } from '@/lib/hooks/useGeoIntelligence';

const GeoContext = createContext<ReturnType<typeof useGeoIntelligence> | null>(null);

export const GeoProvider = ({ children }: { children: ReactNode }) => {
  const geo = useGeoIntelligence();
  return <GeoContext.Provider value={geo}>{children}</GeoContext.Provider>;
};

export const useGeoContext = () => {
  const context = useContext(GeoContext);
  if (!context) throw new Error("useGeoContext must be used within GeoProvider");
  return context;
};
