'use client';

import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import {
  Diamond,
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
import { DashboardHome } from './component/customer/DashboardHome';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, PackagePlus, CalendarPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const DashboardPage: FC = () => {
  const router = useRouter();
  const { userName, userRole } = useSelector((state: RootState) => state.auth);
  const { points, addPoints } = useCustomerPoints();
  const { data: stats, isLoading: isLoadingStats } = useGetStats<OwnerStatsDto | CustomerStatsDto>();
  const {
    data: activities,
    isLoading: isLoadingActivities,
  } = useRecentActivities();

  const [skippedProducts, setSkippedProducts] = useState(false);
  const [skippedServices, setSkippedServices] = useState(false);

  useEffect(() => {
    setSkippedProducts(localStorage.getItem('hybridSkippedProducts') === 'true');
    setSkippedServices(localStorage.getItem('hybridSkippedServices') === 'true');
  }, []);

  const dismissReminder = (type: 'products' | 'services') => {
    if (type === 'products') {
      localStorage.removeItem('hybridSkippedProducts');
      setSkippedProducts(false);
    } else {
      localStorage.removeItem('hybridSkippedServices');
      setSkippedServices(false);
    }
  };

  if (userRole === 'customer' || userRole === UserRole.CUSTOMER) {
    return (
      <DashboardHome
        userName={userName || ''}
        points={points}
        stats={stats || null}
        isLoadingStats={isLoadingStats}
        activities={activities}
        isLoadingActivities={isLoadingActivities}
        onAddPoints={addPoints}
        setActiveTab={(tab) => {
          if (tab === 'home') router.push('/dashboard');
          else if (tab === 'discover') router.push('/dashboard/discover');
          else if (tab === 'promotions') router.push('/dashboard/promotions');
          else if (tab === 'rewards') router.push('/dashboard/rewards');
          else if (tab === 'events') router.push('/dashboard/events');
          else if (tab === 'profile') router.push('/dashboard/my-profile');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-wrap items-center gap-3">
          Hello {userName || 'User'}!
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

      {/* Setup Reminders */}
      {(skippedProducts || skippedServices) && (
        <div className="mb-8 flex flex-col gap-4">
          {skippedProducts && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <PackagePlus size={100} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Finish Your Product Setup</h3>
                  <p className="text-sm text-gray-600 mt-1">You skipped adding a product during onboarding. Get your first product live to start selling!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10 sm:ml-auto">
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100" onClick={() => dismissReminder('products')}>Dismiss</Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20" onClick={() => router.push('/dashboard/store/products/add-product')}>
                  Add Product Now
                </Button>
              </div>
            </div>
          )}

          {skippedServices && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <CalendarPlus size={100} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Finish Your Service Setup</h3>
                  <p className="text-sm text-gray-600 mt-1">You skipped adding a service during onboarding. Add your first service so customers can book you!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10 sm:ml-auto">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" onClick={() => dismissReminder('services')}>Dismiss</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" onClick={() => router.push('/dashboard/services/add-service')}>
                  Add Service Now
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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