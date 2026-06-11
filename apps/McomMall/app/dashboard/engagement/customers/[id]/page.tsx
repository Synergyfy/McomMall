'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Coffee,
  BookOpen,
  Utensils,
  TrendingUp,
  Minus,
  MessageSquare,
  Clock,
  Edit,
  Award,
  ChevronLeft,
} from 'lucide-react';

const months = [
  { name: 'Jan', val: 40 },
  { name: 'Feb', val: 60 },
  { name: 'Mar', val: 85 },
  { name: 'Apr', val: 45 },
  { name: 'May', val: 95, active: true },
  { name: 'Jun', val: 70 },
];

const customersDb: Record<string, {
  name: string;
  status: string;
  statusBg: string;
  points: string;
  borough: string;
  joinDate: string;
  avatar: string;
  initials: string;
  favorites: Array<{ name: string; desc: string; icon: any; bg: string; noTrend?: boolean }>;
  timelineItems: Array<{ title: string; time: string; desc: string; dotBg: string }>;
}> = {
  'sarah-j': {
    name: 'Sarah J.',
    status: 'Gold Status',
    statusBg: 'bg-[#ea580c] text-white',
    points: '450',
    borough: 'Camden, London',
    joinDate: 'Joined January 2023',
    initials: 'SJ',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLuGAbTCn-nss1lFG0a77XykmMW1WMjPV0nneYZpBq7yQ7QXR1GJUFbae9Y-Rb_6fAmkApRmY-T7YY4_JoeQR3y07jrjWFNTUR09-PErqcuNarqXB6tJnSql-pSBWJUcGT9VVXKrRypEkj7cg_lDhklDdzf9iX0agVTtrBXs15wHNjfJz16kXE5HQapPGTX065Pmlh0tKdIR-okzhkUvq1f2pmXo1mY3tmL5DKbSb8V_mA36Rb40SBAopA',
    favorites: [
      { name: 'Artisan Coffee', desc: '18 visits this month', icon: Coffee, bg: 'bg-[#fff1eb] text-[#ea580c]' },
      { name: 'Bookstore', desc: '5 visits this month', icon: BookOpen, bg: 'bg-[#eff6ff] text-blue-600' },
      { name: 'Gourmet Deli', desc: '3 visits this month', icon: Utensils, bg: 'bg-[#fdf4ff] text-purple-600', noTrend: true },
    ],
    timelineItems: [
      {
        title: 'Redeemed "Free Espresso" Reward',
        time: '2 hours ago',
        desc: "Redeemed at 'Roast & Revel' using 250 loyalty points.",
        dotBg: 'bg-[#a14000]',
      },
      {
        title: 'Purchased "Camden Guidebook"',
        time: 'Yesterday, 1:15 PM',
        desc: "Visit at 'The Local Press Books'. Total: $18.50",
        dotBg: 'bg-[#ffb694]',
      },
      {
        title: 'Review Submitted',
        time: '4 days ago',
        desc: "Rated 'The Daily Grind' 5 stars: \"Great workspace and fast wifi!\"",
        dotBg: 'bg-gray-300',
      },
    ]
  },
  'marcus-l': {
    name: 'Marcus L.',
    status: 'Silver Status',
    statusBg: 'bg-[#ffdbcc] text-[#7b2f00]',
    points: '120',
    borough: 'Hackney, London',
    joinDate: 'Joined March 2023',
    initials: 'ML',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvIvMk_LTHXXrryrMaeWOOq35ElRxmVFRgzp9HuKQuUkEtRH8Ism6vqMguVt4bfsYOLjYCWE-02O-mMbKhiIRI7Ov2P3vGfC4VclDasSmtixpjG8JltbYJqWVHcy7E4d3A0I6RTFEPnAt7hnOU36BJCdlYV5zGWAIwt-yR7d4eroxUc8W60fg_WaHN-LXMAvvZuR9DRbJboe8tV4gY0sQVsB7RBj9buLPLH5VhVuQquKOFsOSe4iRRHS-o',
    favorites: [
      { name: 'Artisan Coffee', desc: '8 visits this month', icon: Coffee, bg: 'bg-[#fff1eb] text-[#ea580c]' },
      { name: 'Gourmet Deli', desc: '4 visits this month', icon: Utensils, bg: 'bg-[#fdf4ff] text-purple-600' },
    ],
    timelineItems: [
      {
        title: 'Visited Bakery',
        time: '3 days ago',
        desc: "Craft bakery tasting event. Total: $45.00",
        dotBg: 'bg-[#a14000]',
      },
    ]
  },
  'elena-v': {
    name: 'Elena V.',
    status: 'New',
    statusBg: 'bg-gray-100 text-gray-700',
    points: '50',
    borough: 'Islington, London',
    joinDate: 'Joined May 2023',
    initials: 'EV',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvaKZ7RgvIaEgHECvU3lwnRUOLum3ZkQ0l0GfkZG75ZWjmst5qEO1JretavID-GSeFxMEHxqVZo4oHpWlXiQ-Bfne6b0HjS6yLTYVTqRlv74lNMbQpRRS4MNVC5lXn58rCzL4LpeAPpCjl5b9peGn-IF-lfo5IZfveB3dr5jJe0vg63YpFJeqTaT2sLM2xI-jmy9ziDK8WqzXVFgUC7CeumcMQVD_DGuzex54iLWzsq7HmOfq69dpXxZZA',
    favorites: [
      { name: 'Gourmet Deli', desc: '2 visits this month', icon: Utensils, bg: 'bg-[#fdf4ff] text-purple-600' },
    ],
    timelineItems: [
      {
        title: 'Account Created',
        time: 'Today',
        desc: 'Signed up as a community member.',
        dotBg: 'bg-[#a14000]',
      }
    ]
  },
  'david-k': {
    name: 'David K.',
    status: 'Platinum',
    statusBg: 'bg-orange-600 text-white',
    points: '1,240',
    borough: 'Southwark, London',
    joinDate: 'Joined November 2022',
    initials: 'DK',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvjEFUjca-BkVsu6dm5DLqlsNiujdTU_EKKd0Zi7osm87kxzEKO3EW55-4jkPvD_i2gDrHFNBIcHS0nPAOwG8A61Kkl3XPnpKd4RxGW5_4OH0QyzPYvkxBtd3NutrLe17AmidRpS96twbWgEu83F-rWl1FCLBe7nuCY1AqevZZBZGJwO4KNJlLnO54fFx969UTvCb3EnSxPZDF6cO8_BEIjMjbaB3XWKrvxM7_ojpxyiQPcrNcMvwlEAjQ',
    favorites: [
      { name: 'Artisan Coffee', desc: '22 visits this month', icon: Coffee, bg: 'bg-[#fff1eb] text-[#ea580c]' },
      { name: 'Bookstore', desc: '14 visits this month', icon: BookOpen, bg: 'bg-[#eff6ff] text-blue-600' },
    ],
    timelineItems: [
      {
        title: 'Points Allocated',
        time: '1 week ago',
        desc: 'Allocated 500 bonus points for Platinum Anniversary.',
        dotBg: 'bg-[#a14000]',
      }
    ]
  }
};

