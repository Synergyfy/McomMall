'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetPaymentHistory } from '@/service/payments/hooks';
import { useGetMyMembership } from '@/service/membership/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CreditCard, 
  Receipt, 
  ChevronRight, 
  ArrowUpRight, 
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function BillingOverviewPage() {
  const router = useRouter();
  const { data: invoices, isLoading: isInvoicesLoading } = useGetPaymentHistory();
  const { data: membership, isLoading: isMembershipLoading } = useGetMyMembership();
  const isLoading = isInvoicesLoading || isMembershipLoading;

  // Load custom card details from localStorage to align with update method preview
  const cardNum = typeof window !== 'undefined' ? localStorage.getItem('billing_card_num') || '4242' : '4242';
  const cardName = typeof window !== 'undefined' ? localStorage.getItem('billing_card_name') || 'John Doe' : 'John Doe';
  const cardExpiry = typeof window !== 'undefined' ? localStorage.getItem('billing_card_expiry') || '12/28' : '12/28';

  const last4 = cardNum.slice(-4);

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice receipt #${invoiceId.slice(0, 8)}...`);
  };

  // Get first 3 invoices for the snapshot
  const invoiceSnapshot = invoices ? invoices.slice(0, 3) : [];

  // Dynamic membership calculations
  let priceValue = 299.00;
  let tierName = 'Pro Merchant Tier';
  if (membership) {
    if (membership.tier) {
      tierName = membership.tier.name ? `${membership.tier.name} Merchant Tier` : 'Pro Merchant Tier';
      if (membership.planType === 'annual' && membership.tier.annual_price !== undefined) {
        priceValue = Number(membership.tier.annual_price);
      } else if (membership.planType === 'quarterly' && membership.tier.quaterly_price !== undefined) {
        priceValue = Number(membership.tier.quaterly_price);
      } else {
        priceValue = Number(membership.tier.monthly_price ?? membership.tier.fixed_price ?? 299.00);
      }
    }
  }
  const priceFormatted = `$${priceValue.toFixed(2)}`;
  const billingCycle = membership?.planType === 'annual' ? '/ year' : membership?.planType === 'quarterly' ? '/ quarter' : '/ month';
  const billingCycleLabel = membership?.planType === 'annual' ? 'year' : membership?.planType === 'quarterly' ? 'quarter' : 'month';
  const autoRenewalLabel = membership?.isActive ? 'Auto-renewal: Active' : 'Auto-renewal: Off';
  const nextBillingDate = membership?.expiresAt 
    ? new Date(membership.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Oct 1, 2026';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Billing Overview</h1>
            <p className="text-xs text-gray-500">Manage payment methods, subscriptions, and invoice histories.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Summary Card */}
        <Card className="md:col-span-2 bg-[#213145] text-white border-none shadow-sm rounded-3xl overflow-hidden relative flex flex-col justify-between p-6 h-52">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="h-32 w-32 text-orange-500" />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold bg-[#ff6900] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {tierName}
              </span>
              <span className="text-[11px] font-bold opacity-80 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Next billing: {nextBillingDate}
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold tracking-tight">{priceFormatted}<span className="text-sm font-normal opacity-85">/ {billingCycleLabel}</span></h3>
              <p className="text-xs opacity-75 mt-1.5 max-w-sm">
                Unlock full borough rotator campaigns, marketing automations, and custom team roles permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
            <span className="text-xs font-semibold opacity-90">{autoRenewalLabel}</span>
            <Button 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 text-xs font-semibold"
              onClick={() => toast.info('To cancel or downgrade, please reach out to account manager.')}
            >
              Change Plan
            </Button>
          </div>
        </Card>

        {/* Payment Method Quick Preview */}
        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl p-6 flex flex-col justify-between h-52">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Payment Card</h4>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-gray-900 p-1.5 rounded-lg border shadow-sm">
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider">VISA</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                    •••• •••• •••• {last4}
                  </span>
                  <span className="text-[10px] text-gray-450 dark:text-gray-450 block mt-0.5">
                    Exp: {cardExpiry} · {cardName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/dashboard/settings/payment-method')}
            className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 mt-4"
          >
            Update Method <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      {/* Invoice Snapshot List */}
      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Recent Invoices</CardTitle>
            <CardDescription>Download receipts of recently charged payments.</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/dashboard/settings/invoices')}
            className="text-xs font-bold text-[#ff6900] hover:bg-orange-50/50 flex items-center gap-1"
          >
            All Invoices <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading invoices...</div>
          ) : invoiceSnapshot.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <Receipt className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              No invoices generated yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2">
                    <th className="py-2">Date</th>
                    <th className="py-2">Invoice ID</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {invoiceSnapshot.map((inv: any) => (
                    <tr key={inv.id} className="text-gray-700 dark:text-gray-350">
                      <td className="py-3 font-medium">
                        {new Date(inv.created_at || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-mono text-[10px]">
                        INV-{inv.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 font-bold text-gray-900 dark:text-white">
                        ${Number(inv.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-50 text-[#22C55E]">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
