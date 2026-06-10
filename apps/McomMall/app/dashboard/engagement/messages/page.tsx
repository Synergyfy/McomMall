'use client';

import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Search,
  ChevronRight,
  Users,
  Megaphone,
} from 'lucide-react';

const conversations = [
  { initials: 'SJ', name: 'Sarah Jenkins',  preview: 'Thanks for the loyalty reward! I\'ll use it on my next visit.',  time: '2m',  unread: 2,  bg: 'bg-blue-100',   color: 'text-blue-700' },
  { initials: 'AR', name: 'Alex Rivera',    preview: 'Is the free coffee reward still valid at all branches?',           time: '18m', unread: 0,  bg: 'bg-orange-100', color: 'text-orange-700' },
  { initials: 'MG', name: 'Maria Gomez',    preview: 'I received the event invite — sounds great! I\'ll RSVP now.',     time: '1h',  unread: 1,  bg: 'bg-purple-100', color: 'text-purple-700' },
  { initials: 'TK', name: 'Thomas K.',      preview: 'Love the service as always. Any new promotions coming up?',        time: '3h',  unread: 0,  bg: 'bg-green-100',  color: 'text-green-700' },
  { initials: 'ES', name: 'Emma Stone',     preview: 'Can I transfer my loyalty points to a friend?',                    time: '1d',  unread: 0,  bg: 'bg-orange-100', color: 'text-orange-700' },
  { initials: 'JD', name: 'John Doe',       preview: 'My last order was delayed. Can you help me track it?',             time: '2d',  unread: 0,  bg: 'bg-amber-100',  color: 'text-amber-700' },
];

const broadcasts = [
  { title: 'Weekend Flash Sale',   sent: 450,  opened: 312, time: '2 days ago' },
  { title: 'Loyalty Points Bonus', sent: 1200, opened: 890, time: '1 week ago' },
  { title: 'VIP Event Invite',     sent: 200,  opened: 178, time: '2 weeks ago' },
];

export default function EngagementMessagesPage() {
  return (
    <div style={{ background: '#fff8f5', margin: '-20px -20px 0', minHeight: '100%' }}>
      <div className="px-4 pt-5 pb-32 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1f1b18' }}>Messages</h2>
            <p className="text-xs" style={{ color: '#8e7164' }}>12 active conversations</p>
          </div>
          <Link href="/dashboard/messages"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#ea580c' }}>
            <Megaphone className="w-3.5 h-3.5" /> Broadcast
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8e7164' }} />
          <input
            type="text"
            placeholder="Search conversations…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#ffffff', border: '1px solid #e2bfb0', color: '#1f1b18' }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Active',    value: '12', color: '#ea580c' },
            { label: 'Unread',    value: '3',  color: '#00629f' },
            { label: 'This week', value: '47', color: '#16a34a' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center py-3 rounded-xl bg-white"
              style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.06)' }}>
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#8e7164' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Conversations */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1f1b18' }}>Recent Conversations</h3>
          <div className="space-y-2">
            {conversations.map((c) => (
              <div key={c.name}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white transition-all active:scale-[0.98]"
                style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.05)' }}>
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${c.bg} ${c.color}`}>
                    {c.initials}
                  </div>
                  {c.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                      style={{ background: '#ea580c' }}>
                      {c.unread}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm truncate ${c.unread > 0 ? 'font-bold' : 'font-semibold'}`} style={{ color: '#1f1b18' }}>
                      {c.name}
                    </p>
                    <span className="text-[10px] ml-2 shrink-0" style={{ color: '#8e7164' }}>{c.time}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? 'font-medium' : ''}`} style={{ color: c.unread > 0 ? '#5a4136' : '#8e7164' }}>
                    {c.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/messages"
            className="flex items-center justify-center gap-1 mt-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: '1px solid #ea580c', color: '#ea580c' }}>
            <MessageSquare className="w-4 h-4" /> Open Full Inbox
          </Link>
        </div>

        {/* Recent Broadcasts */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold" style={{ color: '#1f1b18' }}>Recent Broadcasts</h3>
            <Link href="/dashboard/loyalty/promotion" className="text-xs font-semibold" style={{ color: '#ea580c' }}>New broadcast</Link>
          </div>
          <div className="space-y-2">
            {broadcasts.map((b) => {
              const openRate = Math.round((b.opened / b.sent) * 100);
              return (
                <div key={b.title} className="p-4 rounded-2xl bg-white"
                  style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.05)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1f1b18' }}>{b.title}</p>
                      <p className="text-[10px]" style={{ color: '#8e7164' }}>{b.time} · {b.sent} recipients</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                      {openRate}% opened
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: '#f7ece7' }}>
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${openRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
