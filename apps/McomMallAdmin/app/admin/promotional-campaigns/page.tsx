'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Edit,
  Gift,
  Loader2,
  Megaphone,
  Plus,
  Power,
  Search,
  Sparkles,
  Store,
  Trash2,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDeleteCampaign,
  useGetCampaigns,
  useGetCampaignStats,
  useUpdateCampaign,
} from '@/service/promotional-campaigns/hook';
import {
  CampaignFilters,
  PromotionalCampaign,
  PromotionalCampaignStatus,
} from '@/service/promotional-campaigns/types';

const statusStyles: Record<PromotionalCampaignStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
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

export default function PromotionalCampaignsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [campaignToArchive, setCampaignToArchive] =
    useState<PromotionalCampaign | null>(null);

  const { data: stats } = useGetCampaignStats();
  const { data, isLoading, isError, error } = useGetCampaigns(filters);
  const updateCampaign = useUpdateCampaign();
  const archiveCampaign = useDeleteCampaign();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Promotional Campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Build campaigns from merchant products, services and MCOM
            promotional offers, then invite selected businesses to participate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/admin/promotional-campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New campaign
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/promotional-offers">
              <Sparkles className="mr-2 h-4 w-4" />
              Promotional offers
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total campaigns" value={stats?.total ?? 0} icon={Megaphone} />
        <StatCard label="Live" value={stats?.active ?? 0} icon={Sparkles} />
        <StatCard label="Drafts" value={stats?.draft ?? 0} icon={Edit} />
        <StatCard
          label="Accepted businesses"
          value={stats?.acceptedParticipants ?? 0}
          icon={Users}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setFilters((current) => ({
                      ...current,
                      search,
                      page: 1,
                    }));
                  }
                }}
                placeholder="Search campaigns…"
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status:
                    value === 'all'
                      ? undefined
                      : (value as PromotionalCampaignStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() =>
                setFilters((current) => ({ ...current, search, page: 1 }))
              }
            >
              Search
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-orange-500" />
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-red-600">
                      {error instanceof Error
                        ? error.message
                        : 'Could not load campaigns.'}
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length ? (
                  data.data.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {campaign.name}
                          </p>
                          <p className="max-w-[280px] truncate text-xs text-slate-500">
                            {campaign.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {campaign.startDate
                            ? new Date(campaign.startDate).toLocaleDateString()
                            : '—'}
                          {' → '}
                          {campaign.endDate
                            ? new Date(campaign.endDate).toLocaleDateString()
                            : 'Open'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Gift className="h-3.5 w-3.5 text-orange-500" />
                          <span className="capitalize">
                            {campaign.rewardTitle || campaign.rewardType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.items?.length ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {campaign.availableToAll
                            ? 'All businesses'
                            : `${campaign.participants?.length ?? 0} invited`}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.acceptedCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[campaign.status]}
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title={
                              campaign.status === 'active'
                                ? 'Deactivate'
                                : 'Activate'
                            }
                            onClick={() =>
                              updateCampaign.mutate({
                                id: campaign.id,
                                payload: {
                                  status:
                                    campaign.status === 'active'
                                      ? 'inactive'
                                      : 'active',
                                },
                              })
                            }
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit"
                            onClick={() =>
                              router.push(
                                `/admin/promotional-campaigns/${campaign.id}/edit`,
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600"
                            title="Archive"
                            onClick={() => setCampaignToArchive(campaign)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Store className="h-8 w-8 text-slate-300" />
                        <p className="font-semibold">No campaigns yet</p>
                        <p className="text-sm">
                          Create a campaign and invite businesses to participate.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {data.page} of {data.totalPages} · {data.total} campaigns
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: Math.max(1, (current.page ?? 1) - 1),
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: (current.page ?? 1) + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!campaignToArchive}
        onOpenChange={(open) => !open && setCampaignToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              The campaign will be hidden from businesses and storefronts.
              Participation history is retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveCampaign.isPending}
              onClick={() => {
                if (!campaignToArchive) return;
                archiveCampaign.mutate(campaignToArchive.id, {
                  onSuccess: () => setCampaignToArchive(null),
                });
              }}
            >
              {archiveCampaign.isPending ? 'Archiving…' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
