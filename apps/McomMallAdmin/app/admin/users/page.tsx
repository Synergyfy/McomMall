'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetUserStats, useGetAdminUsers } from '@/service/admin/hook';
import { AdminUser } from '@/service/admin/types';
import { CreateUserDialog } from './components/CreateUserDialog';
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Ban,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Wallet,
    Shield,
    Clock,
    Download,
    Plus,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserPlus,
    Users as UsersIcon,
    UserCheck,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Status Badge Component
function StatusBadge({ status }: { status: AdminUser['status'] }) {
    const statusConfig = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        suspended: { label: 'Suspended', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        banned: { label: 'Banned', className: 'bg-red-100 text-red-700 border-red-200' },
        pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };

    return (
        <Badge variant="outline" className={cn('font-medium', config.className)}>
            {config.label}
        </Badge>
    );
}

// Account Type Badge
function AccountTypeBadge({ type }: { type: AdminUser['accountType'] }) {
    const typeConfig = {
        customer: { label: 'Customer', className: 'bg-slate-100 text-slate-700' },
        business: { label: 'Business', className: 'bg-purple-100 text-purple-700' },
        admin: { label: 'Admin', className: 'bg-orange-100 text-orange-700' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: 'bg-slate-100 text-slate-700' };

    return (
        <Badge variant="secondary" className={cn('font-medium', config.className)}>
            {config.label}
        </Badge>
    );
}

// User Detail Sheet Component
function UserDetailSheet({
    user,
    open,
    onOpenChange,
}: {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!user) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                {user.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-xl">{user.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <AccountTypeBadge type={user.accountType} />
                                <StatusBadge status={user.status} />
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                        <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                        <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-6 pt-4">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Contact Information</h4>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p className="text-sm font-medium">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Account Details</h4>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Signup Date</p>
                                        <p className="text-sm font-medium">{new Date(user.signupDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Last Login</p>
                                        <p className="text-sm font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Wallet className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Wallet Balance</p>
                                        <p className="text-sm font-medium">£{user.walletBalance.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                    <Shield className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Verification Status</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {user.verified ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    Not Verified
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {user.notes && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900">Admin Notes</h4>
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <p className="text-sm text-amber-800">{user.notes}</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity" className="pt-4">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Recent activity for this user will be displayed here.</p>
                            {/* Mock activity items */}
                            <div className="space-y-3">
                                {[
                                    { action: 'Logged in', time: '2 hours ago' },
                                    { action: 'Updated profile', time: '1 day ago' },
                                    { action: 'Made a purchase', time: '3 days ago' },
                                    { action: 'Submitted a review', time: '1 week ago' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                        <span className="text-sm">{item.action}</span>
                                        <span className="text-xs text-slate-500">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="actions" className="pt-4">
                        <div className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Password
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Verify Identity
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Wallet className="h-4 w-4 mr-2" />
                                Adjust Wallet Balance
                            </Button>
                            <div className="pt-4 border-t space-y-3">
                                <Button className="w-full justify-start text-amber-600 hover:text-amber-700" variant="outline">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Suspend Account
                                </Button>
                                <Button className="w-full justify-start text-red-600 hover:text-red-700" variant="outline">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Ban User
                                </Button>
                                <Button className="w-full justify-start text-red-600 hover:text-red-700" variant="outline">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Queries
    const { data: stats, isLoading: statsLoading } = useGetUserStats();
    const { data: usersResponse, isLoading: usersLoading } = useGetAdminUsers({
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        page,
        limit,
    });

    const users = usersResponse?.data || [];
    const totalPages = usersResponse?.totalPages || 1;

    const handleViewUser = (user: AdminUser) => {
        setSelectedUser(user);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-slate-500">Manage platform users and accounts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <UsersIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Total Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <UserCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.active || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.suspended || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Suspended</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <UserPlus className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Pending</p>
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
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={(val) => {
                            setTypeFilter(val);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Wallet</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersLoading ? (
                                    Array(limit).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                                                        <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : users.map((user) => (
                                    <TableRow key={user.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleViewUser(user)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-500 text-white text-sm">
                                                        {user.name.split(' ').map((n) => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <AccountTypeBadge type={user.accountType} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">£{user.walletBalance.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-500">
                                                {new Date(user.lastLogin).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Send Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-amber-600">
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Suspend
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Ban User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {!usersLoading && users.length === 0 && (
                        <div className="p-8 text-center border-t">
                            <UsersIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, usersResponse?.total || 0)}</span> of <span className="font-medium">{usersResponse?.total || 0}</span> users
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || usersLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className={cn("w-8 h-8 p-0", page === pageNum && "bg-orange-500 hover:bg-orange-600")}
                                            onClick={() => setPage(pageNum)}
                                            disabled={usersLoading}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || usersLoading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Detail Sheet */}
            <UserDetailSheet
                user={selectedUser}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />

            {/* Create User Dialog */}
            <CreateUserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
