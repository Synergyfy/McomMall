'use client';
import React from 'react';
import { WalletSummary } from './component/WalletSummary';
import { TransactionHistoryTable } from '../component/Tables';
import WithdrawPage from './component/Withdraw';
import { Button } from '@/components/ui/button';
import FundWallet from './component/FundWallet';
import { useWallet } from '@/service/wallet/hook';
import { ArrowUpRight, ExternalLink, PlusCircle, RefreshCw, Wallet } from 'lucide-react';

const Page = () => {
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [showFundWallet, setShowFundWallet] = React.useState(false);
  const { data: walletData, refetch, isFetching } = useWallet();

  if (showWithdraw) {
    return <WithdrawPage onBack={() => setShowWithdraw(false)} />;
  }

  const centralPortalUrl =
    walletData?.centralWallet?.topUpUrl ||
    `${process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'}/dashboard/wallet`;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-orange-600" />
            Wallet & Earnings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your centralized MCOM credits, payouts, and activity ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWithdraw(true)}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Withdraw
          </Button>

          <a
            href={centralPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition-colors"
          >
            Central Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            onClick={() => setShowFundWallet(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Top Up Wallet
          </Button>
        </div>
      </div>

      {/* Wallet Summary Cards */}
      <WalletSummary />

      {/* Transaction History Ledger */}
      <TransactionHistoryTable />

      {/* Funding Modal */}
      <FundWallet
        isOpen={showFundWallet}
        onClose={() => setShowFundWallet(false)}
      />
    </div>
  );
};

export default Page;
