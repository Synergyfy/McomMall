'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  Coins,
  ShoppingBag,
  TrendingUp,
  Plus,
  Pencil,
  PauseCircle,
  PlusCircle,
  Megaphone,
  Check,
  Gift,
  UserPlus,
  BarChart2,
  Send,
} from 'lucide-react';

export default function LoyaltyDashboardPage() {
  const router = useRouter();

  // Statistics cards data
  const stats = [
    {
      title: 'Active Rewards',
      value: '24',
      change: '+12%',
      isPositive: true,
      color: 'border-l-4 border-[#a14000]',
      iconBg: 'bg-[#ffdbcc]/40',
      iconColor: 'text-[#a14000]',
      icon: Star,
    },
    {
      title: 'Points Issued',
      value: '142.8k',
      change: '+5.2k',
      isPositive: true,
      color: '',
      iconBg: 'bg-[#f7ece7]',
      iconColor: 'text-[#a14000]',
      icon: Coins,
    },
    {
      title: 'Redemption Rate',
      value: '68.4%',
      change: '-2%',
      isPositive: false,
      color: '',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: ShoppingBag,
    },
    {
      title: 'Program Growth',
      value: '2.4k',
      change: '+18%',
      isPositive: true,
      color: '',
      iconBg: 'bg-[#fff1eb]',
      iconColor: 'text-[#ea580c]',
      icon: TrendingUp,
    },
  ];

  // Active Reward Offers data
  const offers = [
    {
      id: 1,
      title: '20% Off Next Purchase',
      points: 500,
      redeemed: '1.2k',
      badge: 'Flash Deal',
      badgeBg: 'bg-[#ffdad6] text-[#ba1a1a]',
      expiry: 'Expires in 3 days',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLtH66VWXb3rP7Q3V8B3awwyuBNCuMkEXl1bSM6T_KvNm8snGkln4MsJ6W91yQqVmj2jBn8Xa47JaovuZnZERl0CqNWeS1_8saOU01iTjJT8HWmJyv6eksf6F1YhdVCiuoctt0Z0U9QTTOc_QjYANctFNiB2uRd3n0NFlgDvUgYQXV2xYZduWfnw19pHZ3Zlq9g4pDI1ckkFK1aIzdXihlizFwSnlXRSAWYJaHJ4zW-vy3spJbiTzHc6Vw',
    },
    {
      id: 2,
      title: 'Free Seasonal Drink',
      points: 250,
      redeemed: '4.5k',
      badge: 'Perennial',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-100',
      expiry: '',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvwjhiJB1kFBmtd6A4W8I4pyhmxf1fKDNEPsGdbj7kZtXEL0u6WfvIv6QBif0RyePzhZEImJwDI1bgJjIhyKY9BfAGb5ywlC4QQbLss0yNDk0Pap_FfLjvw-LeIAmceecTu-R7UsA7YRaUvom0NC60cDYIJ_J0_85mZoPRsiYVv2CW8JCDXkog90HHT2VhI4wvTUxapRHh5bRKvQypBer0IUqWgb4IlVMejsYtDAzAQnlRMSdqfp0WfVg',
    },
    {
      id: 3,
      title: 'Free Local Delivery',
      points: 100,
      redeemed: '8.9k',
      badge: 'VIP Only',
      badgeBg: 'bg-[#ffdbcc] text-[#7b2f00]',
      expiry: '',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvzSqxn-Vv4uKBtatka-Dew1aorVSsw40ZOm07MJRGOM9QcyfFGb8pbPBpBi6ZaP0mMZEaMaxlZ6yZp2wMPNIdyie_y33EJpGYfIR_eG5637RbY7mTQYBw2KOz26w6hzGCWLAppzGL0tT-S8w5cgGz1n-PhEQkNzexbipT8TayxF6bMagNXAfEoh-DSRNqtSQJLBVnlERFoOfgoHpQUKUH6k1GamDuCi9WjO_2CEQjwfab9JYH9dvetjUw',
    },
  ];

  // Recent activity logs
  const activities = [
    {
      title: '1,200 points allocated',
      desc: 'Bulk action to Gold Tier • 2m ago',
      icon: Check,
      color: 'bg-[#00629f]',
    },
    {
      title: 'New Reward: BOGO Pizza',
      desc: 'Created by Admin Sarah • 45m ago',
      icon: Gift,
      color: 'bg-[#a14000]',
    },
    {
      title: '50 new members joined',
      desc: 'Organic growth spike • 3h ago',
      icon: UserPlus,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── HEADER INTRO ── */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-bold text-2xl text-gray-900 leading-tight">Loyalty & Rewards</h2>
            <p className="text-xs text-gray-500 mt-1">
              Manage customer incentives and track point distributions.
            </p>
          </div>
          <Link 
            href="/dashboard/loyalty/rules/create"
            className="bg-[#a14000] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(161,64,0,0.15)] hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Reward Rule
          </Link>
        </section>

        {/* ── STATS CARDS GRID ── */}
        <section className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 350 }}
                className={`bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgba(161,64,0,0.02)] border border-[#f7ece7] flex flex-col justify-between ${stat.color}`}
                style={{ minHeight: '120px' }}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-9 h-9 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    stat.isPositive ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-gray-400">{stat.title}</p>
                  <h3 className="text-xl font-black text-gray-950 mt-0.5">{stat.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ── ACTIVE REWARD OFFERS ── */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-base text-gray-950">Active Reward Offers</h3>
            <Link 
              href="/dashboard/loyalty/offers" 
              className="text-xs font-bold text-[#a14000] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                whileHover={{ y: -2 }}
                className="bg-white p-3 rounded-2xl border border-[#f7ece7] flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img
                    alt={offer.title}
                    src={offer.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${offer.badgeBg}`}>
                      {offer.badge}
                    </span>
                    {offer.expiry && (
                      <span className="text-[9px] text-red-600 font-semibold italic">
                        {offer.expiry}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 mt-1 truncate">{offer.title}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {offer.points} Points • {offer.redeemed} Redeemed
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 text-gray-400 hover:text-[#a14000] hover:bg-orange-50 rounded-full transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <PauseCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── QUICK ACTIONS ── */}
        <section className="space-y-3">
          <h3 className="font-bold text-base text-gray-950">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link 
              href="/dashboard/loyalty/points/allocate"
              className="w-full p-3 bg-white hover:bg-gray-50/50 transition-colors rounded-2xl flex items-center gap-3 border border-[#f7ece7] group active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-full bg-orange-50 text-[#a14000] flex items-center justify-center shrink-0 group-hover:bg-[#a14000] group-hover:text-white transition-all">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-gray-800">Allocate Points</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Manually add points to customer</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/loyalty/offers/new"
              className="w-full p-3 bg-white hover:bg-gray-50/50 transition-colors rounded-2xl flex items-center gap-3 border border-[#f7ece7] group active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:bg-[#ea580c] group-hover:text-white transition-all">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-gray-800">Create Redemption Offer</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Launch a new limited time deal</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/loyalty/promotion"
              className="w-full p-3 bg-white hover:bg-gray-50/50 transition-colors rounded-2xl flex items-center gap-3 border border-[#f7ece7] group active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#00629f] flex items-center justify-center shrink-0 group-hover:bg-[#00629f] group-hover:text-white transition-all">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-gray-800">Reward Campaigns</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Manage active campaigns & analytics</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/loyalty/promotion/send-offer"
              className="w-full p-3 bg-white hover:bg-gray-50/50 transition-colors rounded-2xl flex items-center gap-3 border border-[#f7ece7] group active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Send className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-gray-800">Send Targeted Offer</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Broadcast to loyalty, nearby or inactive</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── RECENT ACTIVITY ── */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-base text-gray-950">Recent Activity</h3>
            <Link 
              href="/dashboard/loyalty/members"
              className="text-xs font-bold text-[#a14000] hover:underline"
            >
              Manage Members
            </Link>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-orange-200/50">
            {activities.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="relative">
                  <div className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[#fff8f5] ${act.color} flex items-center justify-center`}>
                    <Icon className="w-2 h-2 text-white" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-[#f7ece7]">
                    <p className="font-bold text-xs text-gray-900">{act.title}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
