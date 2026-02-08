'use client';

import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import {
  MoreHorizontal,
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

// --- MAIN PAGE COMPONENT ---
const DashboardPage: FC = () => {
  const { userName, userRole } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: isLoadingStats } = useGetStats<OwnerStatsDto | CustomerStatsDto>();
  const {
    data: activities,
    isLoading: isLoadingActivities,
  } = useRecentActivities();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello {userName || 'User'} !
        </h1>
        <Breadcrumb className="mt-2 sm:mt-0">
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
      </header>

      <main className="space-y-8">
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
              {userRole === UserRole.OWNER && (
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