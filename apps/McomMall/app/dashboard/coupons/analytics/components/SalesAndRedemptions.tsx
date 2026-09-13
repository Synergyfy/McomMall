'use client';

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
    Pagination,
    PaginationContent,
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
import { useGetCouponTransactions } from '@/service/coupon-products/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { CURRENCY } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { CalendarIcon, Download } from 'lucide-react';

const escapeCsvValue = (value: string | number): string => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

export const SalesAndRedemptions = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data, isLoading } = useGetCouponTransactions(
        date?.from ? format(date.from, 'yyyy-MM-dd') : '',
        date?.to ? format(date.to, 'yyyy-MM-dd') : ''
    );

    const paginatedData = useMemo(() => {
        if (!data) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage]);

    const totalPages = useMemo(() => {
        if (!data) return 0;
        return Math.ceil(data.length / itemsPerPage);
    }, [data]);

    const handleExportCsv = () => {
        if (data) {
            const headers = ['Date', 'Type', 'Customer', 'Coupon Code', 'Amount'];
            const rows = data.map((transaction) => [
                escapeCsvValue(format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss')),
                escapeCsvValue(transaction.type),
                escapeCsvValue(transaction.customerName),
                escapeCsvValue(transaction.couponCode),
                escapeCsvValue(transaction.amount),
            ]);
            const csvContent =
                'data:text/csv;charset=utf-8,' +
                headers.join(',') +
                '\n' +
                rows.map((e) => e.join(',')).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'coupon_transactions.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExportPdf = () => {
        if (data) {
            const doc = new jsPDF();
            autoTable(doc, {
                head: [['Date', 'Type', 'Customer', 'Coupon Code', 'Amount']],
                body: data.map((transaction) => [
                    format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                    transaction.type,
                    transaction.customerName,
                    transaction.couponCode,
                    `${CURRENCY}${Number(transaction.amount).toFixed(2)}`,
                ]),
            });
            doc.save('coupon_transactions.pdf');
        }
    };

    return (
        <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">
                        Detailed Transactions
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Sales and redemptions history for the selected period.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9 px-3 text-sm font-normal text-gray-700">
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        <PopoverContent className="w-auto p-0" align="end">
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
                            <Button size="sm" variant="default" className="bg-[#f58220] hover:bg-[#d9731b]">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportCsv}>Export as CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPdf}>Export as PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Customer
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Coupon Code
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((transaction) => {
                                    const type = transaction.type.toUpperCase();
                                    const isRefund = type === 'REFUND';
                                    const isPurchase = type === 'PURCHASE';
                                    return (
                                        <TableRow key={transaction.id} className="hover:bg-gray-50/60">
                                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                                {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                <TransactionTypeBadge type={transaction.type} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{transaction.customerName}</span>
                                                    <span className="text-xs text-muted-foreground">{transaction.customerEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-gray-700">
                                                {transaction.couponCode || '—'}
                                            </TableCell>
                                            <TableCell
                                                className={`whitespace-nowrap text-right text-sm font-semibold ${
                                                    isRefund
                                                        ? 'text-red-600'
                                                        : isPurchase
                                                          ? 'text-emerald-600'
                                                          : 'text-gray-700'
                                                }`}
                                            >
                                                {isRefund ? '-' : ''}{CURRENCY}{Number(transaction.amount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            No transactions found for the selected date range.
                        </p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
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
                                            className={page === currentPage ? "bg-[#f58220] border-[#f58220] text-white" : ""}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
