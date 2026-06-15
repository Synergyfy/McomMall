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
    LifeBuoy,
    AlertOctagon,
    Store,
    Users,
    Megaphone,
    Search,
    MessageCircle,
    ArrowUpCircle,
    CheckCircle2,
    UserPlus,
    MoreHorizontal,
    Filter
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Support & Resolution Center</h1>
                    <p className="text-slate-500">Manage platform-wide support operations and disputes</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search Ticket ID or User..." className="pl-9 bg-white" />
                    </div>
                    <Button variant="outline" className="bg-white">
                        <Filter className="h-4 w-4 mr-2" /> Filters
                    </Button>
                </div>
            </div>

            {/* Support Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <LifeBuoy className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">142</p>
                            <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-red-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                            <AlertOctagon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">18</p>
                            <p className="text-sm text-slate-500 font-medium">Escalated Cases</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">45</p>
                            <p className="text-sm text-slate-500 font-medium">Business Issues</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">72</p>
                            <p className="text-sm text-slate-500 font-medium">Customer Complaints</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-orange-500">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">7</p>
                            <p className="text-sm text-slate-500 font-medium">Campaign Problems</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Support Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50">
                    <CardTitle className="text-lg">Support Queue</CardTitle>
                    <CardDescription>Manage, assign, and resolve user requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="w-[120px]">Ticket ID</TableHead>
                                <TableHead>User / Entity</TableHead>
                                <TableHead>Borough</TableHead>
                                <TableHead>Issue Type</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Assigned Agent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { id: '#TKT-9921', user: 'The Artisan Bakery', borough: 'Camden', type: 'Business Issue', priority: 'High', agent: 'David S.', status: 'Open' },
                                { id: '#TKT-9920', user: '@miker_99', borough: 'Hackney', type: 'Customer Complaint', priority: 'Medium', agent: 'Unassigned', status: 'New' },
                                { id: '#TKT-9919', user: 'Camden Coffee', borough: 'Camden', type: 'Campaign Problem', priority: 'Critical', agent: 'Elena R.', status: 'Escalated' },
                                { id: '#TKT-9918', user: '@sarahj', borough: 'Southwark', type: 'Customer Complaint', priority: 'Low', agent: 'David S.', status: 'Open' },
                                { id: '#TKT-9917', user: 'Tech Repairs Ltd', borough: 'Hackney', type: 'Business Issue', priority: 'Medium', agent: 'Elena R.', status: 'Resolved' },
                            ].map((ticket, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs text-slate-500 font-medium">{ticket.id}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{ticket.user}</TableCell>
                                    <TableCell className="text-slate-600">{ticket.borough}</TableCell>
                                    <TableCell className="text-slate-600">{ticket.type}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            ticket.priority === 'Critical' ? 'text-red-700 border-red-300 bg-red-50' :
                                            ticket.priority === 'High' ? 'text-orange-600 border-orange-300 bg-orange-50' :
                                            ticket.priority === 'Medium' ? 'text-blue-600 border-blue-300 bg-blue-50' :
                                            'text-slate-600 border-slate-300 bg-slate-50'
                                        )}>
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {ticket.agent === 'Unassigned' ? (
                                            <span className="text-xs text-slate-400 font-medium italic">Unassigned</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
                                                        {ticket.agent.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-slate-700">{ticket.agent}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={cn(
                                            ticket.status === 'New' ? 'bg-indigo-100 text-indigo-700' :
                                            ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                                            ticket.status === 'Escalated' ? 'bg-red-100 text-red-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        )}>
                                            {ticket.status}
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
                                                <DropdownMenuItem className="cursor-pointer text-blue-600">
                                                    <MessageCircle className="mr-2 h-4 w-4" /> Respond
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-slate-700">
                                                    <UserPlus className="mr-2 h-4 w-4" /> Assign Agent
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                                    <ArrowUpCircle className="mr-2 h-4 w-4" /> Escalate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-emerald-600">
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve
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
