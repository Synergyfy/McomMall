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
import PlanVariantLabel from './PlanVariantLabel';

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
  const isTrial = Boolean(subscription.isTrial || (subscription as any).accessType === 'TRIAL_PROGRAMME');
  const statusRaw = isTrial ? 'Trial Active' : (subscription.status || (isActive ? 'active' : 'inactive'));
  const statusKey = isTrial ? 'active' : statusRaw.toLowerCase();

  const planType = subscription.planType || subscription.billingCycle;
  const expiresAt = subscription.expiresAt || subscription.endDate;
  const programmeTasks: any[] = (subscription as any).programmeTasks || [];
  const upgradeUrl = (subscription as any).entitlement?.access?.upgradeUrl;

  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Current Subscription
            </CardTitle>
            <CardDescription>
              Here are details of your current plan.
            </CardDescription>
          </div>
          {isTrial && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-2.5 py-1">
              Trial Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Plan</Badge>
            {subscription.planVariantId ? (
              <PlanVariantLabel planVariantId={subscription.planVariantId} />
            ) : (
              <span className="font-semibold text-gray-700">
                {subscription.tier?.name || 'Unknown Tier'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Cycle</Badge>
            <span className="font-semibold text-gray-700">
              {isTrial ? '14-Day Trial' : (planType ? formatEnumValue(planType) : 'N/A')}
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
            <Badge variant="outline">{isTrial ? 'Trial Ends' : 'Expires'}</Badge>
            <div className="flex items-center space-x-1">
              <Clock className="text-gray-500" />
              <span className="font-semibold text-gray-700">
                {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {isTrial && programmeTasks.length > 0 && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Required Programme Tasks ({programmeTasks.length})
              </h4>
              <span className="text-xs text-amber-600 font-medium">Task-Gated Trial</span>
            </div>
            <div className="space-y-2">
              {programmeTasks.map((t: any) => (
                <div
                  key={t.taskId || t.id}
                  className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-gray-800">{t.title}</p>
                    {t.description && (
                      <p className="text-[11px] text-gray-600 line-clamp-1">{t.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 border-amber-300 text-amber-800 bg-amber-100/60">
                    {t.status || 'PENDING'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {isTrial && (
          <div className="pt-2">
            <Button
              onClick={() => {
                if (upgradeUrl) {
                  window.location.href = upgradeUrl;
                } else {
                  redirectToMcomSolutionsSubscription();
                }
              }}
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium text-xs py-2"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Upgrade to Full Membership on MCOM Central
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
