import React from 'react';
import { PostcodeInput } from '../location/PostcodeInput';
import { useGeoContext } from '@/context/GeoContext';
import { Loader2, Map, ShieldCheck } from 'lucide-react';
import GeoBadge from '../badges/GeoBadge';

export function LocationOnboarding({ onComplete }: { onComplete: (badgeInfo: any) => void }) {
  const geo = useGeoContext();

  const handlePostcodeSelect = async (postcode: string) => {
    await geo.analyzeLocation(postcode);
  };

  const handleComplete = () => {
    onComplete({
      badge: geo.badge,
      highStreet: geo.nearestHighStreet,
      distance: geo.distanceToHighStreet,
      latitude: geo.latitude,
      longitude: geo.longitude
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Map className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Where is your business located?</h2>
        <p className="text-gray-500 text-lg">
          We use your location to connect you with nearby customers, high street ecosystems, and exclusive local campaigns.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <PostcodeInput onSelect={handlePostcodeSelect} />
      </div>

      {geo.isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Analyzing geographic ecosystem...</p>
        </div>
      )}

      {geo.badge && !geo.isLoading && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Verified</h3>
              <p className="text-gray-600 mb-4">
                You are located {geo.distanceToHighStreet?.toFixed(1)} miles from {geo.nearestHighStreet?.name}.
              </p>
              <div className="mb-6">
                <GeoBadge type={geo.badge} />
              </div>
              <button 
                onClick={handleComplete}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
