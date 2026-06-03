'use client';

import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import {
  MoreHorizontal,
  Diamond,
  Building2,
  MapPin,
  Compass,
  Globe,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Import Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRecentActivities } from '@/service/activities/hook';
import { useGetStats } from '@/service/stats';
import StatsCards from './component/StatsCards';
import RecentActivities from './component/RecentActivities';
import EarningProgressionChart from './component/EarningProgressionChart';
import { CustomerStatsDto, OwnerStatsDto } from '@/service/stats/types';
import { UserRole } from '@/service/auth/types';
import { MobileDashboardHub } from './component/MobileDashboardHub';

// --- TYPE DEFINITIONS ---

interface ListingPackage {
  name: string;
  description: string;
}

interface ChartData {
  name: string;
  views: number;
}

const listingPackage: ListingPackage = {
  name: 'Basic',
  description: 'You have 0 listings posted out of 1, listed for 30 days',
};

// --- SUB-COMPONENTS ---
const ListingPackages: FC<{ pkg: ListingPackage }> = ({ pkg }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Your Listing Packages
      </CardTitle>
    </CardHeader>
    <CardContent className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Diamond className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">{pkg.name}</p>
        <p className="text-sm text-gray-500">{pkg.description}</p>
      </div>
    </CardContent>
  </Card>
);

import { useState, useEffect } from 'react';

// --- MAIN PAGE COMPONENT ---
const DashboardPage: FC = () => {
  const { userName, userRole } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: isLoadingStats } = useGetStats<OwnerStatsDto | CustomerStatsDto>();
  const {
    data: activities,
    isLoading: isLoadingActivities,
  } = useRecentActivities();

  const [proximityTier, setProximityTier] = useState<string | null>(null);
  const [proximityDistance, setProximityDistance] = useState<string | null>(null);

  useEffect(() => {
    const tier = localStorage.getItem('businessProximityTier');
    const dist = localStorage.getItem('businessProximityDistance');
    if (tier) setProximityTier(tier);
    if (dist) setProximityDistance(dist);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-wrap items-center gap-3">
          Hello {userName || 'User'}!

          {proximityTier && (
            <span 
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm transition-all select-none animate-fade-in ${
                proximityTier === 'high_street'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/10'
                  : proximityTier === 'hyper_local'
                    ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 shadow-orange-500/10'
                    : proximityTier === 'nearby'
                      ? 'bg-gradient-to-r from-orange-600 via-red-500 to-red-600 shadow-red-500/10'
                      : 'bg-gradient-to-r from-red-600 via-red-700 to-orange-800 shadow-red-700/10'
              }`}
            >
              {proximityTier === 'high_street' && (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  High Street Verified
                </>
              )}
              {proximityTier === 'hyper_local' && (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  Hyper Local ({proximityDistance ? `${parseFloat(proximityDistance).toFixed(1)}m` : '<5m'})
                </>
              )}
              {proximityTier === 'nearby' && (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  Nearby ({proximityDistance ? `${parseFloat(proximityDistance).toFixed(1)}m` : '5-10m'})
                </>
              )}
              {proximityTier === 'national' && (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  National ({proximityDistance ? `${parseFloat(proximityDistance).toFixed(0)}m+` : '>10m'})
                </>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse shrink-0" />
            </span>
          )}
        </h1>
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Mobile Hub View */}
      <div className="block sm:hidden">
        <MobileDashboardHub />
      </div>

      {/* Desktop Overview View */}
      <main className="hidden sm:block space-y-8">
        {isLoadingStats ? (
          <p>Loading statistics...</p>
        ) : stats && userRole ? (
          <>
            <StatsCards stats={stats} role={userRole as UserRole} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
              <div className="lg:col-span-1 space-y-8">
                <RecentActivities
                  activities={activities}
                  isLoading={isLoadingActivities}
                />
              </div>
              {userRole === 'owner' && (
                <div className="lg:col-span-2 space-y-8">
                  <ListingPackages pkg={listingPackage} />
                  <EarningProgressionChart />
                </div>
              )}
            </div>
          </>
        ) : (
          <p>No statistics available.</p>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;