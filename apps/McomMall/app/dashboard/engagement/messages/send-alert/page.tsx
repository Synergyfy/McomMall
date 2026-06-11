'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Zap,
  Clock,
  AlertTriangle,
  Percent,
  Bold,
  Italic,
  Link2,
  Smile,
  Send,
  CheckCircle,
  Info,
} from 'lucide-react';

const alertCategories = [
  {
    id: 'flash',
    label: 'Flash Sale',
    icon: Zap,
    color: 'text-orange-600',
    border: 'border-orange-200 hover:border-orange-500',
    bg: 'bg-orange-50',
    activeBg: 'bg-orange-50/80 border-orange-500 shadow-[0_2px_8px_rgba(234,88,12,0.08)]',
    iconBg: 'bg-orange-100',
    title: 'FLASH SALE!',
  },
  {
    id: 'hours',
    label: 'Hours Change',
    icon: Clock,
    color: 'text-amber-600',
    border: 'border-amber-200 hover:border-amber-500',
    bg: 'bg-amber-50',
    activeBg: 'bg-amber-50/80 border-amber-500 shadow-[0_2px_8px_rgba(217,119,6,0.08)]',
    iconBg: 'bg-amber-100',
    title: 'Schedule Change',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: AlertTriangle,
    color: 'text-red-600',
    border: 'border-red-200 hover:border-red-500',
    bg: 'bg-red-50',
    activeBg: 'bg-red-50/80 border-red-500 shadow-[0_2px_8px_rgba(220,38,38,0.08)]',
    iconBg: 'bg-red-100',
    title: 'URGENT NOTICE',
  },
  {
    id: 'offer',
    label: 'Limited Offer',
    icon: Percent,
    color: 'text-blue-600',
    border: 'border-blue-200 hover:border-blue-500',
    bg: 'bg-blue-50',
    activeBg: 'bg-blue-50/80 border-blue-500 shadow-[0_2px_8px_rgba(37,99,235,0.08)]',
    iconBg: 'bg-blue-100',
    title: 'Special Invitation',
  },
];

export default function SendCustomerAlertPage() {
  const router = useRouter();
  const [category, setCategory] = useState('flash');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeCategory = alertCategories.find((c) => c.id === category) || alertCategories[0];
  const ActiveIcon = activeCategory.icon;

  const handleSend = () => {
    if (!message.trim()) return;
    setIsSuccess(true);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/engagement/messages');
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden bg-[#fff8f5] text-[#1f1b18] pb-28">
      <div className="w-full px-4 pt-5 space-y-6 min-w-0">
        
        {/* ── BACK BUTTON ── */}
        <div className="flex items-center">
          <Link
            href="/dashboard/engagement/messages"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Messages
          </Link>
        </div>

        {/* ── HEADER ── */}
        <section className="space-y-1">
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Send Customer Alert</h2>
          <p className="text-xs text-gray-500">
            Broadcasting urgent updates to your customer community.
          </p>
        </section>

        {/* ── MAIN LAYOUT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Config Form */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Alert Category Selection */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#a14000]">
                Select Alert Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {alertCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        isActive ? cat.activeBg : `bg-white border-[#f7ece7] hover:border-[#e2bfb0]/80`
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${cat.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <span className="text-xs font-bold text-gray-850">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Message Editor */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                Alert Message
              </label>
              <div className="border border-[#e2bfb0]/30 rounded-xl overflow-hidden bg-white">
                <div className="bg-[#fff8f5] p-2 border-b border-[#e2bfb0]/30 flex gap-1.5 items-center">
                  <button type="button" className="p-1 hover:bg-orange-100/50 rounded text-gray-500 transition-colors">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-orange-100/50 rounded text-gray-500 transition-colors">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-orange-100/50 rounded text-gray-500 transition-colors">
                    <Link2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-[#e2bfb0]/40 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-orange-100/50 rounded text-gray-500 transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your urgent message here..."
                  className="w-full p-4 min-h-[160px] border-none focus:ring-0 outline-none text-sm text-[#1f1b18] placeholder:text-gray-400 bg-white resize-none"
                />
              </div>
            </section>

            {/* Configuration & Action */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1f1b18]">Send to All Customers</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Notify all 1,248 active members</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSendToAll(!sendToAll)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    sendToAll ? 'bg-[#a14000]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      sendToAll ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                  message.trim()
                    ? 'bg-gradient-to-r from-[#a14000] to-[#ea580c] text-white shadow-orange-600/10 hover:opacity-95'
                    : 'bg-gray-250 text-gray-400 shadow-none cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Broadcast Alert Now
              </button>
            </section>

          </div>

          {/* Right Column: Device Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Device Preview</h3>
            
            {/* Phone Frame Mockup */}
            <div className="relative w-[280px] h-[570px] mx-auto bg-[#1a1513] rounded-[40px] border-[8px] border-[#261812] overflow-hidden shadow-2xl flex flex-col">
              {/* Screen Content */}
              <div className="relative w-full h-full bg-[#121212] flex flex-col items-center pt-14 px-3.5">
                {/* Notch */}
                <div className="absolute top-0 w-28 h-5 bg-[#261812] rounded-b-xl left-1/2 -translate-x-1/2 z-20"></div>
                
                {/* Lockscreen Time */}
                <div className="text-white text-center mb-7 select-none mt-2">
                  <span className="text-4xl font-light tracking-tight">12:45</span>
                  <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Monday, October 24</p>
                </div>
                
                {/* Notification Card */}
                <motion.div
                  layout
                  className={`w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border-l-4 ${
                    category === 'emergency'
                      ? 'border-red-500'
                      : category === 'offer'
                      ? 'border-blue-500'
                      : category === 'hours'
                      ? 'border-amber-500'
                      : 'border-[#a14000]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${activeCategory.iconBg} flex items-center justify-center shrink-0`}>
                      <ActiveIcon className={`w-4 h-4 ${activeCategory.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-gray-800">McomMall</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Now</span>
                      </div>
                      <h4 className="font-bold text-[10px] text-gray-900 mt-0.5">{activeCategory.title}</h4>
                      <p className="text-[9px] text-gray-650 leading-normal line-clamp-3 mt-0.5 break-words">
                        {message.trim() || 'Start typing your message to see the preview...'}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Unlock hint bar */}
                <div className="absolute bottom-3 w-24 h-1 bg-white/30 rounded-full"></div>
              </div>
              
              {/* High Priority Emergency Pulsing Outer Border */}
              {category === 'emergency' && (
                <div className="absolute inset-0 border-4 border-red-500 rounded-[32px] pointer-events-none animate-pulse z-10" />
              )}
            </div>

            {/* Proximity / Reach Badge Info */}
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-[#e2bfb0]/25 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#a14000] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#a14000]">Visibility Reach</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Your message will appear as a high-priority push notification on all user devices within 10 seconds.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#e2bfb0]/20 relative z-10"
            >
              <div className="w-14 h-14 rounded-full bg-orange-100 text-[#a14000] flex items-center justify-center mx-auto border border-orange-200">
                <CheckCircle className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 font-display">Alert Sent!</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Your <strong>"{activeCategory.title}"</strong> alert has been successfully broadcast to{' '}
                  <strong>{sendToAll ? 'all 1,248' : 'selected'} active members</strong>.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="w-full py-2.5 bg-[#a14000] hover:bg-[#853400] text-white rounded-xl font-bold text-xs active:scale-95 transition-all shadow-md"
              >
                Back to Messages
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
