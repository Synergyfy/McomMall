'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { supportTickets } from '../data/mock-data';
import { SupportTicket } from '../types';
import {
    Search,
    Plus,
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle,
    User,
    Send,
    Paperclip,
    MoreHorizontal,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Priority Badge
function PriorityBadge({ priority }: { priority: SupportTicket['priority'] }) {
    const config = {
        low: { label: 'Low', className: 'bg-slate-100 text-slate-700' },
        medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
        high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
        urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
    };

    return (
        <Badge variant="secondary" className={cn('font-medium', config[priority].className)}>
            {config[priority].label}
        </Badge>
    );
}

// Status Badge
function StatusBadge({ status }: { status: SupportTicket['status'] }) {
    const config = {
        open: { label: 'Open', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        pending: { label: 'Pending', className: 'bg-purple-100 text-purple-700 border-purple-200' },
        resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        closed: { label: 'Closed', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    };

    return (
        <Badge variant="outline" className={cn('font-medium', config[status].className)}>
            {config[status].label}
        </Badge>
    );
}

// SLA Indicator
function SLAIndicator({ deadline, status }: { deadline: string; status: string }) {
    if (status === 'resolved' || status === 'closed') {
        return <span className="text-sm text-emerald-600">Completed</span>;
    }

    const now = new Date();
    const slaDate = new Date(deadline);
    const diffMs = slaDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) {
        return (
            <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Overdue
            </span>
        );
    }

    if (diffHours < 4) {
        return (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {diffHours}h left
            </span>
        );
    }

    return (
        <span className="text-sm text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {diffHours}h left
        </span>
    );
}

// Ticket Detail Sheet
function TicketDetailSheet({
    ticket,
    open,
    onOpenChange,
}: {
    ticket: SupportTicket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [reply, setReply] = useState('');

    if (!ticket) return null;

    // Mock messages
    const messages = [
        {
            id: '1',
            sender: ticket.userName,
            message: 'I am having trouble uploading my verification documents. The page keeps showing an error.',
            time: '2 hours ago',
            isAdmin: false,
        },
        {
            id: '2',
            sender: 'Support Agent',
            message: 'Thank you for reaching out. Can you please provide more details about the error message you are seeing?',
            time: '1 hour ago',
            isAdmin: true,
        },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg">{ticket.subject}</SheetTitle>
                        <StatusBadge status={ticket.status} />
                    </div>
                    <SheetDescription className="flex items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <span>•</span>
                        <span>{ticket.type.replace('_', ' ')}</span>
                    </SheetDescription>
                </SheetHeader>

                {/* Ticket Info */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                                {ticket.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{ticket.userName}</p>
                            <p className="text-xs text-slate-500">Ticket #{ticket.id}</p>
                        </div>
                    </div>
                    <SLAIndicator deadline={ticket.slaDeadline} status={ticket.status} />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex gap-3',
                                msg.isAdmin && 'flex-row-reverse'
                            )}
                        >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className={cn(
                                    'text-xs',
                                    msg.isAdmin
                                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                )}>
                                    {msg.sender.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                'flex-1 max-w-[80%]',
                                msg.isAdmin && 'text-right'
                            )}>
                                <div className={cn(
                                    'inline-block p-3 rounded-lg text-sm',
                                    msg.isAdmin
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                                )}>
                                    {msg.message}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Input */}
                <div className="border-t pt-4">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Type your reply..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            rows={2}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <Button variant="ghost" size="sm">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach
                        </Button>
                        <div className="flex gap-2">
                            <Select defaultValue="open">
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Keep Open</SelectItem>
                                    <SelectItem value="pending">Set Pending</SelectItem>
                                    <SelectItem value="resolved">Resolve</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                <Send className="h-4 w-4 mr-2" />
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Filter tickets
    const filteredTickets = supportTickets.filter((ticket) => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Stats
    const stats = {
        total: supportTickets.length,
        open: supportTickets.filter((t) => t.status === 'open').length,
        inProgress: supportTickets.filter((t) => t.status === 'in_progress').length,
        overdue: supportTickets.filter((t) => {
            const now = new Date();
            const sla = new Date(t.slaDeadline);
            return sla < now && t.status !== 'resolved' && t.status !== 'closed';
        }).length,
    };

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Support</h1>
                    <p className="text-slate-500">Manage support tickets and customer inquiries</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total Tickets</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.open}</p>
                                <p className="text-xs text-slate-500">Open</p>
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
                                <p className="text-2xl font-bold">{stats.inProgress}</p>
                                <p className="text-xs text-slate-500">In Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-200">
                                <AlertCircle className="h-5 w-5 text-red-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                                <p className="text-xs text-red-600">Overdue</p>
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
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>SLA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow
                                    key={ticket.id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => handleViewTicket(ticket)}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{ticket.subject}</p>
                                            <p className="text-xs text-slate-500">#{ticket.id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="text-xs bg-slate-200">
                                                    {ticket.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{ticket.userName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm capitalize">{ticket.type.replace('_', ' ')}</span>
                                    </TableCell>
                                    <TableCell>
                                        <PriorityBadge priority={ticket.priority} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>
                                    <TableCell>
                                        <SLAIndicator deadline={ticket.slaDeadline} status={ticket.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredTickets.length === 0 && (
                        <div className="p-8 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No tickets found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ticket Detail Sheet */}
            <TicketDetailSheet
                ticket={selectedTicket}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
