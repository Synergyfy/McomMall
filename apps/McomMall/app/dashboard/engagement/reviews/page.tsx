'use client';

import Link from 'next/link';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronRight,
  Filter,
  TrendingUp,
} from 'lucide-react';

const reviews = [
  {
    initials: 'TK', name: 'Thomas K.',   rating: 5, time: '1 hour ago',
    text: 'Amazing customer service as always! The staff went above and beyond to help me find exactly what I needed.',
    replied: false, bg: 'bg-green-100', color: 'text-green-700',
  },
  {
    initials: 'SJ', name: 'Sarah Jenkins', rating: 4, time: '3 hours ago',
    text: 'Great experience overall. The loyalty reward was a nice surprise. Would love to see more promotions!',
    replied: true, bg: 'bg-blue-100', color: 'text-blue-700',
  },
  {
    initials: 'MG', name: 'Maria Gomez',  rating: 5, time: '1 day ago',
    text: 'Best local shop in the area. The VIP event invite was a lovely touch — can\'t wait for the preview!',
    replied: true, bg: 'bg-purple-100', color: 'text-purple-700',
  },
  {
    initials: 'JD', name: 'John Doe',    rating: 3, time: '2 days ago',
    text: 'Good products but my last order was slightly delayed. Customer support helped resolve it quickly though.',
    replied: false, bg: 'bg-amber-100', color: 'text-amber-700',
  },
  {
    initials: 'AR', name: 'Alex Rivera', rating: 5, time: '3 days ago',
    text: 'The free coffee reward was such a nice treat! Definitely coming back soon.',
    replied: true, bg: 'bg-orange-100', color: 'text-orange-700',
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3 h-3" fill={s <= rating ? '#f59e0b' : 'none'}
          stroke={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );
}

export default function EngagementReviewsPage() {
  const avgRating = 4.8;
  const totalReviews = 247;
  const breakdown = [
    { stars: 5, count: 180, pct: '73%' },
    { stars: 4, count: 42,  pct: '17%' },
    { stars: 3, count: 18,  pct: '7%'  },
    { stars: 2, count: 5,   pct: '2%'  },
    { stars: 1, count: 2,   pct: '1%'  },
  ];

  return (
    <div style={{ background: '#fff8f5', margin: '-20px -20px 0', minHeight: '100%' }}>
      <div className="px-4 pt-5 pb-32 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1f1b18' }}>Reviews</h2>
            <p className="text-xs" style={{ color: '#8e7164' }}>{totalReviews} total reviews</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#fff', border: '1px solid #e2bfb0', color: '#1f1b18' }}>
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        {/* Rating overview card */}
        <div className="rounded-2xl p-4 bg-white"
          style={{ border: '1px solid #f7ece7', boxShadow: '0 4px 12px rgba(161,64,0,0.08)' }}>
          <div className="flex gap-4">
            {/* Score */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <p className="text-5xl font-bold" style={{ color: '#1f1b18' }}>{avgRating}</p>
              <Stars rating={5} />
              <p className="text-[10px] mt-1" style={{ color: '#8e7164' }}>{totalReviews} reviews</p>
            </div>
            {/* Breakdown bars */}
            <div className="flex-1 space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.stars} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold shrink-0 w-4" style={{ color: '#8e7164' }}>{b.stars}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: '#f7ece7' }}>
                    <div className="h-full rounded-full" style={{ width: b.pct, background: b.stars >= 4 ? '#ea580c' : b.stars === 3 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-[10px] shrink-0 w-6 text-right" style={{ color: '#8e7164' }}>{b.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #f7ece7' }}>
            {[
              { label: 'This week',  value: '12',  up: true },
              { label: 'Replied',    value: '89%', up: true },
              { label: 'Avg rating', value: '4.8', up: true },
            ].map(({ label, value, up }) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold" style={{ color: '#1f1b18' }}>{value}</p>
                <p className="text-[10px]" style={{ color: '#8e7164' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unanswered alert */}
        {reviews.filter((r) => !r.replied).length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.2)' }}>
            <MessageCircle className="w-5 h-5 shrink-0" style={{ color: '#ea580c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#1f1b18' }}>
                {reviews.filter((r) => !r.replied).length} reviews need a reply
              </p>
              <p className="text-xs" style={{ color: '#8e7164' }}>Replying boosts your visibility on the platform</p>
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1f1b18' }}>Recent Reviews</h3>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.name} className="p-4 rounded-2xl bg-white"
                style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.05)' }}>
                {/* Top row */}
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.bg} ${r.color}`}>
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-semibold" style={{ color: '#1f1b18' }}>{r.name}</p>
                      <span className="text-[10px] ml-2 shrink-0" style={{ color: '#8e7164' }}>{r.time}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                {/* Review text */}
                <p className="text-sm leading-relaxed" style={{ color: '#5a4136' }}>{r.text}</p>
                {/* Actions */}
                <div className="flex items-center gap-2 mt-3" style={{ borderTop: '1px solid #f7ece7', paddingTop: '12px' }}>
                  {r.replied ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                      ✓ Replied
                    </span>
                  ) : (
                    <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ background: '#ea580c' }}>
                      <MessageCircle className="w-3 h-3" /> Reply
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button className="flex items-center gap-1 text-xs" style={{ color: '#8e7164' }}>
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1 text-xs" style={{ color: '#8e7164' }}>
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/dashboard/reviews"
            className="flex items-center justify-center gap-1 mt-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: '1px solid #ea580c', color: '#ea580c' }}>
            View All Reviews <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
