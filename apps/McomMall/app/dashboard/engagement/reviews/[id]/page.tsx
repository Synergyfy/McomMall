'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Clock,
  ArrowLeft,
  Share2,
  MoreVertical,
  History,
  ShoppingBag,
  Truck,
  MessageCircle,
  User,
  PlusCircle,
  AlertTriangle,
  Flag,
  Sparkles,
  Ticket,
  Send,
  X,
  Check
} from 'lucide-react';

interface TimelineItem {
  type: string;
  title: string;
  desc: string;
  icon: string;
  buttonText?: string;
  highlight?: boolean;
}

interface ReviewDetails {
  name: string;
  avatar: string;
  since: string;
  totalOrders: string;
  totalSpent: string;
  stars: number;
  time: string;
  title: string;
  text: string;
  images: string[];
  order: {
    number: string;
    items: string;
    itemsCost: string;
    shipping: string;
    total: string;
  };
  timeline: TimelineItem[];
  notes: string[];
  isHighPriority?: boolean;
}

const CUSTOMER_PROFILES: { [key: string]: ReviewDetails } = {
  'elara-vance': {
    name: 'Elara Vance',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLsIHnAk1Fo4u8yLJ6OdfQPNdd-pxGlUwJS3wb4u7upcKjqi0F_IJVAgbOMwYqzp_81D3bdUADtQxOjqOk-usTTTpJ_frzv7qVOz1rrdkO5ksMFzas6Frr0UQI0wpdeN90rGUQ1l6Vqgy-6qlUdW5GJGQiUfDsIr-t3JnwBlUZyETFQJYnYHtjZ1QMgD1AFQs9OkKOWv9yE_VgEdcCJqKUEcC9pBgW1rkknauWMcR9JWHKGRhCriu7l3tA',
    since: 'Loyal Customer since 2021',
    totalOrders: '24',
    totalSpent: '$1.2k',
    stars: 4,
    time: '2 days ago',
    title: '"Exceptional service with a minor hiccup on shipping."',
    text: "I absolutely loved the craftsmanship of the ceramic set I ordered! The warm orange glaze matches my kitchen perfectly. The only reason it's not a 5-star is because the delivery was delayed by three days. However, the customer support was incredibly empathetic and kept me updated throughout. I'll definitely be shopping here again!",
    images: [
      'https://lh3.googleusercontent.com/aida/AP1WRLthluLaBSdRoHW5kogNF6OqsJVnGL0CjEPHqS3xlcW6gx4I3uZ4fOpUkUVoYgeOzwB_x70oHsXp5Z8QuSvjkiCfRE_mBtVOCJpEURydQEplB_wTQ56O5U2Gn4HiaaKKAbtmkd2paWfF_zMhUojbM3kI8KK_YMZtKk87aPxW--lHACn-kOWPSe8eGS04mW1TH6bSh6H8M_--o1oWKUT3LDj0mytIpJv1YqOlu4yC7A1Tgq88GGWvaIsXjw',
      'https://lh3.googleusercontent.com/aida/AP1WRLthNJu7GyCv2GRPTOUU2BoY-T6PrPtSPXgWVywKpNQnBrdmwYatwXYMYHTsLVEcI1z6GW0hXI2jo3152bjaiHs79TTJUgL1suHIV_Pulqgd03DrK6TDoM1BMWGDx3ZgkKiolE7lqN0qAgIgAVfX95MUh2YZmskp0GVzSKXn5wSo9l5tYmlZvpw0f8nJx4XoTK9tJz99FMNT5HaXtlWJwLCpwteqi5SdjsXDsqJs5DLFJ9upCuxShFRzQYg'
    ],
    order: {
      number: '#SH-9821',
      items: 'Items (3)',
      itemsCost: '$89.00',
      shipping: 'Delayed',
      total: '$89.00'
    },
    timeline: [
      { type: 'order', title: 'Order #SH-9821 Placed', desc: 'Oct 12, 2023 • 2:45 PM', icon: 'shopping_bag' },
      { type: 'shipping', title: 'Delayed Shipping Notification Sent', desc: 'Oct 15, 2023 • 9:12 AM', icon: 'truck', buttonText: 'View Message' },
      { type: 'review', title: 'Review Submitted', desc: 'Yesterday • 10:30 AM', icon: 'rate_review', highlight: true }
    ],
    notes: [
      '"Customer called on Oct 16th about shipping. We issued a $10 credit to her account."'
    ]
  },
  'marcus-t': {
    name: 'Marcus T.',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtMPG7nBx-2oB2hFAk3ghnueoOXOK6h2wUXH-oobkttK0SwjLEKMuFkuIGggZGpBo6pA589VbKgMK98RqgMr4tNEF6kA3cUtyLcLai6Aw1sm8n71KCNpfXnlm_mRjqxp6W-2C0JJAc_Pu7Tl0Ma-dMb24T9_YpjnLjk-_6aJJUyr1JKwQ4C3UmffznCXISZSTC0im-dF3ZUK84XKNH_IxAosnKx7tq0jfuWFUvXfIU3acY2eb3RIqpSxg',
    since: 'Customer since 2023',
    totalOrders: '3',
    totalSpent: '$45',
    stars: 2,
    time: '5 hours ago',
    title: '"Delayed lunch delivery ruined my break schedule."',
    text: "The delivery was about 20 minutes late today. Usually everything is perfect, but this was a bit frustrating for my lunch break schedule.",
    images: [],
    order: {
      number: '#SH-9820',
      items: 'Lunch Bento Combo (1)',
      itemsCost: '$15.00',
      shipping: 'Delivered (Late)',
      total: '$18.00'
    },
    timeline: [
      { type: 'order', title: 'Order #SH-9820 Placed', desc: 'Today • 11:30 AM', icon: 'shopping_bag' },
      { type: 'shipping', title: 'Out for Delivery', desc: 'Today • 12:10 PM', icon: 'truck' },
      { type: 'shipping', title: 'Delivered (20m Late)', desc: 'Today • 12:50 PM', icon: 'truck', highlight: true },
      { type: 'review', title: 'Review Submitted', desc: 'Today • 3:00 PM', icon: 'rate_review', highlight: true }
    ],
    notes: [
      '"System flagged automatically as late delivery. Needs service recovery reachout."'
    ],
    isHighPriority: true
  },
  'sarah-j': {
    name: 'Sarah J.',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtmkk34qtcgaNp17ai7Fcqn6OZVvhqhm9IUCfUXuf4KMA0EhlIruFaAKvYEKlxVtfaGYzEm5CnuX_PQq9HQKwSKlh_ew6RWJrGpCsgt7xYQjvbJ_pyAGOWfcbEBx7HILEFaLSmK55HoqnIS3IYTzGjLv35LnqXQlOYGURQUrpzMPtcADBuLPstYwZbRLJghIfXddqJ1pZHadF0VNj-YfRnkjWC04QAv1NYcIdBfoYbktHWuQ8NRMkqN7gI',
    since: 'Loyal Customer since 2022',
    totalOrders: '42',
    totalSpent: '$2.1k',
    stars: 5,
    time: '2 hours ago',
    title: '"Truly a neighborhood gem with smooth curbside pickup!"',
    text: "The curbside pickup was incredibly smooth. I love how the staff recognized me and had my order ready before I even reached the door! Truly a neighborhood gem.",
    images: [],
    order: {
      number: '#SH-9822',
      items: 'Specialty Coffee Beans & Pastry (2)',
      itemsCost: '$28.00',
      shipping: 'Picked Up',
      total: '$28.00'
    },
    timeline: [
      { type: 'order', title: 'Order #SH-9822 Placed', desc: 'Today • 8:15 AM', icon: 'shopping_bag' },
      { type: 'shipping', title: 'Marked Ready for Pickup', desc: 'Today • 8:30 AM', icon: 'storefront' },
      { type: 'shipping', title: 'Curbside Pickup Completed', desc: 'Today • 8:42 AM', icon: 'storefront' },
      { type: 'review', title: 'Review Submitted', desc: 'Today • 10:45 AM', icon: 'rate_review', highlight: true }
    ],
    notes: [
      '"Sarah is a local regular. Staff rewarded her with a free sample of new espresso beans during curbside pickup."'
    ]
  }
};

