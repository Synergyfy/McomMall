'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetVoucherSummaryStatistics } from '@/service/admin';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const VoucherSummary = () => {
  const { data, isLoading } = useGetVoucherSummaryStatistics();

  const chartData = [
    {
      name: 'Vouchers',
      sold: data?.totalSold || 0,
      redeemed: data?.totalRedeemed || 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Sold</CardTitle>
          <CardDescription>
            The total value of vouchers sold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">
              {formatCurrency(data?.totalSold || 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Redeemed</CardTitle>
          <CardDescription>
            The total value of vouchers redeemed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">
              {formatCurrency(data?.totalRedeemed || 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Liability</CardTitle>
          <CardDescription>
            The total value of vouchers yet to be redeemed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">
              {formatCurrency(data?.outstandingLiability || 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Sales vs Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="sold" fill="#3b82f6" />
              <Bar dataKey="redeemed" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};