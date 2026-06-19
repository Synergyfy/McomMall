'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetLatestAudit, useGetAuditHistory } from '@/service/audits/hooks';
import { 
  ClipboardCheck, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp, 
  Lock, 
  CheckCircle,
  Lightbulb, 
  ChevronRight,
  ArrowRight,
  Award,
  Download,
  Eye,
  Store,
  Compass,
  Smile,
  Zap,
  MapPin,
  FileCheck,
  Search,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditsDashboard() {
  const { data: latestAudit, isLoading: isLatestLoading } = useGetLatestAudit();
  const { data: history, isLoading: isHistoryLoading } = useGetAuditHistory();
  const [showExportToast, setShowExportToast] = useState(false);

  const isLoading = isLatestLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Syncing audit logs...</span>
      </div>
    );
  }

  const currentScore = latestAudit?.score || 72;
  const currentLift = latestAudit?.revenueLift || 18.5;
  const suggestions = latestAudit?.suggestions || [];
  
  // Outer progress circle math
  const radius = 50;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  // Handle report exporting mockup
  const handleExportReport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Hero Header with Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col justify-center lg:col-span-2 space-y-4">
          <span className="text-xs font-bold text-[#ff6900] bg-orange-50 px-3 py-1 rounded-full w-fit">
            Storefront Diagnostics
          </span>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Storefront Diagnostics & Health Score
          </h2>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Run custom diagnostics on your Google listing, campaign cycles, and catalogs. Our audits detect search indexing gaps and help you maximize conversion rates.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/dashboard/membership-audits/audits/short">
              <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white flex items-center gap-1.5 shadow-md shadow-orange-600/10">
                Run Diagnostics Wizard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Circle Progress Hero Display */}
        <div className="flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-gray-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-[#ff6900]"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-gray-800">{currentScore}</span>
              <span className="text-[10px] text-gray-400 block font-bold">/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>AI Estimated +{currentLift}% Revenue Lift</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/membership-audits/audits/short" className="w-full">
            <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white w-full py-6 rounded-xl font-bold text-xs shadow-md shadow-orange-600/10 flex items-center justify-center gap-1.5">
              <Play className="w-4 h-4" />
              Run Audit
            </Button>
          </Link>
          <Button 
            onClick={() => document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline" 
            className="border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            View Recommendations
          </Button>
          <Link href="/dashboard/storefront" className="w-full">
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 w-full py-6 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5">
              <Store className="w-4 h-4" />
              Improve Storefront
            </Button>
          </Link>
          <Button 
            onClick={handleExportReport}
            variant="outline" 
            className="border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AUDITS DASHBOARD RATING METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Metric 1: Storefront Completion */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold block">Storefront Completion</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">78%</span>
            <span className="text-[10px] text-gray-400 font-bold">score</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        {/* Metric 2: Visibility Rating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold block flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-gray-400" />
            Visibility Rating
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-600">84%</span>
            <span className="text-[10px] text-orange-400 font-bold">Good</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        {/* Metric 3: Customer Engagement Rating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold block flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-gray-400" />
            Customer Engagement
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-600">72%</span>
            <span className="text-[10px] text-orange-400 font-bold">Average</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        {/* Metric 4: Promotion Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold block flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-gray-400" />
            Promotion Activity
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-600">65%</span>
            <span className="text-[10px] text-orange-400 font-bold">Moderate</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Metric 5: Borough Participation */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-xs text-gray-400 font-semibold block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            Borough Presence
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600">90%</span>
            <span className="text-[10px] text-emerald-500 font-bold">High</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
      </div>

      {/* Grid of Audit Types - 7 Profiles from PRD */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Select Audit Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile 1: Short Audit */}
          <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#ff6900]/40 hover:shadow-sm transition-all">
            <div>
              <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                Standard
              </span>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Short Growth Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                A fast 2-minute diagnostic checklist covering storefront setup, active promotions, and basic visibility metrics.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/audits/short" className="mt-5">
              <Button className="w-full text-xs font-bold bg-[#ff6900] hover:bg-[#a14000] text-white">
                Launch Audit
              </Button>
            </Link>
          </div>

          {/* Profile 2: Full Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Silver+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Full Business Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Detailed business health check reviewing branding, customer engagement (loyalty limits), and high street footfall.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Silver
              </Button>
            </Link>
          </div>

          {/* Profile 3: MCOM Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Gold+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">MCOM Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Platform-specific optimization reviewing local mall integration, campaign participation, and partner visibility.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Gold
              </Button>
            </Link>
          </div>

          {/* Profile 4: Storefront Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Silver+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Storefront Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Review setup parameters, descriptions completeness, products lists, logo uploads, and index structures.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Silver
              </Button>
            </Link>
          </div>

          {/* Profile 5: Promotion Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Silver+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Promotion Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Checks stamp card setups, voucher campaign frequencies, and redemption limits against top merchant cohorts.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Silver
              </Button>
            </Link>
          </div>

          {/* Profile 6: Engagement Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Silver+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Engagement Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Analyzes repeat visits, customer reviews feedback activity, coupons conversions, and loyalty ratings.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Silver
              </Button>
            </Link>
          </div>

          {/* Profile 7: Visibility Audit (Locked) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between opacity-85 hover:border-gray-300 transition-all col-span-1 md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#ff6900] bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Gold+
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-850 text-base mt-2.5">Visibility Audit</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Checks district high street footfall rank, local search rotators indexes, and nearby proximity visibility indexes.
              </p>
            </div>
            <Link href="/dashboard/membership-audits/membership" className="mt-5">
              <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50">
                Unlock with Gold
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Logs List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historical Audits</h3>
          {history && history.length > 0 ? (
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="py-3 pr-4">Run Date</th>
                    <th className="py-3 px-4">Audit Profile</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Revenue Lift</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {history.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 pr-4 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(run.created_at || run.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 capitalize">{run.type} Diagnostics</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">{run.score}/100</td>
                      <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">+{run.revenueLift}%</td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link href="/dashboard/membership-audits/audits/results">
                          <span className="text-[#ff6900] hover:text-[#a14000] font-bold inline-flex items-center gap-0.5 cursor-pointer">
                            Results
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">No audits found in history. Click Run Diagnostics to run your first audit.</p>
            </div>
          )}
        </div>

        {/* Actionable Insights Feed */}
        <div id="recommendations-section" className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actionable Insights</h3>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((sug: any) => (
                <div key={sug.id} className="flex gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-150">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-850 text-xs">{sug.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{sug.description}</p>
                    <Link href={sug.actionLink}>
                      <span className="inline-flex items-center text-[10px] font-bold text-[#ff6900] hover:text-[#a14000] mt-2 cursor-pointer gap-0.5">
                        Resolve Task
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 flex flex-col items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <p className="text-xs text-gray-400">Your storefront has zero flagged recommendations!</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Report Mock Toast */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-5 py-3.5 rounded-2xl shadow-lg border border-gray-800 flex items-center gap-3 animate-slide-up">
          <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Report Export Successful</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Your diagnostic report has been downloaded as PDF.</p>
          </div>
        </div>
      )}
    </div>
  );
}
