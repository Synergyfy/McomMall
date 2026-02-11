'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { auditLogs } from '../data/mock-data';
import { AuditLog } from '../types';
import {
    Search,
    Download,
    Calendar,
    User,
    FileText,
    CreditCard,
    Building2,
    ListChecks,
    Tag,
    Settings,
    Filter,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Action Icon
function ActionIcon({ targetType }: { targetType: AuditLog['targetType'] }) {
    const icons = {
        user: User,
        business: Building2,
        listing: ListChecks,
        transaction: CreditCard,
        coupon: Tag,
        setting: Settings,
    };

    const colors = {
        user: 'bg-purple-100 text-purple-600',
        business: 'bg-blue-100 text-blue-600',
        listing: 'bg-emerald-100 text-emerald-600',
        transaction: 'bg-orange-100 text-orange-600',
        coupon: 'bg-pink-100 text-pink-600',
        setting: 'bg-slate-100 text-slate-600',
    };

    const Icon = icons[targetType];

    return (
        <div className={cn('p-2 rounded-lg', colors[targetType])}>
            <Icon className="h-4 w-4" />
        </div>
    );
}

export default function AuditPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Filter logs
    const filteredLogs = auditLogs.filter((log) => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || log.targetType === typeFilter;
        return matchesSearch && matchesType;
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
                    <p className="text-slate-500">Track all admin actions and changes</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{auditLogs.length}</p>
                                <p className="text-xs text-slate-500">Total Logs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">3</p>
                                <p className="text-xs text-slate-500">Active Admins</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <Clock className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Today</p>
                                <p className="text-xs text-slate-500">Last Activity</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Settings className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-xs text-slate-500">Actions Today</p>
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
                                placeholder="Search actions, admins, or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Target Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="listing">Listing</SelectItem>
                                <SelectItem value="transaction">Transaction</SelectItem>
                                <SelectItem value="coupon">Coupon</SelectItem>
                                <SelectItem value="setting">Setting</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date Range
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <ActionIcon targetType={log.targetType} />
                                            <span className="font-medium">{log.action}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                                    {log.adminName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{log.adminName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {log.targetType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600 max-w-xs truncate block">
                                            {log.details}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-slate-500">{log.ipAddress}</code>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-500">{formatTime(log.timestamp)}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredLogs.length === 0 && (
                        <div className="p-8 text-center">
                            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No logs found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
