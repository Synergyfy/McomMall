'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { coupons } from '../data/mock-data';
import { Coupon } from '../types';
import {
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Copy,
    Eye,
    Tag,
    Gift,
    Ticket,
    Megaphone,
    Star,
    Calendar,
    Users,
    TrendingUp,
    Percent,
    DollarSign,
    Pause,
    Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Coupon Status Badge
function CouponStatusBadge({ status }: { status: Coupon['status'] }) {
    const statusConfig = {
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        paused: { label: 'Paused', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        expired: { label: 'Expired', className: 'bg-red-100 text-red-700 border-red-200' },
    };

    const config = statusConfig[status];

    return (
        <Badge variant="outline" className={cn('font-medium', config.className)}>
            {config.label}
        </Badge>
    );
}

// Create Coupon Dialog
function CreateCouponDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>
                        Create a new coupon code for customers to use at checkout.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title (Internal)</Label>
                            <Input placeholder="e.g., Summer Sale 2026" />
                        </div>
                        <div className="space-y-2">
                            <Label>Public Name</Label>
                            <Input placeholder="e.g., SUMMER20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <div className="flex gap-2">
                                <Input placeholder="COUPONCODE" className="flex-1" />
                                <Button variant="outline" size="sm">Generate</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select defaultValue="percentage">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage Off</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                    <SelectItem value="bogo">Buy One Get One</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input type="number" placeholder="20" />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum Purchase</Label>
                            <Input type="number" placeholder="50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Customer-facing description..." />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Uses (Overall)</Label>
                            <Input type="number" placeholder="1000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Per User Limit</Label>
                            <Input type="number" placeholder="1" />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-4">
                        <Label>Visibility Settings</Label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-normal">Show on Homepage</Label>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="font-normal">Show in Business Dashboard</Label>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="font-normal">Show in Customer Dashboard</Label>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        Create Coupon
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('coupons');
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Filter coupons
    const filteredCoupons = coupons.filter((coupon) =>
        coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const stats = {
        activeCoupons: coupons.filter((c) => c.status === 'active').length,
        totalRedemptions: coupons.reduce((acc, c) => acc + c.usesCount, 0),
        activeGiftCards: 156,
        activeVouchers: 89,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
                    <p className="text-slate-500">Manage coupons, gift cards, vouchers, and campaigns</p>
                </div>
                <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Tag className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.activeCoupons}</p>
                                <p className="text-xs text-slate-500">Active Coupons</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalRedemptions.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Total Redemptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Gift className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.activeGiftCards}</p>
                                <p className="text-xs text-slate-500">Active Gift Cards</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Ticket className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.activeVouchers}</p>
                                <p className="text-xs text-slate-500">Active Vouchers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="coupons" className="gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline">Coupons</span>
                    </TabsTrigger>
                    <TabsTrigger value="giftcards" className="gap-2">
                        <Gift className="h-4 w-4" />
                        <span className="hidden sm:inline">Gift Cards</span>
                    </TabsTrigger>
                    <TabsTrigger value="vouchers" className="gap-2">
                        <Ticket className="h-4 w-4" />
                        <span className="hidden sm:inline">Vouchers</span>
                    </TabsTrigger>
                    <TabsTrigger value="featured" className="gap-2">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">Featured</span>
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="gap-2">
                        <Megaphone className="h-4 w-4" />
                        <span className="hidden sm:inline">Campaigns</span>
                    </TabsTrigger>
                </TabsList>

                {/* Coupons Tab */}
                <TabsContent value="coupons" className="space-y-4">
                    {/* Search */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search coupons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coupons Table */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Coupon</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCoupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900">{coupon.title}</p>
                                                    <p className="text-sm text-slate-500">{coupon.publicName}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
                                                        {coupon.code}
                                                    </code>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {coupon.type === 'percentage' ? (
                                                        <Percent className="h-4 w-4 text-slate-500" />
                                                    ) : (
                                                        <DollarSign className="h-4 w-4 text-slate-500" />
                                                    )}
                                                    <span className="font-medium">
                                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{coupon.usesCount} / {coupon.maxUses}</p>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="h-full bg-orange-500 rounded-full"
                                                            style={{ width: `${(coupon.usesCount / coupon.maxUses) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{new Date(coupon.startDate).toLocaleDateString()}</p>
                                                    <p className="text-slate-500">to {new Date(coupon.endDate).toLocaleDateString()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <CouponStatusBadge status={coupon.status} />
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
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {coupon.status === 'active' ? (
                                                            <DropdownMenuItem>
                                                                <Pause className="h-4 w-4 mr-2" />
                                                                Pause
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem>
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Activate
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Gift Cards Tab */}
                <TabsContent value="giftcards">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Gift Cards</CardTitle>
                            <CardDescription>Manage gift card denominations and track redemptions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Gift className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Gift Cards Management</h3>
                                <p className="text-slate-500 mb-4">Create and manage gift cards for your platform</p>
                                <Button className="bg-orange-500 hover:bg-orange-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Gift Card
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Vouchers Tab */}
                <TabsContent value="vouchers">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Vouchers</CardTitle>
                            <CardDescription>Manage voucher codes and allocations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Ticket className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Vouchers Management</h3>
                                <p className="text-slate-500 mb-4">Create and allocate vouchers to customers or businesses</p>
                                <Button className="bg-orange-500 hover:bg-orange-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Voucher
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Featured Tab */}
                <TabsContent value="featured">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Featured Listings</CardTitle>
                            <CardDescription>Manage featured slots and promotional placements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Star className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Featured Slots</h3>
                                <p className="text-slate-500 mb-4">Create and manage featured listing placements</p>
                                <Button className="bg-orange-500 hover:bg-orange-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Featured Slot
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Marketing Campaigns</CardTitle>
                            <CardDescription>Create and track marketing campaigns and newsletters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Megaphone className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Campaigns</h3>
                                <p className="text-slate-500 mb-4">Launch email campaigns and track performance</p>
                                <Button className="bg-orange-500 hover:bg-orange-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Coupon Dialog */}
            <CreateCouponDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
}
