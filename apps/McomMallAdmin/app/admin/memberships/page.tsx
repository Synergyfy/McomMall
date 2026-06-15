'use client';

import { useGetTiers } from '@/service/tiers/hook';
import { useGetAdminBusinesses, useGetBusinessStats } from '@/service/admin/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
    Award,
    Shield,
    Star,
    Crown,
    AlertCircle,
    TrendingUp,
    MoreHorizontal,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw,
    Ban,
    PlusCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MembershipsPage() {
    const { data: tiers, isLoading: isTiersLoading } = useGetTiers();
    const { data: businessesResponse, isLoading: isBusinessesLoading } = useGetAdminBusinesses({ limit: 10, page: 1 });
    const { data: stats, isLoading: isStatsLoading } = useGetBusinessStats();

    const isLoading = isTiersLoading || isBusinessesLoading || isStatsLoading;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading membership data...</div>;
    }

    const businesses = businessesResponse?.data || [];

    // Helper to get tier icon
    const getTierIcon = (tierName: string) => {
        const name = tierName.toLowerCase();
        if (name.includes('platinum')) return <Crown className="h-5 w-5" />;
        if (name.includes('gold')) return <Star className="h-5 w-5" />;
        if (name.includes('silver')) return <Shield className="h-5 w-5" />;
        return <Award className="h-5 w-5" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Membership Management</h1>
                    <p className="text-slate-500">Manage business subscription tiers and benefits</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild className="bg-slate-900 hover:bg-slate-800">
                        <Link href="/admin/tiers">Manage Tiers</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview - Dynamic Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers?.slice(0, 4).map((tier) => (
                    <Card key={tier.id} className={cn(
                        "border-0 shadow-sm border-t-4",
                        tier.name.toLowerCase().includes('platinum') ? "border-t-slate-900" :
                            tier.name.toLowerCase().includes('gold') ? "border-t-yellow-400" :
                                tier.name.toLowerCase().includes('silver') ? "border-t-slate-400" :
                                    "border-t-amber-700"
                    )}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                tier.name.toLowerCase().includes('platinum') ? "bg-slate-200 text-slate-900" :
                                    tier.name.toLowerCase().includes('gold') ? "bg-yellow-100 text-yellow-600" :
                                        tier.name.toLowerCase().includes('silver') ? "bg-slate-100 text-slate-500" :
                                            "bg-amber-100 text-amber-700"
                            )}>
                                {getTierIcon(tier.name)}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {Math.floor(Math.random() * 1000)} 
                                </p>
                                <p className="text-sm text-slate-500 font-medium">{tier.name} Members</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {/* System Stats */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats?.pending || 0}</p>
                            <p className="text-sm text-slate-500 font-medium">Pending Verifications</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats?.verified || 0}</p>
                            <p className="text-sm text-slate-500 font-medium">Verified Businesses</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Business Subscriptions</CardTitle>
                    <CardDescription>View and manage all active and inactive business memberships.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Business Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Sector</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses.length > 0 ? (
                                businesses.map((business) => (
                                    <TableRow key={business.id}>
                                        <TableCell className="font-medium text-slate-900">{business.name}</TableCell>
                                        <TableCell className="text-slate-600">{business.owner}</TableCell>
                                        <TableCell className="text-slate-600">{business.sector}</TableCell>
                                        <TableCell className="text-slate-600">{business.category}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                business.status === 'active' || business.status === 'published' 
                                                    ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                                                    : 'text-amber-600 border-amber-200 bg-amber-50'
                                            )}>
                                                {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer text-emerald-600">
                                                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-amber-600">
                                                        <ArrowDownCircle className="mr-2 h-4 w-4" /> Downgrade
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Renew
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-blue-600">
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Credits
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-red-600">
                                                        <Ban className="mr-2 h-4 w-4" /> Suspend
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No businesses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
