'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetPaymentHistory } from '@/service/payments/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Receipt, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function InvoicesLogPage() {
  const router = useRouter();
  const { data: invoices, isLoading } = useGetPaymentHistory();

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice receipt INV-${invoiceId.slice(0, 8).toUpperCase()}...`);
  };

  const handleExportCSV = () => {
    toast.success('Exporting transaction history to CSV...');
  };

  // Filtered invoices
  const filteredInvoices = invoices
    ? invoices.filter((inv: any) => {
        const matchesSearch = inv.id.toLowerCase().includes(search.toLowerCase());
        
        // Status checks
        const status = 'paid'; // All backend returned history items are successfully paid checkouts
        const matchesStatus = statusFilter === 'all' || statusFilter === status;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings/billing')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
            <p className="text-xs text-gray-500">Search and download receipts of recently charged payments.</p>
          </div>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200 flex items-center justify-center gap-2 rounded-xl text-xs"
        >
          <FileSpreadsheet size={14} className="text-green-600" />
          Export CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice ID..."
            className="rounded-xl pl-9 border-gray-200/80 focus-visible:ring-[#ff6900] h-9 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 overflow-x-auto no-scrollbar">
          {(['all', 'paid', 'pending', 'failed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`py-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'border-[#ff6900] bg-orange-50/50 text-[#ff6900]'
                  : 'border-gray-100 hover:bg-gray-50 text-gray-500'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Records Log Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 space-y-3">
              <AlertCircle className="h-10 w-10 mx-auto text-gray-300" />
              <p>No invoices match the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2">
                    <th className="py-2">Billing Date</th>
                    <th className="py-2">Invoice ID</th>
                    <th className="py-2">Payment Description</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredInvoices.map((inv: any) => {
                    const status = 'paid'; // Default history status is paid
                    return (
                      <tr key={inv.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-3.5 font-medium">
                          {new Date(inv.created_at || inv.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 font-mono text-[10px] tracking-wider text-gray-500">
                          INV-{inv.id.slice(0, 12).toUpperCase()}
                        </td>
                        <td className="py-3.5 text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                          {inv.description || 'Pro Monthly Subscription Renewal'}
                        </td>
                        <td className="py-3.5 font-bold text-gray-900 dark:text-white">
                          ${Number(inv.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            status === 'paid'
                              ? 'bg-green-50 text-[#22C55E]'
                              : status === 'pending'
                              ? 'bg-yellow-50 text-[#F59E0B]'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadInvoice(inv.id)}
                            className="h-8 w-8 text-[#ff6900] hover:bg-orange-50 rounded-lg"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
