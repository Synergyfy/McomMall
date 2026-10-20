'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, Sparkles } from 'lucide-react';
import { EligibleReward, RewardApplication } from '@/service/rewards/types';
import { CURRENCY } from '@/lib/utils';

export interface RewardLine {
  lineKey: string;
  label: string;
}

interface MyRewardsProps {
  eligible: EligibleReward[];
  lines: RewardLine[];
  isLoading: boolean;
  onApply: (applications: RewardApplication[], discountTotal: number) => void;
}

/**
 * Lets a shopper assign an earned MCOM Rewards discount to a qualifying cart
 * line. One reward per line; the server re-validates everything at checkout.
 */
export default function MyRewards({
  eligible,
  lines,
  isLoading,
  onApply,
}: MyRewardsProps) {
  // lineKey -> issuanceId
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  // Lines we've auto-applied a reward to, and lines the shopper has touched.
  // This prevents auto-application from overriding an explicit "No reward".
  const autoSelectedLines = useRef<Set<string>>(new Set());
  const userTouchedLines = useRef<Set<string>>(new Set());

  const rewardById = useMemo(() => {
    const map = new Map<string, EligibleReward>();
    (eligible || []).forEach((r) => map.set(r.issuanceId, r));
    return map;
  }, [eligible]);

  const optionsForLine = useCallback(
    (lineKey: string) =>
      (eligible || []).filter((r) =>
        r.applicableLines.some((l) => l.lineKey === lineKey)
      ),
    [eligible]
  );

  const discountFor = useCallback(
    (lineKey: string, issuanceId: string) => {
      const reward = rewardById.get(issuanceId);
      return (
        reward?.applicableLines.find((l) => l.lineKey === lineKey)
          ?.discountAmount ?? 0
      );
    },
    [rewardById]
  );

  // Drop selections that are no longer valid (cart/eligibility changed).
  useEffect(() => {
    setAssignment((prev) => {
      const next: Record<string, string> = {};
      let changed = false;
      for (const [lineKey, issuanceId] of Object.entries(prev)) {
        if (discountFor(lineKey, issuanceId) > 0) {
          next[lineKey] = issuanceId;
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [discountFor]);

  // Auto-apply the best available reward per line so an eligible reward is
  // visible immediately instead of leaving the order total unchanged until
  // the shopper discovers the dropdown.
  useEffect(() => {
    setAssignment((prev) => {
      const next = { ...prev };
      const usedIssuances = new Set(Object.values(next));
      let changed = false;

      for (const line of lines || []) {
        if (next[line.lineKey]) continue;
        if (userTouchedLines.current.has(line.lineKey)) continue;
        if (autoSelectedLines.current.has(line.lineKey)) continue;

        const options = optionsForLine(line.lineKey).filter(
          (reward) => !usedIssuances.has(reward.issuanceId)
        );
        if (options.length === 0) continue;

        const best = options.reduce((current, reward) => {
          const amount =
            reward.applicableLines.find((l) => l.lineKey === line.lineKey)
              ?.discountAmount ?? 0;
          const bestAmount =
            current?.applicableLines.find((l) => l.lineKey === line.lineKey)
              ?.discountAmount ?? 0;
          return amount > bestAmount ? reward : current;
        }, options[0]);

        next[line.lineKey] = best.issuanceId;
        usedIssuances.add(best.issuanceId);
        autoSelectedLines.current.add(line.lineKey);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [lines, optionsForLine]);

  useEffect(() => {
    const applications: RewardApplication[] = [];
    let total = 0;
    for (const [lineKey, issuanceId] of Object.entries(assignment)) {
      const amount = discountFor(lineKey, issuanceId);
      if (amount > 0) {
        applications.push({ issuanceId, lineKey });
        total += amount;
      }
    }
    onApply(applications, Math.round((total + Number.EPSILON) * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, discountFor]);

  const hasAnyOption = (lines || []).some(
    (line) => optionsForLine(line.lineKey).length > 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader className="animate-spin" size={16} />
        Checking your rewards…
      </div>
    );
  }

  if (!hasAnyOption) {
    return (
      <p className="text-sm text-gray-500">
        No reward discounts are available for the items in your order.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Sparkles className="w-4 h-4 text-orange-500" />
        Your rewards
      </div>
      <p className="text-xs text-gray-500">
        {Object.keys(assignment).length > 0
          ? "We've applied your best available reward. Change or remove it below."
          : 'Pick which item each reward should discount. One reward per item.'}
      </p>

      {lines
        .filter((line) => optionsForLine(line.lineKey).length > 0)
        .map((line) => {
          const options = optionsForLine(line.lineKey);
          const selected = assignment[line.lineKey] || '';
          const amount = selected ? discountFor(line.lineKey, selected) : 0;
          return (
            <div
              key={line.lineKey}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {line.label}
                </p>
                {amount > 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    −{CURRENCY}
                    {amount.toFixed(2)} applied
                  </p>
                )}
              </div>
              <select
                value={selected}
                onChange={(e) => {
                  userTouchedLines.current.add(line.lineKey);
                  setAssignment((prev) => {
                    const next = { ...prev };
                    if (e.target.value) next[line.lineKey] = e.target.value;
                    else delete next[line.lineKey];
                    return next;
                  });
                }}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">No reward</option>
                {options.map((reward) => {
                  const lineDiscount =
                    reward.applicableLines.find(
                      (l) => l.lineKey === line.lineKey
                    )?.discountAmount ?? 0;
                  return (
                    <option key={reward.issuanceId} value={reward.issuanceId}>
                      {reward.rewardTitle} (−{CURRENCY}
                      {lineDiscount.toFixed(2)})
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
    </motion.div>
  );
}
