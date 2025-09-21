import { useState } from 'react';
import { Conversation } from '@/service/messaging/types';
import { useAuth } from '@/service/auth/hook';
import { Search } from 'lucide-react';

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

  const getContactName = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.id !== currentUser?.id);
    return participant?.name || 'Unknown';
  };

  const filteredConversations = conversations.filter(conversation =>
    getContactName(conversation).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredConversations.map(conversation => (
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
                <p className="font-semibold truncate">{getContactName(conversation)}</p>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.messages && conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1]?.content
                    : 'No messages yet'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
