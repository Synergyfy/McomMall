'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import {
  useLoyaltySettings,
  useUpdateLoyaltySettings,
} from '@/service/loyalty/hook';

export default function LoyaltySettingsPage() {
  const { businessId } = useBusinessId();
  const settingsQuery = useLoyaltySettings(businessId);
  const updateSettings = useUpdateLoyaltySettings();

  const [isEnabled, setIsEnabled] = useState(true);
  const [programName, setProgramName] = useState('Loyalty & Rewards');
  const [brandColor, setBrandColor] = useState('#ea580c');
  const [accentColor, setAccentColor] = useState('#fff1eb');
  const [pointsPerCurrency, setPointsPerCurrency] = useState('1');
  const [pointsMultiplier, setPointsMultiplier] = useState('1');
  const [signupBonusPoints, setSignupBonusPoints] = useState('0');
  const [redemptionApproval, setRedemptionApproval] = useState('auto');
  const [redemptionMode, setRedemptionMode] = useState('both');
  const [redemptionValue, setRedemptionValue] = useState('0.01');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    const settings = settingsQuery.data;
    if (!settings) return;
    setIsEnabled(settings.isEnabled ?? true);
    setProgramName(settings.programName ?? 'Loyalty & Rewards');
    setBrandColor(settings.brandColor ?? '#ea580c');
    setAccentColor(settings.accentColor ?? '#fff1eb');
    setPointsPerCurrency(String(settings.pointsPerCurrency ?? 1));
    setPointsMultiplier(String(settings.pointsMultiplier ?? 1));
    setSignupBonusPoints(String(settings.signupBonusPoints ?? 0));
    setRedemptionApproval(settings.redemptionApproval ?? 'auto');
    setRedemptionMode(settings.redemptionMode ?? 'both');
    setRedemptionValue(String(settings.redemptionValue ?? 0.01));
    setTerms(settings.terms ?? '');
  }, [settingsQuery.data]);

  const handleSave = async () => {
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    try {
      await updateSettings.mutateAsync({
        businessId,
        isEnabled,
        programName,
        brandColor,
        accentColor,
        pointsPerCurrency: Number(pointsPerCurrency) || 0,
        pointsMultiplier: Number(pointsMultiplier) || 1,
        signupBonusPoints: Number(signupBonusPoints) || 0,
        redemptionApproval,
        redemptionMode,
        redemptionValue: Number(redemptionValue) || 0,
        terms,
      });
      toast.success('Loyalty settings saved.');
    } catch {
      toast.error('Could not save settings.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/loyalty"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loyalty Settings</h1>
            <p className="text-sm text-gray-500">
              Configure your programme branding and earning rules.
            </p>
          </div>
        </header>

        {settingsQuery.isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading settings…</p>
        ) : (
          <div className="space-y-5">
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Programme status
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pause the programme without deleting member balances.
                  </p>
                </div>
                <button
                  onClick={() => setIsEnabled((prev) => !prev)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    isEnabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle loyalty programme"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      isEnabled ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Branding</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Programme name
                  </label>
                  <input
                    value={programName}
                    onChange={(event) => setProgramName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Programme logo URL
                  </label>
                  <input
                    value={settingsQuery.data?.logoUrl ?? ''}
                    readOnly
                    placeholder="Upload via storefront settings"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Brand colour
                  </label>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(event) => setBrandColor(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Accent colour
                  </label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Earning & Redemption</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Points per £1 spent
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pointsPerCurrency}
                    onChange={(event) => setPointsPerCurrency(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Points multiplier
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pointsMultiplier}
                    onChange={(event) => setPointsMultiplier(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Sign-up bonus points
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={signupBonusPoints}
                    onChange={(event) => setSignupBonusPoints(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Redemption value per point (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={redemptionValue}
                    onChange={(event) => setRedemptionValue(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Redemption approval
                  </label>
                  <select
                    value={redemptionApproval}
                    onChange={(event) => setRedemptionApproval(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual approval</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Redemption mode
                  </label>
                  <select
                    value={redemptionMode}
                    onChange={(event) => setRedemptionMode(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="points">Points only</option>
                    <option value="discount">Discount only</option>
                    <option value="both">Points and discount</option>
                  </select>
                </div>
              </div>

              <label className="mt-4 block text-xs font-semibold text-gray-500">
                Terms & conditions
              </label>
              <textarea
                value={terms}
                onChange={(event) => setTerms(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updateSettings.isPending ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
