'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { transactions } from '../data/mock-data';
import { Transaction } from '../types';
import {
    Search,
    Download,
    MoreHorizontal,
    Eye,
    RefreshCw,
    CreditCard,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Transaction Status Badge
function TransactionStatusBadge({ status }: { status: Transaction['status'] }) {
    const statusConfig = {
        completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        refunded: { label: 'Refunded', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn('font-medium gap-1', config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

// Transaction Type Badge
function TransactionTypeBadge({ type }: { type: Transaction['type'] }) {
    const typeConfig = {
        payment: { label: 'Payment', icon: ArrowUpRight, className: 'text-emerald-600' },
        refund: { label: 'Refund', icon: ArrowDownRight, className: 'text-red-600' },
        payout: { label: 'Payout', icon: Banknote, className: 'text-blue-600' },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className={cn('flex items-center gap-1', config.className)}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{config.label}</span>
        </div>
    );
}

// Payment Method Icon
function PaymentMethodIcon({ method }: { method: Transaction['paymentMethod'] }) {
    const methodConfig = {
        card: { icon: CreditCard, label: 'Card' },
        bank: { icon: Banknote, label: 'Bank' },
        wallet: { icon: Wallet, label: 'Wallet' },
        paypal: { icon: DollarSign, label: 'PayPal' },
    };

    const config = methodConfig[method];
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-100">
                <Icon className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <span className="text-sm">{config.label}</span>
        </div>
    );
}

// Transaction Detail Sheet
function TransactionDetailSheet({
    transaction,
    open,
    onOpenChange,
}: {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!transaction) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-xl">Transaction Details</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <TransactionStatusBadge status={transaction.status} />
                        <TransactionTypeBadge type={transaction.type} />
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Amount */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                        <p className={cn(
                            'text-4xl font-bold',
                            transaction.type === 'refund' ? 'text-red-600' : 'text-slate-900'
                        )}>
                            {transaction.type === 'refund' ? '-' : ''}£{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Fees: £{transaction.fees.toFixed(2)}
                        </p>
                    </div>

                    {/* Transaction ID */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <span className="text-sm text-slate-500">Transaction ID</span>
                        <code className="text-sm font-mono">{transaction.id}</code>
                    </div>

                    {/* Parties */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Parties</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">From</span>
                                <span className="text-sm font-medium">{transaction.payerName}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">To</span>
                                <span className="text-sm font-medium">{transaction.payeeName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Details</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">Date</span>
                                <span className="text-sm font-medium">
                                    {new Date(transaction.date).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-sm text-slate-500">Payment Method</span>
                                <PaymentMethodIcon method={transaction.paymentMethod} />
                            </div>
                            {transaction.orderId && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <span className="text-sm text-slate-500">Order ID</span>
                                    <code className="text-sm font-mono">{transaction.orderId}</code>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {transaction.status === 'completed' && transaction.type === 'payment' && (
                        <div className="pt-4 border-t">
                            <Button variant="outline" className="w-full text-orange-600 hover:text-orange-700">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Issue Refund
                            </Button>
                        </div>
                    )}

                    {transaction.status === 'pending' && (
                        <div className="pt-4 border-t space-y-2">
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Transaction
                            </Button>
                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Transaction
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Filter transactions
    const filteredTransactions = transactions.filter((txn) => {
        const matchesSearch =
            txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.payeeName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
        const matchesType = typeFilter === 'all' || txn.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Stats
    const stats = {
        totalVolume: transactions.reduce((acc, t) => acc + (t.type === 'payment' ? t.amount : 0), 0),
        totalFees: transactions.reduce((acc, t) => acc + t.fees, 0),
        pendingCount: transactions.filter((t) => t.status === 'pending').length,
        refundCount: transactions.filter((t) => t.type === 'refund').length,
    };

    const handleViewTransaction = (txn: Transaction) => {
        setSelectedTransaction(txn);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                    <p className="text-slate-500">Monitor payments, refunds, and payouts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Total Volume</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">£{stats.totalFees.toFixed(2)}</p>
                                <p className="text-xs text-slate-500">Fees Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                                <p className="text-xs text-slate-500">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                                <RefreshCw className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.refundCount}</p>
                                <p className="text-xs text-slate-500">Refunds</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by ID, payer, or payee..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="payment">Payment</SelectItem>
                                <SelectItem value="refund">Refund</SelectItem>
                                <SelectItem value="payout">Payout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((txn) => (
                                <TableRow key={txn.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell>
                                        <div>
                                            <code className="text-sm font-mono">{txn.id}</code>
                                            <p className="text-xs text-slate-500">
                                                {txn.payerName} → {txn.payeeName}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TransactionTypeBadge type={txn.type} />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className={cn(
                                                'font-semibold',
                                                txn.type === 'refund' ? 'text-red-600' : 'text-slate-900'
                                            )}>
                                                {txn.type === 'refund' ? '-' : ''}£{txn.amount.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-slate-500">Fee: £{txn.fees.toFixed(2)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <PaymentMethodIcon method={txn.paymentMethod} />
                                    </TableCell>
                                    <TableCell>
                                        <TransactionStatusBadge status={txn.status} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-500">
                                            {new Date(txn.date).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleViewTransaction(txn)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {txn.status === 'completed' && txn.type === 'payment' && (
                                                    <DropdownMenuItem>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Issue Refund
                                                    </DropdownMenuItem>
                                                )}
                                                {txn.status === 'failed' && (
                                                    <DropdownMenuItem>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Retry
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredTransactions.length === 0 && (
                        <div className="p-8 text-center">
                            <CreditCard className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No transactions found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Detail Sheet */}
            <TransactionDetailSheet
                transaction={selectedTransaction}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
