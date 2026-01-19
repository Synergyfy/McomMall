'use client';
import React from 'react';
import { CashbackSummary } from './components/CashbackSummary';
import { CashbackRules } from './components/CashbackRules';
import { CashbackHistoryTable } from './components/CashbackHistoryTable';

const Page = () => {
  return (
    <div className="flex flex-col gap-8 overflow-auto pb-10">
      <div className="flex flex-col gap-1">
         <h2 className="text-2xl font-bold tracking-tight text-gray-900">Cashback Program</h2>
         <p className="text-gray-500">View your earnings and discover new ways to get cashback.</p>
      </div>
      <CashbackSummary />
      <div className="grid gap-8 lg:grid-cols-1">
         <CashbackRules />
         <CashbackHistoryTable />
      </div>
    </div>
  );
};

export default Page;
