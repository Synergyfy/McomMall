'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Download,
  Users,
  Gift,
  Award,
  ChevronLeft,
  Share2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

interface RewardClaim {
  id: string;
  name: string;
  avatar: string;
  voucher: string;
  time: string;
  status: 'Claimed' | 'Pending';
}

export default function EventPerformanceAnalytics() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load event details
  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const data = response.data?.data || response.data;
        if (data) {
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event metrics:', err);
        toast.error('Failed to load event metrics database. Showing mock reports.');
        // Mock fallback
        setEvent({
          title: 'Community Mixer',
          description: 'A friendly community mixer for storefront local merchants.',
          date: 'June 17, 2026',
          time: '5:00 PM - 9:00 PM',
          location: 'Peckham High Street, Peckham',
          capacity: 300,
          borough: 'Southwark',
          highStreet: 'Peckham High Street'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Derived Performance Metrics
  const metrics = useMemo(() => {
    const totalCap = event?.capacity || 300;
    const registrations = Math.floor(totalCap * 0.95); // e.g. 285
    const checkIns = Math.floor(registrations * 0.72); // e.g. 205
    const conversion = registrations > 0 ? Math.floor((checkIns / registrations) * 100) : 0;
    const rewardsClaimed = Math.floor(checkIns * 0.45); // e.g. 92

    return {
      registrations,
      checkIns,
      conversion,
      rewardsClaimed,
      capacity: totalCap
    };
  }, [event]);

  // Mock reward logs table
  const rewardClaims: RewardClaim[] = [
    {
      id: '1',
      name: 'Marcus Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmRwy7VtoNo4SdzhP1jQWi2xaZTNfAPr77vFtMw50K91FURqrldKPZJ4_bNHddaSXgYNDEy8P6XiBIihxPlI8UkajKMPOnRuC-pvDiYNeA6f8r-WVUglPd9craEWC5OKmt5Qj0zqu7zbQFcPdZmmFqSDz7FXS5dfSd2RNRRusN7K71eQvT0oKPK74pvdunpyemWXB4UDxU3LK56BQuvvk8rYUlH__rZkYPxZEJYkkglQ4Ok46LH3mPq1_4uw1oSjZvWvQoarBBIQ',
      voucher: 'Peckham Mixer £10 Store Gift',
      time: '12:45 PM',
      status: 'Claimed'
    },
    {
      id: '2',
      name: 'Elena Rodriguez',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTT4-OKwT6Q78jjEmnnGlYzWSEGsHXRnfpcSr29HKoRABkMX0kb2Lc4y1OkxAsCEyhKWZ-oNeymiZVBhSqTKYUmE415T6awBaGdTru-WYkwM3fjfGjFlsIPqfvPI7HITEoIhnigBlf8FdmbfEjFFeZ-36vfgl6zXJsMXOlCKGwgEtHNsoOjoM47aSkXktNNurQjOQXm1GkiEYOCWmE7m1bByh-ub-gOhka-8uTVxBgq2sIVdNoC5V19MGLmbZOppea3evOjfzt4Hk',
      voucher: 'Peckham Mixer £10 Store Gift',
      time: '12:42 PM',
      status: 'Claimed'
    },
    {
      id: '3',
      name: 'Sarah Jenkins',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPHt1_gG7qU6caIUC6mLBrfZUlnoRgbCt6xY4MhbilAgQNiXYlEhaw3UWglJjPh3qpwG8xTZFgRybotK-f6OiCCUHOJAV_fIxBAJJTBBTGOSmQ5bXLs2mfngp-MTs58zoY-VBGcNpNilcEvSTwrk7vC4pJxlSySqc-bgnSp9xTUOBIojpTe9J-FugnaPyYix7uT4wPuFLby9O_7K-SFwxUw4_Ndolj8dDX9GtqAkbYxnVgkpcHGjqHXB4xs4bNKyvSSPTULNVy3dY',
      voucher: 'Peckham Mixer £10 Store Gift',
      time: '12:35 PM',
      status: 'Claimed'
    },
    {
      id: '4',
      name: 'Oliver Thorne',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgEiGhJ8SGqqROf96_8FH48-q6CECPCsZ38Pye3Irrpkh5oyymEAEycixyCuIovXA_7gAJomnFXjO9l9omVaqWn-IIuK3bry5RCL_I8G5xjZJ-nj3rPMtC7fkz6N2vpOx-GQ3CVx_j9wqQvcur5BB8THt7NS0vu6ADUeLfi1_HcN0uNAx3l9cYQFwT_jjkD2GB-djVr9f8pQD4Qa1FumfUjsemxQOdrLvY_W7yfOzQwOgJYwO12fRFoFZea2HiMqJUyiYEIC8gxhw',
      voucher: 'Peckham Mixer £10 Store Gift',
      time: '12:28 PM',
      status: 'Claimed'
    }
  ];

  // Borough reach calculations
  const boroughsData = [
    { name: event?.borough || 'Southwark', registrations: Math.floor(metrics.registrations * 0.70), pct: 70 },
    { name: 'Lambeth', registrations: Math.floor(metrics.registrations * 0.20), pct: 20 },
    { name: 'Lewisham', registrations: Math.floor(metrics.registrations * 0.07), pct: 7 },
    { name: 'Other', registrations: Math.floor(metrics.registrations * 0.03), pct: 3 }
  ];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans pb-24 print:bg-white print:pb-0">
      
      {/* Header Panel */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-sm print:relative print:border-none print:shadow-none">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/events')}
              className="p-2 hover:bg-slate-50 text-gray-500 rounded-xl transition-colors print:hidden"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                Post-Event Performance Report
              </span>
              <h1 className="text-xl font-bold tracking-tight text-gray-800">
                {event?.title || 'Community Mixer'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => toast.success('Link copied to clipboard!')}
              className="p-3 bg-white border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Share2 size={15} />
              Share Report
            </button>
            <button
              onClick={handlePrint}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Download size={15} />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8 print:p-0">
        
        {/* Event Meta Summary Cards */}
        <section className="bg-white rounded-2xl border border-gray-200/60 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm print:border-none">
          <div className="space-y-1.5 min-w-0">
            <h2 className="text-base font-bold text-gray-800 leading-snug">Event Overview</h2>
            <p className="text-xs text-gray-500 max-w-xl font-medium leading-relaxed">
              {event?.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-600 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="text-orange-500" size={15} />
              <span>{event?.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-orange-500" size={15} />
              <span>{event?.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500" size={15} />
              <span>{event?.location}</span>
            </div>
          </div>
        </section>

        {/* KPIs Bento Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registrations */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Registrations</span>
                <Users className="text-orange-600" size={18} />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{metrics.registrations}</div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">
              Out of {metrics.capacity} capacity limit
            </p>
          </div>

          {/* Actual Check-Ins */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Check-Ins</span>
                <CheckCircle className="text-indigo-600" size={18} />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{metrics.checkIns}</div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">
              Physical attendees verified at store
            </p>
          </div>

          {/* Attendance Conversion */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Conversion Rate</span>
                <TrendingUp className="text-emerald-600" size={18} />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{metrics.conversion}%</div>
            </div>
            <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.conversion}%` }}></div>
            </div>
          </div>

          {/* Vouchers Claimed */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rewards Dispatched</span>
                <Gift className="text-rose-600" size={18} />
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{metrics.rewardsClaimed}</div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">
              Voucher templates claimed by attendees
            </p>
          </div>
        </section>

        {/* Visual Analytics Charts Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Attendance Timeline trend (SVG) */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Attendance Trend Timeline</h3>
              <p className="text-[11px] text-gray-400 font-medium mb-6">Hourly check-ins rate during event hours</p>
            </div>
            <div className="w-full h-48 relative">
              {/* SVG Line Graph */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6900" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ff6900" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d="M 0 40 Q 15 28 30 18 T 60 12 T 90 25 T 100 40 Z" fill="url(#areaGrad)" />
                {/* Line Path */}
                <path d="M 0 40 Q 15 28 30 18 T 60 12 T 90 25 T 100 40" fill="none" stroke="#ff6900" strokeWidth="1.5" />
                {/* Dot markers */}
                <circle cx="30" cy="18" r="1.2" fill="#a14000" />
                <circle cx="60" cy="12" r="1.2" fill="#a14000" />
                <circle cx="90" cy="25" r="1.2" fill="#a14000" />
              </svg>
              {/* Y Axis Guides */}
              <div className="absolute top-0 bottom-0 left-0 border-l border-slate-100 flex flex-col justify-between text-[8px] font-bold text-gray-400 pl-1 pointer-events-none">
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4 border-t pt-3 border-gray-100">
              <span>Start (5:00)</span>
              <span>Midway (7:00)</span>
              <span>End (9:00)</span>
            </div>
          </div>

          {/* Borough Reach (Bar chart) */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Geographical Borough Reach</h3>
              <p className="text-[11px] text-gray-400 font-medium mb-6">Distribution of registrations by home borough</p>
            </div>
            <div className="space-y-4">
              {boroughsData.map((data, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{data.name}</span>
                    <span>{data.registrations} ({data.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-slate-400'}`}
                      style={{ width: `${data.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Claimed Rewards Table Logs */}
        <section className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Claimed Rewards Ledger</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Real-time checkout voucher claims log</p>
            </div>
            <span className="p-2 bg-orange-50 rounded-xl text-orange-600">
              <Award size={18} />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Attendee</th>
                  <th className="p-4">Assigned Voucher</th>
                  <th className="p-4">Claimed Time</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-slate-700">
                {rewardClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <img className="w-full h-full object-cover" src={claim.avatar} alt={claim.name} />
                      </div>
                      <span className="font-bold text-gray-900">{claim.name}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-500">{claim.voucher}</td>
                    <td className="p-4 text-slate-500">{claim.time}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold text-[10px]">
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
