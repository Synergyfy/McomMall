'use client';

import { useState } from 'react';
import { useGetVoucherTransactionHistory } from '@/service/admin';
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
import { formatCurrency } from '@/lib/utils';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DateRange } from 'react-day-picker';

export const VoucherTransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data, isLoading } = useGetVoucherTransactionHistory({
    page,
    take: 10,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.meta.pageCount || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.customer.name}</TableCell>
                  <TableCell>{transaction.customer.email}</TableCell>
                  <TableCell>
                    <TransactionTypeBadge type={transaction.type} />
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    {format(new Date(transaction.createdAt), 'PPP')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page - 1);
              }}
            />
          </PaginationItem>
          {Array.from({ length: data?.meta.pageCount || 1 }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={page === i + 1}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(i + 1);
                }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};