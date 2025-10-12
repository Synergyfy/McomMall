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
import { CustomerStatsDto, OwnerStatsDto } from '@/service/stats/types';
import { UserRole } from '@/service/auth/types';
import GiftCardStats from './component/GiftCardStats';
import GiftCardSalesChart from './component/GiftCardSalesChart';


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

const chartData: ChartData[] = [
  { name: 'Jan', views: 0.2 },
  { name: 'Feb', views: 0.4 },
  { name: 'Mar', views: 0.3 },
  { name: 'Apr', views: 0.6 },
  { name: 'May', views: 0.5 },
  { name: 'Jun', views: 0.8 },
  { name: 'Jul', views: 0.7 },
  { name: 'Aug', views: 1.0 },
];

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

const ListingsViewsChart: FC<{ data: ChartData[] }> = ({ data }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold">
        Your Listings Views
      </CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            August 6, 2025 - August 12, 2025
            <MoreHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
          <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
          <DropdownMenuItem>Last 90 Days</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
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
                  <GiftCardStats />
                  <GiftCardSalesChart />
                  <ListingPackages pkg={listingPackage} />
                  <ListingsViewsChart data={chartData} />
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