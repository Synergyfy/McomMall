'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetTakeadsSettings,
  useGetTakeadsSyncRuns,
  useTriggerTakeadsSync,
} from '@/service/takeads/hook';

export default function TakeadsSettingsPage() {
  const { data, isLoading } = useGetTakeadsSettings();
  const { data: runs } = useGetTakeadsSyncRuns();
  const sync = useTriggerTakeadsSync();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          TakeAds Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Connection state only. Secret values are never sent to the browser.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Platform key
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {data?.platformConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                {data?.platformConfigured ? 'Configured' : 'Missing'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Merchants, coupons and link resolution.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Account key
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {data?.accountConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                {data?.accountConfigured ? 'Configured' : 'Missing'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click and action reports.
                {data && !data.dedicatedAccountKey && data.accountConfigured
                  ? ' Currently falling back to the platform key.'
                  : ''}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                API base URL
              </p>
              <p className="mt-1 text-sm font-mono text-slate-700">
                {data?.baseUrl}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Scheduled sync
              </p>
              <Badge
                variant="outline"
                className={
                  data?.syncEnabled
                    ? 'mt-1 border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'mt-1 border-amber-200 bg-amber-50 text-amber-700'
                }
              >
                {data?.syncEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Default country
              </p>
              <p className="mt-1 text-sm font-semibold">{data?.defaultCountry}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Default language
              </p>
              <p className="mt-1 text-sm font-semibold">{data?.defaultLanguage}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => sync.mutate('merchants')}
              disabled={sync.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync merchants
            </Button>
            <Button
              variant="outline"
              onClick={() => sync.mutate('coupons')}
              disabled={sync.isPending}
            >
              Sync coupons
            </Button>
            <Button
              variant="outline"
              onClick={() => sync.mutate('reports')}
              disabled={sync.isPending}
            >
              Sync reports
            </Button>
            <Button onClick={() => sync.mutate('all')} disabled={sync.isPending}>
              Sync all
            </Button>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
            <p className="font-semibold">Server-side configuration</p>
            <p className="mt-1">
              Set <code>TAKEADS_PLATFORM_API_KEY</code> and{' '}
              <code>TAKEADS_ACCOUNT_API_KEY</code> in the backend environment.
              <code>TAKEADS_KEY</code> is used as a fallback for the platform key.
              Never expose these to the storefront.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Sync history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!runs?.length ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No sync runs yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="capitalize">{run.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          run.status === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : run.status === 'failed'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-sky-200 bg-sky-50 text-sky-700'
                        }
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(run.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{run.itemsReceived}</TableCell>
                    <TableCell>{run.itemsCreated}</TableCell>
                    <TableCell>{run.itemsUpdated}</TableCell>
                    <TableCell>{run.itemsFailed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