const DEFAULT_PROFILE: ReviewDetails = {
  name: 'Elena R.',
  avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtFptcFQtpJXz6E7yE8mPo-XQ9mhhbkJThsR3-Y5zvA3_EyMOdk2IC3jJ1-tsqmc39w1JD_l5WjMINrUCEIGAuQXc_yDBVnUgzRn59Hot-FAspANZpHus2-h2QqnndhuK7A28NQX1pr83zfTpNmF75b6Mp2IMx3_cfI938Xzu7eQyMxEzOhttgVsJbkSIQgi-53Yf8pG09fkY6OH4Bo9YO8FeGjAd3x9yNkDAdEtlMHl24wcR8tdYQqgs0',
  since: 'Loyal Customer since 2022',
  totalOrders: '12',
  totalSpent: '$320',
  stars: 4,
  time: 'Yesterday',
  title: '"Loyalty reward program redeemed smoothly"',
  text: 'The new loyalty program is great. I just redeemed my first reward and it was so easy to use at checkout. Keep it up!',
  images: [],
  order: {
    number: '#SH-9819',
    items: 'Fresh Bakery Blend & Tea (2)',
    itemsCost: '$16.00',
    shipping: 'Completed',
    total: '$16.00'
  },
  timeline: [
    { type: 'order', title: 'Order #SH-9819 Placed', desc: 'Yesterday • 9:00 AM', icon: 'shopping_bag' },
    { type: 'shipping', title: 'Redeemed Free Pastry reward', desc: 'Yesterday • 9:15 AM', icon: 'ticket' },
    { type: 'review', title: 'Review Submitted', desc: 'Yesterday • 4:30 PM', icon: 'rate_review', highlight: true }
  ],
  notes: [
    '"Redeemed Silver Tier voucher. Transaction verified successfully."'
  ]
};

