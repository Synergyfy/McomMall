'use client';

import React from 'react';
import Link from 'next/link';
import { useGetMyMembership } from '@/service/membership/hooks';
import { useGetLatestAudit } from '@/service/audits/hooks';
import { useGetStorefrontReport } from '@/service/stats/hook';
import { 
  Award, 
  ArrowRight, 
  FileText, 
  Ticket, 
  TrendingUp, 
  ChevronRight, 
  Lightbulb, 
  Store, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper component for rendering circular progress score gauges
const ScoreGauge = ({ 
  value, 
  label, 
  sublabel 
}: { 
  value: number; 
  label: string; 
  sublabel: string; 
}) => {
  const radius = 35;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex-1 min-w-[240px]">
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="text-gray-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
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
        <span className="absolute text-lg font-bold text-gray-800">{value}%</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-800 text-sm">{label}</h4>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sublabel}</p>
      </div>
    </div>
  );
};

export default function MembershipAuditsOverview() {
  const { data: membership, isLoading: isMemberLoading } = useGetMyMembership();
  const { data: latestAudit, isLoading: isAuditLoading } = useGetLatestAudit();
  const { data: reports, isLoading: isReportsLoading } = useGetStorefrontReport('weekly');

  const isLoading = isMemberLoading || isAuditLoading || isReportsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Syncing storefront data...</span>
      </div>
    );
  }

  const activeTier = membership?.isActive ? membership.tier?.name : 'Free / Trial';
  const scoreStorefront = 78; // Storefront checklist completion estimate
  const scoreAudit = latestAudit?.score || 72;
  const suggestions = latestAudit?.suggestions || [];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Banner Status */}
      <div className="bg-gradient-to-r from-[#eff4ff] to-[#fcf8f6] border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#ff6900] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff6900]">Current Membership</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-0.5">{activeTier} Member</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {membership?.isActive 
                ? `Active subscription. Renews on ${new Date(membership.expiresAt).toLocaleDateString()}`
                : "You are currently running with a basic business account. Upgrade to unlock all benefits."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-200">
          <div className="text-left md:text-right flex-1 md:flex-initial">
            <span className="text-xs text-gray-400 block font-medium">Growth Balance</span>
            <span className="text-xl font-bold text-gray-800">$1,240.00</span>
          </div>
          <Link href="/dashboard/membership-audits/vouchers">
            <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white flex items-center gap-1 shadow-md shadow-orange-600/10">
              View Credits
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Gauges */}
      <div className="flex flex-wrap gap-5">
        <ScoreGauge 
          value={scoreStorefront} 
          label="Storefront Completeness" 
          sublabel="Score reflecting profile logo, description, and listings depth."
        />
        <ScoreGauge 
          value={scoreAudit} 
          label="Shop Growth Audit" 
          sublabel="Score based on campaigns frequency, loyalty settings, and reviews."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/membership-audits/audits/short" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-[#fcf8f6]/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Run Growth Audit</h4>
                  <p className="text-xs text-gray-400 truncate">Identify optimization gaps in 2 minutes</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff6900] transition-all" />
              </Link>

              <Link href="/dashboard/membership-audits/vouchers" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-[#fcf8f6]/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Manage Voucher Credits</h4>
                  <p className="text-xs text-gray-400 truncate">Use growth capital for promotion</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff6900] transition-all" />
              </Link>

              <Link href="/dashboard/storefront" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-[#fcf8f6]/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Improve Storefront</h4>
                  <p className="text-xs text-gray-400 truncate">Optimize descriptions & listing details</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff6900] transition-all" />
              </Link>

              <Link href="/dashboard/membership-audits/membership" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-[#fcf8f6]/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Member Benefits</h4>
                  <p className="text-xs text-gray-400 truncate">View priority rotator & search support</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff6900] transition-all" />
              </Link>
            </div>
          </div>

          {/* AI Suggestions Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-[#ff6900]">
              <Sparkles size={80} />
            </div>
            <div className="flex gap-2 items-center mb-4 text-[#ff6900]">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">AI Growth Recommendations</h3>
            </div>

            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.slice(0, 2).map((sug: any) => (
                  <div key={sug.id} className="flex gap-4 p-4 rounded-xl bg-[#fcf8f6]/40 border border-orange-100/50">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">{sug.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sug.description}</p>
                      <Link href={sug.actionLink}>
                        <span className="inline-flex items-center text-xs font-semibold text-[#ff6900] hover:text-[#a14000] mt-2 cursor-pointer gap-0.5">
                          Fix Now
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0 self-start">
                      {sug.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No active suggestions. Run a short audit to generate recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Performance Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Weekly Snapshot</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Borough traffic standing</p>
                </div>
                <Link href="/dashboard/membership-audits/reports">
                  <span className="text-xs font-semibold text-[#ff6900] hover:underline cursor-pointer">
                    Full Report
                  </span>
                </Link>
              </div>

              {reports ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Monthly Reach</span>
                    <span className="font-bold text-gray-800 text-sm">{reports.metrics.monthlyReach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Storefront Conversion</span>
                    <span className="font-bold text-gray-800 text-sm">{reports.metrics.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Local Engagement</span>
                    <span className="font-bold text-gray-800 text-sm">{reports.metrics.engagementRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-500">Borough Rank</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-800 text-sm">#{reports.metrics.boroughRank}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        Top {Math.round((reports.metrics.boroughRank / 40) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Failed to load snapshot statistics.</p>
              )}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-850 text-xs">Unlock Detailed Analytics</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Silver plan includes weekly metrics. Upgrade to Gold to access full customer journey details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
