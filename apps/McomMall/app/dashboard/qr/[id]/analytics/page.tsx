'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MousePointerClick, 
  Award, 
  Percent, 
  MapPin, 
  Clock, 
  Lightbulb, 
  Phone, 
  Info,
  ChevronRight
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface QrDetails {
  id: string;
  name: string;
  qrType: string;
  targetId?: string;
  status: string;
  scanCount: number;
  createdAt: string;
}

export default function QrPerformanceAnalytics() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Fetch QR details from API
  const { data: qrCode = null, isLoading } = useQuery<QrDetails | null>({
    queryKey: ['qr-details', id],
    queryFn: async () => {
      try {
        const res = await api.get(`qr-codes/${id}`);
        return res.data;
      } catch {
        // Fallback mock campaign details
        return {
          id: id || 'qr-1',
          name: 'Fall Season Promo',
          qrType: 'promo',
          targetId: 'promo-123',
          status: 'active',
          scanCount: 12842,
          createdAt: new Date().toISOString(),
        };
      }
    }
  });

  const handleExportPDF = () => {
    toast.success('Generating PDF report...');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/dashboard/qr/${id}/analytics`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Analytics page URL copied!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-bold text-[#5a4136] uppercase tracking-wider mb-2">
            <span className="hover:text-[#a14000] cursor-pointer" onClick={() => router.push('/dashboard/qr')}>QR Engine</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#a14000] font-black">{qrCode?.name || 'Analytics'}</span>
          </nav>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">QR Performance Dashboard</h1>
          <p className="text-sm text-[#5a4136]">
            Real-time tracking for campaign: <span className="font-extrabold">{qrCode?.name?.toUpperCase().replace(/\s+/g, '_') || 'FALL_DEALS'}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button 
            onClick={handleExportPDF} 
            variant="outline" 
            className="border-[#a14000] text-[#a14000] hover:bg-orange-50/50 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button 
            onClick={handleShare}
            className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Main Metric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Graph Area */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-[#0b1c30]">Total Scans</h2>
              <p className="text-xs text-[#5a4136]">Scans progression over the last 30 days</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#a14000]">{qrCode?.scanCount.toLocaleString() || '12,842'}</span>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 justify-end">
                <span>+14.2%</span>
              </div>
            </div>
          </div>
          
          {/* SVG Line Graph */}
          <div className="w-full h-48 bg-orange-50/20 border border-orange-100/30 rounded-xl relative overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <path 
                d="M0,180 C50,170 100,190 150,150 S250,50 300,80 S400,120 450,100 S550,20 600,40 S700,60 800,30" 
                fill="none" 
                stroke="#a14000" 
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path 
                d="M0,180 C50,170 100,190 150,150 S250,50 300,80 S400,120 450,100 S550,20 600,40 S700,60 800,30 L800,200 L0,200 Z" 
                fill="url(#trend-grad)" 
                opacity="0.15"
              />
              <defs>
                <linearGradient id="trend-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff6900" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-[10px] uppercase font-bold text-[#5a4136]/60">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>

        {/* Small Metrics Stack */}
        <div className="lg:col-span-4 grid grid-rows-3 gap-4">
          <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl flex items-center gap-4 hover:translate-y-[-2px] transition-transform shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f8f9ff] flex items-center justify-center text-[#ff6900]">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#5a4136]">Total Click-throughs</p>
              <h4 className="text-2xl font-black text-[#0b1c30]">8,214</h4>
            </div>
          </Card>

          <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl flex items-center gap-4 hover:translate-y-[-2px] transition-transform shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f8f9ff] flex items-center justify-center text-[#ff6900]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#5a4136]">Promo Redemptions</p>
              <h4 className="text-2xl font-black text-[#0b1c30]">3,492</h4>
            </div>
          </Card>

          <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl flex items-center gap-4 hover:translate-y-[-2px] transition-transform shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f8f9ff] flex items-center justify-center text-[#ff6900]">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#5a4136]">Scan Conversion Rate</p>
              <h4 className="text-2xl font-black text-[#0b1c30]">27.1%</h4>
            </div>
          </Card>
        </div>
      </div>

      {/* Borough Breakdown & Peak Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Borough list */}
        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
            <h3 className="font-black text-[#0b1c30] flex items-center gap-1.5">
              <MapPin className="w-4.5 h-4.5 text-[#ff6900]" />
              Borough Breakdown
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Islington', pct: 42 },
              { name: 'Hackney', pct: 31 },
              { name: 'Camden', pct: 18 },
              { name: 'Tower Hamlets', pct: 7 },
              { name: 'Westminster', pct: 2 }
            ].map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#5a4136]">
                  <span>{b.name}</span>
                  <span>{b.pct}%</span>
                </div>
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <div className="h-full bg-[#ff6900] rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Scan Times */}
        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
            <h3 className="font-black text-[#0b1c30] flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-[#ff6900]" />
              Peak Scan Hours
            </h3>
          </div>
          
          <div className="flex-grow flex items-end justify-between gap-1.5 h-36">
            {[15, 10, 45, 85, 65, 35].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-lg transition-all ${
                  h === 85 ? 'bg-[#ff6900]' : 'bg-[#e2bfb0]/30 hover:bg-[#ff6900]/50'
                }`}
                style={{ height: `${h}%` }}
                title={`Hour Block ${i * 4}: ${h}%`}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-[10px] font-bold text-[#5a4136]/70 uppercase mt-2 border-t border-gray-50 pt-2">
            <span>12 AM</span>
            <span>4 AM</span>
            <span>8 AM</span>
            <span className="text-[#a14000] font-black">Lunch</span>
            <span>4 PM</span>
            <span>8 PM</span>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-[#e2bfb0]/30 flex gap-3 items-center">
            <Lightbulb className="text-[#a14000] w-5 h-5 shrink-0" />
            <p className="text-xs text-[#5a4136] leading-normal">
              Most scans occur between <span className="font-bold text-[#a14000]">12:30 PM - 2:00 PM</span>. Target promotions during lunch-time peak hours.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-[#0b1c30]">Recent Scan Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-gray-100 text-xs font-bold text-[#5a4136] uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Device/OS</th>
                <th className="py-4 px-6">Borough Location</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[#0b1c30]">
              {[
                { time: 'Today, 02:14 PM', device: 'iOS 17.4 (iPhone)', loc: 'Islington', status: 'Redeemed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                { time: 'Today, 01:58 PM', device: 'Android 14 (Galaxy)', loc: 'Hackney', status: 'Clicked', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
                { time: 'Today, 01:42 PM', device: 'iOS 16.2 (iPhone)', loc: 'Camden', status: 'Scanned', color: 'bg-amber-50 text-amber-700 border border-amber-200' }
              ].map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold">{log.time}</td>
                  <td className="py-4 px-6 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {log.device}
                  </td>
                  <td className="py-4 px-6 font-semibold">{log.loc}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${log.color}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button size="sm" variant="ghost" className="text-[#a14000] p-1">
                      <Info className="w-4.5 h-4.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
