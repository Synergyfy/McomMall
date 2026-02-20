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
import { useMemo } from 'react';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { CalendarIcon, Download } from 'lucide-react';

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
                format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                transaction.type,
                `"${transaction.customerName}"`,
                transaction.couponCode,
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Detailed Transactions</CardTitle>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9 px-3 text-sm font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
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
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Coupon Code</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="text-sm">
                                            {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <TransactionTypeBadge type={transaction.type} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{transaction.customerName}</span>
                                                <span className="text-xs text-muted-foreground">{transaction.customerEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{transaction.couponCode}</TableCell>
                                        <TableCell className={`text-right font-bold ${transaction.type === 'PURCHASE' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.type === 'REFUND' ? '-' : ''}{CURRENCY}{Number(transaction.amount).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No transactions found for the selected date range.
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-4">
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
