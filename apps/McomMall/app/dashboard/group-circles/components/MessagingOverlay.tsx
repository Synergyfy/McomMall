"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Send, Paperclip, MessageSquare, Users, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MessagingOverlayProps {
    selectedCircle: any;
    chatType: 'GROUP' | 'DIRECT';
    chatMemberId: string | null;
    isChatOverlayOpen: boolean;
    onClose: () => void;
    onSetChatType: (type: 'GROUP' | 'DIRECT') => void;
    onSetChatMemberId: (id: string | null) => void;
    isLoadingMessages: boolean;
    messagesData: any;
    profile: any;
    chatInput: string;
    setChatInput: (val: string) => void;
    onSendMessage: () => void;
    isSending: boolean;
}

export const MessagingOverlay = React.memo(({
    selectedCircle,
    chatType,
    chatMemberId,
    isChatOverlayOpen,
    onClose,
    onSetChatType,
    onSetChatMemberId,
    isLoadingMessages,
    messagesData,
    profile,
    chatInput,
    setChatInput,
    onSendMessage,
    isSending
}: MessagingOverlayProps) => {
    if (!isChatOverlayOpen || !selectedCircle) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] z-[100] flex flex-col pointer-events-auto"
        >
            <Card className="flex-1 flex flex-col border-white/20 dark:border-zinc-800 shadow-[0_32px_128px_-16px_rgba(249,115,22,0.15)] overflow-hidden rounded-[32px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl">
                <CardHeader className="py-4 px-6 border-b bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-950/50 flex flex-row items-center justify-between space-y-0 flex-none backdrop-blur-md">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                            onSetChatType('GROUP');
                            onSetChatMemberId(null);
                        }}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg",
                            chatType === 'GROUP' ? "bg-orange-600 shadow-orange-500/20" : "bg-zinc-900 shadow-zinc-900/20"
                        )}>
                            {chatType === 'GROUP' ? <Users className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                            <CardTitle className="text-sm font-black group-hover:text-orange-600 transition-colors">
                                {chatType === 'GROUP' ? 'Circle Chat' : `Direct: ${selectedCircle?.members.find((m: any) => m.id === chatMemberId)?.name || 'Direct'}`}
                            </CardTitle>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live Connect</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {chatType === 'DIRECT' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-zinc-100 rounded-xl"
                                onClick={() => {
                                    onSetChatType('GROUP');
                                    onSetChatMemberId(null);
                                }}
                                title="Back to Circle"
                            >
                                <ArrowRight className="w-4 h-4 text-zinc-400 rotate-180" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-zinc-100 rounded-xl"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </Button>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-6 bg-transparent">
                    <div className="space-y-6">
                        {isLoadingMessages ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing messages...</p>
                            </div>
                        ) : messagesData?.data && messagesData.data.length > 0 ? (        
                            messagesData.data
                                .filter((msg: any) => {
                                    if (chatType === 'GROUP') return msg.type === 'GROUP';
                                    return msg.type === 'DIRECT' && (msg.senderId === chatMemberId || msg.recipientId === chatMemberId);
                                })
                                .reverse()
                                .map((msg: any, idx: number) => {
                                    const isMe = msg.senderId === profile?.id;
                                    return (
                                        <div key={msg.id || idx} className={cn("flex flex-col gap-1.5", isMe ? "items-end" : "items-start")}>
                                            {!isMe && chatType === 'GROUP' && (
                                                <span className="text-[10px] font-black uppercase text-zinc-400 ml-1">{msg.senderName}</span>
                                            )}
                                            <div className={cn(
                                                "p-4 rounded-[24px] text-sm max-w-[85%] shadow-sm transition-all hover:scale-[1.02]",
                                                isMe
                                                    ? "bg-orange-600 text-white rounded-tr-none shadow-orange-500/20"
                                                    : "bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-none"
                                            )}>
                                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-zinc-400 mx-1 uppercase">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-orange-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="w-10 h-10 text-orange-200" />
                                </div>
                                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 italic">No Conversations Found</h4>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 mt-2 px-10">Start the conversation with your network members.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 px-6 border-t bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-orange-600 rounded-lg"><Paperclip className="w-4 h-4" /></Button>
                        <input
                            className="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none h-10"
                            placeholder={chatType === 'GROUP' ? "Post to circle..." : "Reply privately..."}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}   
                        />
                        <Button
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-xl transition-all shadow-lg",
                                chatInput.trim() ? "bg-orange-600 text-white shadow-orange-500/40 hover:scale-105" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            )}
                            onClick={onSendMessage}
                            disabled={!chatInput.trim() || isSending} 
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

MessagingOverlay.displayName = "MessagingOverlay";

