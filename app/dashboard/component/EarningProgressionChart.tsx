'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetSalesChart } from '@/service/stats/hook';
import { SalesChartQuery } from '@/service/stats/types';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const EarningProgressionChart = () => {
  const [query, setQuery] = useState<SalesChartQuery>({});
  const { data: chartData, isLoading } = useGetSalesChart(query);
  const [visibleLines, setVisibleLines] = useState({
    orderSales: true,
    giftCardSales: true,
    voucherSales: true,
    bookingPayments: true,
  });

  const handleTimeRangeChange = (timeRange: string) => {
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        setQuery({ allTime: true });
        return;
    }
    setQuery({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });
  };

  const toggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Your Earning Progression
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Filter by time
              <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTimeRangeChange('7days')}>
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange('30days')}>
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange('90days')}>
              Last 90 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange('all')}>
              All Time
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="h-96">
        <div className="flex justify-center space-x-4 mb-4">
          {Object.keys(visibleLines).map((line) => (
            <div key={line} className="flex items-center space-x-2">
              <Checkbox
                id={line}
                checked={visibleLines[line as keyof typeof visibleLines]}
                onCheckedChange={() =>
                  toggleLine(line as keyof typeof visibleLines)
                }
              />
              <label htmlFor={line} className="text-sm font-medium">
                {line.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
        {isLoading ? (
          <p>Loading chart data...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              {visibleLines.orderSales && (
                <Line
                  type="monotone"
                  dataKey="orderSales"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Order Sales"
                />
              )}
              {visibleLines.giftCardSales && (
                <Line
                  type="monotone"
                  dataKey="giftCardSales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  name="Gift Card Sales"
                />
              )}
              {visibleLines.voucherSales && (
                <Line
                  type="monotone"
                  dataKey="voucherSales"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                  name="Voucher Sales"
                />
              )}
              {visibleLines.bookingPayments && (
                <Line
                  type="monotone"
                  dataKey="bookingPayments"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                  name="Booking Payments"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningProgressionChart;
