'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetSalesAndRedemptions } from '@/service/gift-card/hook';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useMemo } from 'react';
import { TransactionTypeBadge } from './TransactionTypeBadge';

export const SalesAndRedemptions = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useGetSalesAndRedemptions(
    date?.from ? format(date.from, 'yyyy-MM-dd') : '',
    date?.to ? format(date.to, 'yyyy-MM-dd') : ''
  );

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.length / itemsPerPage);
  }, [data, itemsPerPage]);

  const handleExportCsv = () => {
    if (data) {
      const headers = ['Date', 'Type', 'Customer', 'Gift Card', 'Amount'];
      const rows = data.map((transaction) => [
        format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        transaction.type,
        `"${transaction.customerName}"`,
        transaction.giftCardCode,
        transaction.amount,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        headers.join(',') +
        '\n' +
        rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'transaction_history.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportPdf = () => {
    if (data) {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Date', 'Type', 'Customer', 'Gift Card', 'Amount']],
        body: data.map((transaction) => [
          format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          transaction.type,
          transaction.customerName,
          transaction.giftCardCode,
          formatCurrency(transaction.amount),
        ]),
      });
      doc.save('transaction_history.pdf');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Transaction History{' '}
          {date?.from && date.to ? `(${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!data}>Export Data</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCsv}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {data && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Gift Card</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((transaction, index) => (
                    <TableRow
                      key={transaction.id}
                      className={index % 2 === 0 ? 'bg-gray-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <TransactionTypeBadge type={transaction.type} />
                      </TableCell>
                      <TableCell>{transaction.customerName}</TableCell>
                      <TableCell className="font-mono">{transaction.giftCardCode}</TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
