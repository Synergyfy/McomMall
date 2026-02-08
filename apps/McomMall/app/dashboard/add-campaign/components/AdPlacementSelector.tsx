'use client';
import { BarChart2 } from 'lucide-react';
import { AdPlacement } from '../types';
import { PlacementCard } from './PlacementCard';

interface AdPlacementSelectorProps {
  placementsData: AdPlacement[];
  selectedPlacements: string[];
  togglePlacement: (id: string) => void;
  error?: string;
}

export const AdPlacementSelector = ({
  placementsData,
  selectedPlacements,
  togglePlacement,
  error,
}: AdPlacementSelectorProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <BarChart2 size={24} />
        Select Ad Placement
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {placementsData.map(placement => (
          <PlacementCard
            key={placement.id}
            placement={placement}
            isSelected={selectedPlacements.includes(placement.id)}
            onSelect={togglePlacement}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-4 text-center">{error}</p>
      )}
    </div>
  );
};
