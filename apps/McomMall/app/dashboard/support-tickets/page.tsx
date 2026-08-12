'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Plus,
    Search,
    MessageSquare,
    Send,
    Loader2,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    User as UserIcon,
    Headphones,
    Filter
} from 'lucide-react';
import {
    useGetSupportTickets,
    useGetSupportTicket,
    useCreateSupportTicket,
    useAddSupportMessage
} from '@/service/support-tickets/hook';
import { SupportTicket, TicketStatus } from '@/service/support-tickets/types';
import { formatDistanceToNow, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

export default function SupportTicketsPage() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
    const [newMessage, setNewMessage] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Queries
    const { data: tickets, isLoading: isTicketsLoading } = useGetSupportTickets();
    const { data: selectedTicket, isLoading: isTicketLoading } = useGetSupportTicket(selectedTicketId || undefined);

    // Mutations
    const createTicketMutation = useCreateSupportTicket();
    const addMessageMutation = useAddSupportMessage();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedTicket && !isTicketLoading) {
            // Small timeout to ensure DOM is fully rendered before scrolling
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedTicket?.id, selectedTicket?.messages?.length, isTicketLoading]);

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.description) return;
        try {
            await createTicketMutation.mutateAsync(newTicket);
            setNewTicket({ subject: '', description: '' });
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to create ticket:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedTicketId || !newMessage.trim()) return;
        try {
            await addMessageMutation.mutateAsync({
                id: selectedTicketId,
                data: { content: newMessage }
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const formatStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const getStatusConfig = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.OPEN:
                return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={12} className="mr-1" /> };
            case TicketStatus.IN_PROGRESS:
                return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Loader2 size={12} className="mr-1 animate-spin" /> };
            case TicketStatus.RESOLVED:
                return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} className="mr-1" /> };
            case TicketStatus.CLOSED:
                return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <AlertCircle size={12} className="mr-1" /> };
            default:
                return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-7xl mx-auto w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header Area */}
            <div className="px-6 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 rounded-2xl text-orange-600">
                        <Headphones size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
                        <p className="text-sm text-slate-500 font-medium">Get assistance from our support team</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#f58220] hover:bg-[#e0751a] text-white rounded-xl px-5 h-11 font-semibold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="mr-2 h-5 w-5" /> Create New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none"
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onInteractOutside={(e) => e.preventDefault()}
                    >
                        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                            <DialogTitle className="text-xl font-bold text-slate-900">Open a Support Ticket</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium mt-1">
                                Our team typically responds within a few hours.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                <Input
                                    placeholder="e.g. Trouble with my recent order"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                <Textarea
                                    placeholder="Describe your issue in detail..."
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    rows={5}
                                    className="rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                            <Button
                                onClick={handleCreateTicket}
                                className="bg-[#f58220] hover:bg-[#e0751a] text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-orange-500/20"
                                disabled={createTicketMutation.isPending || !newTicket.subject || !newTicket.description}
                            >
                                {createTicketMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-1 overflow-hidden bg-slate-50/50">
                {/* Sidebar - Ticket List */}
                <aside className={cn(
                    "w-full md:w-[380px] border-r border-slate-100 flex flex-col bg-white transition-all duration-300 shrink-0",
                    selectedTicketId ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input
                                placeholder="Search tickets..."
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-1">
                            {isTicketsLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="p-4 rounded-2xl animate-pulse bg-slate-50 mb-2 h-20" />
                                ))
                            ) : !tickets || tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold">No active tickets</h3>
                                    <p className="text-slate-500 text-sm mt-1">When you create a ticket, it will appear here.</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => {
                                    const config = getStatusConfig(ticket.status);
                                    return (
                                        <button
                                            key={ticket.id}
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl text-left transition-all duration-200 flex flex-col gap-2 border border-transparent",
                                                selectedTicketId === ticket.id
                                                    ? "bg-orange-50/50 border-orange-100 shadow-sm"
                                                    : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={cn(
                                                    "font-bold text-sm truncate",
                                                    selectedTicketId === ticket.id ? "text-orange-600" : "text-slate-900"
                                                )}>
                                                    {ticket.subject}
                                                </h3>
                                                <Badge className={cn("rounded-full px-2 py-0 text-[10px] font-bold shrink-0 border", config.color)}>
                                                    {formatStatusLabel(ticket.status)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-slate-500 font-medium">#{ticket.id.slice(0, 8)}</p>
                                                <p className="text-[10px] text-slate-400 font-medium italic">
                                                    {ticket.lastMessageAt && isValid(new Date(ticket.lastMessageAt))
                                                        ? formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true })
                                                        : 'New'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Main Content - Chat Area */}
                <main className={cn(
                    "flex-1 flex flex-col bg-white relative overflow-hidden",
                    !selectedTicketId && "hidden md:flex"
                )}>
                    {selectedTicketId ? (
                        <>
                            {/* Chat Header */}
                            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20 shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden rounded-full hover:bg-slate-100"
                                        onClick={() => setSelectedTicketId(null)}
                                    >
                                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                                    </Button>
                                    <div>
                                        {isTicketLoading ? (
                                            <div className="h-5 w-48 bg-slate-100 animate-pulse rounded" />
                                        ) : (
                                            <>
                                                <h2 className="font-bold text-slate-900 line-clamp-1">{selectedTicket?.subject}</h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket #{selectedTicket?.id.slice(0, 12)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <div className={cn(
                                                        "flex items-center text-[10px] font-bold uppercase tracking-wider",
                                                        getStatusConfig(selectedTicket?.status as TicketStatus).color.split(' ')[1]
                                                    )}>
                                                        {getStatusConfig(selectedTicket?.status as TicketStatus).icon}
                                                        {selectedTicket?.status ? formatStatusLabel(selectedTicket.status) : ''}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </header>

                            {/* Chat History */}
                            <ScrollArea className="flex-1 bg-slate-50/30 min-h-0">
                                <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
                                    {isTicketLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-10 w-10 animate-spin text-orange-500 opacity-20" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Initial Request Bubble */}
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="bg-[#f58220] text-white p-4 rounded-2xl rounded-tr-none shadow-sm shadow-orange-500/10 text-sm leading-relaxed max-w-[85%] border border-orange-400/20">
                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                            <UserIcon size={12} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase">Original Request</span>
                                                    </div>
                                                    {selectedTicket?.description}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 mr-1">
                                                    {selectedTicket && isValid(new Date(selectedTicket.createdAt))
                                                        ? formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })
                                                        : 'Unknown date'
                                                    }
                                                </span>
                                            </div>

                                            {/* Thread Messages */}
                                            {selectedTicket?.messages?.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex flex-col gap-1.5",
                                                        msg.isAdminMessage ? "items-start" : "items-end"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm",
                                                        msg.isAdminMessage
                                                            ? "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                                            : "bg-[#f58220] text-white rounded-tr-none border border-orange-400/20 shadow-orange-500/10"
                                                    )}>
                                                        <div className={cn(
                                                            "flex items-center gap-2 mb-2 pb-2 border-b",
                                                            msg.isAdminMessage ? "border-slate-100" : "border-white/10"
                                                        )}>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center",
                                                                msg.isAdminMessage ? "bg-slate-100 text-slate-500" : "bg-white/20 text-white"
                                                            )}>
                                                                {msg.isAdminMessage ? <Headphones size={12} /> : <UserIcon size={12} />}
                                                            </div>
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase",
                                                                msg.isAdminMessage ? "text-slate-500" : "text-white/80"
                                                            )}>
                                                                {msg.isAdminMessage ? 'Support Specialist' : 'You'}
                                                            </span>
                                                        </div>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 mx-1">
                                                        {isValid(new Date(msg.createdAt))
                                                            ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                                                            : 'Unknown date'
                                                        }
                                                    </span>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} className="h-4" />
                                        </>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Chat Input */}
                            <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <div className="max-w-4xl mx-auto flex gap-3">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            placeholder="Type your response here..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="min-h-[56px] max-h-32 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all py-4 px-5 pr-12 resize-none leading-relaxed text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <div className="absolute right-3 bottom-3 flex items-center gap-1">
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 transition-opacity",
                                                newMessage.length > 0 ? "opacity-100" : "opacity-0"
                                            )}>
                                                ENTER TO SEND
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        className="h-14 w-14 rounded-2xl bg-[#f58220] hover:bg-[#e0751a] text-white shadow-lg shadow-orange-500/20 shrink-0"
                                        onClick={handleSendMessage}
                                        disabled={addMessageMutation.isPending || !newMessage.trim() || isTicketLoading}
                                    >
                                        {addMessageMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                                    </Button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-100">
                                <MessageSquare size={48} className="text-slate-200" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Your Conversations</h2>
                            <p className="text-slate-500 max-w-sm mt-2 leading-relaxed">
                                Select a ticket from the sidebar to view the conversation history and respond.
                            </p>
                            <div className="mt-8 flex gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                                    <Filter size={14} /> ALL TICKETS
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                                    <Clock size={14} /> RECENT FIRST
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}