'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Banknote, Wallet, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Type Definitions ---

type PaymentMethod = {
  id: string;
  type: 'Bank Transfer' | 'PayPal' | 'Payoneer';
  details: string;
  isDefault: boolean;
};

type Withdrawal = {
  id: string;
  date: Date;
  amount: number;
  method: string;
  status: 'Approved' | 'Pending' | 'Cancelled';
};

type InfoCardProps = {
  title: string;
  children: React.ReactNode;
};

// --- Mock Data ---

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'Bank Transfer',
    details: 'nequijj - asfsdfds - ****3432',
    isDefault: true,
  },
  { id: 'pm_2', type: 'PayPal', details: 'user@example.com', isDefault: false },
];

const withdrawalHistory: Withdrawal[] = [
  {
    id: '#WTH-001',
    date: new Date(2025, 7, 5),
    amount: 150.0,
    method: 'Bank Transfer',
    status: 'Approved',
  },
  {
    id: '#WTH-002',
    date: new Date(2025, 6, 20),
    amount: 75.5,
    method: 'PayPal',
    status: 'Approved',
  },
  {
    id: '#WTH-003',
    date: new Date(2025, 6, 1),
    amount: 250.0,
    method: 'Bank Transfer',
    status: 'Cancelled',
  },
  {
    id: '#WTH-004',
    date: new Date(),
    amount: 100.0,
    method: 'PayPal',
    status: 'Pending',
  },
];

// --- Reusable UI Components ---

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-lg shadow-sm"
  >
    <div className="p-4 sm:p-6 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </motion.div>
);

const PaymentMethodRow: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const Icon = method.type === 'Bank Transfer' ? Banknote : Wallet;
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Icon className="h-6 w-6 text-gray-400" />
        <div>
          <p className="font-medium text-gray-800">{method.type}</p>
          <p className="text-sm text-gray-500">{method.details}</p>
        </div>
      </div>
      {method.isDefault && (
        <Badge
          variant="outline"
          className="text-indigo-600 border-indigo-200 bg-indigo-50"
        >
          Default
        </Badge>
      )}
    </div>
  );
};

const WithdrawalHistory: React.FC<{ history: Withdrawal[] }> = ({
  history,
}) => {
  const statusColors: Record<Withdrawal['status'], string> = {
    Approved: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You do not have any approved withdraw yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full responsive-table">
        <thead className="text-left text-xs text-gray-500 uppercase">
          <tr>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Method</th>
            <th className="pb-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody className="md:divide-y md:divide-gray-200">
          {history.map(item => (
            <tr key={item.id}>
              <td data-label="Date" className="py-4 text-sm text-gray-800">
                {item.date.toLocaleDateString()}
              </td>
              <td
                data-label="Amount"
                className="py-4 text-sm font-medium text-gray-900"
              >
                ${item.amount.toFixed(2)}
              </td>
              <td data-label="Method" className="py-4 text-sm text-gray-800">
                {item.method}
              </td>
              <td data-label="Status" className="py-4 text-right">
                <Badge className={`${statusColors[item.status]}`}>
                  {item.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function WithdrawPage() {
  const balance = 275.5;
  const minimumWithdrawal = 50.0;

  return (
    <>
      <style jsx global>{`
        @media (max-width: 639px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table tr {
            display: block;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
            overflow: hidden;
          }
          .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f3f4f6;
            text-align: right;
          }
          .responsive-table td:last-child {
            border-bottom: none;
          }
          .responsive-table td::before {
            content: attr(data-label);
            font-weight: 600;
            text-align: left;
            margin-right: 1rem;
            color: #4b5563;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Withdraw</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Withdraw</span>
            </div>
          </header>

          <div className="space-y-8">
            <InfoCard title="Balance">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-gray-600">
                    Your Balance:{' '}
                    <span className="font-bold text-2xl text-gray-800">
                      ${balance.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Minimum Withdraw Amount: ${minimumWithdrawal.toFixed(2)}
                  </p>
                </div>
                <Button size="lg" disabled={balance < minimumWithdrawal}>
                  Request Withdraw
                </Button>
              </div>
            </InfoCard>

            <InfoCard title="Payment Details">
              <WithdrawalHistory history={withdrawalHistory} />
            </InfoCard>

            <InfoCard title="Payment Methods">
              <div className="divide-y divide-gray-200">
                {paymentMethods.map(method => (
                  <PaymentMethodRow key={method.id} method={method} />
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}
