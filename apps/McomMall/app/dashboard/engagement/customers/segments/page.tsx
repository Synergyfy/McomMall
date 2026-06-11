'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  RotateCw,
  Send,
  Gift,
  Plus,
  Users,
  Sparkles,
  Check,
  Star,
  ChevronRight,
} from 'lucide-react';

export default function CustomerSegmentsPage() {
  const router = useRouter();

  const handleCreateSegment = () => {
    // Navigate to customer list page to allow creating segment via bulk action
    router.push('/dashboard/engagement/customers');
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK BUTTON ── */}
        <div className="flex items-center">
          <Link 
            href="/dashboard/engagement/customers" 
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Customers
          </Link>
        </div>

        {/* ── DASHBOARD INTRO ── */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-bold text-2xl text-gray-900 leading-tight">Customer Segments</h2>
            <p className="text-xs text-gray-500 mt-1">
              Optimize your reach by targeting specific customer behaviors.
            </p>
          </div>
          <button 
            onClick={handleCreateSegment}
            className="bg-[#a14000] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(161,64,0,0.15)] hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Segment
          </button>
        </section>

        {/* ── BENTO GRID LAYOUT FOR SEGMENTS (Linear/Stacked for Mobile view, matching page widths) ── */}
        <div className="space-y-4">
          
          {/* VIP Segment Card (Large Focus) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#f7ece7] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#7b2f00] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#ea580c] leading-tight">VIP Customers</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Top 5% by total LTV</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-xl text-gray-900">1,248</span>
                <span className="text-[#00629f] text-[9px] font-bold flex items-center justify-end gap-0.5 mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> +12% growth
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f7ece7]">
                <p className="text-[9px] text-gray-400 font-semibold">Avg. Order</p>
                <p className="font-bold text-sm text-gray-800 mt-0.5">$245.00</p>
              </div>
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f7ece7]">
                <p className="text-[9px] text-gray-400 font-semibold">Churn Risk</p>
                <p className="font-bold text-sm text-[#00629f] mt-0.5">Very Low</p>
              </div>
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f7ece7]">
                <p className="text-[9px] text-gray-400 font-semibold">Retention</p>
                <p className="font-bold text-sm text-gray-800 mt-0.5">94%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f7ece7]">
                <p className="text-[9px] text-gray-400 font-semibold">Frequency</p>
                <p className="font-bold text-sm text-gray-800 mt-0.5">2.4x /mo</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link 
                href="/dashboard/engagement/customers?segment=vip"
                className="bg-[#ffdbcc] text-[#7b2f00] px-4 py-2.5 rounded-xl font-bold text-xs flex-1 flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Send Campaign
              </Link>
              <Link
                href="/dashboard/engagement/customers?segment=vip" 
                className="border border-[#ea580c] text-[#ea580c] bg-white px-4 py-2.5 rounded-xl font-bold text-xs flex-1 flex items-center justify-center gap-1.5 hover:bg-orange-50 active:scale-95 transition-all"
              >
                <Gift className="w-3.5 h-3.5" /> Allocate Rewards
              </Link>
            </div>
          </motion.div>

          {/* Inactive Segment Card */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#f7ece7]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#93000a] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 leading-tight">Inactive</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">No orders in 90 days</p>
              </div>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div className="flex flex-col">
                <span className="font-black text-2xl text-gray-900">432</span>
                <span className="text-[#ba1a1a] text-[9px] font-bold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> +4.2% increase
                </span>
              </div>
              {/* Mini Sparkline Visualization */}
              <div className="w-24 h-10 bg-[#fff8f5] rounded-lg relative overflow-hidden border border-[#f7ece7] flex items-end">
                <div className="w-full h-1/3 bg-[#ba1a1a]/10" />
                <div className="absolute bottom-0 left-0 w-3/4 h-2/3 bg-[#ba1a1a]/20 rounded-r" />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium italic mb-4">
              "Winning these back costs 5x less than new acquisition."
            </p>
            <Link 
              href="/dashboard/engagement/customers?segment=inactive"
              className="w-full bg-[#f7ece7] text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-all active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" /> Win-back Strategy
            </Link>
          </motion.div>

          {/* High Spenders Card */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#f7ece7]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#cfe4ff] flex items-center justify-center text-[#004a79] shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 leading-tight">High Spenders</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">AOV &gt; $500</p>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <span className="font-black text-2xl text-gray-900">892</span>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Highly receptive to bundles</p>
            </div>

            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Growth</span>
                <span className="text-[#00629f]">+18.5%</span>
              </div>
              <div className="w-full bg-[#fff8f5] h-2 rounded-full overflow-hidden border border-[#f7ece7]">
                <div className="bg-[#00629f] h-2 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div className="flex gap-2">
              <Link 
                href="/dashboard/engagement/customers?segment=high_spenders"
                className="flex-1 bg-[#a14000] text-[#ffffff] py-2 rounded-xl font-bold text-xs text-center hover:opacity-90 active:scale-95 transition-all"
              >
                Campaign
              </Link>
              <Link 
                href="/dashboard/engagement/customers?segment=high_spenders"
                className="flex-1 border border-[#e2bfb0] bg-white text-gray-600 py-2 rounded-xl font-bold text-xs text-center hover:bg-gray-50 active:scale-95 transition-all"
              >
                Details
              </Link>
            </div>
          </motion.div>

          {/* Frequent Buyers Card */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#f7ece7]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#7b2f00] shrink-0">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 leading-tight">Frequent</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">3+ orders/month</p>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <span className="font-black text-2xl text-gray-900">2,510</span>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Strongest brand loyalty</p>
            </div>

            {/* Overlapping User Avatars */}
            <div className="flex -space-x-2 overflow-hidden mb-5 items-center">
              <img 
                alt="User 1" 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLuGAbTCn-nss1lFG0a77XykmMW1WMjPV0nneYZpBq7yQ7QXR1GJUFbae9Y-Rb_6fAmkApRmY-T7YY4_JoeQR3y07jrjWFNTUR09-PErqcuNarqXB6tJnSql-pSBWJUcGT9VVXKrRypEkj7cg_lDhklDdzf9iX0agVTtrBXs15wHNjfJz16kXE5HQapPGTX065Pmlh0tKdIR-okzhkUvq1f2pmXo1mY3tmL5DKbSb8V_mA36Rb40SBAopA" 
              />
              <img 
                alt="User 2" 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLvIvMk_LTHXXrryrMaeWOOq35ElRxmVFRgzp9HuKQuUkEtRH8Ism6vwMguVt4bfsYOLjYCWE-02O-mMbKhiIRI7Ov2P3vGfC4VclDasSmtixpjG8JltbYJqWVHcy7E4d3A0I6RTFEPnAt7hnOU36BJCdlYV5zGWAIwt-yR7d4eroxUc8W60fg_WaHN-LXMAvvZuR9DRbJboe8tV4gY0sQVsB7RBj9buLPLH5VhVuQquKOFsOSe4iRRHS-o" 
              />
              <img 
                alt="User 3" 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLvaKZ7RgvIaEgHECvU3lwnRUOLum3ZkQ0l0GfkZG75ZWjmst5qEO1JretavID-GSeFxMEHxqVZo4oHpWlXiQ-Bfne6b0HjS6yLTYVTqRlv74lNMbQpRRS4MNVC5lXn58rCzL4LpeAPpCjl5b9peGn-IF-lfo5IZfveB3dr5jJe0vg63YpFJeqTaT2sLM2xI-jmy9ziDK8WqzXVFgUC7CeumcMQVD_DGuzex54iLWzsq7HmOfq69dpXxZZA" 
              />
              <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-[#f7ece7] text-[10px] text-gray-500 font-bold">
                +2.5k
              </div>
            </div>

            <Link 
              href="/dashboard/engagement/customers?segment=frequent"
              className="w-full bg-[#f7ece7] text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Apply Perks
            </Link>
          </motion.div>

          {/* Segment Analytics Card */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative bg-[#ebe0dc] rounded-2xl p-5 overflow-hidden border border-[#e2bfb0]/40 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-base text-gray-900 leading-tight">Segment Growth</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Overview of segment activities this quarter.</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="font-semibold text-xs text-gray-800">Acquisition</span>
                  <span className="text-[#00629f] font-bold text-xs">+22%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="font-semibold text-xs text-gray-800">Retention</span>
                  <span className="text-[#a14000] font-bold text-xs">+8%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="font-semibold text-xs text-gray-800">Avg Revenue</span>
                  <span className="text-[#ea580c] font-bold text-xs">+$12</span>
                </div>
              </div>
            </div>
            
            {/* Soft decorative background circles */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#a14000]/10 rounded-full blur-xl pointer-events-none" />
          </motion.div>

        </div>

        {/* ── RECENT SEGMENT ACTIVITY TIMELINE ── */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Recent Segment Activity</h3>
          
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-orange-200/50">
            
            {/* Timeline Item 1 */}
            <div className="relative">
              <div className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[#fff8f5] bg-[#00629f] flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-[#f7ece7]">
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <h4 className="font-bold text-xs text-gray-900">"Summer Loyalty" Campaign Sent</h4>
                  <span className="text-[9px] text-gray-400 font-semibold shrink-0">2h ago</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Targeted to <span className="font-bold text-[#ea580c]">VIP Customers</span>. Open rate: 32.4%
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <div className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[#fff8f5] bg-[#a14000] flex items-center justify-center">
                <Star className="w-2 h-2 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-[#f7ece7]">
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <h4 className="font-bold text-xs text-gray-900">Points Multiplier Allocated</h4>
                  <span className="text-[9px] text-gray-400 font-semibold shrink-0">Yesterday</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Allocated 2x points to <span className="font-bold text-[#a14000]">Frequent Buyers</span> for the weekend.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
