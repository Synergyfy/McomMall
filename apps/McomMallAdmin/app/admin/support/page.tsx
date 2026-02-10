'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    useGetSupportTickets,
    useGetSupportTicket,
    useAddSupportMessage,
    useResolveSupportTicket,
    useCloseSupportTicket
} from '../../../service/support-tickets/hook';
import { SupportTicket, TicketStatus } from '../../../service/support-tickets/types';
import {
    Search,
    MessageSquare,
    Clock,
    AlertCircle,
    User,
    Send,
    Paperclip,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, addHours, isValid } from 'date-fns';

// Extended type for UI
interface UITicket extends SupportTicket {
    userName: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    type: string;
    slaDeadline: Date;
}

// Priority Badge
function PriorityBadge({ priority }: { priority: UITicket['priority'] }) {
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
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, className: string }> = {
        OPEN: { label: 'Open', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        RESOLVED: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    };

    const statusKey = status as string;
    const conf = config[statusKey] || { label: status, className: 'bg-gray-100' };

    return (
        <Badge variant="outline" className={cn('font-medium', conf.className)}>
            {conf.label}
        </Badge>
    );
}

// SLA Indicator
function SLAIndicator({ deadline, status }: { deadline: Date; status: string }) {
    if (status === 'RESOLVED' || status === 'CLOSED') {
        return <span className="text-sm text-emerald-600">Completed</span>;
    }

    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
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
    ticketId,
    open,
    onOpenChange,
}: {
    ticketId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [reply, setReply] = useState('');

    const { data: fullTicket, isLoading } = useGetSupportTicket(ticketId || undefined);
    const addMessageMutation = useAddSupportMessage();
    const resolveMutation = useResolveSupportTicket();
    const closeMutation = useCloseSupportTicket();

    const handleSend = async () => {
        if (!ticketId || !reply.trim()) return;
        try {
            await addMessageMutation.mutateAsync({ id: ticketId, content: reply });
            setReply('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (status: string) => {
        if (!ticketId) return;
        try {
            if (status === 'RESOLVED') await resolveMutation.mutateAsync(ticketId);
            if (status === 'CLOSED') await closeMutation.mutateAsync(ticketId);
        } catch (error) {
            console.error(error);
        }
    };

    if (!ticketId && !open) return null;

    const userName = fullTicket?.user ? `${fullTicket.user.firstName} ${fullTicket.user.lastName}` : 'User';
    const messages = fullTicket?.messages || [];
    const createdAt = fullTicket ? new Date(fullTicket.createdAt) : new Date();
    const slaDeadline = fullTicket && isValid(new Date(fullTicket.createdAt))
        ? addHours(new Date(fullTicket.createdAt), 24)
        : new Date();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                {isLoading ? (
                    <>
                        <SheetHeader className="sr-only">
                            <SheetTitle>Loading Ticket Details</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    </>
                ) : fullTicket ? (
                    <>
                        <SheetHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-lg">{fullTicket.subject}</SheetTitle>
                                <StatusBadge status={fullTicket.status} />
                            </div>
                            <SheetDescription className="flex items-center gap-2">
                                <PriorityBadge priority="medium" />
                                <span>•</span>
                                <span>General Support</span>
                            </SheetDescription>
                        </SheetHeader>

                        {/* Ticket Info */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                                        {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{userName}</p>
                                    <p className="text-xs text-slate-500">Ticket #{fullTicket.id}</p>
                                </div>
                            </div>
                            <SLAIndicator deadline={slaDeadline} status={fullTicket.status} />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {/* Initial Description as first message */}
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                        {userName.slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 max-w-[80%]">
                                    <div className="inline-block p-3 rounded-lg text-sm bg-slate-100 text-slate-900 rounded-bl-none">
                                        {fullTicket.description}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isValid(createdAt) ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Unknown date'}
                                    </p>
                                </div>
                            </div>

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex gap-3',
                                        msg.isAdminMessage && 'flex-row-reverse'
                                    )}
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className={cn(
                                            'text-xs',
                                            msg.isAdminMessage
                                                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                                : 'bg-slate-200 text-slate-600'
                                        )}>
                                            {msg.isAdminMessage ? 'SA' : userName.slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        'flex-1 max-w-[80%]',
                                        msg.isAdminMessage && 'text-right'
                                    )}>
                                        <div className={cn(
                                            'inline-block p-3 rounded-lg text-sm',
                                            msg.isAdminMessage
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-slate-100 text-slate-900 rounded-bl-none'
                                        )}>
                                            {msg.content}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {isValid(new Date(msg.createdAt)) ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Unknown date'}
                                        </p>
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
                                    <Select onValueChange={handleStatusChange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RESOLVED">Resolve</SelectItem>
                                            <SelectItem value="CLOSED">Close</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSend} disabled={addMessageMutation.isPending}>
                                        {addMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <SheetHeader className="sr-only">
                        <SheetTitle>No Ticket Selected</SheetTitle>
                    </SheetHeader>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data: ticketsData, isLoading } = useGetSupportTickets();

    // Map to UI Ticket
    const tickets: UITicket[] = (ticketsData || []).map(t => ({
        ...t,
        userName: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown User',
        priority: 'medium' as const,
        type: 'General Support',
        slaDeadline: addHours(new Date(t.createdAt), 24),
    }));

    // Filter tickets
    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
        inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
        resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
    };

    const handleViewTicket = (ticketId: string) => {
        setSelectedTicketId(ticketId);
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
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-200">
                                <AlertCircle className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                                <p className="text-xs text-green-600">Resolved</p>
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
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : (
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
                                        onClick={() => handleViewTicket(ticket.id)}
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
                                            <span className="text-sm capitalize">{ticket.type}</span>
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
                    )}

                    {!isLoading && filteredTickets.length === 0 && (
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
                ticketId={selectedTicketId}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}