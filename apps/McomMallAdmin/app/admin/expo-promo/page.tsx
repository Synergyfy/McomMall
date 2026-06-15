'use client';

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
    Calendar,
    Users,
    TrendingUp,
    MapPin,
    Plus,
    Activity,
    Ticket,
    MoreHorizontal,
    Settings,
    BarChart,
    Megaphone
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export default function ExpoPromoPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Expo & Promo Management</h1>
                    <p className="text-slate-500">Manage event ecosystems and business participation</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Expo
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">12</p>
                            <p className="text-sm text-slate-500 font-medium">Upcoming Expos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">3</p>
                            <p className="text-sm text-slate-500 font-medium">Active Expos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">458</p>
                            <p className="text-sm text-slate-500 font-medium">Participating Businesses</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">12.4k</p>
                            <p className="text-sm text-slate-500 font-medium">Visitor Registrations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">2.1M</p>
                            <p className="text-sm text-slate-500 font-medium">Campaign Reach</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">18</p>
                            <p className="text-sm text-slate-500 font-medium">Borough Participation</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expo Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>All Expos & Promotions</CardTitle>
                    <CardDescription>Monitor and manage all current and upcoming event ecosystems.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Event Name</TableHead>
                                <TableHead>Borough</TableHead>
                                <TableHead>Venue</TableHead>
                                <TableHead className="text-center">Participating Businesses</TableHead>
                                <TableHead className="text-center">Attendance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { name: 'Summer Night Market', borough: 'Camden', venue: 'Camden Lock Plaza', businesses: 45, attendance: '2.5k', status: 'Active' },
                                { name: 'Tech & Maker Expo', borough: 'Hackney', venue: 'Here East Hub', businesses: 120, attendance: '800 (Registered)', status: 'Upcoming' },
                                { name: 'Foodie Weekend Carnival', borough: 'Southwark', venue: 'Borough Market Ext', businesses: 85, attendance: '1.2k', status: 'Active' },
                                { name: 'Winter Wonderland Trade', borough: 'Westminster', venue: 'Hyde Park Pavillion', businesses: 200, attendance: '15k (Est)', status: 'Planning' },
                            ].map((expo, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-slate-900">{expo.name}</TableCell>
                                    <TableCell className="text-slate-600">{expo.borough}</TableCell>
                                    <TableCell className="text-slate-600">{expo.venue}</TableCell>
                                    <TableCell className="text-center font-medium">{expo.businesses}</TableCell>
                                    <TableCell className="text-center text-slate-600">{expo.attendance}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            expo.status === 'Active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 
                                            expo.status === 'Upcoming' ? 'text-blue-600 border-blue-200 bg-blue-50' : 
                                            'text-amber-600 border-amber-200 bg-amber-50'
                                        )}>
                                            {expo.status}
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
                                                <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                    <Settings className="mr-2 h-4 w-4" /> Manage
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                    <Users className="mr-2 h-4 w-4" /> Assign Businesses
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-orange-600">
                                                    <Megaphone className="mr-2 h-4 w-4" /> Launch Promotion
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                    <BarChart className="mr-2 h-4 w-4" /> Analytics
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
        </div>
    );
}
