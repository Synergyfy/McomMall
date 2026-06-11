'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useGeoContext } from '@/context/GeoContext';
import GeoBadge from '../badges/GeoBadge';
import { Store, Users, Megaphone, MapPin, X } from 'lucide-react';
import { LocationOnboarding } from '../onboarding/LocationOnboarding';
import { LocalCampaignsPanel } from '../campaigns/LocalCampaignsPanel';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';

const NearbyDiscovery = dynamic(() => import('../marketplace/NearbyDiscovery'), { ssr: false });

export default function GeographicDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { badge, nearestHighStreet, distanceToHighStreet } = useGeoContext();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCampaignPanelOpen, setIsCampaignPanelOpen] = useState(false);
  
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (pathname === '/dashboard/localmall') {
    return <>{children}</>;
  }

  if (userRole !== 'owner') {
    return <>{children}</>;
  }

  if (!badge) {
    return <>{children}</>;
  }

  const renderWelcomeBanner = () => {
    switch (badge) {
      case 'HIGH_STREET':
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">Welcome to {nearestHighStreet?.name}</h2>
                <p className="text-amber-800">You are a Premium High Street business. Access exclusive local expos and featured mall visibility.</p>
              </div>
              <GeoBadge type={badge} />
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Store className="w-4 h-4" /> View High Street Mall
              </button>
              <button 
                onClick={() => setIsCampaignPanelOpen(true)}
                className="flex items-center gap-2 bg-white text-amber-700 border border-amber-300 hover:bg-amber-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Megaphone className="w-4 h-4" /> Local Campaigns
              </button>
            </div>
          </div>
        );
      case 'HYPERLOCAL':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Hyperlocal Ecosystem: {nearestHighStreet?.name}</h2>
                <p className="text-blue-800">You are {distanceToHighStreet?.toFixed(1)} miles from the high street. Activate radius targeting to reach nearby customers.</p>
              </div>
              <GeoBadge type={badge} />
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MapPin className="w-4 h-4" /> View Radius Map
              </button>
              <button 
                onClick={() => setIsCampaignPanelOpen(true)}
                className="flex items-center gap-2 bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" /> Community Rewards
              </button>
            </div>
          </div>
        );
      case 'NEARBY':
        return (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Nearby Region: {nearestHighStreet?.name}</h2>
                <p className="text-emerald-800">Participate in broader regional campaigns and extend your commerce reach.</p>
              </div>
              <GeoBadge type={badge} />
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MapPin className="w-4 h-4" /> View Region Map
              </button>
              <button 
                onClick={() => setIsCampaignPanelOpen(true)}
                className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Megaphone className="w-4 h-4" /> Regional Campaigns
              </button>
            </div>
          </div>
        );
      case 'REMOTE':
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Member</h2>
                <p className="text-gray-600">You are operating outside the main geographic clusters. Connect with the broader platform features.</p>
              </div>
              <GeoBadge type={badge} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col relative w-full min-w-0">
      <div className="hidden sm:block">
        {renderWelcomeBanner()}
      </div>
      {children}

      <LocalCampaignsPanel 
        isOpen={isCampaignPanelOpen} 
        onOpenChange={setIsCampaignPanelOpen} 
      />

      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{nearestHighStreet?.name} Ecosystem</h3>
                <p className="text-sm text-gray-500">Interactive geographic clustering map</p>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative w-full">
              <NearbyDiscovery />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
