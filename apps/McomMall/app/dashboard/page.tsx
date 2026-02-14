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
import { Progress } from '@/components/ui/progress';
import { useGetTiers } from '@/service/tiers/hook';
import { ActivityTimerCard } from '@/components/dashboard/ActivityTimerCard';
import { useGetActivityTimerStatus, usePauseActivityTimer, useResumeActivityTimer } from '@/service/activity-timer/hook';


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
const ListingPackages: FC<{
  name: string;
  current: number;
  max: number;
}> = ({ name, current, max }) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Your Listing Packages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Diamond className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold text-gray-800">{name}</p>
              <span className="text-xs font-medium text-gray-500">
                {current} / {max}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              You have used {current} out of {max} listing slots.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
const DashboardPage: FC = () => {
  const { userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: stats, isLoading: isLoadingStats } = useGetStats<
    OwnerStatsDto | CustomerStatsDto
  >();
  const { data: activities, isLoading: isLoadingActivities } =
    useRecentActivities();
  const { data: tiers } = useGetTiers();

  const { data: timers, isLoading: isLoadingTimers } = useGetActivityTimerStatus();
  const pauseTimerMutation = usePauseActivityTimer();
  const resumeTimerMutation = useResumeActivityTimer();

  const currentTier = tiers?.find(
    t => t.name.toLowerCase() === packageInfo?.planType?.toLowerCase()
  );

  const maxListings = currentTier?.configuration?.quotas?.maxListings || 1;
  const currentListings =
    userRole === UserRole.OWNER
      ? (stats as OwnerStatsDto)?.totalAmountOfListing || 0
      : 0;

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
        {/* Activity Timers */}
        {timers && timers.length > 0 && (
          <div className="space-y-6">
            {timers.map((timer) => (
              <ActivityTimerCard
                key={timer.id}
                timer={timer}
                onPause={() => pauseTimerMutation.mutate()}
                onResume={() => resumeTimerMutation.mutate()}
                isActionPending={pauseTimerMutation.isPending || resumeTimerMutation.isPending}
              />
            ))}
          </div>
        )}

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
                  <ListingPackages
                    name={packageInfo?.planType || 'Basic'}
                    current={currentListings}
                    max={maxListings}
                  />
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