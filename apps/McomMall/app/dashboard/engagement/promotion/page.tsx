'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Send,
  Target,
  Clock,
  Eye,
  Store,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';

export default function CreateNewPromotionPage() {
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [url, setUrl] = useState('');
  const [audience, setAudience] = useState('All');
  const [borough, setBorough] = useState('All Boroughs');
  const [sendImmediately, setSendImmediately] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Interface state
  const [isSuccess, setIsSuccess] = useState(false);

  // Preview fallbacks
  const previewTitle = title || 'Weekend Flash Sale!';
  const previewMessage = message || 'Describe your offer in detail... This is how your message will appear to your customers on their mobile devices.';
  const previewCta = ctaText || 'Shop Now';

  const handleLaunch = () => {
    if (!title.trim() || !message.trim()) return;
    setIsSuccess(true);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/engagement');
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden bg-[#fff8f5] text-[#1f1b18] pb-28">
      <div className="w-full px-4 pt-5 space-y-6 min-w-0">
        
        {/* ── BACK BUTTON ── */}
        <div className="flex items-center">
          <Link
            href="/dashboard/engagement"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Engagement
          </Link>
        </div>

        {/* ── HEADER ── */}
        <section className="space-y-1">
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Create New Promotion</h2>
          <p className="text-xs text-gray-500">
            Reach your customers with a fresh neighborhood offer.
          </p>
        </section>

        {/* ── GRID LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Settings */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Promotion Details */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#a14000]">Promotion Details</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400">Promotion Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekend Flash Sale!"
                  className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400">Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your offer in detail..."
                  className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Shop Now"
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400">Offer Link</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://mcommall.com/deal"
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Targeting */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#a14000] flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Targeting
              </h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Audience Segment</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'VIP', 'Nearby'].map((seg) => {
                    const isActive = audience === seg;
                    return (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => setAudience(seg)}
                        className={`px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 ${
                          isActive
                            ? 'bg-[#a14000] text-white shadow-md'
                            : 'border border-[#e2bfb0] text-gray-500 hover:bg-orange-50/20 bg-white'
                        }`}
                      >
                        {seg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400">Borough Selector</label>
                <select
                  value={borough}
                  onChange={(e) => setBorough(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-850 font-medium transition-all"
                >
                  <option>All Boroughs</option>
                  <option>Manhattan</option>
                  <option>Brooklyn</option>
                  <option>Queens</option>
                  <option>The Bronx</option>
                  <option>Staten Island</option>
                </select>
              </div>
            </section>

            {/* Scheduling */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#a14000] flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Scheduling
              </h3>

              <div className="flex items-center justify-between p-3.5 bg-[#fff8f5] rounded-xl border border-[#e2bfb0]/10">
                <span className="text-xs font-bold text-gray-800">Send Immediately</span>
                <button
                  type="button"
                  onClick={() => setSendImmediately(!sendImmediately)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    sendImmediately ? 'bg-[#a14000]' : 'bg-gray-250'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      sendImmediately ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!sendImmediately && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-black uppercase text-gray-400">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all"
                  />
                </div>
              )}
            </section>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLaunch}
                disabled={!title.trim() || !message.trim()}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-lg ${
                  title.trim() && message.trim()
                    ? 'bg-gradient-to-r from-[#a14000] to-[#ea580c] text-white shadow-orange-600/10 hover:opacity-95'
                    : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" /> Launch Promotion
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/engagement')}
                className="px-6 py-3.5 rounded-xl border-2 border-[#e2bfb0] text-gray-600 font-bold text-xs hover:bg-orange-50/20 active:scale-95 transition-all bg-white"
              >
                Cancel
              </button>
            </div>

          </div>

          {/* Right Column: Real-time Device Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Real-time Preview</h3>
            
            {/* Phone Frame Mockup */}
            <div className="relative w-[280px] h-[570px] mx-auto bg-[#1a1513] rounded-[40px] border-[8px] border-[#261812] overflow-hidden shadow-2xl flex flex-col">
              {/* Screen Content */}
              <div className="relative w-full h-full bg-[#fff8f5] flex flex-col pt-12">
                {/* Notch */}
                <div className="absolute top-0 w-28 h-5 bg-[#261812] rounded-b-xl left-1/2 -translate-x-1/2 z-20"></div>
                
                {/* App Top Bar */}
                <div className="px-3.5 py-2.5 border-b border-[#e2bfb0]/25 flex items-center gap-2 bg-white">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Store className="w-3.5 h-3.5 text-[#a14000]" />
                  </div>
                  <span className="font-bold text-[10px] text-gray-800">Your Store</span>
                </div>
                
                {/* Scrollable Message Content */}
                <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto no-scrollbar">
                  
                  {/* Promo Image Cover */}
                  <div className="w-full aspect-square bg-[#ffeae1] rounded-xl overflow-hidden relative shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Artisanal Boutique Interior"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida/AP1WRLutIqbKf0_GKgJmgdcZzq6q4HL4kO49BcvytFTbMombX65nYbEapymR9jfHsLYVgkPQyrDF1Eeu5bBppJNMQ02EaID7raVI3v22GHP2HkWqIvJr2J3Yccy6piFCdIu4CyI8i6Suy0iYV8Xt8G5CynODbkZ2Q1EUb4gLXo6xbtvXDOXrwHa99s8WorYMOGFJ_kcvThhwPnHSGfffoDEpoMsvC9SkO6u1kPspoSTA3qt4yQiHhyOEo6qvjQ"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent h-16" />
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 bg-[#ff6904] text-white rounded font-black text-[7px] uppercase tracking-wider shadow-sm">
                        Limited Offer
                      </span>
                    </div>
                  </div>

                  {/* Promo details */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-900 leading-tight break-words">
                      {previewTitle}
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed break-words font-medium">
                      {previewMessage}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    disabled
                    className="w-full py-2.5 bg-[#a14000] text-white rounded-lg font-bold text-[10px] shadow-sm select-none opacity-90"
                  >
                    {previewCta}
                  </button>

                </div>

                {/* Unlock hint bar */}
                <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto my-3 shrink-0"></div>
              </div>
            </div>

            {/* Preview Reach Stats Gauge */}
            <div className="bg-[#fff1eb]/70 p-4 rounded-2xl border border-[#e2bfb0]/25 space-y-2">
              <div className="flex items-center gap-1.5 text-[#a14000]">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Estimated Reach</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-bold font-display text-[#a1450a]">12,450</span>
                <span className="text-[10px] text-gray-500 font-semibold">Customers</span>
              </div>
              <div className="w-full bg-[#f7ece7] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#a14000] h-full w-[65%]" />
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
                <h3 className="font-bold text-lg text-gray-900 font-display">Promotion Launched!</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Your promotional campaign <strong>"{previewTitle}"</strong> has been successfully set up for broadcast targeting <strong>{audience}</strong> customers.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="w-full py-2.5 bg-[#a14000] hover:bg-[#853400] text-white rounded-xl font-bold text-xs active:scale-95 transition-all shadow-md"
              >
                Back to Engagement
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