export default function ReviewDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Load correct customer data or default
  const profile = CUSTOMER_PROFILES[id] || DEFAULT_PROFILE;

  // Local States
  const [notes, setNotes] = useState<string[]>(profile.notes);
  const [newNote, setNewNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  
  const [replyText, setReplyText] = useState<string>('');
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);
  const [isReplied, setIsReplied] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, `"${newNote.trim()}"`]);
    setNewNote('');
    setShowNoteInput(false);
    triggerToast('Internal note saved!');
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setIsReplied(true);
    setShowReplyModal(false);
    setReplyText('');
    triggerToast(`Response sent successfully to ${profile.name}!`);
  };

  // Rendering Helper for Timeline Icons
  const getTimelineIcon = (icon: string) => {
    switch (icon) {
      case 'shopping_bag':
        return <ShoppingBag className="w-4 h-4 text-[#a23f00]" />;
      case 'local_shipping':
      case 'truck':
        return <Truck className="w-4 h-4 text-[#a23f00]" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#a23f00]" />;
      default:
        return <MessageCircle className="w-4 h-4 text-[#a23f00]" />;
    }
  };

  return (
    <div className="mcommall-onboarding -mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full bg-[#fff8f6] text-[#261812] pb-32">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] flex items-center gap-2 bg-[#a23f00] text-white px-4 py-3 rounded-xl shadow-xl animate-fade-in duration-300">
          <Sparkles className="w-4 h-4 text-orange-200" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full sticky top-0 z-30 bg-[#fff8f6]/95 backdrop-blur-md shadow-[0_4px_12px_rgba(162,63,0,0.05)] border-b border-[#e2bfb0]/20 flex justify-between items-center px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/engagement/reviews')}
            className="p-1 rounded-full hover:bg-[#ffeae1] text-[#a23f00] active:scale-95 duration-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-[#a23f00] tracking-tight">Review Details</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerToast('Share link copied!')}
            className="p-2 rounded-full hover:bg-[#ffeae1] text-[#5a4136] transition-colors"
            title="Share Review"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-[#ffeae1] text-[#5a4136] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: Review card & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Review Card */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_12px_rgba(162,63,0,0.05)] border border-[#e2bfb0]/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < profile.stars ? 'fill-[#a23f00] text-[#a23f00]' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#5a4136] bg-[#ffeae1] px-2 py-0.5 rounded-md">
                  {profile.time}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-[#261812] mb-3">
                {profile.title}
              </h2>
              
              <p className="text-xs sm:text-sm text-[#5a4136] leading-relaxed">
                {profile.text}
              </p>

              {/* Review Glaze Glaze Glaze Glaze Glaze Images */}
              {profile.images && profile.images.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {profile.images.map((imgSrc, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-[#e2bfb0]/30 hover:scale-105 transition-transform duration-200 shadow-sm shrink-0">
                      <img className="w-full h-full object-cover" src={imgSrc} alt={`Review attachments ${idx}`} />
                    </div>
                  ))}
                </div>
              )}

              {profile.isHighPriority && (
                <div className="mt-5 flex items-center gap-1.5 bg-[#ffdad6] text-[#ba1a1a] px-3 py-2 rounded-xl border border-red-200/50">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">High Priority Response Needed</span>
                </div>
              )}

              {isReplied && (
                <div className="mt-5 p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-green-800">Your Response Sent</p>
                    <p className="text-xs text-green-700 mt-1 leading-relaxed italic">
                      Response has been successfully published to customer dashboard and public local directory.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Engagement History Timeline */}
            <section className="bg-[#ffeae1]/30 rounded-2xl p-5 border border-[#e2bfb0]/15 space-y-4">
              <h3 className="font-extrabold text-sm text-[#261812] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#a23f00]" />
                Engagement History
              </h3>
              
              <div className="relative pl-2 space-y-5">
                {/* Timeline Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#e2bfb0]/40"></div>

                {profile.timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-8 flex gap-3">
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#fff8f6] z-10 shadow-sm ${
                      item.highlight ? 'bg-[#a23f00] text-white' : 'bg-[#ffeae1] text-[#a23f00]'
                    }`}>
                      {item.highlight ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        getTimelineIcon(item.icon)
                      )}
                    </div>
                    <div className={`flex-1 bg-white p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#e2bfb0]/10 ${
                      item.highlight ? 'border-l-4 border-l-[#a23f00]' : ''
                    }`}>
                      <p className="text-xs font-bold text-[#261812]">{item.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      {item.buttonText && (
                        <button
                          onClick={() => triggerToast(`Displaying shipping dispatch document ${profile.order.number}`)}
                          className="mt-2 text-[10px] font-bold text-[#a23f00] hover:underline flex items-center gap-1"
                        >
                          {item.buttonText} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Side: Customer info & Notes */}
          <div className="space-y-6">
            
            {/* Customer Details Card */}
            <section className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/20 text-center shadow-[0_4px_12px_rgba(162,63,0,0.03)]">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                <img className="w-full h-full object-cover" src={profile.avatar} alt={profile.name} />
              </div>
              <h3 className="font-extrabold text-sm text-[#261812]">{profile.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{profile.since}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                <div className="bg-[#ffeae1]/40 p-2.5 rounded-xl border border-[#e2bfb0]/10">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <span className="text-base font-extrabold text-[#a23f00]">{profile.totalOrders}</span>
                </div>
                <div className="bg-[#ffeae1]/40 p-2.5 rounded-xl border border-[#e2bfb0]/10">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
                  <span className="text-base font-extrabold text-[#a23f00]">{profile.totalSpent}</span>
                </div>
              </div>

              <button
                onClick={() => triggerToast(`Opening customer details page for ${profile.name}`)}
                className="w-full mt-4 py-2.5 bg-[#ffeae1] text-[#a23f00] font-bold text-xs rounded-xl hover:bg-[#fee3d8] transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" />
                View Customer Profile
              </button>
            </section>

            {/* Related Order Card */}
            <section className="bg-[#ffeae1]/40 p-5 rounded-2xl border border-[#e2bfb0]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#a23f00]/10 flex items-center justify-center text-[#a23f00]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Related Order</p>
                  <p className="text-xs font-bold text-[#261812]">{profile.order.number}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">{profile.order.items}</span>
                  <span className="text-[#261812] font-semibold">{profile.order.itemsCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className={`font-semibold ${
                    profile.order.shipping.toLowerCase().includes('delay') ? 'text-[#ba1a1a]' : 'text-green-600'
                  }`}>{profile.order.shipping}</span>
                </div>
                <div className="pt-2 border-t border-[#e2bfb0]/20 mt-2 flex justify-between items-baseline">
                  <span className="font-bold text-[#261812]">Total</span>
                  <span className="text-base font-extrabold text-[#a23f00]">{profile.order.total}</span>
                </div>
              </div>
            </section>

            {/* Internal notes */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/20 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#5a4136] flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-[#a23f00]" />
                  Internal Staff Notes
                </h4>
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="text-[#a23f00] hover:text-[#a23f00]/80 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((note, index) => (
                    <div key={index} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-[#5a4136] italic leading-relaxed">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No notes logged for this review.</p>
              )}

              {showNoteInput && (
                <div className="pt-2 border-t border-slate-100 space-y-2 animate-fade-in">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="w-full bg-[#fff8f6] p-2 text-xs rounded-lg border border-[#e2bfb0]/40 focus:outline-none focus:ring-1 focus:ring-[#a23f00]"
                    placeholder="Type notes to attach..."
                    rows={2}
                  ></textarea>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setNewNote('');
                      }}
                      className="px-2.5 py-1 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1 bg-[#a23f00] text-white font-bold text-[10px] rounded-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>

        </div>

      </main>

      {/* Bottom Action Bar (Fixed mobile first) */}
      <footer className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white shadow-[0_-4px_12px_rgba(162,63,0,0.08)] border-t border-[#e2bfb0]/30 py-3.5 px-4 md:px-8">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => triggerToast('Review flagged for investigation.')}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#5a4136] text-xs font-bold transition-all active:scale-95"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
            
            <button
              onClick={() => triggerToast('Review highlighted on local storefront.')}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-[#a23f00] text-[#a23f00] hover:bg-[#ffeae1]/30 text-xs font-bold transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Highlight</span>
            </button>
            
            <button
              onClick={() => triggerToast('Voucher coupon created and sent for customer outreach.')}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100/50 text-xs font-bold transition-all active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offer Resolution</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (isReplied) {
                triggerToast('Reply already submitted for this review.');
              } else {
                setShowReplyModal(true);
              }
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
              isReplied ? 'bg-green-600' : 'bg-[#a23f00] hover:brightness-110'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {isReplied ? 'Replied' : 'Reply to Review'}
          </button>
        </div>
      </footer>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 border border-[#e2bfb0]/20">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-sm text-[#a23f00] flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Reply to {profile.name}
              </h4>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="w-full bg-[#fff8f6] p-3 text-xs sm:text-sm rounded-xl border border-[#e2bfb0]/40 focus:outline-none focus:ring-1 focus:ring-[#a23f00] text-[#261812] placeholder:text-[#5a4136]/40"
              placeholder={`Write response to ${profile.name}...`}
              rows={4}
            ></textarea>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#5a4136] font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                className="px-5 py-2 bg-[#a23f00] text-white font-bold text-xs rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
