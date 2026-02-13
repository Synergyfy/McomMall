'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { useGetAdminTransactions } from '@/service/admin/hook';
import { Loader2, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [type, setType] = useState<string>('all');

    const { data, isLoading, isError } = useGetAdminTransactions({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        type: type !== 'all' ? type : undefined,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-500">Failed</Badge>;
            default:
                return <Badge className="bg-gray-500">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'payment':
                return <Badge variant="outline" className="border-blue-500 text-blue-500">Payment</Badge>;
            case 'refund':
                return <Badge variant="outline" className="border-purple-500 text-purple-500">Refund</Badge>;
            case 'payout':
                return <Badge variant="outline" className="border-orange-500 text-orange-500">Payout</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID or Reference..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
                        <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={type} onValueChange={(val) => { setType(val); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="payment">Payment</SelectItem>
                                <SelectItem value="refund">Refund</SelectItem>
                                <SelectItem value="payout">Payout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8 text-red-500">
                            Failed to load transactions. Please try again.
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>User / Business</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    No transactions found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data?.items.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        {transaction.reference || transaction.id.substring(0, 8)}
                                                        <div className="text-xs text-muted-foreground">{transaction.description}</div>
                                                    </TableCell>
                                                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                                                    <TableCell className="font-bold">
                                                        £{transaction.amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                                    <TableCell>
                                                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.user ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{transaction.user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{transaction.user.email}</span>
                                                            </div>
                                                        ) : transaction.business ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{transaction.business.name}</span>
                                                                <span className="text-xs text-muted-foreground">Business</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {data?.meta && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((data.meta.currentPage - 1) * data.meta.itemsPerPage) + 1} to {Math.min(data.meta.currentPage * data.meta.itemsPerPage, data.meta.totalItems)} of {data.meta.totalItems} results
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                                            disabled={page >= data.meta.totalPages}
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
