'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cashbackApi } from '@/service/cashback/api';
import { HistoryQueryParams } from '@/service/cashback/types';
import { Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CashbackHistoryTableProps {
  scope: 'platform' | 'global';
}

export function CashbackHistoryTable({ scope }: CashbackHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [emailFilter, setEmailFilter] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');

  // Debounce logic using useEffect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailFilter);
      setPage(1); // Reset to first page on search change
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [emailFilter]);

  const queryParams: HistoryQueryParams = {
    page,
    limit: pageSize,
    sort: 'DESC',
    ...(debouncedEmail && { email: debouncedEmail }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['cashback-history', scope, queryParams],
    queryFn: () =>
      scope === 'platform'
        ? cashbackApi.getPlatformHistory(queryParams)
        : cashbackApi.getGlobalHistory(queryParams),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load transaction history.
      </div>
    );
  }

  const transactions = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(tx.createdAt), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>{tx.wallet?.user?.email || 'N/A'}</TableCell>
                  <TableCell>{tx.eventType.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.sourcePlatform}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        tx.type === 'CREDIT'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      )}
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.type === 'CREDIT' ? '+' : '-'}£{tx.amount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
