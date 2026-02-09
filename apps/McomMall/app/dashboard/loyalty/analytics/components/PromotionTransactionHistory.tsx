'use client';

import { useState } from 'react';
import { useGetPromotionTransactionHistory } from '@/service/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DateRange } from 'react-day-picker';
import { Loader2, FileText, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PromotionTransactionHistory = ({
  promotionId,
}: {
  promotionId: string;
}) => {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data, isLoading } = useGetPromotionTransactionHistory(promotionId, {
    page,
    take: 10,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.meta.pageCount || 1)) {
      setPage(newPage);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Real-time log of customer points activity.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Syncing records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-60">
                      <FileText className="h-10 w-10" />
                      <p>No activity found for this period.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((transaction) => (
                  <TableRow key={transaction.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{transaction.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{transaction.customer.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                            transaction.type === 'EARNED' 
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" 
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        }
                      >
                        {transaction.type === 'EARNED' ? (
                            <span className="flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" /> Earned
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <ArrowDownLeft className="h-3 w-3" /> Redeemed
                            </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${transaction.type === 'EARNED' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center justify-end gap-2">
                            <span>{format(new Date(transaction.createdAt), 'MMM d, yyyy')}</span>
                            <span className="text-xs opacity-50">{format(new Date(transaction.createdAt), 'h:mm a')}</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.meta.pageCount > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                    <span className="text-sm text-muted-foreground px-4">
                        Page {page} of {data.meta.pageCount}
                    </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={page >= data.meta.pageCount ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};