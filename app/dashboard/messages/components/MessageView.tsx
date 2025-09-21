import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/service/messaging/types';
import { useGetConversationMessages, useSendMessage } from '@/service/messaging/hook';
import { useAuth } from '@/service/auth/hook';
import { ArrowLeft, ReplyIcon, XIcon, Paperclip } from 'lucide-react';

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

  const getContactName = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.id !== currentUser?.id);
    return participant?.name || 'Unknown';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <div className="hidden md:flex flex-1 items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading messages...</div>;
  }

  const groupedMessages = messages ? groupMessagesByDate(messages) : {};
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="p-4 border-b flex items-center shadow-sm">
        <button onClick={onBack} className="md:hidden mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} />
        </button>
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
        <div>
          <h2 className="text-xl font-bold">{getContactName(conversation)}</h2>
          <p className="text-sm text-green-500">Online</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {sortedDates.map(date => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {groupedMessages[date].map(message => {
              const parentMessage = message.parentMessage
                ? messages?.find(m => m.id === message.parentMessage?.id)
                : null;

              return (
                <div
                  key={message.id}
                  className={`flex items-end my-2 group ${
                    message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-lg relative shadow ${
                      message.sender.id === currentUser?.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {parentMessage && (
                      <div className="p-2 mb-2 border-l-2 border-blue-300 bg-blue-500 rounded">
                        <p className="font-bold text-xs">
                          {parentMessage.sender.id === currentUser?.id ? 'You' : parentMessage.sender.name}
                        </p>
                        <p className="text-xs opacity-90">{parentMessage.content}</p>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-right mt-1 opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={() => handleReplyClick(message)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-100 lg:opacity-0 transition-opacity ${
                        message.sender.id === currentUser?.id ? '-left-10' : '-right-10'
                      }`}
                    >
                      <ReplyIcon size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        {replyingTo && (
          <div className="flex items-center justify-between p-2 mb-2 bg-gray-100 rounded-lg">
            <div>
              <p className="font-bold text-xs">Replying to {replyingTo.sender.name}</p>
              <p className="text-xs text-gray-600 truncate">{replyingTo.content}</p>
            </div>
            <button onClick={cancelReply} className="p-1 rounded-full hover:bg-gray-200">
              <XIcon size={16} />
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-3 pl-12 pr-28 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="absolute left-3 p-2 rounded-full hover:bg-gray-200">
            <Paperclip size={20} className="text-gray-500" />
          </button>
          <button
            onClick={handleSendMessage}
            className="absolute right-3 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
