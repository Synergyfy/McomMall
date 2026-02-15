'use client';
import React from 'react';
import { CashbackSummary } from './CashbackSummary';
import { CashbackRules } from './CashbackRules';
import { CashbackHistoryTable } from './CashbackHistoryTable';

export const GeneralCashback = () => {
  return (
    <div className="flex flex-col gap-8 overflow-auto pb-10">
      <CashbackSummary />
      <div className="grid gap-8 lg:grid-cols-1">
         <CashbackRules />
         <CashbackHistoryTable />
      </div>
    </div>
  );
};
