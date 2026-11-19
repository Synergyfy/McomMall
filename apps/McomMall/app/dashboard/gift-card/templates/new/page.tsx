'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useAddGiftCardTemplate } from '@/service/gift-card/hook';
import { useBusinessId } from '@/hooks/useBusinessId';

export default function NewGiftCardTemplatePage() {
  const router = useRouter();
  const { businessName } = useBusinessId();
  const createTemplate = useAddGiftCardTemplate();

  const [name, setName] = useState(businessName ?? '');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ea580c');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fixedAmounts, setFixedAmounts] = useState('25,50,100');
  const [allowCustomAmount, setAllowCustomAmount] = useState(false);
  const [minCustomAmount, setMinCustomAmount] = useState('10');
  const [maxCustomAmount, setMaxCustomAmount] = useState('500');
  const [expiryPeriodDays, setExpiryPeriodDays] = useState('365');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Template name is required.');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: name.trim(),
        description: description || undefined,
        backgroundColor,
        textColor,
        fixedAmounts: fixedAmounts
          .split(',')
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isFinite(value) && value > 0),
        allowCustomAmount,
        minCustomAmount: allowCustomAmount ? Number(minCustomAmount) : undefined,
        maxCustomAmount: allowCustomAmount ? Number(maxCustomAmount) : undefined,
        expiryPeriodDays: Number(expiryPeriodDays) || undefined,
        logoUrl: logoUrl || undefined,
      } as any);
      toast.success('Gift card template submitted for admin approval.');
      router.push('/dashboard/gift-card/templates');
    } catch {
      toast.error('Could not create the gift card template.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/gift-card/templates"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Gift Card Template</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div>
            <label className="text-xs font-semibold text-gray-500">Template name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Fixed amounts (comma separated)
            </label>
            <input
              value={fixedAmounts}
              onChange={(event) => setFixedAmounts(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allowCustomAmount}
              onChange={(event) => setAllowCustomAmount(event.target.checked)}
            />
            Allow custom amount
          </label>
          {allowCustomAmount && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Minimum</label>
                <input
                  type="number"
                  value={minCustomAmount}
                  onChange={(event) => setMinCustomAmount(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Maximum</label>
                <input
                  type="number"
                  value={maxCustomAmount}
                  onChange={(event) => setMaxCustomAmount(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">Card colour</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Text colour</label>
              <input
                type="color"
                value={textColor}
                onChange={(event) => setTextColor(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Expiry period (days)
              </label>
              <input
                type="number"
                value={expiryPeriodDays}
                onChange={(event) => setExpiryPeriodDays(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Logo URL</label>
              <input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createTemplate.isPending}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {createTemplate.isPending ? 'Creating…' : 'Create template'}
          </button>
        </form>
      </div>
    </div>
  );
}
