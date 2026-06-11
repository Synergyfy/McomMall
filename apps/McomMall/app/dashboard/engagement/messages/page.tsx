'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Tag,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Users,
  Percent,
  Plus,
  Send,
  Edit2,
  Settings,
  Play,
  CheckCircle,
  Inbox,
  ArrowUpRight,
  User,
  Search,
  ChevronRight,
} from 'lucide-react';

// Predefined Mock Data
const QUICK_ACTIONS = [
  {
    label: 'Send Promotion',
    icon: Megaphone,
    color: 'text-[#a14000]',
    bg: 'bg-orange-50',
    href: '/dashboard/loyalty/promotion',
  },
  {
    label: 'Send Offer',
    icon: Tag,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    href: '/dashboard/loyalty/promotion/send-offer',
  },
  {
    label: 'Send Alert',
    icon: AlertTriangle,
    color: 'text-[#ba1a1a]',
    bg: 'bg-red-50',
    href: '/dashboard/engagement/messages/send-alert',
  },
  {
    label: 'Invite to Event',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/dashboard/engagement/messages/invite-to-event',
  },
];

const RECENT_CAMPAIGNS = [
  {
    id: 1,
    title: 'Summer Flash Sale',
    type: 'SMS + EMAIL',
    details: 'Sent to 4,280 customers • 12% Open Rate',
    status: 'ACTIVE',
    icon: Megaphone,
    iconColor: 'text-[#a14000]',
    iconBg: 'bg-orange-50',
  },
  {
    id: 2,
    title: 'VIP Early Access',
    type: 'EMAIL',
    details: 'Sent 2 days ago • 8.4% Conversion',
    status: 'COMPLETED',
    icon: Tag,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
];

const NEW_REPLIES = [
  {
    id: 1,
    name: 'Sarah J.',
    text: '"I loved the summer collection! Do you have the blue dress in size M?"',
    time: '2m ago',
    initials: 'SJ',
  },
  {
    id: 2,
    name: 'Mark Wilson',
    text: '"Is the VIP discount still valid for online purchases today?"',
    time: '15m ago',
    initials: 'MW',
  },
  {
    id: 3,
    name: 'Emma Stone',
    text: '"Can I transfer my loyalty points to a friend?"',
    time: '1h ago',
    initials: 'ES',
  },
];

const TABS = [
  { id: 'promotions', label: 'Promotions' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'offers', label: 'Offers' },
  { id: 'events', label: 'Event Invitations' },
  { id: 'templates', label: 'Templates' },
  { id: 'scheduled', label: 'Scheduled' },
];

const CARDS_BY_TAB: Record<string, any[]> = {
  promotions: [
    {
      id: 1,
      title: 'Summer Weekend 20%',
      desc: '"Hey {name}, beat the heat with 20% off all summer apparel this weekend! Use code HEATWAVE."',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvBTajcEvmOCnrUgsnMXn1YgPmAccrE7dpoaC7MRyANelu-rPvra3AYZ-awuJW1gf9IbxphLTpcANcBxTAjnXTLbhe0Dha0YQ9zEaFuOdBlxnfA1Jp9J1gHW2TAEC7FeYNlQmzwt4QSI-xri-9PLeev8G3pI7YiOAL0EH4Nr6iea4RHMsMcu2529nCJS9sPTkkrTkh7HANdtC2N0Qr7MkvZ3eo0B7Cd5K5CpfVuEaaTDbCkOh5q6PLMHI0',
      channels: 'SMS + EMAIL',
      meta: 'Last sent Oct 12',
      actionIcon: Edit2,
    },
    {
      id: 2,
      title: 'Birthday Special',
      desc: '"Happy Birthday {name}! We have a little something special waiting for you in-store today..."',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLuGnQ3-AhXlXaBN8szxCy49q0aUTjY6in06OUZx4m10IevAKH80anpyOq3DiWlKvLf-ugV3aXc9eVbLUXWp2X5Ji3-HzXiXacjb-HzaFtbsYUTA1qkcf-FXb5HL--awrEfhgM_x2mgQKGM3elu_1OQ2hQaGMaYUXfwvYuQ3uwNCy4_Hh7TFlZKrvhFr39pisJGOvKh_HtINMAv5jIuuaoi-JbZ5OLGDNXhYdstLfnvrMOLG2MO_j_zggso',
      channels: 'EMAIL',
      meta: 'Automated',
      actionIcon: Settings,
    },
  ],
  alerts: [
    {
      id: 3,
      title: 'Store Hours Update',
      desc: '"Dear customer, our Downtown branch will open at 10 AM starting next week. Thank you for your cooperation."',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvzSqxn-Vv4uKBtatka-Dew1aorVSsw40ZOm07MJRGOM9QcyfFGb8pbPBpBi6ZaP0mMZEaMaxlZ6yZp2wMPNIdyie_y33EJpGYfIR_eG5637RbY7mTQYBw2KOz26w6hzGCWLAppzGL0tT-S8w5cgGz1n-PhEQkNzexbipT8TayxF6bMagNXAfEoh-DSRNqtSQJLBVnlERFoOfgoHpQUKUH6k1GamDuCi9WjO_2CEQjwfab9JYH9dvetjUw',
      channels: 'SMS',
      meta: 'Last sent Nov 1',
      actionIcon: Edit2,
    },
  ],
  offers: [
    {
      id: 4,
      title: 'Free Espresso Friday',
      desc: '"Warm up your Friday! Present this message at checkout to get a complimentary single-shot espresso."',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvwjhiJB1kFBmtd6A4W8I4pyhmxf1fKDNEPsGdbj7kZtXEL0u6WfvIv6QBif0RyePzhZEImJwDI1bgJjIhyKY9BfAGb5ywlC4QQbLss0yNDk0Pap_FfLjvw-LeIAmceecTu-R7UsA7YRaUvom0NC60cDYIJ_J0_85mZoPRsiYVv2CW8JCDXkog90HHT2VhI4wvTUxapRHh5bRKvQypBer0IUqWgb4IlVMejsYtDAzAQnlRMSdqfp0WfVg',
      channels: 'SMS + PUSH',
      meta: 'Active Deal',
      actionIcon: Settings,
    },
  ],
  events: [
    {
      id: 5,
      title: 'Wine Tasting Night',
      desc: '"Join us for an exclusive evening of fine wines and artisan pairings. Limited seats available, RSVP now!"',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLtH66VWXb3rP7Q3V8B3awwyuBNCuMkEXl1bSM6T_KvNm8snGkln4MsJ6W91yQqVmj2jBn8Xa47JaovuZnZERl0CqNWeS1_8saOU01iTjJT8HWmJyv6eksf6F1YhdVCiuoctt0Z0U9QTTOc_QjYANctFNiB2uRd3n0NFlgDvUgYQXV2xYZduWfnw19pHZ3Zlq9g4pDI1ckkFK1aIzdXihlizFwSnlXRSAWYJaHJ4zW-vy3spJbiTzHc6Vw',
      channels: 'EMAIL',
      meta: 'Scheduled for Dec 10',
      actionIcon: Edit2,
    },
  ],
  templates: [],
  scheduled: [],
};

export default function MessagesDashboardPage() {
  const [activeTab, setActiveTab] = useState('promotions');
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [localReplies, setLocalReplies] = useState(NEW_REPLIES);

  // Send message simulation inside full inbox view
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return;

    const userMsg = {
      id: Date.now(),
      text: chatMessage,
      name: 'You',
      time: 'Just now',
      initials: 'YO',
      isSender: true,
    };

    setSelectedChat((prev: any) => ({
      ...prev,
      messages: [...(prev.messages || []), userMsg],
    }));

    setChatMessage('');
  };

  const openConversation = (reply: any) => {
    setSelectedChat({
      ...reply,
      messages: [
        { id: 1, text: reply.text, name: reply.name, time: reply.time, initials: reply.initials },
      ],
    });
  };

  const cards = CARDS_BY_TAB[activeTab] || [];

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden bg-[#fff8f5] text-[#1f1b18] pb-28">
      <div className="w-full px-4 pt-5 space-y-6 min-w-0">
        
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-[#1f1b18] truncate">Messages</h1>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">Coordinate promotions, alerts, and live chats.</p>
          </div>
          <button 
            onClick={() => setIsInboxOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#a14000] hover:bg-[#853400] transition-colors shadow-sm active:scale-95 shrink-0"
          >
            <Inbox className="w-3.5 h-3.5" /> View Inbox
          </button>
        </div>

        {/* Quick Actions */}
        <section className="space-y-2">
          <h2 className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] hover:shadow-[0_4px_12px_rgba(161,64,0,0.06)] transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div className={`p-1.5 sm:p-2 rounded-full ${action.bg} mb-1.5 group-hover:scale-110 transition-transform shrink-0`}>
                  <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#1f1b18] text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Recent Campaigns */}
          <div className="md:col-span-2 bg-white p-3.5 sm:p-5 rounded-xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] flex flex-col justify-between min-w-0">
            <div className="flex justify-between items-center mb-3 gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-[#1f1b18] truncate">Recent Campaigns</h3>
              <Link href="/dashboard/loyalty/promotion" className="text-[11px] font-bold text-[#a14000] flex items-center gap-0.5 hover:underline shrink-0">
                View History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-2.5">
              {RECENT_CAMPAIGNS.map((camp) => (
                <div key={camp.id} className="flex items-center justify-between gap-2.5 p-2.5 rounded-lg bg-[#fff8f5] hover:bg-orange-50/50 transition-colors min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${camp.iconBg} flex items-center justify-center shrink-0`}>
                      <camp.icon className={`w-4 h-4 ${camp.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[11px] sm:text-xs text-[#1f1b18] truncate">{camp.title}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">{camp.details}</p>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold shrink-0 ${
                    camp.status === 'ACTIVE' ? 'bg-orange-100 text-[#a14000]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {camp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Replies Snippet */}
          <div className="bg-[#a14000] text-white p-3.5 sm:p-5 rounded-xl shadow-md relative overflow-hidden group flex flex-col justify-between min-w-0">
            <div className="relative z-10 flex justify-between items-center mb-3 gap-2">
              <h3 className="font-bold text-xs sm:text-sm truncate">New Replies</h3>
              <span className="bg-white text-[#a14000] px-1.5 py-0.5 rounded-full font-black text-[8px] shrink-0">
                {localReplies.length} NEW
              </span>
            </div>

            <div className="relative z-10 space-y-2 mb-3 min-w-0">
              {localReplies.slice(0, 2).map((reply) => (
                <div 
                  key={reply.id} 
                  onClick={() => {
                    openConversation(reply);
                    setIsInboxOpen(true);
                  }}
                  className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white/15 transition-colors min-w-0"
                >
                  <p className="text-[9px] font-bold opacity-80 mb-0.5 truncate">{reply.name}</p>
                  <p className="text-[11px] line-clamp-1 italic font-medium opacity-90 truncate">{reply.text}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsInboxOpen(true)}
              className="relative z-10 w-full py-2 bg-white text-[#a14000] rounded-lg font-bold text-[11px] hover:bg-orange-50 active:scale-[0.98] transition-all shadow-sm"
            >
              Go to Inbox
            </button>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="space-y-3">
          <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar w-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#a14000] text-white shadow-sm'
                      : 'bg-white border border-[#e2bfb0]/30 text-gray-500 hover:bg-orange-50/20'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <AnimatePresence mode="popLayout">
              {cards.map((card) => {
                const ActionIcon = card.actionIcon;
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm mx-auto sm:max-w-none bg-white border border-[#e2bfb0]/20 rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(161,64,0,0.02)] hover:shadow-[0_4px_12px_rgba(161,64,0,0.06)] transition-all group flex flex-col justify-between min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="h-24 sm:h-28 lg:h-32 bg-orange-50/20 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={card.image} 
                          alt={card.title} 
                        />
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/90 backdrop-blur rounded text-[8px] font-extrabold text-[#a14000] shadow-sm">
                          {card.channels}
                        </div>
                      </div>
                      
                      <div className="p-3 sm:p-4 space-y-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1f1b18] truncate">{card.title}</h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed break-words">{card.desc}</p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 pt-2 sm:pt-3 border-t border-[#f7ece7] flex justify-between items-center bg-[#fff8f5]/40 min-w-0 gap-2">
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate flex-1 min-w-0">{card.meta}</span>
                      <div className="flex gap-2 shrink-0">
                        <button className="p-1 rounded-full hover:bg-white text-gray-400 hover:text-[#a14000] transition-colors border border-transparent hover:border-[#e2bfb0]/30">
                          <ActionIcon className="w-3 h-3" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-[#a14000] hover:text-white text-[#a14000] bg-orange-100/60 transition-colors">
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Create New Promo Button Card */}
            <Link 
              href="/dashboard/loyalty/promotion" 
              className="w-full max-w-sm mx-auto sm:max-w-none border-2 border-dashed border-[#e2bfb0]/40 rounded-xl flex flex-col items-center justify-center p-5 space-y-1.5 hover:border-[#a14000] hover:bg-orange-50/10 transition-all text-gray-400 hover:text-[#a14000] min-h-[160px]"
            >
              <Plus className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[11px] sm:text-xs font-bold">Create New Promotion</span>
            </Link>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="bg-[#fff1eb]/70 border border-[#e2bfb0]/20 rounded-xl p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center space-y-0.5 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-extrabold text-gray-400 uppercase tracking-wider truncate">Sent Today</p>
            <p className="text-sm sm:text-base font-bold font-display text-[#a14000] truncate">1,248</p>
          </div>
          <div className="text-center space-y-0.5 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-extrabold text-gray-400 uppercase tracking-wider truncate">Open Rate</p>
            <p className="text-sm sm:text-base font-bold font-display text-[#a14000] truncate">24.5%</p>
          </div>
          <div className="text-center space-y-0.5 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-extrabold text-gray-400 uppercase tracking-wider truncate">Unsubscribes</p>
            <p className="text-sm sm:text-base font-bold font-display text-[#ba1a1a] truncate">0.2%</p>
          </div>
          <div className="text-center space-y-0.5 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-extrabold text-gray-400 uppercase tracking-wider truncate">ROI</p>
            <p className="text-sm sm:text-base font-bold font-display text-blue-600 truncate">4.2x</p>
          </div>
        </section>
      </div>

      {/* ── FULL INBOX MODAL DIALOG ── */}
      <AnimatePresence>
        {isInboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#fff8f5] h-full shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#e2bfb0]/20 bg-white flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <Inbox className="w-5 h-5 text-[#a14000] shrink-0" />
                  <h2 className="font-bold text-sm text-[#1f1b18] truncate">Customer Messages</h2>
                </div>
                <button 
                  onClick={() => {
                    setIsInboxOpen(false);
                    setSelectedChat(null);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0"
                >
                  Close
                </button>
              </div>

              {/* Modal Workspace Split */}
              <div className="flex-1 min-h-0 flex overflow-hidden">
                {!selectedChat ? (
                  /* Conversations List */
                  <div className="w-full overflow-y-auto p-4 space-y-2">
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search conversations..." 
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-[#e2bfb0]/30 outline-none focus:border-[#a14000]" 
                      />
                    </div>
                    {localReplies.map((reply) => (
                      <div 
                        key={reply.id} 
                        onClick={() => openConversation(reply)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#e2bfb0]/20 hover:border-[#a14000]/30 transition-all cursor-pointer shadow-[0_2px_4px_rgba(161,64,0,0.02)] active:scale-[0.99] min-w-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#a14000] text-xs shrink-0">
                          {reply.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className="font-bold text-xs text-[#1f1b18] truncate">{reply.name}</h4>
                            <span className="text-[9px] text-gray-400 shrink-0">{reply.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate italic mt-0.5">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Active Conversation Room */
                  <div className="w-full flex flex-col h-full bg-[#fff8f5] min-w-0">
                    {/* Chat Header */}
                    <div className="p-3 bg-white border-b border-[#e2bfb0]/20 flex items-center gap-2 min-w-0">
                      <button 
                        onClick={() => setSelectedChat(null)}
                        className="text-xs font-bold text-[#a14000] mr-2 flex items-center gap-0.5 shrink-0"
                      >
                        ← Back
                      </button>
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#a14000] text-[10px] shrink-0">
                        {selectedChat.initials}
                      </div>
                      <span className="font-bold text-xs text-[#1f1b18] truncate">{selectedChat.name}</span>
                    </div>

                    {/* Message Log */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                      {selectedChat.messages?.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${
                            msg.isSender 
                              ? 'bg-[#a14000] text-white rounded-br-none' 
                              : 'bg-white text-[#1f1b18] rounded-bl-none border border-[#e2bfb0]/20'
                          } break-words`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className="block text-[8px] text-right mt-1 opacity-70">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Composer */}
                    <div className="p-3 bg-white border-t border-[#e2bfb0]/20 flex gap-2">
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your reply..." 
                        className="flex-1 px-3 py-2 rounded-xl text-xs border border-[#e2bfb0]/30 outline-none focus:border-[#a14000] min-w-0"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="p-2 bg-[#a14000] hover:bg-[#853400] text-white rounded-xl transition-all active:scale-95 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
