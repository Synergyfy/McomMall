'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  MousePointerClick,
  Package,
  RefreshCw,
  Ticket,
  Wallet,
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
  useGetTakeadsOverview,
  useTriggerTakeadsSync,
} from '@/service/takeads/hook';
import { TakeadsSyncRun } from '@/service/takeads/types';

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'sky',
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'sky' | 'emerald' | 'amber' | 'slate' | 'violet';
}) {
  const tones = {
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
    violet: 'bg-violet-100 text-violet-600',
  };

  return (
    <Card className="border-slate-200 shadow-sm">
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

function SyncStatus({ run }: { run: TakeadsSyncRun }) {
  const styles = {
    running: 'bg-sky-100 text-sky-700 border-sky-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <Badge variant="outline" className={styles[run.status]}>
      {run.status}
    </Badge>
  );
}

export default function TakeadsOverviewPage() {
  const { data, isLoading, isError, error, refetch } =
    useGetTakeadsOverview();
  const sync = useTriggerTakeadsSync();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading TakeAds integration…
      </div>
    );
  }

  if (isError || !data) {
    const message =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      'The API did not return an overview response.';

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Could not load the TakeAds overview.</p>
        <p className="mt-1">{message}</p>
        <Button
          variant="outline"
          className="mt-4 border-red-300 text-red-700"
          onClick={() => refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const { connection, counts, actions } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <Globe className="h-6 w-6 text-sky-600" />
            TakeAds Integration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Import external merchants and deals, review them, and publish only
            what MCOM Mall approves.
          </p>
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
            <Ticket className="mr-2 h-4 w-4" />
            Sync coupons
          </Button>
          <Button
            onClick={() => sync.mutate('reports')}
            disabled={sync.isPending}
          >
            <MousePointerClick className="mr-2 h-4 w-4" />
            Sync reports
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-2">
            {connection.platformConfigured ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm font-semibold text-slate-700">
              Platform key {connection.platformConfigured ? 'configured' : 'missing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {connection.accountConfigured ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm font-semibold text-slate-700">
              Reporting key {connection.accountConfigured ? 'configured' : 'missing'}
            </span>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            {connection.baseUrl}
          </Badge>
          <Badge
            variant="outline"
            className={
              connection.syncEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }
          >
            Scheduled sync {connection.syncEnabled ? 'on' : 'off'}
          </Badge>
          {!connection.dedicatedAccountKey && connection.accountConfigured && (
            <span className="text-xs text-amber-700">
              Using the platform key for reporting. Add TAKEADS_ACCOUNT_API_KEY
              for the documented two-key setup.
            </span>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Merchants"
          value={counts.merchants}
          icon={Globe}
          tone="sky"
        />
        <StatCard
          label="Coupons"
          value={counts.coupons}
          icon={Ticket}
          tone="violet"
        />
        <StatCard
          label="Pending review"
          value={counts.pendingOffers}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Published offers"
          value={counts.publishedOffers}
          icon={Package}
          tone="emerald"
        />
        <StatCard
          label="MCOM clicks"
          value={data.mcomClicks}
          icon={MousePointerClick}
          tone="sky"
        />
        <StatCard
          label="TakeAds clicks"
          value={data.takeadsClicks}
          icon={ExternalLink}
          tone="slate"
        />
        <StatCard
          label="Validated revenue"
          value={`£${actions.validatedRevenue.toFixed(2)}`}
          icon={Wallet}
          tone="emerald"
        />
        <StatCard
          label="Pending actions"
          value={actions.byStatus.PENDING}
          icon={Clock}
          tone="amber"
        />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent sync runs</CardTitle>
          <span className="text-xs text-slate-500">
            Last success:{' '}
            {data.lastSuccessfulSync
              ? new Date(data.lastSuccessfulSync).toLocaleString()
              : 'never'}
          </span>
        </CardHeader>
        <CardContent>
          {data.recentSyncRuns.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No sync has run yet. Use the buttons above to import data.
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
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSyncRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium capitalize">
                      {run.type}
                    </TableCell>
                    <TableCell>
                      <SyncStatus run={run} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(run.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{run.itemsReceived}</TableCell>
                    <TableCell>{run.itemsCreated}</TableCell>
                    <TableCell>{run.itemsUpdated}</TableCell>
                    <TableCell className="max-w-xs truncate text-red-600">
                      {run.errorMessage || '—'}
                    </TableCell>
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
