'use client';

import type { FC } from 'react';
import {
  PoundSterling,
  ShoppingCart,
  Package,
  BarChart2,
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
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';

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

import { formatDistanceToNow } from 'date-fns';
import { useRecentActivities } from '@/service/activities/hook';
import { Activity } from '@/service/activities/types';
// 1. --- TYPE DEFINITIONS ---
// Ensures all data structures are strongly typed.

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

interface ListingPackage {
  name: string;
  description: string;
}

interface ChartData {
  name: string;
  views: number;
}

import { useGetOrderStats } from '@/service/store/orders/hook';

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

// 3. --- SUB-COMPONENTS ---
// Breaks the UI into manageable, reusable pieces.

const StatCard: FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <div className={color}>{icon}</div>
    </CardContent>
  </Card>
);

const RecentActivities: FC<{
  activities: Activity[] | undefined;
  isLoading: boolean;
}> = ({ activities, isLoading }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      <Button variant="ghost" size="sm">
        Clear All
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <p>Loading activities...</p>
      ) : (
        <ul className="space-y-4">
          {activities?.map((activity, index) => (
            <li key={index} className="flex items-center space-x-4">
              <div className="flex-grow">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

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

// 4. --- MAIN PAGE COMPONENT ---
// Assembles the entire dashboard page.

const DashboardPage: FC = () => {
  const { data: orderStats, isLoading } = useGetOrderStats();
  const { userName } = useSelector((state: RootState) => state.auth);
  const {
    data: activities,
    isLoading: isLoadingActivities,
  } = useRecentActivities();

  const stats: StatCardProps[] = isLoading
    ? [
        {
          title: 'Total Sales',
          value: 'loading...',
          icon: <PoundSterling className="h-8 w-8" />,
          color: 'text-green-500',
        },
        {
          title: 'Net Sales',
          value: 'loading...',
          icon: <PoundSterling className="h-8 w-8" />,
          color: 'text-blue-500',
        },
        {
          title: 'Orders',
          value: 'loading...',
          icon: <ShoppingCart className="h-8 w-8" />,
          color: 'text-yellow-500',
        },
        {
          title: 'Products Sold',
          value: 'loading...',
          icon: <Package className="h-8 w-8" />,
          color: 'text-red-500',
        },
      ]
    : [
        {
          title: 'Total Sales',
          value: `£${orderStats?.totalSales.toFixed(2) ?? '0.00'}`,
          icon: <PoundSterling className="h-8 w-8" />,
          color: 'text-green-500',
        },
        {
          title: 'Net Sales',
          value: `£${orderStats?.netSales.toFixed(2) ?? '0.00'}`,
          icon: <PoundSterling className="h-8 w-8" />,
          color: 'text-blue-500',
        },
        {
          title: 'Orders',
          value: orderStats?.orders ?? 0,
          icon: <ShoppingCart className="h-8 w-8" />,
          color: 'text-yellow-500',
        },
        {
          title: 'Products Sold',
          value: orderStats?.productsSold ?? 0,
          icon: <Package className="h-8 w-8" />,
          color: 'text-red-500',
        },
      ];
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
        {/* Stat Cards Section */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <RecentActivities
              activities={activities}
              isLoading={isLoadingActivities}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <ListingPackages pkg={listingPackage} />
            <ListingsViewsChart data={chartData} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
