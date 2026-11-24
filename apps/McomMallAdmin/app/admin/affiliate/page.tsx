'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BadgePercent,
  CheckCircle2,
  Clock,
  Loader2,
  MousePointerClick,
  PoundSterling,
  RefreshCw,
  Store,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetAffiliateClicks,
  useGetAffiliateSummary,
  useGetAffiliateTransactions,
  useSyncAwin,
} from '@/service/promotional-offers/hook';

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'orange' | 'sky' | 'emerald' | 'amber' | 'red' | 'slate';
}) {
  const tones = {
    orange: 'bg-orange-100 text-orange-600',
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadge(status: string) {
  if (status === 'approved' || status === 'amended') {
    return (
      <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {status}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
        pending
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100">
        rejected
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function AffiliateReportingPage() {
  const [tab, setTab] = useState<'transactions' | 'clicks'>('transactions');
  const [page, setPage] = useState(1);
  const { data: summary, isLoading: summaryLoading } =
    useGetAffiliateSummary();
  const { data: transactions, isLoading: transactionsLoading } =
    useGetAffiliateTransactions({ page, limit: 25 });
  const { data: clicks, isLoading: clicksLoading } = useGetAffiliateClicks({
    page,
    limit: 25,
  });
  const syncAwin = useSyncAwin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Affiliate Reporting
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Attribution for Awin promotional offers across every business.
            Internal clicks are recorded independently and reconciled against
            Awin transactions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/promotional-offers">
              <BadgePercent className="mr-2 h-4 w-4" />
              Manage offers
            </Link>
          </Button>
          <Button
            onClick={() => syncAwin.mutate({})}
            disabled={syncAwin.isPending}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {syncAwin.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync from Awin
          </Button>
        </div>
      </div>

      {syncAwin.isError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {(syncAwin.error as any)?.response?.data?.message ||
            (syncAwin.error as Error)?.message ||
            'Awin sync is not configured.'}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Internal clicks"
          value={summaryLoading ? '…' : summary?.totalClicks ?? 0}
          icon={MousePointerClick}
          tone="sky"
        />
        <SummaryCard
          label="Attributed sales"
          value={summaryLoading ? '…' : summary?.transactions ?? 0}
          icon={Store}
          tone="orange"
        />
        <SummaryCard
          label="Approved commission"
          value={
            summaryLoading
              ? '…'
              : `£${(summary?.approvedCommission ?? 0).toFixed(2)}`
          }
          icon={PoundSterling}
          tone="emerald"
        />
        <SummaryCard
          label="Conversion rate"
          value={
            summaryLoading ? '…' : `${summary?.conversionRate ?? 0}%`
          }
          icon={BadgePercent}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={summary?.pendingTransactions ?? 0}
          icon={Clock}
          tone="amber"
        />
        <SummaryCard
          label="Approved"
          value={summary?.approvedTransactions ?? 0}
          icon={CheckCircle2}
          tone="emerald"
        />
        <SummaryCard
          label="Rejected"
          value={summary?.rejectedTransactions ?? 0}
          icon={XCircle}
          tone="red"
        />
        <SummaryCard
          label="Pending commission"
          value={`£${(summary?.pendingCommission ?? 0).toFixed(2)}`}
          icon={PoundSterling}
          tone="amber"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b">
          <CardTitle className="text-base">Attribution ledger</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === 'transactions' ? 'default' : 'outline'}
              onClick={() => {
                setTab('transactions');
                setPage(1);
              }}
            >
              Transactions
            </Button>
            <Button
              size="sm"
              variant={tab === 'clicks' ? 'default' : 'outline'}
              onClick={() => {
                setTab('clicks');
                setPage(1);
              }}
            >
              Clicks
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {tab === 'transactions' ? (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Awin transaction</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>ClickRef</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sale</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-sky-600" />
                      </TableCell>
                    </TableRow>
                  ) : transactions?.data?.length ? (
                    transactions.data.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs">
                          {transaction.externalTransactionId}
                        </TableCell>
                        <TableCell>
                          {transaction.businessName || 'Unattributed'}
                        </TableCell>
                        <TableCell>{transaction.offerName}</TableCell>
                        <TableCell className="max-w-[220px] truncate font-mono text-[11px] text-slate-500">
                          {transaction.clickRef || '—'}
                        </TableCell>
                        <TableCell>{statusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.saleAmount !== null &&
                          transaction.saleAmount !== undefined
                            ? `£${Number(transaction.saleAmount).toFixed(2)}`
                            : '—'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {transaction.commissionAmount !== null &&
                          transaction.commissionAmount !== undefined
                            ? `£${Number(transaction.commissionAmount).toFixed(2)}`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-28 text-center text-slate-500"
                      >
                        No Awin transactions yet. Configure AWIN_API_TOKEN and
                        AWIN_PUBLISHER_ID, then run a sync.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>ClickRef</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Attributed</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clicksLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-sky-600" />
                      </TableCell>
                    </TableRow>
                  ) : clicks?.data?.length ? (
                    clicks.data.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="max-w-[260px] truncate font-mono text-[11px] text-slate-500">
                          {click.clickRef}
                        </TableCell>
                        <TableCell>{click.businessName}</TableCell>
                        <TableCell>{click.offerName}</TableCell>
                        <TableCell className="capitalize text-slate-500">
                          {click.source || '—'}
                        </TableCell>
                        <TableCell>
                          {click.attributed ? (
                            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              attributed
                            </Badge>
                          ) : (
                            <Badge variant="outline">pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(click.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-28 text-center text-slate-500"
                      >
                        No affiliate clicks recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="flex items-center justify-between border-t p-4 text-sm text-slate-500">
            <span>
              Page {page} ·{' '}
              {tab === 'transactions'
                ? transactions?.total ?? 0
                : clicks?.total ?? 0}{' '}
              records
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
