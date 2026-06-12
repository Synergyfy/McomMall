'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Send,
  CheckCircle,
  Tag,
  MapPin,
  Calendar,
  History,
  Eye,
} from 'lucide-react';

const audiences = [
  {
    id: 'loyalty',
    icon: Tag,
    label: 'Loyalty Tier',
    sub: 'Top 10% spenders',
    iconBg: 'bg-orange-100',
    iconColor: 'text-[#a14000]',
  },
  {
    id: 'nearby',
    icon: MapPin,
    label: 'Nearby Users',
    sub: 'Within 2.5 miles',
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#00629f]',
  },
  {
    id: 'events',
    icon: Calendar,
    label: 'Event Attendees',
    sub: "Last weekend's gala",
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#a14000]',
  },
  {
    id: 'inactive',
    icon: History,
    label: 'Inactive',
    sub: '30+ days away',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
];

export default function SendTargetedOfferPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['loyalty']);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleAudience = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (!title.trim()) return;
    setIsSuccess(true);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/promotions');
  };

  const previewTitle = title || 'Weekend Flash Sale - 20% Off';
  const previewMessage =
    message ||
    'Your message will appear here. Craft a welcoming offer for your customers...';

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK ── */}
        <div className="flex items-center">
          <Link
            href="/dashboard/promotions"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
        </div>

        {/* ── HEADER ── */}
        <section className="space-y-1">
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Send Offer</h2>
          <p className="text-xs text-gray-500">
            Create and broadcast a targeted promotion to your community.
          </p>
        </section>

        {/* ── SELECT AUDIENCE ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#a14000]">
              Select Audience
            </p>
            <span className="text-[10px] font-bold text-[#7b2f00] bg-[#ffdbcc] px-2 py-0.5 rounded-full">
              {selected.length} Target{selected.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {audiences.map((aud) => {
              const Icon = aud.icon;
              const isActive = selected.includes(aud.id);
              return (
                <motion.button
                  key={aud.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleAudience(aud.id)}
                  className={`relative p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all duration-200 ${
                    isActive
                      ? 'border-[#a14000] bg-[#fff8f5] shadow-[0_4px_12px_rgba(161,64,0,0.1)]'
                      : 'border-[#f7ece7] bg-white hover:border-[#e2bfb0]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${aud.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${aud.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{aud.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{aud.sub}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#a14000] flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── OFFER CONTENT FORM ── */}
        <section className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              Offer Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Flash Sale - 20% Off"
              className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Craft a welcoming message for your customers..."
              className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 font-medium placeholder:text-gray-400 resize-none transition-all"
            />
          </div>

          {/* Live preview card */}
          <div className="bg-[#fff8f5] rounded-xl p-4 border border-dashed border-[#e2bfb0] flex gap-3 items-start">
            <div className="w-14 h-14 rounded-xl bg-[#ffdbcc] flex items-center justify-center shrink-0 overflow-hidden">
              <Eye className="w-6 h-6 text-[#a14000]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-[#a14000] tracking-wider">
                Live Preview
              </p>
              <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
                {previewTitle}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                {previewMessage}
              </p>
            </div>
          </div>
        </section>

        {/* ── SEND BUTTON ── */}
        <button
          onClick={handleSend}
          disabled={!title.trim() || selected.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
            title.trim() && selected.length > 0
              ? 'bg-gradient-to-r from-[#a14000] to-[#ea580c] text-white shadow-orange-600/20 hover:opacity-95'
              : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          Send Targeted Offer
        </button>

      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSuccessClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative z-10 border border-[#f7ece7]"
            >
              <div className="w-14 h-14 rounded-full bg-orange-100 text-[#a14000] flex items-center justify-center mx-auto border border-orange-200">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Offer Sent!</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  <strong>"{previewTitle}"</strong> has been broadcast to{' '}
                  <strong>{selected.length} audience group{selected.length !== 1 ? 's' : ''}</strong> successfully.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="w-full py-2.5 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Back to Campaigns
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
