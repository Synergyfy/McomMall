import { useState } from 'react';
import { Conversation } from '@/service/messaging/types';
import { useAuth } from '@/service/auth/hook';
import { Search } from 'lucide-react';
import { UserRole } from '@/service/auth/types';
import { User } from '../types';

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

  const filteredConversations = conversations.filter(conversation => {
    const contact = getContact(conversation);
    return contact?.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ul className="overflow-y-auto flex-grow">
        {filteredConversations.map(conversation => {
          const contact = getContact(conversation);
          const lastMessage =
            conversation.messages && conversation.messages.length > 0
              ? conversation.messages[conversation.messages.length - 1]
              : null;

          return (
            <li
              key={conversation.id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0"></div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="font-semibold truncate">{contact?.name || 'Unknown'}</p>
                      {contact && (
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            contact.role === UserRole.OWNER
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {contact.role === UserRole.OWNER ? 'Owner' : 'Customer'}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(lastMessage.createdAt)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage ? lastMessage.content : ''}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
