'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetLatestAudit } from '@/service/audits/hooks';
import { 
  Award, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditResults() {
  const router = useRouter();
  const { data: latestAudit, isLoading } = useGetLatestAudit();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Analyzing diagnostic records...</span>
      </div>
    );
  }

  const score = latestAudit?.score || 72;
  const lift = latestAudit?.revenueLift || 18.5;
  const suggestions = latestAudit?.suggestions || [];
  const responses = latestAudit?.responses || {};

  // Outer progress ring calculations
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Build Strengths list based on questionnaire responses
  const strengths = [];
  if (responses.campaignFrequency === 'daily' || responses.campaignFrequency === 'weekly') {
    strengths.push({
      title: 'Active Campaign Frequency',
      desc: 'You consistently refresh promotions, keeping search indexing fresh.',
    });
  }
  if (responses.hasLoyalty === 'yes') {
    strengths.push({
      title: 'Configured Loyalty Program',
      desc: 'Repeat customer loops are active, protecting your merchant margins.',
    });
  }
  if (responses.googleVerified === 'yes') {
    strengths.push({
      title: 'Google Listing Verified',
      desc: 'Your shop coordinates are verified, maximizing high street visibility.',
    });
  }
  if (responses.profileComplete === 'yes') {
    strengths.push({
      title: 'Completed Storefront Profile',
      desc: 'Descriptions and product listings catalog are rich in meta details.',
    });
  }

  // Fallback strengths in case they have a low score
  if (strengths.length === 0) {
    strengths.push({
      title: 'Onboarded Merchant Account',
      desc: 'Your business profile is correctly registered in the borough catalog.',
    });
    strengths.push({
      title: 'Active Subscription Profile',
      desc: 'Basic search settings are running and available.',
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/membership-audits/audits')}
            className="hover:bg-gray-150 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
            <p className="text-xs text-gray-500">Storefront growth diagnostics output</p>
          </div>
        </div>
        
        <Link href="/dashboard/membership-audits/audits/short">
          <Button variant="outline" className="border-orange-100 text-[#ff6900] hover:bg-[#fcf8f6] text-xs font-bold">
            Re-Run Audit
          </Button>
        </Link>
      </div>

      {/* Score and Projected Revenue Lift Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge card */}
        <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-sm font-bold text-gray-800 mb-4">Diagnostics Health Score</h4>
          
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="text-gray-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
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
            <span className="absolute text-2xl font-black text-gray-800">{score}%</span>
          </div>
          
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Overall storefront visibility and promotion index performance
          </p>
        </div>

        {/* Impact Chart Estimation card */}
        <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-[#ff6900]">
            <Sparkles size={120} />
          </div>
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Growth Projection
            </span>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              Projected +{lift}% Monthly Sales Increase
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Based on statistics from similar retail merchants in your local borough, resolving outstanding opportunities (such as activating loyalty vouchers and syncing Google Places) yields an average 18% to 25% revenue boost.
            </p>
          </div>

          <div className="flex gap-4 items-center border-t border-gray-100 pt-4 mt-6">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 border border-white text-xs font-bold text-[#ff6900] flex items-center justify-center">1</div>
              <div className="w-7 h-7 rounded-full bg-orange-200 border border-white text-xs font-bold text-[#ff6900] flex items-center justify-center">2</div>
              <div className="w-7 h-7 rounded-full bg-orange-300 border border-white text-xs font-bold text-[#ff6900] flex items-center justify-center">3</div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Complete the remaining {suggestions.length} growth items to trigger the lift.
            </span>
          </div>
        </div>
      </div>

      {/* Strengths and Opportunities Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths (Green Card list) */}
        <div className="bg-[#f6fbf8] border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Key Strengths
          </h3>
          <div className="space-y-3.5">
            {strengths.map((str, idx) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 fill-emerald-50" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">{str.title}</h4>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5 leading-relaxed">{str.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities (Red/Orange Card list) */}
        <div className="bg-[#fffbfa] border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-orange-950 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#ff6900]" />
            Growth Opportunities
          </h3>
          <div className="space-y-3.5">
            {suggestions.length > 0 ? (
              suggestions.map((sug: any) => (
                <div key={sug.id} className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-[#ff6900] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-orange-900 text-xs">{sug.title}</h4>
                    <p className="text-[11px] text-orange-700/80 mt-0.5 leading-relaxed">{sug.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Zero optimization opportunities remaining. Excellent work!</p>
            )}
          </div>
        </div>
      </div>

      {/* Prioritized Recommendation Action Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Prioritized Action Plan</h3>
        <div className="space-y-4">
          {suggestions.map((sug: any, idx) => (
            <div 
              key={sug.id} 
              className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0 text-sm font-bold border border-orange-100">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-bold text-gray-900 text-sm">{sug.title}</h4>
                    <span className="text-[9px] uppercase font-extrabold tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {sug.impact} Impact
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-2xl">
                    {sug.description}
                  </p>
                </div>
              </div>

              <Link href={sug.actionLink} className="w-full md:w-auto shrink-0">
                <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white text-xs font-bold w-full md:w-auto flex items-center justify-center gap-1 shadow-md shadow-orange-600/10 py-5 px-5 rounded-xl">
                  Resolve Task
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
