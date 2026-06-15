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
    ShieldAlert,
    MessageSquareX,
    QrCode,
    TicketX,
    UserX,
    Search,
    AlertTriangle,
    Eye,
    Ban,
    AlertCircle,
    CheckCircle2,
    ArrowUpCircle,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function CompliancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moderation & Compliance</h1>
                    <p className="text-slate-500">Secure oversight of reports, abuse, and platform integrity</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search reports or users..." className="pl-9 bg-white" />
                    </div>
                </div>
            </div>

            {/* Moderation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm border-t-4 border-t-red-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">42</p>
                            <p className="text-sm text-slate-500 font-medium">Abuse Reports</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-orange-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                            <MessageSquareX className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">128</p>
                            <p className="text-sm text-slate-500 font-medium">Spam Activity</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-purple-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">15</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Suspicious QR Scans</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <TicketX className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">8</p>
                            <p className="text-sm text-slate-500 font-medium">Fake Rewards</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-slate-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-200 text-slate-800">
                            <UserX className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">24</p>
                            <p className="text-sm text-slate-500 font-medium">Suspended Accounts</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Review Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Action Required
                    </CardTitle>
                    <CardDescription>Review and resolve pending moderation tickets</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Report Type</TableHead>
                                <TableHead>User / Entity</TableHead>
                                <TableHead>Borough</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { type: 'Fake Reward Claim', user: '@sarahj99', borough: 'Camden', severity: 'High', date: '2 hrs ago', status: 'Pending' },
                                { type: 'Review Spam', user: 'Tech Fixers Ltd', borough: 'Hackney', severity: 'Medium', date: '5 hrs ago', status: 'Under Review' },
                                { type: 'Suspicious QR', user: 'Unknown Device', borough: 'Southwark', severity: 'Critical', date: 'Yesterday', status: 'Escalated' },
                                { type: 'Harassment', user: '@mark_b', borough: 'Westminster', severity: 'High', date: 'Yesterday', status: 'Pending' },
                            ].map((report, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-slate-900">{report.type}</TableCell>
                                    <TableCell className="text-slate-600 font-mono text-sm">{report.user}</TableCell>
                                    <TableCell className="text-slate-600">{report.borough}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            report.severity === 'Critical' ? 'text-red-700 border-red-300 bg-red-100' :
                                            report.severity === 'High' ? 'text-orange-600 border-orange-300 bg-orange-50' :
                                            'text-amber-600 border-amber-300 bg-amber-50'
                                        )}>
                                            {report.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">{report.date}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={cn(
                                            report.status === 'Pending' ? 'bg-slate-100 text-slate-700' :
                                            report.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                                            'bg-blue-100 text-blue-700'
                                        )}>
                                            {report.status}
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
                                                <DropdownMenuItem className="cursor-pointer text-blue-600 font-medium">
                                                    <Eye className="mr-2 h-4 w-4" /> Review Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-amber-600">
                                                    <AlertCircle className="mr-2 h-4 w-4" /> Issue Warning
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                                    <Ban className="mr-2 h-4 w-4" /> Suspend Account
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-emerald-600">
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve Ticket
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                    <ArrowUpCircle className="mr-2 h-4 w-4" /> Escalate
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
