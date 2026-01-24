import { Membership } from '@/service/membership/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatEnumValue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Info, XCircle } from 'lucide-react';
import React from 'react';

interface CurrentPlanCardProps {
  subscription: Membership;
}

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="text-green-500" />,
  cancelled: <XCircle className="text-red-500" />,
  expired: <Info className="text-gray-500" />,
  inactive: <Info className="text-gray-500" />,
};

export default function CurrentPlanCard({
  subscription,
}: CurrentPlanCardProps) {
  if (!subscription) {
    return (
      <Card className="w-full max-w-lg mx-auto my-8">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You are not currently subscribed to any plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please choose a plan below to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusKey = subscription.status.toLowerCase();

  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-lg rounded-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Current Subscription
        </CardTitle>
        <CardDescription>
          Here are the details of your current plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Plan</Badge>
            <span className="font-semibold text-gray-700">
              {subscription.tier.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Cycle</Badge>
            <span className="font-semibold text-gray-700">
              {formatEnumValue(subscription.billingCycle)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Status</Badge>
            <div className="flex items-center space-x-1">
              {statusIcons[statusKey] || statusIcons.inactive}
              <span className="font-semibold text-gray-700">
                {formatEnumValue(subscription.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Expires</Badge>
            <div className="flex items-center space-x-1">
              <Clock className="text-gray-500" />
              <span className="font-semibold text-gray-700">
                {new Date(subscription.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
