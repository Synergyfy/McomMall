'use client';
import React from 'react';
import { WalletSummary } from './component/WalletSummary';
import { EarningTable } from '../component/Tables';
import WithdrawPage from './component/Withdraw';
import { Button } from '@/components/ui/button';

const Page = () => {
  const [showWithdraw, setShowWithdraw] = React.useState(false);

  if (showWithdraw) {
    return <WithdrawPage />;
  }

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <div className="flex justify-end">
        <Button onClick={() => setShowWithdraw(true)}>Withdraw</Button>
      </div>
      <WalletSummary />
      <EarningTable />
    </div>
  );
};

export default Page;
