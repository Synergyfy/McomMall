"use client";

import { useGetGiftCardChartData } from '@/service/gift-card/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

const GiftCardSalesChart = () => {
  const { data: chartData, isLoading, isError } = useGetGiftCardChartData();

  if (isLoading) {
    return <div>Loading chart data...</div>;
  }

  if (isError || !chartData) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">Could not load sales chart data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Gift Card Sales vs. Redemptions
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
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
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={2}
              name="Sales (£)"
            />
            <Line
              type="monotone"
              dataKey="redemptions"
              stroke="#ef4444"
              strokeWidth={2}
              name="Redemptions (£)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GiftCardSalesChart;