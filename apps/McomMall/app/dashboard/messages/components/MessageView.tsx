import { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '@/service/messaging/types';
import { useGetConversationMessages, useSendMessage } from '@/service/messaging/hook';
import { useAuth } from '@/service/auth/hook';
import { ArrowLeft, ReplyIcon, XIcon, Paperclip, Send, MoreVertical, Info, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface MessageViewProps {
  conversation: Conversation | null;
  onBack: () => void;
}

const groupMessagesByDate = (messages: Message[]) => {
  return messages.reduce((acc, message) => {
    const messageDate = new Date(message.createdAt).toDateString();
    if (!acc[messageDate]) {
      acc[messageDate] = [];
    }
    acc[messageDate].push(message);
    return acc;
  }, {} as Record<string, Message[]>);
};

export default function MessageView({ conversation, onBack }: MessageViewProps) {
  const { data: messages, isLoading } = useGetConversationMessages(conversation?.id || '');
  const { user: currentUser } = useAuth();
  const { mutate: sendMessage } = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getContact = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUser?.id);
  };

  const getDisplayName = (user?: User) => {
    if (!user) return 'Unknown';
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, conversation?.id]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !conversation || !currentUser) return;

    const receiver = conversation.participants.find(p => p.id !== currentUser.id);

    if (!receiver) {
      console.error("Could not determine the receiver of the message.");
      return;
    }

    sendMessage({
      content: newMessage,
      receiverId: receiver.id,
      parentMessageId: replyingTo?.id,
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  const handleReplyClick = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (!conversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full bg-[#F6F6F6]/50">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
          <Send className="w-10 h-10 text-orange-500 opacity-30" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Your Messages</h3>
        <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">
          Choose a chat from the sidebar to connect with our community.
        </p>
      </div>
    );
  }

  const contact = getContact(conversation);
  const contactName = getDisplayName(contact);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Messages</p>
      </div>
    );
  }

  const groupedMessages = messages ? groupMessagesByDate(messages) : {};
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between z-10 bg-slate-800 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden rounded-full text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <div className="relative">
            <Avatar className="w-11 h-11 border-2 border-orange-500/30 shadow-md">
              <AvatarFallback className="bg-orange-500 text-white text-sm font-bold shadow-inner">
                {getInitials(contactName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full shadow-sm"></div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight tracking-wide">{contactName}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active Now</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-[10px] text-slate-400 font-medium">{contact?.role}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-orange-400 hover:bg-white/10">
            <Search size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-orange-400 hover:bg-white/10">
            <Info size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-orange-400 hover:bg-white/10">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden bg-[#F6F6F6]">
        <ScrollArea className="h-full">
          <div className="px-6 py-8">
            {sortedDates.map(date => (
              <div key={date} className="mb-10">
                <div className="flex items-center gap-4 my-8">
                  <Separator className="flex-1 bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border shadow-sm border-slate-100">
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                    })}
                  </span>
                  <Separator className="flex-1 bg-slate-200" />
                </div>
                
                <div className="space-y-6">
                  {groupedMessages[date].map((message, idx) => {
                    const isMine = message.sender.id === currentUser?.id;
                    const parentMessage = message.parentMessage
                      ? messages?.find(m => m.id === message.parentMessage?.id)
                      : null;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col group animate-in fade-in slide-in-from-bottom-3 duration-500",
                          isMine ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "flex items-end gap-3 max-w-[85%] lg:max-w-[75%]",
                          isMine ? "flex-row-reverse" : "flex-row"
                        )}>
                          {!isMine && (
                            <Avatar className="w-8 h-8 mb-1 border shadow-sm shrink-0">
                              <AvatarFallback className="text-[10px] bg-slate-700 text-white font-bold">{getInitials(contactName)}</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className="relative group/bubble">
                            {parentMessage && (
                              <div className={cn(
                                "px-4 py-2.5 mb-[-12px] pb-5 rounded-t-2xl text-[11px] border shadow-sm max-w-sm truncate font-medium",
                                isMine ? "bg-orange-50 border-orange-100 text-orange-800 mr-2" : "bg-slate-100 border-slate-200 text-slate-700 ml-2"
                              )}>
                                <p className="font-black opacity-90 uppercase text-[9px] mb-0.5 tracking-tighter">
                                  {parentMessage.sender.id === currentUser?.id ? 'You' : getDisplayName(parentMessage.sender)}
                                </p>
                                <p className="opacity-70 line-clamp-1">{parentMessage.content}</p>
                              </div>
                            )}
                            
                            <div
                              className={cn(
                                "p-4 rounded-2xl relative shadow-md transition-all",
                                isMine 
                                  ? "bg-orange-500 text-white rounded-br-none hover:shadow-orange-500/20" 
                                  : "bg-white text-slate-800 rounded-bl-none border border-slate-100 hover:shadow-slate-200/50"
                              )}
                            >
                              <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                              <p className={cn(
                                "text-[9px] mt-2 font-black uppercase tracking-widest opacity-60",
                                isMine ? "text-right" : "text-left"
                              )}>
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReplyClick(message)}
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 rounded-full h-9 w-9 opacity-0 group-hover/bubble:opacity-100 transition-all bg-white border shadow-xl hover:text-orange-500 border-slate-100 z-10",
                                isMine ? "-left-11" : "-right-11"
                              )}
                            >
                              <ReplyIcon size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t relative z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {replyingTo && (
          <div className="flex items-center justify-between p-4 mb-4 bg-orange-50 rounded-2xl border border-orange-100 animate-in slide-in-from-bottom-5 duration-300 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-orange-500 rounded-full shadow-sm" />
              <div>
                <p className="font-black text-[10px] text-orange-600 uppercase tracking-[0.15em]">Replying to {getDisplayName(replyingTo.sender)}</p>
                <p className="text-sm text-slate-600 truncate max-w-xl font-medium">{replyingTo.content}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelReply} className="h-9 w-9 rounded-full hover:bg-orange-100 text-orange-500 transition-colors">
              <XIcon size={18} />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button variant="outline" size="icon" className="rounded-2xl h-14 w-14 shrink-0 bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm group">
            <Paperclip size={22} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </Button>
          
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type your message here..."
              className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-orange-500/30 transition-all text-sm font-medium shadow-inner"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="rounded-2xl h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none font-bold tracking-wide"
          >
            <span className="hidden sm:inline mr-2 uppercase text-xs">Send Message</span>
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}