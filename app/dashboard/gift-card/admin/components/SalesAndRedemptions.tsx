'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetSalesAndRedemptions } from '@/service/gift-card/hook';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export const SalesAndRedemptions = () => {
  const [date, setDate] = useState<DateRange | undefined>();
  const { data, isLoading } = useGetSalesAndRedemptions(
    date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
    date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
  );

  const handleExport = () => {
    if (data) {
      const headers = ['StartDate', 'EndDate', 'TotalSales', 'TotalRedemptions'];
      const values = [
        date?.from ? format(date.from, 'yyyy-MM-dd') : 'all-time',
        date?.to ? format(date.to, 'yyyy-MM-dd') : 'all-time',
        data.totalSales,
        data.totalRedemptions,
      ];
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        headers.join(',') +
        '\n' +
        values.join(',');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'sales_and_redemptions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Sales and Redemptions{' '}
          {date?.from && date.to ? `(${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')})` : '(All Time)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport} disabled={!data}>
              Export Data
            </Button>
          </div>
          {isLoading && (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {data && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(data.totalSales)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Redemptions</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(data.totalRedemptions)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
