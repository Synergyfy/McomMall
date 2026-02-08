'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MoreVertical, BarChart2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

// In a real Next.js app with shadcn/ui, you would import components like this:
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useGetOrderStats } from '@/service/store/orders/hook';
import { formatCurrency } from '@/lib/utils';

// --- Type Definitions ---

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  color: string;
};

type ChartData = {
  name: string;
  uv: number;
  pv: number;
};

type Preset = {
  label: string;
  range: () => DateRange;
};


const generateChartData = (days: number): ChartData[] => {
  return Array.from({ length: days }, (_, i) => ({
    name: `Day ${i + 1}`,
    uv: Math.floor(Math.random() * 2000) + 500,
    pv: Math.floor(Math.random() * 1500) + 300,
  }));
};

// --- Reusable UI Components ---

const StatCard: React.FC<StatCardProps> = ({ title, value, change, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="rounded-xl p-4"
    style={{ backgroundColor: color }}
  >
    <h4 className="text-sm font-medium text-slate-600">{title}</h4>
    <div className="mt-2 flex items-baseline justify-between">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {change && (
        <p className="text-sm font-semibold text-green-600">{change}</p>
      )}
    </div>
  </motion.div>
);

const ChartCard: React.FC<{ title: string; data: ChartData[] }> = ({
  title,
  data,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="rounded-xl border border-slate-200 bg-white p-4"
  >
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <button>
        <MoreVertical className="h-5 w-5 text-slate-400" />
      </button>
    </div>
    <div className="mt-4 h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => formatCurrency(value)}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="uv"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="pv"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const DateRangePicker: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const today = new Date();

  const presets: Preset[] = [
    { label: 'Today', range: () => ({ from: today, to: today }) },
    {
      label: 'Yesterday',
      range: () => ({ from: subDays(today, 1), to: subDays(today, 1) }),
    },
    {
      label: 'Week to date',
      range: () => ({ from: startOfWeek(today), to: today }),
    },
    {
      label: 'Last week',
      range: () => ({
        from: startOfWeek(subDays(today, 7)),
        to: endOfWeek(subDays(today, 7)),
      }),
    },
    {
      label: 'Month to date',
      range: () => ({ from: startOfMonth(today), to: today }),
    },
    {
      label: 'Last month',
      range: () => ({
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      }),
    },
  ];

  const handlePresetSelect = (preset: Preset) => {
    setDate(preset.range());
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Select a Date Range';
    const fromStr = format(range.from, 'LLL d, y');
    if (
      !range.to ||
      format(range.from, 'y-MM-dd') === format(range.to, 'y-MM-dd')
    )
      return fromStr;
    return `${fromStr} - ${format(range.to, 'LLL d, y')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={`w-full justify-start text-left font-normal h-auto p-3 ${
            !date && 'text-muted-foreground'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {formatDateRange(date)}
              </p>
              <p className="text-xs text-slate-500">vs. Previous year</p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 mt-2" align="end">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 p-3 text-sm font-medium text-center ${
              activeTab === 'presets'
                ? 'border-b-2 border-red-500 text-red-600 bg-slate-50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 p-3 text-sm font-medium text-center ${
              activeTab === 'custom'
                ? 'border-b-2 border-red-500 text-red-600 bg-slate-50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Custom
          </button>
        </div>
        <div className="p-4">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => handlePresetSelect(p)}
                  className="rounded-md p-2 text-left text-sm hover:bg-slate-100"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              classNames={{
                caption_label: 'flex items-center text-sm font-medium',
                nav_button_previous:
                  'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                nav_button_next:
                  'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                caption: 'flex justify-center pt-1 relative items-center',
              }}
            />
          )}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 p-3 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Update</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// --- Main Page Component ---

export default function StoreDashboardPage() {
  const { data: orderStats, isLoading } = useGetOrderStats();
  const chartData = useMemo(() => generateChartData(11), []);
  const statCardColors = [
    '#ffebee',
    '#f3e5f5',
    '#e3f2fd',
    '#e0f2f1',
    '#f1f8e9',
    '#fffde7',
    '#fbe9e7',
  ];

  const performanceStats: Omit<StatCardProps, 'color'>[] = isLoading
    ? [
        { title: 'Total sales', value: 'loading...' },
        { title: 'Net sales', value: 'loading...' },
        { title: 'Orders', value: 'loading...' },
        { title: 'Products sold', value: 'loading...' },
        { title: 'Gross sales', value: 'loading...' },
        { title: 'Total Earning', value: 'loading...' },
        { title: 'Balance', value: 'loading...' },
      ]
    : [
        {
          title: 'Total sales',
          value: formatCurrency(orderStats?.totalSales ?? 0),
        },
        {
          title: 'Net sales',
          value: formatCurrency(orderStats?.netSales ?? 0),
        },
        { title: 'Orders', value: orderStats?.orders.toString() ?? '0' },
        {
          title: 'Products sold',
          value: orderStats?.productsSold.toString() ?? '0',
        },
        {
          title: 'Gross sales',
          value: formatCurrency(orderStats?.grossSales ?? 0),
        },
        {
          title: 'Total Earning',
          value: formatCurrency(orderStats?.totalEarnings ?? 0),
        },
        {
          title: 'Balance',
          value: formatCurrency(orderStats?.balance ?? 0),
        },
      ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Store Dashboard
          </h1>
          <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
        </header>

        {/* Overview Section */}
        <section className="mb-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-2xl font-semibold text-slate-700">Overview</h2>
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:w-auto">
              <span className="inline-flex items-center justify-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                Balance: {formatCurrency(orderStats?.balance ?? 0)}
              </span>
              <div className="w-full sm:w-72">
                <DateRangePicker />
              </div>
            </div>
          </div>
        </section>

        {/* Performance Section */}
        <section className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-slate-700">
            Performance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {performanceStats.map((stat, i) => (
              <StatCard
                key={stat.title}
                {...stat}
                color={statCardColors[i % statCardColors.length]}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-700">Charts</h3>
            <div className="flex items-center gap-2">
              <button className="rounded-md p-2 hover:bg-slate-200">
                <BarChart2 className="h-5 w-5 text-slate-500" />
              </button>
              <button className="rounded-md p-2 hover:bg-slate-200">
                <MoreVertical className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Total sales" data={chartData} />
            <ChartCard title="Net sales" data={chartData} />
            <ChartCard title="Orders" data={chartData} />
            <ChartCard title="Average order value" data={chartData} />
          </div>
        </section>
      </main>
    </div>
  );
}
