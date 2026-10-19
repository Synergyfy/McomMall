'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Clock, Sparkles, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { RootState } from '@/service/store/store';
import { useGetTrialStatus, buildTrialStatusFromEntitlement } from '@/service/payments/hooks';
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';
import { TrialStatusResponse } from '@/service/payments/types';
import { Button } from '@/components/ui/button';

const DAY_MS = 24 * 60 * 60 * 1000;

function splitRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
  };
}

/**
 * Prominent dashboard-wide indicator that the merchant is on a programme trial.
 * Reads the entitlement resolved at SSO login (falling back to the live trial
 * query) so the trial state and days remaining are always visible.
 */
export default function TrialBanner() {
  const { data: queriedTrial } = useGetTrialStatus();
  const entitlement = useSelector((state: RootState) => state.auth.entitlement);

  // Prefer the live query, but never lose the trial state if the re-check is
  // unavailable — the login entitlement is authoritative.
  const trialStatus: TrialStatusResponse | null = useMemo(
    () => queriedTrial ?? buildTrialStatusFromEntitlement(entitlement),
    [queriedTrial, entitlement],
  );

  const [remainingTime, setRemainingTime] = useState(
    trialStatus?.remainingTime ?? 0,
  );

  useEffect(() => {
    setRemainingTime(trialStatus?.remainingTime ?? 0);
  }, [trialStatus?.remainingTime]);

  useEffect(() => {
    if (!trialStatus?.isActive) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [trialStatus?.isActive]);

  if (!trialStatus) return null;

  const expired = remainingTime <= 0 && Boolean(trialStatus.expiresAt);
  if (!trialStatus.isActive && !expired) return null;

  const { days, hours, minutes } = splitRemaining(remainingTime);
  const programmeTasks: any[] = trialStatus.programmeTasks || [];
  const completedTasks = programmeTasks.filter(
    (t) => t.status === 'COMPLETED',
  ).length;

  const expiryLabel = trialStatus.expiresAt
    ? new Date(trialStatus.expiresAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`w-full border-b px-4 py-2.5 ${
        expired
          ? 'bg-rose-50 border-rose-200'
          : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              expired ? 'bg-rose-100' : 'bg-orange-100'
            }`}
          >
            {expired ? (
              <Clock className="w-4.5 h-4.5 text-rose-600" />
            ) : (
              <Sparkles className="w-4.5 h-4.5 text-orange-600" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {expired
                ? 'Your free trial has ended'
                : 'You are on a free trial'}
              {!expired && (
                <span className="text-orange-700">
                  {' '}
                  · {days} {days === 1 ? 'day' : 'days'}{' '}
                  {hours}h {minutes}m left
                </span>
              )}
            </p>
            <p className="text-xs text-gray-600 leading-tight truncate">
              {expired ? (
                'Subscribe to keep full access to your dashboard and storefront.'
              ) : expiryLabel ? (
                <>
                  Trial access ends on <strong>{expiryLabel}</strong>
                </>
              ) : (
                'Your programme tasks unlock access during the trial.'
              )}
              {!expired && programmeTasks.length > 0 && (
                <>
                  {' '}
                  · {completedTasks}/{programmeTasks.length} onboarding tasks
                  done
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!expired && programmeTasks.length > 0 && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-orange-700 hover:bg-orange-100 hover:text-orange-800"
            >
              <Link href="/dashboard/my-subscription">
                View tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() =>
              expired
                ? redirectToMcomSolutionsSubscription()
                : (window.location.href = '/pricing')
            }
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
          >
            {expired ? 'Subscribe now' : 'Upgrade plan'}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {!expired && programmeTasks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 pl-12">
          {programmeTasks.slice(0, 4).map((task, index) => {
            const done = task.status === 'COMPLETED';
            return (
              <span
                key={task.taskId || task.id || index}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-orange-200 text-gray-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-orange-400 shrink-0" />
                )}
                <span className="truncate max-w-[16rem]">{task.title}</span>
              </span>
            );
          })}
          {programmeTasks.length > 4 && (
            <span className="text-[11px] font-medium text-gray-500">
              +{programmeTasks.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
