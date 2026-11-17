'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import {
  useCreateLoyaltyRule,
  useDeleteLoyaltyRule,
  useLoyaltyRules,
  useUpdateLoyaltyRule,
} from '@/service/loyalty/hook';

const RULE_TYPES = [
  { value: 'percentage_of_spend', label: 'Points per £ spent' },
  { value: 'fixed_per_booking', label: 'Fixed points per booking' },
  { value: 'bonus_multiplier', label: 'Bonus multiplier' },
  { value: 'welcome_bonus', label: 'Welcome bonus' },
];

const TRIGGERS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'booking', label: 'Booking' },
  { value: 'visit', label: 'Visit' },
  { value: 'review', label: 'Review' },
  { value: 'referral', label: 'Referral' },
  { value: 'share', label: 'Share profile' },
  { value: 'signup', label: 'Sign up' },
  { value: 'all', label: 'All activity' },
];

export default function CreateLoyaltyRulePage() {
  const { businessId } = useBusinessId();
  const rules = useLoyaltyRules(businessId);
  const createRule = useCreateLoyaltyRule();
  const updateRule = useUpdateLoyaltyRule();
  const deleteRule = useDeleteLoyaltyRule();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleType, setRuleType] = useState('percentage_of_spend');
  const [trigger, setTrigger] = useState('purchase');
  const [pointsPerCurrency, setPointsPerCurrency] = useState('1');
  const [fixedPoints, setFixedPoints] = useState('100');
  const [multiplier, setMultiplier] = useState('2');
  const [minSpend, setMinSpend] = useState('0');
  const [frequencyLimit, setFrequencyLimit] = useState('0');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    if (!name.trim()) {
      toast.error('Rule name is required.');
      return;
    }

    const payload: Record<string, unknown> = {
      businessId,
      name: name.trim(),
      description: description.trim() || undefined,
      ruleType,
      trigger,
      appliesTo:
        ruleType === 'fixed_per_booking' ? 'booking' : 'purchase',
      isActive: true,
      minSpend: Number(minSpend) || undefined,
      frequencyLimit: Number(frequencyLimit) || undefined,
    };

    if (ruleType === 'percentage_of_spend') {
      payload.pointsPerCurrency = Number(pointsPerCurrency) || 1;
    } else if (ruleType === 'fixed_per_booking' || ruleType === 'welcome_bonus') {
      payload.fixedPoints = Number(fixedPoints) || 0;
    } else {
      payload.multiplier = Number(multiplier) || 1;
    }

    try {
      await createRule.mutateAsync(payload);
      toast.success('Loyalty rule created.');
      setName('');
      setDescription('');
    } catch {
      toast.error('Could not create the rule.');
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      await updateRule.mutateAsync({ id, isActive: !isActive });
      toast.success(isActive ? 'Rule paused.' : 'Rule activated.');
    } catch {
      toast.error('Could not update the rule.');
    }
  };

  const removeRule = async (id: string) => {
    try {
      await deleteRule.mutateAsync(id);
      toast.success('Rule deleted.');
    } catch {
      toast.error('Could not delete the rule.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/loyalty"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loyalty Rules</h1>
            <p className="text-sm text-gray-500">
              Decide how customers earn points across your business.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Plus className="h-5 w-5 text-orange-600" /> New rule
            </h2>

            <label className="text-xs font-semibold text-gray-500">Rule name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Double points weekend"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-xs font-semibold text-gray-500">
              Description
            </label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Earning type</label>
                <select
                  value={ruleType}
                  onChange={(event) => setRuleType(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {RULE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Trigger</label>
                <select
                  value={trigger}
                  onChange={(event) => setTrigger(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {TRIGGERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              {ruleType === 'percentage_of_spend' ? (
                <>
                  <label className="text-xs font-semibold text-gray-500">
                    Points per £1
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pointsPerCurrency}
                    onChange={(event) => setPointsPerCurrency(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </>
              ) : ruleType === 'bonus_multiplier' ? (
                <>
                  <label className="text-xs font-semibold text-gray-500">Multiplier</label>
                  <input
                    type="number"
                    min={1}
                    value={multiplier}
                    onChange={(event) => setMultiplier(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </>
              ) : (
                <>
                  <label className="text-xs font-semibold text-gray-500">Points</label>
                  <input
                    type="number"
                    min={0}
                    value={fixedPoints}
                    onChange={(event) => setFixedPoints(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Min spend</label>
                <input
                  type="number"
                  min={0}
                  value={minSpend}
                  onChange={(event) => setMinSpend(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Frequency limit
                </label>
                <input
                  type="number"
                  min={0}
                  value={frequencyLimit}
                  onChange={(event) => setFrequencyLimit(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createRule.isPending}
              className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {createRule.isPending ? 'Saving…' : 'Publish rule'}
            </button>
          </form>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Your rules</h2>
            {rules.isLoading ? (
              <p className="py-6 text-center text-sm text-gray-400">Loading rules…</p>
            ) : (rules.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No rules yet — create your first one.
              </p>
            ) : (
              <ul className="space-y-3">
                {(rules.data ?? []).map((rule) => (
                  <li
                    key={rule.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500">
                          {rule.ruleType.replaceAll('_', ' ')} · {rule.trigger}
                        </p>
                        {rule.description ? (
                          <p className="mt-1 text-xs text-gray-400">{rule.description}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRule(rule.id, rule.isActive)}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            rule.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Paused'}
                        </button>
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="text-gray-400 hover:text-red-600"
                          aria-label="Delete rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
