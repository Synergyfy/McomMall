'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetPromotionSummaryStatistics } from '@/service/admin';
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

export const PromotionSummary = ({ promotionId }: { promotionId: string }) => {
  const { data, isLoading } = useGetPromotionSummaryStatistics(promotionId);

  const chartData = [
    {
      name: 'Points',
      earned: data?.totalPointsEarned || 0,
      redeemed: data?.totalPointsRedeemed || 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Points Earned</CardTitle>
          <CardDescription>
            The total points earned by customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{data?.totalPointsEarned}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Points Redeemed</CardTitle>
          <CardDescription>
            The total points redeemed by customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{data?.totalPointsRedeemed}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Participants</CardTitle>
          <CardDescription>
            The number of unique customers participating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{data?.totalParticipants}</p>
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Earned vs Redeemed Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="earned" fill="#3b82f6" />
              <Bar dataKey="redeemed" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};