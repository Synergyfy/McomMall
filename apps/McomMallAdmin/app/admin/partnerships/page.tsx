'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Search,
    Plus,
    Download,
    Eye,
    Handshake,
    Building2,
    Calendar,
    Mail,
    Phone,
    CheckCircle2,
    XCircle,
    QrCode,
    Users,
    TrendingUp,
    LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Partnerships Data
const partnerships = [
    {
        id: 'part-1',
        name: 'City Commerce Association',
        contactPerson: 'David Chen',
        email: 'david@citycomm.org',
        phone: '+44 20 7123 4567',
        startDate: '2025-01-15',
        status: 'active',
        plaqueCount: 45,
        businessCount: 120,
        type: 'Regional Partner',
    },
    {
        id: 'part-2',
        name: 'Green Tech Innovation Hub',
        contactPerson: 'Emma Watson',
        email: 'e.watson@greentech.io',
        phone: '+44 20 8234 5678',
        startDate: '2025-03-20',
        status: 'pending',
        plaqueCount: 12,
        businessCount: 35,
        type: 'Industry Partner',
    },
    {
        id: 'part-3',
        name: 'SME Support Network',
        contactPerson: 'Mark Thompson',
        email: 'mark@smesupport.co.uk',
        phone: '+44 20 9345 6789',
        startDate: '2024-11-10',
        status: 'active',
        plaqueCount: 88,
        businessCount: 210,
        type: 'Strategic Partner',
    },
];

// Status Badge
function PartnershipStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: LucideIcon }> = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Calendar },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
    };

    const { label, className, icon: Icon } = config[status] || config.inactive;

    return (
        <Badge variant="outline" className={cn('font-medium gap-1', className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

export default function PartnershipsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredPartnerships = partnerships.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Partnerships</h1>
                    <p className="text-slate-500">Manage institutional partners and QR plaque distribution</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Partner
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Handshake className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{partnerships.length}</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Total Partners</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <QrCode className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">145</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Active Plaques</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">365</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Partner Businesses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search partners or contact people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Partners</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Partners Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Partner Organization</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Plaques</TableHead>
                                <TableHead>Businesses</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPartnerships.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{p.name}</span>
                                            <span className="text-xs text-slate-500 font-mono">{p.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-700">{p.contactPerson}</span>
                                            <span className="text-xs text-slate-500">{p.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600">{p.type}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                            {p.plaqueCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-medium text-slate-900">{p.businessCount}</span>
                                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <PartnershipStatusBadge status={p.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
