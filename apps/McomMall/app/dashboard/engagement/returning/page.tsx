'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  History,
  Clock,
  Star,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

export default function ReturningCustomersPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-orange-500/20 animate-fade-in-down">
          {toastMessage}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-6">
        
        {/* ── BACK NAVIGATION ── */}
        <div className="flex items-center">
          <Link href="/dashboard/engagement" className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800">
            <ChevronLeft className="w-4 h-4" /> Back to Engagement
          </Link>
        </div>

        {/* ── TITLE BLOCK ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Returning Customers</h2>
          <p className="text-xs text-gray-400">Re-engage inactive high-value loyalty members</p>
        </div>

        {/* ── QUICK ACTIONS BENTO ── */}
        <section className="grid grid-cols-1 gap-3">
          {/* Reward returning customers */}
          <div 
            onClick={() => showToast("Bulk loyalty points distribution initiated")} 
            className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#ea580c] group-hover:scale-110 transition-transform shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Reward returning customers</h3>
              <p className="text-xs text-gray-400">Bulk apply loyalty points or perks</p>
            </div>
          </div>

          {/* Send comeback offer */}
          <div 
            onClick={() => showToast("Comeback campaign creator opened")} 
            className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#ea580c] group-hover:scale-110 transition-transform shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Send comeback offer</h3>
              <p className="text-xs text-gray-400">Target inactive high-value users</p>
            </div>
          </div>
        </section>

        {/* ── LOYALTY ANALYTICS SECTION ── */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-bold text-gray-900">Loyalty Analytics</h2>
            <span className="text-[10px] font-bold text-[#ea580c] bg-orange-50 border border-orange-200/50 px-2.5 py-0.5 rounded-full">
              Last 30 Days
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Repeat Rate */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Repeat Rate</span>
                <span className="text-emerald-600 flex items-center text-[10px] font-bold gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> 12%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">64.2%</div>
              <div className="w-full bg-[#f7ece7] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ea580c] h-full rounded-full" style={{ width: '64%' }}></div>
              </div>
              <p className="text-[10px] text-gray-400">Vs. 52% category average</p>
            </div>

            {/* Redemptions & Avg. Cycle */}
            <div className="grid grid-cols-2 gap-3">
              {/* Redemptions */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-semibold">Redemptions</span>
                  <span className="text-emerald-600 flex items-center text-[10px] font-bold gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> 5%
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">1,204</div>
                <p className="text-[10px] text-gray-400 leading-tight">Total rewards claimed</p>
              </div>

              {/* Avg. Cycle */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] space-y-2 relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-5 text-gray-400">
                  <History className="w-16 h-16" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-semibold">Avg. Cycle</span>
                  <span className="text-red-500 flex items-center text-[10px] font-bold gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> 2d
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">18 Days</div>
                <p className="text-[10px] text-gray-400 leading-tight">Time between visits</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WIN BACK LIST SECTION ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Win Back</h2>
              <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                High Inactivity
              </span>
            </div>
            <button 
              onClick={() => showToast("Full win-back list loaded")} 
              className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              {
                name: 'Elena Rodriguez',
                avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLsmIsLyuOdfknxzUINdNwMQ67FdSKal4OO6G5s1vO2oHNP7r9ZAjCG9hv0RWtync95bKl9LM2IjinbnGnYx5PU6lvxrGDcrm5Z1FBhNhSzdkLsKY0GXj2gi7w895nIPU6eBJAPWvCrModQbx2SMy1jZEhQehtbQx4i1RkwmOOOtndlMBpCjJ9Uxhg8olUNtnvZ26kwVNXoRE0kEPDdVWevSBRNXawbQ26EV-ZEuyChrEN4-n-ncu-d8dQ',
                isVip: true,
                daysAgo: '42 Days ago',
                visits: '18 Visits',
                ltv: '$842 LTV',
                status: 'At Risk',
                statusColor: 'text-red-500'
              },
              {
                name: 'Marcus Chen',
                avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvWCbYtTo5dcKZz7JK-dJP5MXX0qLMd1EQkZPYRXaAG9MfnC9FNPSHXHdoAokypPPxG-TvmCl-pK0M_IQu-8CIN_frBb_wpmZmNHBfyiiO6zA8Ysfm5DmP4aeSQ-OPrOB-OQ0zEbik_4aNn75BlsByakHXUcluRUSi0XNScXHuVhc-tDo4b3_9RhKM9D84L-t2qUTtrQSuPwJLJer7mErMhCqm9CWq0VWEcF6O1g_kJuRTGGabHCgT2-NU',
                daysAgo: '35 Days ago',
                visits: '12 Visits',
                ltv: '$520 LTV',
                status: 'Warning',
                statusColor: 'text-orange-500'
              },
              {
                name: 'David Wilson',
                avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLt8gK_mFcAdqzO0KLe27CcAMhKYCmuskp5NCyHbBexWcy2lJSmqZy-fTns5nwR0CfpaJvecJEqFBFYTaGWYkdve50rl0j9KnOcqZwDNJp6LhD-xJMyQQigNQGxaSJEV6-USAp6y1S-1BJw17wUVGXpv2niWgbNAlvKdNjxV9-BLU-zP1isgfcRi3ohhSURVWUWn190hrvreDtbH5nbl0NbGexdi3CgZB7RUWBtdg1naD_wb8lRQR8FmLQ',
                daysAgo: '28 Days ago',
                visits: '9 Visits',
                ltv: '$310 LTV',
                status: 'Expiring',
                statusColor: 'text-yellow-600'
              }
            ].map((user) => (
              <div key={user.name} className="bg-white rounded-xl p-4 shadow-sm border border-[#f7ece7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-[#fff8f5]" alt={user.name} />
                    {user.isVip && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white uppercase">
                        VIP
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug">{user.name}</h4>
                    <div className="flex gap-2.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {user.daysAgo}
                      </span>
                      <span className="text-[10px] text-[#ea580c] flex items-center gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-orange-500/10" /> {user.visits}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-gray-50 pt-2.5 sm:border-0 sm:pt-0">
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-900 leading-none">{user.ltv}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${user.statusColor} leading-none`}>{user.status}</div>
                  </div>
                  <button 
                    onClick={() => showToast(`Offer campaign sent to ${user.name}`)}
                    className="bg-[#a14000] hover:bg-[#ea580c] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 transition-all"
                  >
                    Send Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ASYMMETRIC DETAIL SECTION ── */}
        <section className="space-y-4">
          {/* Growth Tips Card */}
          <div className="bg-[#a14000] text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <h3 className="text-base font-bold">Growth Tips</h3>
              <p className="text-xs text-orange-100 leading-relaxed">
                Customers who visit more than 5 times have an 85% chance of becoming lifelong patrons. Focus your efforts on the &apos;3-Visit Plateau&apos;.
              </p>
              <button 
                onClick={() => showToast("Loading Retention Guide...")}
                className="bg-white text-[#a14000] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-orange-50 transition-colors"
              >
                Read Retention Guide
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute -right-4 -top-4 opacity-10">
              <Lightbulb className="w-32 h-32 rotate-12" />
            </div>
          </div>

          {/* Redemption Trends Card */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">Redemption Trends</h3>
            <div className="bg-white rounded-xl p-5 border border-[#f7ece7] shadow-sm">
              <div className="h-36 flex items-end justify-between gap-3 px-2 pt-2">
                {[40, 65, 45, 85, 95, 70, 60].map((height, i) => {
                  const isHighlight = i === 4;
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isHighlight
                            ? 'bg-gradient-to-t from-[#c2410c] to-[#ea580c] shadow-[0_4px_12px_rgba(234,88,12,0.15)]'
                            : 'bg-[#f7ece7] hover:bg-[#ffb694]'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`Period ${i + 1}: ${height}% redemption`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-2 font-bold px-1">
                <span>Wk 1</span>
                <span>Wk 2</span>
                <span>Wk 3</span>
                <span>Wk 4</span>
                <span>Wk 5</span>
                <span>Wk 6</span>
                <span>Wk 7</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
