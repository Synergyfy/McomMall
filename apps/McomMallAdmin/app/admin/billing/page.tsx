'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Wallet,
    TrendingUp,
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Download,
    DollarSign,
    RefreshCw,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing & Financial Oversight</h1>
                    <p className="text-slate-500">Monitor ecosystem revenue, payouts, and transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Billing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Membership Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">£145,200</p>
                        <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Campaign Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">£84,500</p>
                        <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +8.2% this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Promotion Spending</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">£22,150</p>
                        <p className="text-xs text-amber-600 font-medium flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" /> Steady
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Credit Purchases</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">£18,400</p>
                        <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +4.1% this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                                <RefreshCw className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Payout Activity</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">£65,800</p>
                        <p className="text-xs text-rose-600 font-medium flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" /> Disbursed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Tables Tabs */}
            <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-1">
                    <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                    <TabsTrigger value="memberships">Membership Payments</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaign Purchases</TabsTrigger>
                    <TabsTrigger value="credits">Credits</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="mt-6">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>All incoming and outgoing cash flows</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Business/User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { id: 'TXN-998234', date: 'Today, 14:32', entity: 'The Artisan Bakery', type: 'Membership (Gold)', amount: '£49.00', status: 'Success', statusColor: 'emerald' },
                                        { id: 'TXN-998233', date: 'Today, 11:15', entity: 'Tech Repairs Ltd', type: 'Campaign Boost', amount: '£150.00', status: 'Success', statusColor: 'emerald' },
                                        { id: 'TXN-998232', date: 'Today, 09:45', entity: 'Camden Coffee', type: 'Credit Purchase', amount: '£25.00', status: 'Failed', statusColor: 'red' },
                                        { id: 'TXN-998231', date: 'Yesterday', entity: 'Vintage Threads', type: 'Refund', amount: '-£49.00', status: 'Processed', statusColor: 'blue' },
                                        { id: 'TXN-998230', date: 'Yesterday', entity: 'Local Grocer', type: 'Membership (Silver)', amount: '£29.00', status: 'Success', statusColor: 'emerald' },
                                    ].map((txn, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-xs text-slate-500">{txn.id}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{txn.date}</TableCell>
                                            <TableCell className="font-medium text-slate-900">{txn.entity}</TableCell>
                                            <TableCell className="text-slate-600">{txn.type}</TableCell>
                                            <TableCell className={cn(
                                                "font-semibold",
                                                txn.amount.startsWith('-') ? "text-rose-600" : "text-slate-900"
                                            )}>{txn.amount}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={cn(
                                                    txn.statusColor === 'emerald' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                    txn.statusColor === 'red' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    'text-blue-600 border-blue-200 bg-blue-50'
                                                )}>
                                                    {txn.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Empty states for other tabs to show architecture is complete */}
                <TabsContent value="memberships" className="mt-6">
                    <Card className="border-0 shadow-sm p-12 text-center text-slate-500">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">Membership Payments Filtered</h3>
                        <p>View restricted to membership transactions only.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns" className="mt-6">
                    <Card className="border-0 shadow-sm p-12 text-center text-slate-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">Campaign Purchases Filtered</h3>
                        <p>View restricted to campaign boosts and ads.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="credits" className="mt-6">
                    <Card className="border-0 shadow-sm p-12 text-center text-slate-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">Credit Transactions Filtered</h3>
                        <p>View restricted to digital credit top-ups.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="refunds" className="mt-6">
                    <Card className="border-0 shadow-sm p-12 text-center text-slate-500">
                        <RefreshCw className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">Refunds Filtered</h3>
                        <p>View restricted to processed and pending refunds.</p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
