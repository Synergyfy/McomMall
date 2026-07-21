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
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Info, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import React from 'react';
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';

interface CurrentPlanCardProps {
  subscription: Membership;
}

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="text-green-500" />,
  paid: <CheckCircle className="text-green-500" />,
  cancelled: <XCircle className="text-red-500" />,
  expired: <Info className="text-gray-500" />,
  inactive: <Info className="text-gray-500" />,
};

export default function CurrentPlanCard({
  subscription,
}: CurrentPlanCardProps) {
  if (!subscription) {
    return (
      <Card className="w-full max-w-lg mx-auto my-8 border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="text-orange-800">No Active Subscription</CardTitle>
          <CardDescription className="text-orange-700/80">
            You are not currently subscribed to any plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Subscribe to unlock advanced platform features and grow your business.
          </p>
          <Button
            onClick={() => redirectToMcomSolutionsSubscription()}
            className="bg-orange-600 hover:bg-orange-700 text-white w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Subscribe to Mcom Mall
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Determine display values based on new or old fields
  const isActive = subscription.isActive ?? (subscription.status === 'active');
  const statusRaw = subscription.status || (isActive ? 'active' : 'inactive');
  const statusKey = statusRaw.toLowerCase();

  const planType = subscription.planType || subscription.billingCycle;
  const expiresAt = subscription.expiresAt || subscription.endDate;

  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-lg rounded-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Current Subscription
        </CardTitle>
        <CardDescription>
          Here are details of your current plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Plan</Badge>
            <span className="font-semibold text-gray-700">
              {subscription.tier?.name || 'Unknown Tier'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Cycle</Badge>
            <span className="font-semibold text-gray-700">
              {planType ? formatEnumValue(planType) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Status</Badge>
            <div className="flex items-center space-x-1">
              {statusIcons[statusKey] || statusIcons.inactive}
              <span className="font-semibold text-gray-700">
                {formatEnumValue(statusRaw)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Expires</Badge>
            <div className="flex items-center space-x-1">
              <Clock className="text-gray-500" />
              <span className="font-semibold text-gray-700">
                {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
