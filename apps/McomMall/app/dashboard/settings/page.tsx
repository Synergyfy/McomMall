'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserProfile } from '@/service/user/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { useGetTeam } from '@/service/team/hooks';
import { useGetMyMembership } from '@/service/membership/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  UserPlus, 
  Link as LinkIcon, 
  Receipt, 
  User, 
  Users, 
  Puzzle, 
  CreditCard, 
  ChevronRight, 
  CheckCircle, 
  Award,
  Globe
} from 'lucide-react';

export default function SettingsHubPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: isUserLoading } = useGetUserProfile();
  const { data: listingsData, isLoading: isListingsLoading } = useGetUserListings(1, 1);
  const { data: membership, isLoading: isMembershipLoading } = useGetMyMembership();
  
  const listing = listingsData?.data?.[0];
  const businessId = listing?.id || '';
  
  const { data: teamData } = useGetTeam(businessId);
  const activeMembersCount = teamData?.members?.length || 1; // self is at least 1
  
  const isLoading = isUserLoading || isListingsLoading || isMembershipLoading;

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!userProfile) return 0;
    let score = 0;
    if (userProfile.firstName) score += 20;
    if (userProfile.lastName) score += 20;
    if (userProfile.phoneNumber) score += 20;
    if (userProfile.profilePictureUrl) score += 20;
    if (userProfile.socials && Object.keys(userProfile.socials).length > 0) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();

  // Dynamic subscription price calculations
  let priceValue = 299.00;
  let tierName = 'Pro Tier';
  if (membership) {
    if (membership.tier) {
      tierName = membership.tier.name || 'Pro Tier';
      if (membership.planType === 'annual' && membership.tier.annual_price !== undefined) {
        priceValue = Number(membership.tier.annual_price);
      } else if (membership.planType === 'quarterly' && membership.tier.quaterly_price !== undefined) {
        priceValue = Number(membership.tier.quaterly_price);
      } else {
        priceValue = Number(membership.tier.monthly_price ?? membership.tier.fixed_price ?? 299.00);
      }
    }
  }
  const priceFormatted = `$${priceValue.toFixed(2)}`;
  const billingCycle = membership?.planType === 'annual' ? '/ year' : membership?.planType === 'quarterly' ? '/ quarter' : '/ month';
  const isActiveTier = membership?.isActive ? 'Active Tier' : 'Inactive Tier';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback defaults if no listing profile exists yet
  const displayBusinessName = listing?.businessName || 'My Business';
  const displayLogo = listing?.logoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCT-HaLvjePg65iRrx4YYbgRF58m0nK-2Kz-Q6WSxtWRQjJY5o8OxqWiNpqmNeLE-stCUd77MWrqpWiGy3NR0IKqiPK0r_twbSS87xb-d2jbOnINzoBzQULSvX2kwE9z1p-EVnJIk305OYCYb7mY1vPKTEbbcCNKiHSC3IVsPY38hFxI1Jrdmf4Pqu1YhvkMh4yE4vrRgAINTGJ5VlHoX-lL6hVPjkK_dKnM2xPozkML99obkSeM821-0Jh5ZbxTvEC-3dlf2Hksrf';
  const displayStatus = listing?.isActive ? 'Active' : 'Pending Setup';

  return (
    <div className="space-y-6">
      {/* Business Profile Header (Bento Style Card) */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <img 
            className="w-full h-full object-cover rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800" 
            alt={displayBusinessName} 
            src={displayLogo}
          />
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
            <CheckCircle className="text-[#ff6900] h-4.5 w-4.5 fill-orange-50 dark:fill-orange-950/20" />
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {displayBusinessName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Central Management Dashboard
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-950/20 text-[#22C55E] text-xs font-semibold px-3 py-1 rounded-full border border-green-200/50">
              <CheckCircle className="h-3 w-3" />
              {displayStatus}
            </span>
            <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] text-xs font-semibold px-3 py-1 rounded-full border border-orange-200/30">
              <Award className="h-3 w-3" />
              Pro Membership
            </span>
          </div>
        </div>
      </section>

      {/* Quick Actions (Horizontal Scroll on Mobile, Grid on Desktop) */}
      <section className="w-full">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider pl-1">
          Quick Actions
        </h3>
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
          {/* Change Password */}
          <button 
            onClick={() => router.push('/dashboard/settings/password')}
            className="shrink-0 w-40 md:w-auto h-24 bg-white dark:bg-gray-900 hover:bg-orange-50/20 dark:hover:bg-gray-800/50 transition-all rounded-2xl p-4 flex flex-col items-start justify-between border border-gray-100 dark:border-gray-800 active:scale-95 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <Key className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-left">Change Password</span>
          </button>

          {/* Add Team Member */}
          <button 
            onClick={() => router.push('/dashboard/settings/team')}
            className="shrink-0 w-40 md:w-auto h-24 bg-white dark:bg-gray-900 hover:bg-orange-50/20 dark:hover:bg-gray-800/50 transition-all rounded-2xl p-4 flex flex-col items-start justify-between border border-gray-100 dark:border-gray-800 active:scale-95 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-left">Add Team Member</span>
          </button>

          {/* Connect Apps */}
          <button 
            onClick={() => router.push('/dashboard/settings/apps')}
            className="shrink-0 w-40 md:w-auto h-24 bg-white dark:bg-gray-900 hover:bg-orange-50/20 dark:hover:bg-gray-800/50 transition-all rounded-2xl p-4 flex flex-col items-start justify-between border border-gray-100 dark:border-gray-800 active:scale-95 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <LinkIcon className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-left">Connect Services</span>
          </button>

          {/* View Invoices */}
          <button 
            onClick={() => router.push('/dashboard/settings/invoices')}
            className="shrink-0 w-40 md:w-auto h-24 bg-white dark:bg-gray-900 hover:bg-orange-50/20 dark:hover:bg-gray-800/50 transition-all rounded-2xl p-4 flex flex-col items-start justify-between border border-gray-100 dark:border-gray-800 active:scale-95 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-left">View Invoices</span>
          </button>
        </div>
      </section>

      {/* Status Overview Bento Grid */}
      <section className="w-full">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider pl-1">
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Card */}
          <div 
            onClick={() => router.push('/dashboard/settings/account')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 transition-all cursor-pointer group flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 group-hover:text-[#ff6900] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Account Settings</h4>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage profile details, credentials, and email triggers.
              </p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#ff6900] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 block">
                Profile {completeness}% complete
              </span>
            </div>
          </div>

          {/* Team Card */}
          <div 
            onClick={() => router.push('/dashboard/settings/team')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 transition-all cursor-pointer group flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 group-hover:text-[#ff6900] transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Team Management</h4>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
            </div>
            <div className="flex items-end justify-between mt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {activeMembersCount}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                  Active Team Members
                </span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-[#ff6900]">
                  {userProfile?.firstName?.[0] || 'U'}
                </div>
                {activeMembersCount > 1 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                    +{activeMembersCount - 1}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Integrations Card */}
          <div 
            onClick={() => router.push('/dashboard/settings/apps')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 transition-all cursor-pointer group flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 group-hover:text-[#ff6900] transition-colors">
                  <Puzzle className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Integrations</h4>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                  G
                </div>
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center font-bold text-[10px]">
                  S
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Services Connection Hub
              </span>
            </div>
          </div>

          {/* Billing Card */}
          <div 
            onClick={() => router.push('/dashboard/settings/billing')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 transition-all cursor-pointer group flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 group-hover:text-[#ff6900] transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Billing & Usage</h4>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
            </div>
            <div className="flex flex-col mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {priceFormatted}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{billingCycle}</span>
              </div>
              <p className="text-[10px] font-semibold text-[#22C55E] flex items-center gap-1 mt-1">
                {tierName} · {isActiveTier}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
