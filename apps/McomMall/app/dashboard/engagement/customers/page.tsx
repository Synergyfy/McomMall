'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageSquare,
  Clock,
  Megaphone,
  Share2,
  Filter,
  Plus,
  Award,
} from 'lucide-react';

const customersData = [
  {
    name: 'Sarah J.',
    status: 'Gold Status',
    statusBg: 'bg-[#ea580c] text-white',
    engagement: 'High',
    engagementColor: 'text-[#ea580c]',
    points: 450,
    borough: 'Camden',
    lastVisit: '2 days ago',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLuGAbTCn-nss1lFG0a77XykmMW1WMjPV0nneYZpBq7yQ7QXR1GJUFbae9Y-Rb_6fAmkApRmY-T7YY4_JoeQR3y07jrjWFNTUR09-PErqcuNarqXB6tJnSql-pSBWJUcGT9VVXKrRypEkj7cg_lDhklDdzf9iX0agVTtrBXs15wHNjfJz16kXE5HQapPGTX065Pmlh0tKdIR-okzhkUvq1f2pmXo1mY3tmL5DKbSb8V_mA36Rb40SBAopA',
    category: 'loyalty',
  },
  {
    name: 'Marcus L.',
    status: 'Silver Status',
    statusBg: 'bg-[#ffdbcc] text-[#7b2f00]',
    engagement: 'Medium',
    engagementColor: 'text-blue-600',
    points: 120,
    borough: 'Hackney',
    lastVisit: '5 days ago',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvIvMk_LTHXXrryrMaeWOOq35ElRxmVFRgzp9HuKQuUkEtRH8Ism6vqMguVt4bfsYOLjYCWE-02O-mMbKhiIRI7Ov2P3vGfC4VclDasSmtixpjG8JltbYJqWVHcy7E4d3A0I6RTFEPnAt7hnOU36BJCdlYV5zGWAIwt-yR7d4eroxUc8W60fg_WaHN-LXMAvvZuR9DRbJboe8tV4gY0sQVsB7RBj9buLPLH5VhVuQquKOFsOSe4iRRHS-o',
    category: 'nearby',
  },
  {
    name: 'Elena V.',
    status: 'New',
    statusBg: 'bg-gray-100 text-gray-700',
    engagement: 'Low',
    engagementColor: 'text-[#ba1a1a]',
    points: 50,
    borough: 'Islington',
    lastVisit: 'Today',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvaKZ7RgvIaEgHECvU3lwnRUOLum3ZkQ0l0GfkZG75ZWjmst5qEO1JretavID-GSeFxMEHxqVZo4oHpWlXiQ-Bfne6b0HjS6yLTYVTqRlv74lNMbQpRRS4MNVC5lXn58rCzL4LpeAPpCjl5b9peGn-IF-lfo5IZfveB3dr5jJe0vg63YpFJeqTaT2sLM2xI-jmy9ziDK8WqzXVFgUC7CeumcMQVD_DGuzex54iLWzsq7HmOfq69dpXxZZA',
    category: 'returning',
  },
  {
    name: 'David K.',
    status: 'Platinum',
    statusBg: 'bg-orange-600 text-white',
    engagement: 'High',
    engagementColor: 'text-[#ea580c]',
    points: 1240,
    borough: 'Southwark',
    lastVisit: '1 week ago',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvjEFUjca-BkVsu6dm5DLqlsNiujdTU_EKKd0Zi7osm87kxzEKO3EW55-4jkPvD_i2gDrHFNBIcHS0nPAOwG8A61Kkl3XPnpKd4RxGW5_4OH0QyzPYvkxBtd3NutrLe17AmidRpS96twbWgEu83F-rWl1FCLBe7nuCY1AqevZZBZGJwO4KNJlLnO54fFx969UTvCb3EnSxPZDF6cO8_BEIjMjbaB3XWKrvxM7_ojpxyiQPcrNcMvwlEAjQ',
    category: 'borough',
  },
];

export default function EngagementCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredCustomers = customersData.filter((customer) => {
    // Search query filter
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.borough.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.status.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesFilter =
      activeFilter === 'all' || customer.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-5">

        {/* ── SEARCH & FILTER BAR ── */}
        <section className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, borough, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: 'all', label: 'All Customers' },
              { id: 'nearby', label: 'Nearby' },
              { id: 'returning', label: 'Returning' },
              { id: 'loyalty', label: 'Loyalty' },
              { id: 'borough', label: 'Borough' },
            ].map((chip) => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 duration-100 ${
                    isActive
                      ? 'bg-[#a14000] text-white shadow-sm'
                      : 'border border-[#e2bfb0] text-gray-500 hover:bg-gray-50 bg-white'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── CUSTOMERS LIST/GRID ── */}
        <section className="space-y-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.name}
                className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] hover:border-orange-500/20 transition-all duration-300 space-y-4"
              >
                {/* Wrap profile details in a Link */}
                <Link href={`/dashboard/engagement/customers/${customer.name.toLowerCase().replace('.', '').replace(' ', '-')}`} className="block space-y-4 hover:opacity-95 transition-opacity">
                  {/* Top User Info Section */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-orange-100 overflow-hidden shrink-0">
                        <img
                          alt={customer.name}
                          src={customer.avatar}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 leading-tight">{customer.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${customer.statusBg}`}>
                          {customer.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Engagement</p>
                      <span className={`font-bold text-sm leading-none mt-1 inline-block ${customer.engagementColor}`}>
                        {customer.engagement}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#f7ece7]">
                      <p className="text-gray-400 text-[10px] font-bold">Points</p>
                      <p className="font-bold text-lg text-[#ea580c] mt-0.5">{customer.points}</p>
                    </div>
                    <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#f7ece7]">
                      <p className="text-gray-400 text-[10px] font-bold">Borough</p>
                      <p className="font-bold text-sm text-gray-800 mt-0.5">{customer.borough}</p>
                    </div>
                  </div>

                  {/* Last Visit Row */}
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Visit: {customer.lastVisit}</span>
                  </div>
                </Link>

                {/* CTA Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <button className="w-full py-2.5 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(161,64,0,0.15)]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send Message
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 border border-[#e2bfb0] rounded-xl font-bold text-xs text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all">
                      Allocate Points
                    </button>
                    <button className="flex-1 py-2 border border-[#e2bfb0] rounded-xl font-bold text-xs text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all">
                      Add Reward
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#f7ece7]">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-500">No customers found</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting search query or filter chip.</p>
            </div>
          )}
        </section>

      </div>

      {/* ── BULK ACTIONS FLOATING BAR ── */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-40">
        <div className="bg-[#1f1b18] text-white rounded-full py-3 px-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-bold text-xs text-orange-200">4 Selected</span>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-1 text-[11px] font-bold text-gray-200 hover:text-white transition-colors">
              <Megaphone className="w-3.5 h-3.5 text-orange-400" />
              Send Promotion
            </button>
            <button className="flex items-center gap-1 text-[11px] font-bold text-gray-200 hover:text-white transition-colors">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              Export
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// Simple placeholder icon
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
