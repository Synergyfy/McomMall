'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  MousePointerClick,
  Package,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useGetTakeadsActions,
  useGetTakeadsClickReports,
  useGetTakeadsMcomClicks,
  useGetTakeadsProductPerformance,
  useGetTakeadsReportSummary,
  useSyncTakeadsReports,
} from '@/service/takeads/hook';

const statusStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELED: 'border-red-200 bg-red-50 text-red-700',
  SETTLED: 'border-sky-200 bg-sky-50 text-sky-700',
};

export default function TakeadsReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const params = { from: from || undefined, to: to || undefined };

  const { data: summary, isLoading } = useGetTakeadsReportSummary(params);
  const { data: actions } = useGetTakeadsActions({ ...params, limit: 50 });
  const { data: mcomClicks } = useGetTakeadsMcomClicks({ ...params, limit: 20 });
  const { data: clickReports } = useGetTakeadsClickReports({
    ...params,
    limit: 20,
  });
  const { data: performance } = useGetTakeadsProductPerformance(params);
  const sync = useSyncTakeadsReports();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            TakeAds Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            MCOM marketplace events and TakeAds reports are shown separately.
            Clicks are not sales and pending actions are not confirmed revenue.
          </p>
        </div>
        <Button onClick={() => sync.mutate()} disabled={sync.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync reports
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-[170px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-[170px]"
            />
          </div>
          <p className="text-xs text-slate-500">
            Defaults to the last 30 days.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading report…
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  MCOM clicks
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {summary.mcomClicks}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  TakeAds clicks
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {summary.takeadsClicks}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Validated revenue
                </p>
                <p className="flex items-start gap-2 text-lg font-black text-emerald-700">
                  <Wallet className="mt-1 h-5 w-5 shrink-0" />
                  <span>
                    {summary.actions.byCurrency?.length
                      ? summary.actions.byCurrency.map((bucket) => (
                          <span key={bucket.currency} className="mr-2">
                            {bucket.currency}{' '}
                            {bucket.validatedRevenue.toFixed(2)}
                          </span>
                        ))
                      : `${summary.actions.validatedRevenue.toFixed(2)} (currency unknown)`}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Pending actions
                </p>
                <p className="text-2xl font-black text-amber-700">
                  {summary.actions.byStatus.PENDING}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Per-product performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!performance?.data.length ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No offers to report on yet.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>SubID</TableHead>
                        <TableHead className="text-right">MCOM clicks</TableHead>
                        <TableHead className="text-right">
                          TakeAds clicks
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performance.data.map((row) => {
                        const actionTotal = Object.values(row.actions).reduce(
                          (sum, count) => sum + count,
                          0,
                        );
                        return (
                          <TableRow key={row.offerId}>
                            <TableCell>
                              <Link
                                href={`/admin/takeads/offers/${row.offerId}`}
                                className="line-clamp-1 text-sm font-medium text-sky-700 hover:underline"
                              >
                                {row.title}
                              </Link>
                              <p className="text-[11px] text-slate-500">
                                {row.approvalStatus} / {row.publicationStatus}
                              </p>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {row.merchantName || row.externalMerchantId || '—'}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-slate-500">
                              {row.subId || '—'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {row.mcomClicks}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {row.takeadsClicks}
                            </TableCell>
                            <TableCell className="text-right">
                              {actionTotal}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {row.revenueByCurrency.length ? (
                                row.revenueByCurrency.map((bucket) => (
                                  <span key={bucket.currency} className="block">
                                    {bucket.currency}{' '}
                                    {(
                                      bucket.validatedRevenue +
                                      bucket.pendingRevenue
                                    ).toFixed(2)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {performance.unmappedActions > 0 && (
                    <p className="border-t border-slate-100 px-4 py-3 text-xs text-amber-700">
                      {performance.unmappedActions} TakeAds action(s) could not
                      be mapped to an offer because no subId was supplied.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MousePointerClick className="h-4 w-4" />
                TakeAds actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!actions?.data.length ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No actions recorded for this period.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>SubID</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.data.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-mono text-xs">
                          {action.actionId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusStyles[action.status]}
                          >
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{action.type || '—'}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {action.merchantId || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {action.subId || '—'}
                        </TableCell>
                        <TableCell>
                          {action.orderAmount
                            ? `${action.currencyCode || ''} ${action.orderAmount}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {action.publisherRevenue
                            ? `${action.currencyCode || ''} ${action.publisherRevenue}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {action.advertiserPaid ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">MCOM click ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!mcomClicks?.data.length ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No MCOM clicks for this period.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Click ref</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>SubID</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mcomClicks.data.map((click) => (
                        <TableRow key={click.id}>
                          <TableCell className="font-mono text-[11px]">
                            {click.clickRef}
                          </TableCell>
                          <TableCell>{click.source || '—'}</TableCell>
                          <TableCell className="text-xs">
                            {click.subId || '—'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(click.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  TakeAds click aggregates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!clickReports?.data.length ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No TakeAds click reports for this period.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>SubID</TableHead>
                        <TableHead>Clicks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clickReports.data.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.date}</TableCell>
                          <TableCell className="text-xs">
                            {report.merchantName ||
                              report.merchantId ||
                              '—'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {report.subId || '—'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {report.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
