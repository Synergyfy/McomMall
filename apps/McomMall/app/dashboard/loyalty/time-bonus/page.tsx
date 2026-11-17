'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Gift,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  useDeleteOffer,
  useGetOffers,
  useUpdateOffer,
} from '@/service/offers/hook';

export default function TimeBonusListPage() {
  const { data: offers, isLoading, refetch } = useGetOffers();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const timeBonuses = (offers ?? []).filter(
    (offer) => offer.isTimeBonus === true
  );

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateOffer.mutateAsync({ id, isActive: !isActive } as any);
      toast.success(isActive ? 'Time bonus paused' : 'Time bonus resumed');
    } catch {
      toast.error('Could not update the time bonus.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this time bonus? This cannot be undone.')) {
      return;
    }
    try {
      await deleteOffer.mutateAsync(id);
      toast.success('Time bonus deleted');
      refetch();
    } catch {
      toast.error('Could not delete the time bonus.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/loyalty"
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Time Bonuses</h1>
              <p className="text-sm text-gray-500">
                Recurring bonus-point rewards customers can activate from your
                public listing.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/loyalty/time-bonus/new"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" /> New Time Bonus
          </Link>
        </header>

        {isLoading ? (
          <p className="rounded-xl border border-gray-100 bg-white py-12 text-center text-sm text-gray-400">
            Loading time bonuses…
          </p>
        ) : timeBonuses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">
              No time bonuses yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Create a recurring bonus customers can claim to keep them coming
              back.
            </p>
            <Link
              href="/dashboard/loyalty/time-bonus/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" /> Create your first time bonus
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {timeBonuses.map((bonus) => (
              <div
                key={bonus.id}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#a14000] ring-1 ring-orange-100">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{bonus.name}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          bonus.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {bonus.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black leading-none text-[#a14000]">
                      +{bonus.bonusPoints ?? 0}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      points
                    </p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
                  {bonus.description || 'No description.'}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                  <span>
                    {bonus.limitPerCustomer
                      ? `${bonus.limitPerCustomer} claim(s) per customer`
                      : 'Unlimited claims'}
                    {bonus.allowLimitToReset ? ' · resets daily' : ''}
                  </span>
                  {bonus.endDate ? (
                    <span>Ends {new Date(bonus.endDate).toLocaleDateString()}</span>
                  ) : (
                    <span>Always available</span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/dashboard/loyalty/offers/edit/${bonus.id}`}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(bonus.id, !!bonus.isActive)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-orange-600"
                  >
                    {bonus.isActive ? (
                      <>
                        <PauseCircle className="h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" /> Resume
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(bonus.id)}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
