import { useWallet } from '@/service/wallet/hook';
import {
  Wallet,
  Landmark,
  ShieldCheck,
  AlertCircle,
  Coins,
  Lock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const WalletSummary = () => {
  const {
    data: walletData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useWallet();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-36 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <WalletStateCard
        title="Couldn't load your wallet"
        message={
          error instanceof Error
            ? error.message
            : 'Please check your connection and try again.'
        }
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  if (!walletData) {
    return (
      <WalletStateCard
        title="No wallet data found"
        message="We couldn't find a wallet for this account. Please retry or contact support."
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const centralWallet = walletData.centralWallet;
  const isCentral = Boolean(centralWallet?.linked);
  const isUnavailable =
    walletData.success === false && walletData.status === 'UNAVAILABLE';
  const isUnlinked =
    walletData.status === 'UNLINKED' ||
    (!isCentral && walletData.success === false);
  const currency = centralWallet?.currency || walletData.currency || 'MCOM';

  const balance = toFiniteNumber(
    centralWallet?.balance ??
      walletData.balance ??
      walletData.wallet?.balance,
  );
  const availableBalance = toFiniteNumber(
    centralWallet?.availableBalance ??
      walletData.availableBalance ??
      walletData.wallet?.spendableBalance ??
      walletData.wallet?.balance,
  );
  const holdReserve =
    balance !== null && availableBalance !== null
      ? Math.max(0, balance - availableBalance)
      : null;
  const status =
    centralWallet?.status ||
    walletData.status ||
    walletData.wallet?.status ||
    (isCentral ? 'ACTIVE' : 'UNLINKED');
  const canShowBalance = !isUnlinked && !isUnavailable;

  return (
    <div className="space-y-6">
      {/* Central Wallet Banner Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-orange-100 text-xs font-bold uppercase tracking-widest">
              <Coins className="w-4 h-4" /> MCOM Central Wallet
              {isUnlinked ? (
                <Badge
                  variant="outline"
                  className="text-amber-200 border-amber-300/40 bg-amber-900/30 text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Not linked
                </Badge>
              ) : isUnavailable ? (
                <Badge
                  variant="outline"
                  className="text-amber-200 border-amber-300/40 bg-amber-900/30 text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Unavailable
                </Badge>
              ) : isCentral ? (
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-white/30 text-xs font-semibold px-2 py-0.5 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {status}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-amber-200 border-amber-300/40 bg-amber-900/30 text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Local Account
                </Badge>
              )}
            </div>

            <div className="text-4xl sm:text-5xl font-black font-sans tracking-tight">
              {canShowBalance && balance !== null
                ? balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '—'}
              {canShowBalance && (
                <span className="text-xl sm:text-2xl font-bold ml-2.5 opacity-90">
                  {currency}
                </span>
              )}
            </div>

            {canShowBalance ? (
              <div className="text-xs font-medium text-orange-100/90 pt-1">
                Available:{' '}
                <span className="font-bold text-white">
                  {availableBalance !== null
                    ? `${availableBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ${currency}`
                    : '—'}
                </span>
                {holdReserve !== null && holdReserve > 0 && (
                  <span className="ml-2 opacity-80">
                    · {holdReserve.toFixed(2)} {currency} in active hold
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs font-medium text-orange-100/90 pt-1 max-w-md leading-relaxed">
                {isUnlinked
                  ? 'Your MCOM wallet is not linked to this account. Log in via MCOM SSO to link it.'
                  : 'We could not reach MCOM Central to load your balance. Your money is safe — please retry.'}
              </div>
            )}

            {isUnavailable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-2 gap-1.5 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
                Retry
              </Button>
            )}

            {isUnlinked && (
              <a
                href={walletData.topUpUrl || centralWallet?.topUpUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-white underline underline-offset-4 decoration-white/50 hover:decoration-white pt-1"
              >
                Open MCOM Wallet
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs text-orange-50 space-y-1.5 max-w-xs self-start md:self-auto">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Single Source of Truth
            </div>
            <p className="opacity-90 leading-relaxed">
              Managed centrally by MCOM Solutions. Synchronized in real-time
              across Mall, Rewards, Spin, and all MCOM apps.
            </p>
          </div>
        </div>
      </div>

      {/* Main Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <BalanceCard
          title="Total Balance"
          amount={canShowBalance ? balance : null}
          subtitle="Total credits in central wallet"
          icon={<Landmark size={20} />}
          color="orange"
          currency={currency}
        />

        <BalanceCard
          title="Available Balance"
          amount={canShowBalance ? availableBalance : null}
          subtitle="Ready to spend (excl. holds)"
          icon={<Wallet size={20} />}
          color="green"
          currency={currency}
        />

        <BalanceCard
          title="Reserved / Holds"
          amount={canShowBalance ? holdReserve : null}
          subtitle="Pre-authorized checkout holds"
          icon={<Lock size={20} />}
          color="yellow"
          currency={currency}
        />

        <BalanceCard
          title="Conversion Rate"
          amount={1.0}
          subtitle="1 MCOM Credit = £1.00 GBP"
          icon={<ArrowUpRight size={20} />}
          color="blue"
          currency="GBP"
        />
      </div>
    </div>
  );
};

const WalletStateCard = ({
  title,
  message,
  onRetry,
  retrying,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) => (
  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 flex flex-col items-start gap-3">
    <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
      <AlertCircle className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-lg">{message}</p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      disabled={retrying}
      className="gap-1.5"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
      Retry
    </Button>
  </div>
);

interface BalanceCardProps {
  title: string;
  amount: number | null;
  subtitle?: string;
  icon: ReactNode;
  color: 'orange' | 'green' | 'blue' | 'yellow';
  currency?: string;
}

const BalanceCard = ({ title, amount, subtitle, icon, color, currency = 'MCOM' }: BalanceCardProps) => {
  const colorStyles = {
    orange: {
      bg: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    green: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    yellow: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  };

  const style = colorStyles[color];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${style.bg}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-3 tracking-tight">
          {amount !== null
            ? amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '—'}{' '}
          {amount !== null && (
            <span className="text-sm font-semibold text-gray-500">
              {currency}
            </span>
          )}
        </p>
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};
