'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
  MapPin,
  Filter,
  Volume2,
  AlertCircle,
  Clock,
  Sparkles,
  Share2,
  Trash2,
  RotateCcw,
  Check,
  Send,
  X,
  Award
} from 'lucide-react';

// Interfaces
interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  time: string;
  text: string;
  tags: string[];
  borough: string;
  isEventRelated: boolean;
  replied: boolean;
  replyText?: string;
  isHighPriority?: boolean;
  featured?: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'sarah-j',
    name: 'Sarah J.',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtmkk34qtcgaNp17ai7Fcqn6OZVvhqhm9IUCfUXuf4KMA0EhlIruFaAKvYEKlxVtfaGYzEm5CnuX_PQq9HQKwSKlh_ew6RWJrGpCsgt7xYQjvbJ_pyAGOWfcbEBx7HILEFaLSmK55HoqnIS3IYTzGjLv35LnqXQlOYGURQUrpzMPtcADBuLPstYwZbRLJghIfXddqJ1pZHadF0VNj-YfRnkjWC04QAv1NYcIdBfoYbktHWuQ8NRMkqN7gI',
    rating: 5,
    time: '2 hours ago',
    text: 'The curbside pickup was incredibly smooth. I love how the staff recognized me and had my order ready before I even reached the door! Truly a neighborhood gem.',
    tags: ['#LocalFavorite', '#Service'],
    borough: 'North Borough',
    isEventRelated: false,
    replied: false,
    featured: true,
  },
  {
    id: 'marcus-t',
    name: 'Marcus T.',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtMPG7nBx-2oB2hFAk3ghnueoOXOK6h2wUXH-oobkttK0SwjLEKMuFkuIGggZGpBo6pA589VbKgMK98RqgMr4tNEF6kA3cUtyLcLai6Aw1sm8n71KCNpfXnlm_mRjqxp6W-2C0JJAc_Pu7Tl0Ma-dMb24T9_YpjnLjk-_6aJJUyr1JKwQ4C3UmffznCXISZSTC0im-dF3ZUK84XKNH_IxAosnKx7tq0jfuWFUvXfIU3acY2eb3RIqpSxg',
    rating: 2,
    time: '5 hours ago',
    text: 'The delivery was about 20 minutes late today. Usually everything is perfect, but this was a bit frustrating for my lunch break schedule.',
    tags: ['#Delivery'],
    borough: 'South Borough',
    isEventRelated: false,
    replied: false,
    isHighPriority: true,
  },
  {
    id: 'elena-r',
    name: 'Elena R.',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtFptcFQtpJXz6E7yE8mPo-XQ9mhhbkJThsR3-Y5zvA3_EyMOdk2IC3jJ1-tsqmc39w1JD_l5WjMINrUCEIGAuQXc_yDBVnUgzRn59Hot-FAspANZpHus2-h2QqnndhuK7A28NQX1pr83zfTpNmF75b6Mp2IMx3_cfI938Xzu7eQyMxEzOhttgVsJbkSIQgi-53Yf8pG09fkY6OH4Bo9YO8FeGjAd3x9yNkDAdEtlMHl24wcR8tdYQqgs0',
    rating: 4,
    time: 'Yesterday',
    text: 'The new loyalty program is great. I just redeemed my first reward and it was so easy to use at checkout. Keep it up!',
    tags: ['#Loyalty', '#Service'],
    borough: 'North Borough',
    isEventRelated: false,
    replied: true,
    replyText: 'Thank you Elena! We are thrilled to hear you are enjoying the rewards program. We appreciate your loyalty!',
  },
  {
    id: 'elara-vance',
    name: 'Elara Vance',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLsIHnAk1Fo4u8yLJ6OdfQPNdd-pxGlUwJS3wb4u7upcKjqi0F_IJVAgbOMwYqzp_81D3bdUADtQxOjqOk-usTTTpJ_frzv7qVOz1rrdkO5ksMFzas6Frr0UQI0wpdeN90rGUQ1l6Vqgy-6qlUdW5GJGQiUfDsIr-t3JnwBlUZyETFQJYnYHtjZ1QMgD1AFQs9OkKOWv9yE_VgEdcCJqKUEcC9pBgW1rkknauWMcR9JWHKGRhCriu7l3tA',
    rating: 4,
    time: '2 days ago',
    text: "I absolutely loved the craftsmanship of the ceramic set I ordered! The warm orange glaze matches my kitchen perfectly. The only reason it's not a 5-star is because the delivery was delayed by three days. However, the customer support was incredibly empathetic and kept me updated throughout.",
    tags: ['#Ceramics', '#Support'],
    borough: 'West Borough',
    isEventRelated: true,
    replied: false,
  }
];

