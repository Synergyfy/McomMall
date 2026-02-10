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
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Coins, Users, ArrowRightLeft, Loader2, Percent } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) => (
  <Card className="relative overflow-hidden border-l-4 border-l-transparent hover:border-l-orange-500 transition-all shadow-sm hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </CardTitle>
      <div className="p-2 bg-secondary/20 rounded-full">
        <Icon className="h-4 w-4 text-secondary-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {description && (
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <span>{description}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export const PromotionSummary = ({ promotionId }: { promotionId: string }) => {
  const { data, isLoading } = useGetPromotionSummaryStatistics(promotionId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  const totalEarned = data?.totalPointsEarned || 0;
  const totalRedeemed = data?.totalPointsRedeemed || 0;
  const totalParticipants = data?.totalParticipants || 0;
  const redemptionRate = totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0;

  const barData = [
    { name: 'Earned', value: totalEarned, fill: '#3b82f6' },
    { name: 'Redeemed', value: totalRedeemed, fill: '#f97316' },
  ];

  const radialData = [
    {
      name: 'Redemption Rate',
      uv: redemptionRate,
      fill: '#f97316',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row - All Data from API */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Points Issued"
          value={totalEarned.toLocaleString()}
          icon={Coins}
          description="Cumulative points awarded"
        />
        <MetricCard
          title="Points Redeemed"
          value={totalRedeemed.toLocaleString()}
          icon={ArrowRightLeft}
          description="Total points used by customers"
        />
        <MetricCard
          title="Active Members"
          value={totalParticipants.toLocaleString()}
          icon={Users}
          description="Unique customer participants"
        />
        <MetricCard
          title="Redemption Rate"
          value={`${redemptionRate.toFixed(1)}%`}
          icon={Percent}
          description="Points conversion ratio"
        />
      </div>

      {/* Charts Row - Visualizing API Data */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm">
          <CardHeader>
            <CardTitle>Volume Overview</CardTitle>
            <CardDescription>Comparative analysis of points flow based on current records.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-0">
            <CardTitle>Conversion Health</CardTitle>
            <CardDescription>Usage efficiency.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center pb-6">
            <div className="relative w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={20} 
                    data={radialData} 
                    startAngle={90} 
                    endAngle={-270}
                >
                    <RadialBar
                    background
                    dataKey="uv"
                    cornerRadius={10}
                    />
                </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-orange-600">{redemptionRate.toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground uppercase text-center">Redeemed</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};