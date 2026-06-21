'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Bell, 
  MessageSquare, 
  Send, 
  Calendar, 
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronRight,
  Loader2,
  Building
} from 'lucide-react';
import api from '@/service/api';

// ─── SEARCH & FILTER SCREEN ──────────────────────────────────────────────────
interface SearchFilterScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const SearchFilterScreen: FC<SearchFilterScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'claimed'>('all');

  const businesses = mallData?.businesses || [];

  const filtered = businesses.filter((b: any) => {
    const matchesQuery = b.businessName.toLowerCase().includes(query.toLowerCase()) || 
                         (b.category || '').toLowerCase().includes(query.toLowerCase());
    
    if (selectedFilter === 'verified') return matchesQuery && b.isVerified;
    if (selectedFilter === 'claimed') return matchesQuery && b.isClaimed;
    return matchesQuery;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-black text-gray-900 tracking-tight">Global Search Directory</h3>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search merchants, services, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'verified', 'claimed'] as const).map((filter) => (
            <button 
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                selectedFilter === filter 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'bg-white text-gray-650 border-gray-150 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((b: any) => (
          <div 
            key={b.id}
            onClick={() => onNavigate(`profile:${b.id}`)}
            className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-100">
                {b.businessName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 leading-snug">{b.businessName}</p>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">{b.category || 'Store'}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">No search results found.</p>
        )}
      </div>
    </div>
  );
};

// ─── SYSTEM NOTICE SCREEN ────────────────────────────────────────────────────
interface SystemNoticeScreenProps {
  onNavigate: (screen: string) => void;
}

export const SystemNoticeScreen: FC<SystemNoticeScreenProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-150">
          <AlertTriangle className="w-6 h-6 animate-bounce" />
        </div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Active Moderation Notices</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Your merchant profile is currently compliant. No warnings or exclusions are active for your store listing. Please review community guidelines to prevent signage exclusion flags.
        </p>
        <button 
          onClick={() => onNavigate('home')}
          className="w-full mt-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors active:scale-95 duration-150"
        >
          Return to Dashboard Home
        </button>
      </div>
    </div>
  );
};

// ─── NOTIFICATIONS CENTER SCREEN ─────────────────────────────────────────────
interface NotificationsCenterScreenProps {
  onNavigate: (screen: string) => void;
}

