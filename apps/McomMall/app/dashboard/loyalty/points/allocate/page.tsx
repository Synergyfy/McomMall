'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Send,
  Clock,
  CheckCircle,
  Users,
} from 'lucide-react';

export default function AllocatePointsPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All VIPs');
  const [pointsAmount, setPointsAmount] = useState(500);
  const [reason, setReason] = useState('');

  // Groups and sizes for dynamic calculator
  const groups: Record<string, { label: string; count: number }> = {
    'Top 10 Customers': { label: 'Top 10 Customers', count: 10 },
    'All VIPs': { label: 'All VIPs', count: 12 },
    'Recent Shoppers': { label: 'Recent Shoppers', count: 8 },
    'Anniversary This Week': { label: 'Anniversary This Week', count: 5 },
  };

  const currentCount = searchQuery.trim() ? 1 : (groups[selectedGroup]?.count || 0);
  const currentTargetLabel = searchQuery.trim() ? `Customer: ${searchQuery}` : `Target Group: ${selectedGroup}`;
  const totalPoints = currentCount * pointsAmount;

  const handleConfirm = () => {
    setIsSuccess(true);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/loyalty');
  };

  const selectGroup = (groupId: string) => {
    setSearchQuery('');
    setSelectedGroup(groupId);
  };

  // Recent activity allocation log
  const allocationHistory = [
    {
      name: 'Elena Rodriguez',
      points: '+250',
      reason: 'Customer Service Credit',
      time: '2 hours ago',
      color: 'bg-[#a14000]',
    },
    {
      name: 'Top 10 Batch',
      points: '+1,000',
      reason: 'Monthly Loyalty Bonus',
      time: 'Yesterday',
      color: 'bg-[#00629f]',
    },
    {
      name: 'Marcus Chen',
      points: '+50',
      reason: 'Review Incentive',
      time: '3 days ago',
      color: 'bg-[#ffb694]',
    },
    {
      name: 'Sarah Miller',
      points: '+150',
      reason: 'Referral Success',
      time: '4 days ago',
      color: 'bg-[#ebe0dc]',
    },
  ];

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK NAVIGATION ── */}
        <div className="flex items-center">
          <Link 
            href="/dashboard/loyalty" 
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Loyalty
          </Link>
        </div>

        {/* ── HEADER ── */}
        <section>
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Allocate Points</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manually award points to individual customers or groups.
          </p>
        </section>

        {/* ── ALLOCATION FORM BLOCK ── */}
        <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
          
          {/* Search Customer */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Search Customer</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Quick Select Pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Quick Select Group</label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {Object.keys(groups).map((key) => {
                const isActive = selectedGroup === key && !searchQuery;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectGroup(key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 duration-100 ${
                      isActive
                        ? 'bg-[#a14000] text-white shadow-sm'
                        : 'border border-[#e2bfb0] text-gray-500 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {groups[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Points Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-baseline">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Point Amount</label>
              <span className="text-2xl font-black text-[#a14000]">{pointsAmount} <span className="text-xs font-bold text-gray-400">pts</span></span>
            </div>
            <input
              type="range"
              min="10"
              max="2500"
              step="10"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#a14000] outline-none"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
              <span>10 pts</span>
              <span>2,500 pts</span>
            </div>
          </div>

          {/* Reason for Allocation */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Reason for Allocation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer Service Resolution, Special Campaign..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-orange-600/15 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Confirm Allocation
          </button>
        </div>

        {/* ── DYNAMIC SUMMARY CALLOUT ── */}
        <section className="bg-gradient-to-r from-[#ea580c] to-[#c2410c] p-5 rounded-2xl shadow-[0_8px_24px_rgba(234,88,12,0.15)] text-white relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-orange-200" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-orange-200 tracking-wider">SUMMARY</p>
            <h4 className="font-bold text-base mt-0.5">{currentCount} Customers</h4>
            <p className="text-[10px] text-orange-100 font-semibold mt-0.5">{currentTargetLabel}</p>
            <h3 className="font-black text-xl text-white mt-1">Total: {totalPoints.toLocaleString()} pts</h3>
          </div>
        </section>

        {/* ── RECENT HISTORY ── */}
        <section className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(161,64,0,0.02)] border border-[#f7ece7] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" /> Recent Activity
            </h3>
            <button className="text-[11px] font-bold text-[#a14000] hover:underline">
              View Detailed Log
            </button>
          </div>

          <div className="space-y-3">
            {allocationHistory.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 border border-[#f7ece7] rounded-xl bg-[#fff8f5]/30 hover:bg-[#fff8f5]/60 transition-colors gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1 h-8 rounded-full ${item.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold truncate">{item.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-sm text-[#a14000]">{item.points}</p>
                  <p className="text-[9px] text-gray-400 font-bold mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── SUCCESS MODAL DIALOG ── */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSuccessClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />

            {/* Content box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative z-10 border border-[#f7ece7]"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#a14000] flex items-center justify-center mx-auto border border-orange-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">Allocation Confirmed!</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Successfully allocated **{totalPoints.toLocaleString()} points** in total across **{currentCount} customer(s)**.
                </p>
              </div>
              <button 
                onClick={handleSuccessClose}
                className="w-full py-2.5 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Go to Loyalty
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
