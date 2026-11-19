'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Check,
  Coins,
  Package,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  PublicLoyaltyEligibleItem,
  PublicLoyaltyProgram,
  useJoinLoyaltyProgram,
  usePublicLoyaltyProgram,
} from '@/service/loyalty/hook';
import { CURRENCY } from '@/lib/utils';

type LoyaltyProgramBannerProps = {
  businessId?: string;
  className?: string;
  /** Render without its own card surface, for use inside a loyalty container. */
  embedded?: boolean;
};

const plural = (count: number, singular: string, pluralForm?: string) =>
  `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;

const pointsLabel = (count: number) =>
  count === 1 ? '1 point' : `${count.toLocaleString('en-GB')} points`;

const moneyLabel = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
};

function scopeLabel(program: PublicLoyaltyProgram) {
  if (program.earnOnProducts && program.earnOnServices) {
    return 'products and services';
  }
  if (program.earnOnServices) return 'service bookings';
  return 'products';
}

function earningSummary(program: PublicLoyaltyProgram) {
  const scope = scopeLabel(program);
  const rate = pointsLabel(Number(program.pointsPerCurrency ?? 0));
  return `Earn ${rate} for every ${CURRENCY}1 spent on ${scope}.`;
}

function ItemList({
  title,
  icon,
  items,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  items: PublicLoyaltyEligibleItem[];
  emptyLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-500">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-gray-400">{emptyLabel}</p>
      ) : (
        <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-[#ece4de] bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600"
            >
              {item.name}
              {item.customPoints !== null
                ? ` · ${item.customPoints.toLocaleString('en-GB')} pts`
                : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Public loyalty programme banner.
 *
 * Shows a one-line summary and the qualifying catalogue, then reveals the
 * earning rules in plain language before the customer joins.
 */
export default function LoyaltyProgramBanner({
  businessId,
  className,
  embedded = false,
}: LoyaltyProgramBannerProps) {
  const router = useRouter();
  const { data: program } = usePublicLoyaltyProgram(businessId);
  const joinProgram = useJoinLoyaltyProgram();
  const [open, setOpen] = useState(false);

  const products = useMemo(
    () => program?.eligibleProducts ?? [],
    [program?.eligibleProducts],
  );
  const services = useMemo(
    () => program?.eligibleServices ?? [],
    [program?.eligibleServices],
  );

  const customPointItems = useMemo(
    () =>
      [...products, ...services].filter(
        (item) => item.customPoints !== null,
      ),
    [products, services],
  );

  if (!businessId || !program?.isEnabled) return null;

  const totalItems = products.length + services.length;
  const preview = [...products, ...services].slice(0, 3);
  const remaining = totalItems - preview.length;
  const itemBreakdown = [
    products.length > 0 ? plural(products.length, 'product') : null,
    services.length > 0 ? plural(services.length, 'service') : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const minSpend = moneyLabel(program.minSpend);
  const fixedBonus = Number(program.fixedPointsPerOrder ?? 0);
  const rate = pointsLabel(Number(program.pointsPerCurrency ?? 0));
  const scope = scopeLabel(program);

  const handleJoin = async () => {
    try {
      await joinProgram.mutateAsync(businessId);
      toast.success(`You joined ${program.programName}!`);
      setOpen(false);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        toast.error('Please sign in to join the loyalty programme.');
        setOpen(false);
        router.push('/signin');
        return;
      }
      toast.error('Could not join the loyalty programme. Please try again.');
    }
  };

  const rules = [
    `Earn ${rate} for every ${CURRENCY}1 you spend on ${scope}.`,
    ...(fixedBonus > 0
      ? [`Get ${pointsLabel(fixedBonus)} extra on every order or booking.`]
      : []),
    ...(minSpend
      ? [
          `Orders and bookings must be at least ${CURRENCY}${minSpend} to earn points.`,
        ]
      : []),
    ...(customPointItems.length > 0
      ? [
          `Some items earn a fixed amount instead: ${customPointItems
            .map((item) => `${item.name} (${item.customPoints} pts)`)
            .join(', ')}.`,
        ]
      : []),
  ];

  return (
    <>
      <div
        className={
          embedded
            ? `flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`
            : `flex flex-col gap-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`
        }
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f58220] text-white shadow-lg shadow-orange-500/20">
            <Coins className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-[#5a2c00]">
                {program.programName}
              </p>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-700 ring-1 ring-orange-200">
                Loyalty programme
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#8a4a12]">
              {earningSummary(program)}
            </p>
            {totalItems > 0 ? (
              <p className="mt-1.5 truncate text-[11px] font-medium text-[#8a4a12]/80">
                {itemBreakdown} qualify —{' '}
                {preview.map((item) => item.name).join(', ')}
                {remaining > 0 ? ` +${remaining} more` : ''}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-[#8a4a12]/80">
                No qualifying items listed yet.
              </p>
            )}
          </div>
        </div>

        {program.isOwner ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="View how customers earn points"
            className="shrink-0 self-start rounded-full bg-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-300 sm:self-auto"
          >
            Your business
          </button>
        ) : program.isJoined ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="View how you earn points"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 sm:self-auto"
          >
            <BadgeCheck className="h-4 w-4" /> Joined
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 self-start rounded-xl bg-[#a14000] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#8a3700] active:scale-95 sm:self-auto"
          >
            Join & start earning
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#a14000] sm:mx-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg">
              {program.isOwner
                ? `How customers earn with ${program.programName}`
                : program.isJoined
                  ? `How you earn with ${program.programName}`
                  : `Join ${program.programName}`}
            </DialogTitle>
            <DialogDescription>
              {program.isOwner
                ? 'This is the rule summary customers see before they join.'
                : program.isJoined
                  ? 'Your membership is active. Points are added after a completed order or booking.'
                  : "Here's exactly how your points will work. No fees, and you can join in one step."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                How you earn
              </p>
              <ul className="mt-2.5 space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[#6b3a12]"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {program.earnOnProducts ? (
                <ItemList
                  title="Qualifying products"
                  icon={<Package className="h-3.5 w-3.5" />}
                  items={products}
                  emptyLabel="No products listed yet."
                />
              ) : null}
              {program.earnOnServices ? (
                <ItemList
                  title="Qualifying services"
                  icon={<Wrench className="h-3.5 w-3.5" />}
                  items={services}
                  emptyLabel="No services listed yet."
                />
              ) : null}
            </div>

            <p className="text-[11px] leading-relaxed text-gray-500">
              Points are credited once per completed order or booking. Items not
              listed here do not earn points.
            </p>
          </div>

          <DialogFooter>
            {program.isJoined || program.isOwner ? (
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl bg-[#a14000] px-5 text-sm font-semibold text-white hover:bg-[#8a3700]"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-xl px-5 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleJoin}
                  disabled={joinProgram.isPending}
                  className="h-10 rounded-xl bg-[#a14000] px-5 text-sm font-semibold text-white hover:bg-[#8a3700]"
                >
                  {joinProgram.isPending
                    ? 'Joining…'
                    : 'Continue & join'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