export const NotificationsCenterScreen: FC<NotificationsCenterScreenProps> = ({
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAllSeen = async () => {
    const unreadIds = notifications.filter((n: any) => !n.isSeen).map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await api.post('notifications/seen', { notificationIds: unreadIds });
      fetchAlerts();
    } catch (err) {
      console.error('Error marking alerts as seen:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Center</h2>
          <p className="text-xs text-gray-400 mt-1">Review active system alerts and local campaign triggers.</p>
        </div>
        {notifications.some((n: any) => !n.isSeen) && (
          <button 
            onClick={handleMarkAllSeen}
            className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-3xl border shadow-sm flex items-start gap-3 transition-colors ${
                n.isSeen 
                  ? 'bg-white border-gray-100 text-gray-500' 
                  : 'bg-orange-50/20 border-orange-100 text-gray-900'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                n.isSeen ? 'bg-gray-50 border-gray-150 text-gray-450' : 'bg-orange-100 border-orange-200 text-orange-600'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-normal">{n.message}</p>
                <span className="text-[9px] text-gray-400 font-semibold mt-1 block">
                  {new Date(n.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-400 text-xs">
          No new notifications or system alerts.
        </div>
      )}
    </div>
  );
};

// ─── MESSAGES CENTER SCREEN ──────────────────────────────────────────────────
interface MessagesCenterScreenProps {
  onNavigate: (screen: string) => void;
}

export const MessagesCenterScreen: FC<MessagesCenterScreenProps> = ({
  onNavigate,
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePartnerId, setActivePartnerId] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get('messaging/conversations');
      setConversations(res.data || []);
    } catch (err) {
      console.error('Error fetching chat directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = async (id: string, receiverId: string) => {
    setActiveConvId(id);
    setActivePartnerId(receiverId);
    try {
      const res = await api.get(`messaging/conversations/${id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Error loading conversation chats:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartnerId) return;

    try {
      await api.post('messaging', {
        content: newMessage.trim(),
        receiverId: activePartnerId,
      });
      setNewMessage('');
      if (activeConvId) {
        handleSelectConversation(activeConvId, activePartnerId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Chat Center</h2>
          <p className="text-xs text-gray-400 mt-1">Chat securely with neighboring B2B merchants.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('message-templates')}
            className="px-3 py-1.5 bg-gray-50 border border-gray-150 text-[10px] font-bold uppercase text-gray-650 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Templates
          </button>
          <button 
            onClick={() => onNavigate('scheduled-messages')}
            className="px-3 py-1.5 bg-gray-50 border border-gray-150 text-[10px] font-bold uppercase text-gray-650 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Schedules
          </button>
        </div>
      </div>

      {activeConvId ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-96 overflow-hidden relative">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-black text-gray-950">Active Conversation Chat</span>
            <button 
              onClick={() => setActiveConvId(null)}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`max-w-[70%] p-3 rounded-2xl text-xs leading-normal ${
                  m.senderId === activePartnerId 
                    ? 'bg-gray-50 border border-gray-100 text-gray-800 self-start rounded-tl-none' 
                    : 'bg-orange-500 text-white self-end rounded-tr-none'
                }`}
              >
                <p>{m.content}</p>
              </div>
            ))}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input 
              type="text"
              placeholder="Type message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
            />
            <button 
              type="submit"
              className="p-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-650 transition-colors active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Conversation Threads</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            </div>
          ) : conversations.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {conversations.map((c) => {
                const partnerName = c.receiver?.businessName || c.sender?.businessName || 'Merchant Partner';
                const receiverId = c.receiverId;
                return (
                  <div 
                    key={c.id} 
                    onClick={() => handleSelectConversation(c.id, receiverId)}
                    className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200">
                        {partnerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{partnerName}</p>
                        <p className="text-[10px] text-gray-450 truncate max-w-[200px]">{c.content}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4">No active conversations found. Propose a partnership to open chats.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MESSAGE TEMPLATES SCREEN ────────────────────────────────────────────────
interface MessageTemplatesScreenProps {
  onNavigate: (screen: string) => void;
}

export const MessageTemplatesScreen: FC<MessageTemplatesScreenProps> = ({
  onNavigate,
}) => {
  const templates = [
    { title: 'New Customer Welcome', text: 'Welcome to our neighborhood shop! Enjoy 10% off your first purchase.' },
    { title: 'Double Points Weekend', text: 'Earn double loyalty points this weekend when buying any high street cluster products.' },
    { title: 'B2B Collaboration Pitch', text: 'Hey there! We are interested in swapping point pools to co-promote local listings.' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Message Templates</h2>
        <p className="text-xs text-gray-400 mt-1">Configure quick messages to dispatch to customers or nearby shops.</p>

        <div className="flex flex-col gap-3 mt-6">
          {templates.map((temp, idx) => (
            <div key={idx} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-xs font-bold text-gray-900">{temp.title}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{temp.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── SCHEDULED MESSAGES SCREEN ───────────────────────────────────────────────
interface ScheduledMessagesScreenProps {
  onNavigate: (screen: string) => void;
}

export const ScheduledMessagesScreen: FC<ScheduledMessagesScreenProps> = ({
  onNavigate,
}) => {
  const [blastText, setBlastText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.post('support-tickets', {
        subject: `Scheduled Message Blast Campaign`,
        description: `Scheduled Date: ${scheduledDate}, Text: ${blastText}`,
        priority: 'low',
      });
      setSuccess(true);
      setBlastText('');
      setScheduledDate('');
    } catch (err) {
      console.error('Error logging scheduled blast request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Message Schedulers</h2>
        <p className="text-xs text-gray-400 mt-1">Schedule push notifications or message blasts to local Greenwich consumers.</p>

        <form onSubmit={handleSchedule} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Blast Text</label>
            <textarea 
              placeholder="Type message content here..."
              value={blastText}
              onChange={(e) => setBlastText(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 h-20 resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Dispatch Date & Time</label>
            <input 
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <>Scheduled Blast Campaign <Check className="w-4 h-4" /></>
            ) : (
              <>Schedule Message Blast <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