export default function EngagementReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'recent'>('all');
  const [selectedBorough, setSelectedBorough] = useState<string>('All');
  const [eventOnly, setEventOnly] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // States for inline replying
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  // Social Media Post Generator State
  const [socialModal, setSocialModal] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');

  // Dropdowns
  const [showBoroughDropdown, setShowBoroughDropdown] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Reply submit handlers
  const handleSendResponse = (id: string, text: string) => {
    if (!text.trim()) return;
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, replied: true, replyText: text, isHighPriority: false };
        }
        return r;
      })
    );
    setReplyInputs(prev => ({ ...prev, [id]: '' }));
    setActiveReplyBox(null);
    triggerToast(`Reply sent successfully to ${reviews.find(r => r.id === id)?.name}!`);
  };

  // Feature toggle
  const toggleFeature = (id: string) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newState = !r.featured;
          triggerToast(newState ? 'Review featured on public profile!' : 'Review removed from featured.');
          return { ...r, featured: newState };
        }
        return r;
      })
    );
  };

  // Social Post Generator Logic
  const handleGenerateSocialPost = () => {
    // Pick the highest rated reviews
    const goodReviews = reviews.filter(r => r.rating >= 4);
    if (goodReviews.length === 0) {
      triggerToast('No highly-rated reviews to generate a post from!');
      return;
    }
    const randomReview = goodReviews[Math.floor(Math.random() * goodReviews.length)];
    const postText = `✨ Customer Love Alert! ✨\n\n"${randomReview.text}"\n\n— ${randomReview.name} (${randomReview.borough})\n\nThank you for supporting our local business! We love serving our community. 🧡\n\n#ShopLocal #McomMall #CommunityFirst`;
    setGeneratedPost(postText);
    setSocialModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    triggerToast('Post copied to clipboard!');
    setSocialModal(false);
  };

  // Reset reviews to original
  const handleResetReviews = () => {
    setReviews(INITIAL_REVIEWS);
    triggerToast('Review list reset to initial state.');
  };

  // Clear reviews to test empty state
  const handleClearReviews = () => {
    setReviews([]);
    triggerToast('All reviews cleared.');
  };

  // Filters logic
  const filteredReviews = reviews.filter(r => {
    // Star filter
    if (filter === 'positive' && r.rating < 4) return false;
    if (filter === 'negative' && r.rating >= 4) return false;
    // Recent filter (say, within hours ago)
    if (filter === 'recent' && !r.time.includes('hour') && !r.time.includes('mins')) return false;

    // Borough filter
    if (selectedBorough !== 'All' && r.borough !== selectedBorough) return false;

    // Event filter
    if (eventOnly && !r.isEventRelated) return false;

    return true;
  });

  // Calculations
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const unansweredCount = reviews.filter(r => !r.replied).length;

  const totalReviewsCount = reviews.length;

  const getDistributionPct = (stars: number) => {
    if (reviews.length === 0) return '0%';
    const count = reviews.filter(r => r.rating === stars).length;
    return `${Math.round((count / reviews.length) * 100)}%`;
  };

  return (
    <div className="mcommall-onboarding -mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full bg-[#fff8f6] text-[#261812] pb-24">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] flex items-center gap-2 bg-[#a23f00] text-white px-4 py-3 rounded-xl shadow-xl animate-fade-in duration-300">
          <Sparkles className="w-4 h-4 text-orange-200" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Dashboard Title Header & Quick Reset controls */}
        <header className="flex justify-between items-center border-b border-[#e2bfb0]/30 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#a23f00]">Reviews & Ratings Dashboard</h1>
            <p className="text-xs text-[#5a4136]">Monitor reputation, respond to feedback, and share social proof.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetReviews}
              title="Reset Mock Data"
              className="p-2 rounded-lg bg-white border border-[#e2bfb0] text-[#5a4136] hover:bg-[#ffeae1] active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearReviews}
              title="Clear All (Empty State Test)"
              className="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {reviews.length > 0 ? (
          <>
            {/* Dashboard Hero / Key Metrics Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Overall Rating card */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgba(162,63,0,0.05)] border border-[#e2bfb0]/20 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#5a4136] mb-1">Overall Reputation</p>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-4xl font-extrabold text-[#a23f00]">{averageRating}</h2>
                      <span className="text-xs text-[#5a4136] font-semibold">/5</span>
                    </div>
                  </div>
                  <div className="bg-[#ffeae1] p-3 rounded-full">
                    <Star className="w-6 h-6 text-[#a23f00] fill-[#a23f00]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="flex text-[#a23f00]">
                      {[1, 2, 3, 4].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-[#a23f00] text-[#a23f00]" />
                      ))}
                      <Star className="w-3.5 h-3.5 text-[#a23f00] fill-[#a23f00]" style={{ opacity: 0.8 }} />
                    </div>
                    <span className="text-[10px] text-[#5a4136] font-medium">Based on {totalReviewsCount} reviews</span>
                  </div>
                  <p className="text-[11px] text-[#a23f00] font-medium italic">“Highest rating in your local borough this month!”</p>
                </div>
              </div>

              {/* Urgent Metric: Unanswered */}
              <div className="bg-[#ffdad6] p-5 rounded-2xl shadow-[0_4px_12px_rgba(162,63,0,0.05)] border border-[#ba1a1a]/10 flex flex-col justify-center items-center text-center hover:translate-y-[-2px] transition-transform duration-200">
                <AlertCircle className="w-8 h-8 text-[#ba1a1a] mb-2" />
                <h3 className="text-3xl font-extrabold text-[#93000a]">{unansweredCount}</h3>
                <p className="text-xs font-bold text-[#93000a] mt-0.5">Unanswered Reviews</p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setEventOnly(false);
                    setSelectedBorough('All');
                    triggerToast('Showing all reviews. Urgent alerts are flagged below.');
                  }}
                  className="mt-3 text-[10px] font-bold text-[#ba1a1a] border border-[#ba1a1a]/20 px-3 py-1 rounded-full bg-white hover:bg-red-50 transition-colors"
                >
                  Take Action
                </button>
              </div>

              {/* Trend Indicator */}
              <div className="bg-[#e8f4fd] p-5 rounded-2xl shadow-[0_4px_12px_rgba(162,63,0,0.05)] border border-[#00629f]/10 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200">
                <div>
                  <p className="text-xs font-bold text-[#5a4136]">Sentiment Trend</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-5 h-5 text-[#00629f]" />
                    <span className="text-xl font-bold text-[#00629f]">+14%</span>
                  </div>
                </div>
                {/* Sentiment Trend Mini Bar Chart */}
                <div className="h-12 flex items-end gap-1.5 mt-4">
                  <div className="flex-1 bg-[#00629f]/20 h-1/2 rounded-t-sm" title="Week 1: 50%"></div>
                  <div className="flex-1 bg-[#00629f]/30 h-2/3 rounded-t-sm" title="Week 2: 66%"></div>
                  <div className="flex-1 bg-[#00629f]/40 h-3/4 rounded-t-sm" title="Week 3: 75%"></div>
                  <div className="flex-1 bg-[#00629f]/20 h-1/2 rounded-t-sm" title="Week 4: 50%"></div>
                  <div className="flex-1 bg-[#00629f]/60 h-5/6 rounded-t-sm" title="Week 5: 83%"></div>
                  <div className="flex-1 bg-[#00629f]/80 h-full rounded-t-sm" title="Week 6: 100%"></div>
                  <div className="flex-1 bg-[#00629f] h-[90%] rounded-t-sm" title="Week 7: 90%"></div>
                </div>
              </div>
            </section>

            {/* Filters Bar */}
            <section className="flex flex-wrap items-center gap-2 bg-[#ffeae1]/60 p-2 rounded-2xl border border-[#e2bfb0]/20 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-[#a23f00] text-white shadow-md' : 'border border-[#e2bfb0]/50 text-[#5a4136] hover:bg-[#ffeae1]'}`}
              >
                All Feed
              </button>
              <button
                onClick={() => setFilter('positive')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'positive' ? 'bg-[#a23f00] text-white shadow-md' : 'border border-[#e2bfb0]/50 text-[#5a4136] hover:bg-[#ffeae1]'}`}
              >
                Positive
              </button>
              <button
                onClick={() => setFilter('negative')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'negative' ? 'bg-[#a23f00] text-white shadow-md' : 'border border-[#e2bfb0]/50 text-[#5a4136] hover:bg-[#ffeae1]'}`}
              >
                Negative
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'recent' ? 'bg-[#a23f00] text-white shadow-md' : 'border border-[#e2bfb0]/50 text-[#5a4136] hover:bg-[#ffeae1]'}`}
              >
                Recent
              </button>

              <div className="h-6 w-[1px] bg-[#e2bfb0]/40 mx-1"></div>

              {/* Borough Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowBoroughDropdown(!showBoroughDropdown)}
                  className="px-4 py-1.5 border border-[#e2bfb0]/50 text-[#5a4136] font-bold text-xs rounded-full hover:bg-[#ffeae1] flex items-center gap-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#a23f00]" />
                  <span>Borough: {selectedBorough}</span>
                  <span className="text-[10px] opacity-75">▼</span>
                </button>
                {showBoroughDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-[#e2bfb0]/30 rounded-xl shadow-xl z-30 p-1">
                    {['All', 'North Borough', 'South Borough', 'West Borough'].map(b => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBorough(b);
                          setShowBoroughDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${selectedBorough === b ? 'bg-[#ffeae1] text-[#a23f00] font-bold' : 'hover:bg-slate-50 text-[#261812]'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Event-related Toggle */}
              <button
                onClick={() => setEventOnly(!eventOnly)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${eventOnly ? 'bg-[#ff9969] text-[#351000] border border-[#ff9969]' : 'border border-[#e2bfb0]/50 text-[#5a4136] hover:bg-[#ffeae1]'}`}
              >
                <span>Event-related</span>
                <Filter className="w-3 h-3" />
              </button>
            </section>

            {/* Main Dashboard Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Latest Reviews List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-baseline mb-1 px-1">
                  <h3 className="text-sm font-extrabold text-[#261812]">
                    Latest Customer Feedback ({filteredReviews.length})
                  </h3>
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSelectedBorough('All');
                      setEventOnly(false);
                    }}
                    className="text-xs font-bold text-[#a23f00] hover:underline"
                  >
                    Reset filters
                  </button>
                </div>

                {filteredReviews.length > 0 ? (
                  filteredReviews.map(r => (
                    <div
                      key={r.id}
                      className={`bg-white p-5 rounded-2xl border transition-all duration-200 relative ${
                        r.isHighPriority
                          ? 'border-red-400 bg-red-50/20 shadow-[0_4px_12px_rgba(239,68,68,0.05)]'
                          : 'border-[#e2bfb0]/20 shadow-[0_2px_8px_rgba(162,63,0,0.03)] hover:shadow-[0_8px_20px_rgba(162,63,0,0.07)]'
                      }`}
                    >
                      {/* Featured Star Badge */}
                      {r.featured && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
                          <Award className="w-3 h-3 fill-white" />
                          <span>Featured</span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#e2bfb0]/20">
                          <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Contents */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              {/* Customer name links to details page */}
                              <Link
                                href={`/dashboard/engagement/reviews/${r.id}`}
                                className="font-extrabold text-sm text-[#261812] hover:text-[#a23f00] hover:underline transition-colors flex items-center gap-1.5"
                              >
                                {r.name}
                                <span className="text-[10px] font-normal text-slate-400 no-underline hover:no-underline">
                                  (Click for details)
                                </span>
                              </Link>
                              
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < r.rating ? 'fill-[#a23f00] text-[#a23f00]' : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{r.time}</span>
                          </div>

                          <p className="mt-3 text-xs sm:text-sm text-[#5a4136] leading-relaxed">
                            {r.text}
                          </p>

                          {/* Tags / Meta */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {r.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-[#ffeae1] text-[#a23f00] text-[10px] font-bold rounded-md">
                                {t}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                              <MapPin className="w-3 h-3" />
                              {r.borough}
                            </span>
                          </div>

                          {/* Priority flag */}
                          {r.isHighPriority && (
                            <div className="mt-3 flex items-center gap-1 bg-[#ffdad6] text-[#ba1a1a] px-3 py-1.5 rounded-xl border border-red-200/50 animate-pulse">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span className="text-[10px] font-extrabold uppercase">High Priority Response Needed</span>
                            </div>
                          )}

                          {/* Replied text if exists */}
                          {r.replied && r.replyText && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-2">
                              <MessageCircle className="w-4 h-4 text-[#a23f00] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold text-[#261812]">Your Response</p>
                                <p className="text-xs text-[#5a4136] mt-0.5 leading-relaxed italic">
                                  "{r.replyText}"
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Bar */}
                          <div className="mt-4 pt-3 border-t border-[#e2bfb0]/15 flex items-center justify-between">
                            <div className="flex gap-4">
                              <button
                                onClick={() => {
                                  if (r.replied) {
                                    triggerToast('This review has already been answered.');
                                  } else {
                                    setActiveReplyBox(activeReplyBox === r.id ? null : r.id);
                                  }
                                }}
                                className={`flex items-center gap-1 text-xs font-bold hover:underline transition-colors ${
                                  r.replied ? 'text-green-600' : 'text-[#a23f00]'
                                }`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                {r.replied ? '✓ Replied' : 'Reply'}
                              </button>
                              
                              <button
                                onClick={() => toggleFeature(r.id)}
                                className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                                  r.featured ? 'text-amber-500' : 'text-[#5a4136] hover:text-amber-500'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${r.featured ? 'fill-amber-500' : ''}`} />
                                {r.featured ? 'Unfeature' : 'Feature'}
                              </button>
                            </div>

                            <Link
                              href={`/dashboard/engagement/reviews/${r.id}`}
                              className="text-xs font-bold text-slate-400 hover:text-[#a23f00] transition-colors"
                            >
                              View Details →
                            </Link>
                          </div>

                          {/* Quick reply inline text area */}
                          {activeReplyBox === r.id && (
                            <div className="mt-4 pt-3 border-t border-[#e2bfb0]/10 space-y-2">
                              <textarea
                                value={replyInputs[r.id] || ''}
                                onChange={e => setReplyInputs({ ...replyInputs, [r.id]: e.target.value })}
                                className="w-full bg-[#fff8f6] p-3 rounded-xl border border-[#e2bfb0]/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#a23f00] text-[#261812] placeholder:text-[#5a4136]/40"
                                placeholder={`Type your reply to ${r.name}...`}
                                rows={3}
                              ></textarea>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setActiveReplyBox(null)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#5a4136] font-bold text-xs rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSendResponse(r.id, replyInputs[r.id] || '')}
                                  className="px-4 py-1.5 bg-[#a23f00] text-white font-bold text-xs rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  Send Response
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Marcus T. Default text box reply state if not replied yet */}
                          {r.id === 'marcus-t' && !r.replied && activeReplyBox !== r.id && (
                            <div className="mt-4 pt-3 border-t border-[#e2bfb0]/10">
                              <textarea
                                value={replyInputs['marcus-t'] || ''}
                                onChange={e => setReplyInputs({ ...replyInputs, ['marcus-t']: e.target.value })}
                                className="w-full bg-[#fff8f6] p-3 rounded-xl border border-[#e2bfb0]/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#a23f00] text-[#261812] placeholder:text-[#5a4136]/40"
                                placeholder="Type your response to Marcus..."
                                rows={2}
                              ></textarea>
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => handleSendResponse('marcus-t', replyInputs['marcus-t'] || '')}
                                  className="px-4 py-1.5 bg-[#a23f00] text-white font-bold text-xs rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all"
                                >
                                  Send Response
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-[#e2bfb0]/20">
                    <p className="text-slate-400 text-sm font-semibold">No reviews matching the filters.</p>
                    <button
                      onClick={() => {
                        setFilter('all');
                        setSelectedBorough('All');
                        setEventOnly(false);
                      }}
                      className="mt-3 px-4 py-2 bg-[#ffeae1] text-[#a23f00] rounded-xl text-xs font-bold hover:bg-[#fee3d8] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Sidebar Stats & Testimonials */}
              <div className="space-y-6">
                
                {/* Top Testimonials */}
                <div className="bg-[#ffeae1] p-5 rounded-2xl border border-[#e2bfb0]/35 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[#261812] text-sm mb-3">Top Testimonials</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-xl border border-[#a23f00]/10 relative shadow-sm">
                        <span className="text-[#a23f00] font-black absolute top-2 right-3 opacity-20 text-3xl select-none">“</span>
                        <p className="text-xs italic text-[#5a4136] leading-relaxed pr-6">
                          "The only shop that remembers my name and my coffee order. Professional yet feels like family."
                        </p>
                        <p className="mt-2 font-bold text-[10px] text-[#a23f00]">— David K., regular customer</p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-xl border border-[#a23f00]/10 relative shadow-sm">
                        <span className="text-[#a23f00] font-black absolute top-2 right-3 opacity-20 text-3xl select-none">“</span>
                        <p className="text-xs italic text-[#5a4136] leading-relaxed pr-6">
                          "Unbeatable quality and service. I always recommend them to anyone visiting the area."
                        </p>
                        <p className="mt-2 font-bold text-[10px] text-[#a23f00]">— Sarah L., local business owner</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateSocialPost}
                    className="w-full mt-4 py-2.5 bg-white border border-[#a23f00] text-[#a23f00] text-xs font-bold rounded-xl hover:bg-[#a23f00] hover:text-white transition-all flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Social Media Post
                  </button>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/20">
                  <h3 className="font-extrabold text-[#261812] text-sm mb-4">Rating Distribution</h3>
                  <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-3 text-xs font-bold text-[#5a4136]">{stars}</span>
                        <Star className="w-3 h-3 fill-[#a23f00] text-[#a23f00] shrink-0" />
                        <div className="flex-1 h-2 bg-[#ffeae1] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#a23f00] rounded-full transition-all duration-500"
                            style={{ width: getDistributionPct(stars) }}
                          ></div>
                        </div>
                        <span className="w-8 text-[10px] font-bold text-[#5a4136] text-right">
                          {getDistributionPct(stars)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Context Card */}
                <div className="bg-[#fee3d8] p-5 rounded-2xl border border-[#ff9969]/30 relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <h3 className="font-extrabold text-[#772f05] text-sm">Summer Festival Impact</h3>
                    <p className="text-xs text-[#772f05] leading-relaxed">
                      Reviews increased by 40% during the Local Summer Festival week. Average rating was 4.9!
                    </p>
                    <div className="flex items-center gap-1 text-[#a23f00]">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold">High Sentiment Spike</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-9xl">
                    ★
                  </div>
                </div>

              </div>

            </div>
          </>
        ) : (
          /* NO REVIEWS EMPTY STATE */
          <main className="flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto">
            <div className="relative w-full aspect-square max-w-[280px] mb-6 flex items-center justify-center">
              {/* Decorative Shapes */}
              <div className="absolute inset-0 bg-[#ffeae1] rounded-full scale-90 opacity-40"></div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#ff9969] rounded-full opacity-20 animate-bounce" style={{ animationDuration: '6s' }}></div>
              <div className="absolute bottom-10 -left-6 w-20 h-20 bg-[#fee3d8] rounded-full opacity-30 animate-pulse" style={{ animationDuration: '4s' }}></div>
              
              {/* Image Illustration */}
              <div className="relative z-10 w-full h-full p-4">
                <img
                  alt="No reviews yet"
                  className="w-full h-full object-contain drop-shadow-xl"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuxqECxHJ0MvXTq5E4d2UVLoJ5ch_TqKtebVxngojEpQeRtnIz-dFPmwJxhSuTOWcnj-ZvD5zEK4Qpnpp3cc2csoOVRioHScz0eJ3ZRpoLhL1WTREwxXf2Vu56-9gD1JkjsNtI_XcgY16PD6vnqZhqtzhlvih0xMuPyjKn_gu76wzDWPxOGreTVUciIbgzhWlV03fKiCxJDU6DOGjHaeqsE05FnnYBSw8gVmINPqBgK_EPeFNrbcQH30CY"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-[#261812]">No reviews yet</h2>
              <p className="text-[#5a4136] px-4 text-xs sm:text-sm leading-relaxed">
                Reviews are the heartbeat of ShopHub. Sharing feedback helps your community grow and builds trust with new customers.
              </p>
            </div>

            <div className="mt-8 w-full flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  triggerToast('Invitation links generated! Sending to customers...');
                }}
                className="bg-gradient-to-r from-[#a23f00] to-[#ff6904] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all w-full max-w-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Invite Customers to Review
              </button>
              
              <button
                onClick={() => {
                  triggerToast('ShopHub reviews guide: Customers leave feedback which boosts your hyperlocal search ranking.');
                }}
                className="text-[#a23f00] font-bold text-xs sm:text-sm hover:bg-[#ffeae1] px-5 py-2 rounded-xl transition-all active:scale-95"
              >
                How it works
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e2bfb0]/30 w-full">
              <div className="flex justify-center gap-3 opacity-60">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#5a4136] bg-[#ffeae1] px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5 text-[#a23f00]" />
                  <span>Trusted Platform</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#5a4136] bg-[#ffeae1] px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5 text-[#a23f00]" />
                  <span>Community Driven</span>
                </div>
              </div>
            </div>
          </main>
        )}

      </div>

      {/* Floating Action Button (Invite Customers Shortcut) */}
      {reviews.length > 0 && (
        <button
          onClick={() => {
            triggerToast('Invitation email templates are ready under Marketing > Promotions!');
          }}
          className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-[#ff6904] text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 group hover:rotate-6"
          title="Invite Customers"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Social Media Generator Modal */}
      {socialModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 border border-[#e2bfb0]/20 animate-scale-up">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-sm text-[#a23f00] flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#ff6904]" />
                Generated Social Post
              </h4>
              <button
                onClick={() => setSocialModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-[#fff8f6] p-4 rounded-xl border border-[#e2bfb0]/25 text-xs text-[#5a4136] font-mono leading-relaxed whitespace-pre-wrap">
              {generatedPost}
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setSocialModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#5a4136] font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={copyToClipboard}
                className="px-5 py-2 bg-[#a23f00] text-white font-bold text-xs rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Copy Post Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
