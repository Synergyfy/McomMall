import { SubscriptionStatusResponse } from '@/service/payments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentPlanCardProps {
  subscription: SubscriptionStatusResponse;
}

export default function CurrentPlanCard({
  subscription,
}: CurrentPlanCardProps) {
  if (!subscription) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are not subscribed to any plan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Plan:</strong> {subscription.planType}
          </p>
          <p>
            <strong>Pay-as-you-go:</strong>{' '}
            {subscription.paygOption || 'Not applicable'}
          </p>
          <p>
            <strong>Status:</strong> {subscription.status}
          </p>
          {subscription.trialEndDate && (
            <p>
              <strong>Trial End Date:</strong>{' '}
              {new Date(subscription.trialEndDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
