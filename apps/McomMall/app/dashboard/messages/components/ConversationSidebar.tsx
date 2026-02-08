import { useState } from 'react';
import { Conversation, User } from '@/service/messaging/types';
import { useAuth } from '@/service/auth/hook';
import { Search } from 'lucide-react';
import { UserRole } from '@/service/auth/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
}

export default function ConversationSidebar({
  conversations,
  selectedConversation,
  onConversationSelect,
}: ConversationSidebarProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredConversations = conversations.filter(conversation => {
    const contact = getContact(conversation);
    const contactName = getDisplayName(contact);
    return contactName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTimestamp = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Predefined avatar background colors based on initials
  const getAvatarBg = (initials: string) => {
    const colors = [
      'bg-orange-500',
      'bg-red-500',
      'bg-slate-700',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-rose-500',
    ];
    const index = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-6 pb-4 bg-slate-800 text-white">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all border-transparent focus:bg-white/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col p-2 bg-gray-50/30">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conversation => {
                const contact = getContact(conversation);
                const displayName = getDisplayName(contact);
                const lastMessage =
                  conversation.messages && conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1]
                    : null;

                const isActive = selectedConversation?.id === conversation.id;
                const initials = getInitials(displayName);

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center p-3 mb-1 rounded-xl cursor-pointer transition-all hover:bg-white hover:shadow-md hover:border-gray-100 border border-transparent",
                      isActive && "bg-white shadow-lg border-orange-100"
                    )}
                    onClick={() => onConversationSelect(conversation)}
                  >
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className={cn(
                        "text-white font-bold",
                        isActive ? "bg-orange-500 shadow-inner shadow-black/20" : getAvatarBg(initials)
                      )}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-grow ml-4 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className={cn(
                            "font-bold truncate text-sm transition-colors",
                            isActive ? "text-orange-600" : "text-slate-800"
                          )}>
                            {displayName}
                          </p>
                          {contact && (
                            <Badge 
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 h-4 uppercase tracking-tighter font-extrabold border-0",
                                contact.role === UserRole.OWNER 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "bg-blue-100 text-blue-700"
                              )}
                            >
                              {contact.role === UserRole.OWNER ? 'Owner' : 'Customer'}
                            </Badge>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                            {formatTimestamp(lastMessage.createdAt)}
                          </p>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate transition-colors",
                        isActive ? "text-orange-600/70" : "text-slate-500"
                      )}>
                        {lastMessage ? lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                    
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 ml-2 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}