'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minus, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { 
    useGetSupportTickets, 
    useGetSupportTicket, 
    useCreateSupportTicket, 
    useAddSupportMessage 
} from '@/service/support-tickets/hook';
import { TicketStatus } from '@/service/support-tickets/types';
import Link from 'next/link';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, hasMoved: false });
    const { accessToken } = useSelector((state: RootState) => state.auth);

    // Queries
    const { data: tickets, isLoading: isTicketsLoading } = useGetSupportTickets();
    
    // Find latest active ticket
    const activeTicketBrief = tickets?.find(t => 
        t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS
    );

    const { data: activeTicket, isLoading: isTicketLoading } = useGetSupportTicket(activeTicketBrief?.id);

    // Mutations
    const createTicketMutation = useCreateSupportTicket();
    const addMessageMutation = useAddSupportMessage();

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Construct messages from activeTicket
    const chatMessages: Message[] = activeTicket?.messages?.map(m => ({
        id: m.id,
        text: m.content,
        sender: m.isAdminMessage ? 'agent' : 'user'
    })) || (activeTicketBrief ? [] : [{
        id: 'welcome',
        text: 'Hi there! 👋 How can we help you today?',
        sender: 'agent'
    }]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chatMessages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || createTicketMutation.isPending || addMessageMutation.isPending) return;

        const text = inputValue;
        setInputValue('');

        try {
            if (activeTicketBrief) {
                await addMessageMutation.mutateAsync({ 
                    id: activeTicketBrief.id, 
                    data: { content: text } 
                });
            } else {
                await createTicketMutation.mutateAsync({
                    subject: 'Support Request via Widget',
                    description: text
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const isLoading = isTicketsLoading || (!!activeTicketBrief && isTicketLoading);
    const isSending = createTicketMutation.isPending || addMessageMutation.isPending;

    const handlePointerDown = (e: React.PointerEvent) => {
        const drag = dragRef.current;
        drag.isDragging = true;
        drag.startX = e.clientX;
        drag.startY = e.clientY;
        drag.startPosX = position.x;
        drag.startPosY = position.y;
        drag.hasMoved = false;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            dragRef.current.hasMoved = true;
        }
        setPosition({
            x: dragRef.current.startPosX + dx,
            y: dragRef.current.startPosY + dy,
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!dragRef.current.isDragging) return;
        const wasDrag = dragRef.current.hasMoved;
        dragRef.current.isDragging = false;
        if (!wasDrag) {
            toggleChat();
        }
    };

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none"
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 pointer-events-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-[#f58220] p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <MessageCircle size={20} />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#f58220] rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Customer Support</h3>
                                    <p className="text-xs text-white/80">Typically replies in minutes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Link href="/dashboard/support-tickets" passHref>
                                    <button className="p-1 hover:bg-white/20 rounded-full transition-colors" title="View all tickets">
                                        <ExternalLink size={18} />
                                    </button>
                                </Link>
                                <button
                                    onClick={toggleChat}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                            {!accessToken ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <p className="text-gray-500 mb-4">Please login to chat with support.</p>
                                    <Link href="/auth/login" className="text-[#f58220] hover:underline">Login</Link>
                                </div>
                            ) : isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-[#f58220]" size={32} />
                                </div>
                            ) : (
                                <>
                                    {chatMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                                        ? 'bg-[#f58220] text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        {accessToken && (
                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 focus-visible:ring-[#f58220]"
                                    disabled={isLoading || isSending}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="bg-[#f58220] hover:bg-[#e0751a] text-white shrink-0"
                                    disabled={isLoading || isSending}
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="pointer-events-auto bg-[#f58220] text-white p-4 rounded-full shadow-lg hover:shadow-orange-500/30 transition-shadow relative group cursor-grab active:cursor-grabbing touch-none select-none"
                style={{ touchAction: 'none' }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