export default function CustomerProfilePage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const customer = customersDb[id] || customersDb['sarah-j'];

  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5]">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-orange-500/20 animate-fade-in-down">
          {toastMessage}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK BUTTON & NAVIGATION ── */}
        <div className="flex items-center">
          <Link href="/dashboard/engagement/customers" className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800">
            <ChevronLeft className="w-4 h-4" /> Back to Customers
          </Link>
        </div>

        {/* ── PROFILE HEADER CARD ── */}
        <section className="relative bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12"></div>
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-orange-100 p-0.5 overflow-hidden flex items-center justify-center">
              {customer.avatar ? (
                <img
                  alt={customer.name}
                  src={customer.avatar}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-[#ea580c] font-bold text-2xl">
                  {customer.initials}
                </div>
              )}
            </div>
            {/* STATUS BADGE */}
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-wider shadow-sm uppercase px-2.5 py-0.5 rounded-full border border-orange-200 ${customer.statusBg}`}>
              {customer.status}
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{customer.name}</h2>
            <div className="inline-block bg-[#ffdbcc] text-[#7b2f00] font-bold text-xs px-3 py-1 rounded-full">
              {customer.points} Points
            </div>
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{customer.borough}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{customer.joinDate}</span>
            </div>
          </div>

          {/* Quick Header actions */}
          <div className="flex gap-2 w-full pt-4">
            <button 
              onClick={() => showToast(`Edit profile requested for ${customer.name}`)}
              className="flex-1 py-2 rounded-xl font-bold text-[11px] text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => showToast(`Message modal opened for ${customer.name}`)}
              className="flex-1 py-2 rounded-xl font-bold text-[11px] text-white bg-gradient-to-r from-[#ea580c] to-[#a14000] hover:opacity-95 shadow-md shadow-orange-600/10 transition-all active:scale-95"
            >
              Send Message
            </button>
          </div>
        </section>

        {/* ── HORIZONTAL TABS ── */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 border-b border-gray-200/50">
          <div className="flex gap-4 min-w-max">
            {[
              'Overview',
              'Rewards',
              'Offers',
              'Events',
              'Activity',
              'Messages',
              'Reviews',
              'Notes',
            ].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'border-[#ea580c] text-[#ea580c]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── VISIT FREQUENCY BENTO CARD ── */}
        <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ea580c]" />
              Visit Frequency
            </h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg py-1 px-2.5 text-[10px] font-bold text-gray-500 outline-none focus:ring-1 focus:ring-orange-500">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>

          {/* Visit Chart Bars */}
          <div className="h-44 flex items-end justify-between gap-3 px-2 pt-2">
            {months.map((m) => (
              <div key={m.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    m.active
                      ? 'bg-gradient-to-t from-[#c2410c] to-[#ea580c] shadow-[0_4px_12px_rgba(234,88,12,0.2)]'
                      : 'bg-[#ffdbcc]/70 hover:bg-[#ffb694]'
                  }`}
                  style={{ height: `${m.val}%` }}
                />
                <span className={`text-[10px] font-bold ${m.active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAVORITES BENTO CARD ── */}
        <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#ea580c]" />
            Favorites
          </h3>
          <div className="space-y-3">
            {customer.favorites.map((fav) => {
              const Icon = fav.icon;
              return (
                <div key={fav.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fav.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-800">{fav.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fav.desc}</p>
                  </div>
                  {fav.noTrend ? (
                    <Minus className="w-4 h-4 text-gray-300" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[#ea580c]" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── LAST INTERACTIONS TIMELINE ── */}
        <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ea580c]" />
            Last Interactions
          </h3>
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            {customer.timelineItems.map((item, index) => (
              <div key={index} className="relative">
                <div className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${item.dotBg}`} />
                <div className="bg-[#fff8f5] rounded-xl p-3 border border-[#f7ece7]">
                  <div className="flex flex-wrap justify-between items-baseline mb-1 gap-1">
                    <h4 className="font-bold text-xs text-gray-900 flex-1 min-w-[140px]">{item.title}</h4>
                    <span className="text-[9px] text-gray-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── FLOATING ACTION BUTTON (FAB) ── */}
      <button 
        onClick={() => showToast('New note creation triggered')}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-[#ea580c] to-[#a14000] shadow-xl text-white flex items-center justify-center active:scale-90 hover:scale-105 transition-all z-50"
      >
        <Edit className="w-5 h-5" />
      </button>

    </div>
  );
}
