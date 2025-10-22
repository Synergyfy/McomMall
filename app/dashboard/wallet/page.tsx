'use client';
import React from 'react';
import { WalletSummary } from './component/WalletSummary';
import { EarningTable } from '../component/Tables';
import WithdrawPage from './component/Withdraw';
import { Button } from '@/components/ui/button';
import FundWallet from './component/FundWallet';

const Page = () => {
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [showFundWallet, setShowFundWallet] = React.useState(false);

  if (showWithdraw) {
    return <WithdrawPage onBack={() => setShowWithdraw(false)} />;
  }

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <div className="flex justify-end gap-3">
        <Button onClick={() => setShowWithdraw(true)}>Withdraw</Button>
        <Button onClick={() => setShowFundWallet(true)}>Fund Wallet</Button>
      </div>
      <WalletSummary />
      <EarningTable />
      <FundWallet
        isOpen={showFundWallet}
        onClose={() => setShowFundWallet(false)}
      />
    </div>
  );
};

export default Page;
