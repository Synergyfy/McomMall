'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Shield,
    Map,
    Store,
    Megaphone,
    AlertTriangle,
    Headset,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Ban,
    Key,
    UserCheck
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function TeamPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team & Staff Management</h1>
                    <p className="text-slate-500">Manage admin permissions and operational roles across the ecosystem</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        <Plus className="h-4 w-4 mr-2" /> Invite Staff
                    </Button>
                </div>
            </div>

            {/* Role Types Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="border-0 shadow-sm border-t-4 border-t-slate-900">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-slate-100 text-slate-900">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Super Admin</p>
                            <p className="text-xs text-slate-500">Global Access</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                            <Map className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Borough Admin</p>
                            <p className="text-xs text-slate-500">Regional Control</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">High St Manager</p>
                            <p className="text-xs text-slate-500">Local Operations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-orange-500">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Campaign Mgr</p>
                            <p className="text-xs text-slate-500">Marketing & Promos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-red-500">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Moderator</p>
                            <p className="text-xs text-slate-500">Trust & Safety</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Headset className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Support Staff</p>
                            <p className="text-xs text-slate-500">Ticket Resolution</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Active Staff Directory</CardTitle>
                            <CardDescription>Manage your entire MCOM operational team</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search staff members..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Borough</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { name: 'Alex Thompson', email: 'alex@mcom.io', role: 'Super Admin', borough: 'Global', perms: 'All Access', active: 'Just now', status: 'Active', avatarColor: 'bg-slate-900' },
                                { name: 'Sarah Jenkins', email: 'sarah.j@mcom.io', role: 'Borough Admin', borough: 'Camden', perms: 'Regional write', active: '10 mins ago', status: 'Active', avatarColor: 'bg-indigo-500' },
                                { name: 'Marcus Cole', email: 'm.cole@mcom.io', role: 'High Street Manager', borough: 'Hackney', perms: 'Local write', active: '2 hrs ago', status: 'Active', avatarColor: 'bg-emerald-500' },
                                { name: 'Elena Rodriguez', email: 'elena@mcom.io', role: 'Campaign Manager', borough: 'Global', perms: 'Marketing write', active: '1 day ago', status: 'Offline', avatarColor: 'bg-orange-500' },
                                { name: 'David Smith', email: 'david@mcom.io', role: 'Moderator', borough: 'Southwark', perms: 'Safety read/write', active: '3 days ago', status: 'Suspended', avatarColor: 'bg-red-500' },
                            ].map((staff, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className={cn("text-xs text-white", staff.avatarColor)}>
                                                    {staff.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900">{staff.name}</p>
                                                <p className="text-xs text-slate-500">{staff.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700">{staff.role}</TableCell>
                                    <TableCell>
                                        {staff.borough === 'Global' ? (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">Global</Badge>
                                        ) : (
                                            <span className="text-slate-600">{staff.borough}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-600">
                                            {staff.perms}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{staff.active}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            staff.status === 'Active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 
                                            staff.status === 'Suspended' ? 'text-red-600 border-red-200 bg-red-50' : 
                                            'text-slate-500 border-slate-200 bg-slate-50'
                                        )}>
                                            {staff.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Map className="mr-2 h-4 w-4 text-slate-500" /> Assign Borough
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Key className="mr-2 h-4 w-4 text-amber-500" /> Reset Access
                                                </DropdownMenuItem>
                                                {staff.status !== 'Suspended' ? (
                                                    <DropdownMenuItem className="cursor-pointer text-red-600">
                                                        <Ban className="mr-2 h-4 w-4" /> Suspend
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem className="cursor-pointer text-emerald-600">
                                                        <UserCheck className="mr-2 h-4 w-4" /> Unsuspend
                                                    </DropdownMenuItem>
                                                )}
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
