'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Store, Gift, Calendar, Sparkles,
  Star, ChevronDown, Bell, ChevronRight,
  Utensils, Dumbbell, Layers,
  Map, Ticket, Sun, CloudSun, Thermometer, Droplets,
  Cloud, CloudRain, CloudSnow, CloudLightning,
  CloudFog, CloudDrizzle, Building2,
} from 'lucide-react';

import StatsCards from '../StatsCards';
import RecentActivities from '../RecentActivities';
import { CustomerStatsDto, OwnerStatsDto } from '@/service/stats/types';
import { UserRole } from '@/service/auth/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetMarketplaceLocations } from '@/service/marketplace/discovery';
import { useGetUserProfile } from '@/service/user/hook';
import { useWeather } from '@/lib/hooks/useWeather';
import {
  useCustomerHome,
  useCustomerRewards,
} from '@/service/customers/dashboard';

interface DashboardHomeProps {
  userName: string;
  points: number;
  stats: OwnerStatsDto | CustomerStatsDto | null;
  isLoadingStats: boolean;
  activities: any;
  isLoadingActivities: boolean;
  onAddPoints: (amount: number) => void;
  setActiveTab: (tab: 'home' | 'discover' | 'rewards' | 'profile') => void;
}

const WEATHER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
};

const categoryIcon = (category?: string) => {
  const value = (category || '').toLowerCase();
  if (/(food|dining|cafe|coffee|restaurant|bakery)/.test(value)) {
    return Utensils;
  }
  if (/(fitness|health|gym|sport)/.test(value)) {
    return Dumbbell;
  }
  return Store;
};

const plural = (count: number, singular: string, pluralForm?: string) =>
  count === 1 ? singular : pluralForm || `${singular}s`;

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  points,
  stats,
  isLoadingStats,
  activities,
  isLoadingActivities,
  setActiveTab,
}) => {
  const router = useRouter();
  const [boroughOverride, setBoroughOverride] = useState<string | null>(null);
  const [isBoroughOpen, setIsBoroughOpen] = useState(false);

  const { data: home, isLoading: isLoadingHome } = useCustomerHome(
    boroughOverride ?? undefined,
  );
  const { data: locationFacets } = useGetMarketplaceLocations();
  const { data: rewards } = useCustomerRewards();
  const { data: profile } = useGetUserProfile();

  const assignedBorough =
    home?.location?.borough || home?.location?.city || null;
  const activeBorough = boroughOverride || assignedBorough;

  const { data: weather } = useWeather({
    latitude: home?.location?.latitude,
    longitude: home?.location?.longitude,
    postcode: profile?.postcode,
  });

  const boroughOptions = useMemo(() => {
    const names = new Set<string>();
    const cities = locationFacets?.cities ?? [];
    cities.forEach((city) => {
      city.children.forEach((borough) => {
        if (borough.name) names.add(borough.name);
      });
    });
    if (assignedBorough) names.add(assignedBorough);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [locationFacets, assignedBorough]);

  const trending = home?.trending ?? [];
  const rewardItems = rewards?.rewards ?? [];
  const deals = home?.nearbyDeals ?? [];
  const liveOffers = home?.liveOffersCount ?? 0;
  const newOffers = home?.newOffersCount ?? 0;
  const activeCampaigns = home?.activeCampaignsCount ?? 0;
  const displayPoints = home?.user?.points ?? points;

  const WeatherIcon = weather?.available
    ? WEATHER_ICONS[weather.icon || 'cloud-sun'] || CloudSun
    : CloudSun;

  const handleBoroughChange = (borough: string) => {
    setBoroughOverride(borough);
    setIsBoroughOpen(false);
  };

  return (
    <div className="space-y-6 pb-6 relative min-h-screen">
      {/* ── Top App Bar ── */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-full border-2 border-[#ff6900] overflow-hidden">
            <AvatarFallback className="bg-[#ff6900]/10 text-[#a14000] font-extrabold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-[#5a4136]">
              Welcome back,
            </span>
            <span className="font-headline-md text-headline-md font-bold text-[#a14000] leading-none">
              {userName || 'Member'}!
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#ff9969] px-2.5 py-1 rounded-full">
            <Star className="w-[14px] h-[14px] fill-[#773005] text-[#773005]" />
            <span className="text-[11px] font-extrabold text-[#773005]">
              {displayPoints.toLocaleString()} pts
            </span>
          </div>
          <button className="p-2 hover:bg-[#f8ddd2] rounded-full transition-colors">
            <Bell className="w-6 h-6 text-[#5a4136]" />
          </button>
        </div>
      </header>

      {/* ── Location & Weather Widget ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2a3a] via-[#2c3e50] to-[#34495e] p-5 rounded-2xl text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <WeatherIcon className="w-full h-full" />
        </div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <WeatherIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="relative">
                  {boroughOptions.length > 0 ? (
                    <button
                      onClick={() => setIsBoroughOpen(!isBoroughOpen)}
                      className="flex items-center gap-1 text-base font-bold"
                    >
                      {activeBorough || 'Your area'}
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-base font-bold">
                      <MapPin className="w-4 h-4 text-white/70" />
                      {activeBorough || 'Your area'}
                    </span>
                  )}
                  {isBoroughOpen && boroughOptions.length > 0 && (
                    <div className="absolute top-8 left-0 z-50 bg-white border border-[#e2bfb0] shadow-lg rounded-xl py-2 w-48 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {boroughOptions.map((borough) => (
                        <button
                          key={borough}
                          onClick={() => handleBoroughChange(borough)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                            activeBorough === borough
                              ? 'text-[#a14000] bg-[#fff1ec]'
                              : 'text-[#5a4136] hover:bg-[#fff8f6]'
                          }`}
                        >
                          {borough}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {weather?.available ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-sm font-bold">
                          {weather.temperature}&deg;C
                        </span>
                      </div>
                      <span className="w-px h-3 bg-white/20" />
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-xs text-white/80">
                          {weather.humidity}%
                        </span>
                      </div>
                      <span className="w-px h-3 bg-white/20" />
                      <span className="text-xs text-white/80 flex items-center gap-1">
                        <WeatherIcon className="w-3 h-3" />
                        {weather.condition}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-white/70">
                      {weather?.available === false
                        ? 'Weather unavailable'
                        : isLoadingHome
                          ? 'Locating your weather...'
                          : 'Weather unavailable'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {home && (
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white text-[10px] flex items-center justify-center font-bold">
                  {liveOffers}
                </div>
                <div className="w-9 h-9 rounded-full border-2 border-white/30 bg-[#ff6900] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeCampaigns}
                </div>
              </div>
            )}
          </div>
          {home && (
            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-white/70">
              <Store className="w-3.5 h-3.5" />
              {liveOffers} live {plural(liveOffers, 'offer')} &middot;{' '}
              {activeCampaigns} active{' '}
              {plural(activeCampaigns, 'campaign')} in{' '}
              {activeBorough || 'your borough'}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-4 pb-2">
          {[
            { icon: Gift, label: 'Redeem', color: 'bg-[#ff9969] text-[#773005]' },
            { icon: Calendar, label: 'Book', color: 'bg-[#f8ddd2] text-[#261812]' },
            { icon: Map, label: 'Map', color: 'bg-[#f8ddd2] text-[#261812]' },
            { icon: Layers, label: 'Trends', color: 'bg-[#f8ddd2] text-[#261812]' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
              onClick={() => {
                if (label === 'Redeem') setActiveTab('rewards');
                if (label === 'Book') router.push('/dashboard/my-bookings');
                if (label === 'Map') router.push('/dashboard/discover');
                if (label === 'Trends') router.push('/dashboard/discover');
              }}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg group-active:scale-90 transition-transform`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-[#261812]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Offers Banner ── */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-[#a14000] p-6 text-white shadow-xl min-h-[160px] flex flex-col justify-between">
          <div className="z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full font-label-sm text-label-sm font-bold mb-2">
              Happening Now
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile leading-tight">
              {!home && isLoadingHome
                ? `Checking offers in ${activeBorough || 'your borough'}...`
                : newOffers > 0
                  ? `${newOffers} new ${plural(newOffers, 'offer')} in ${activeBorough || 'your borough'}`
                  : liveOffers > 0
                    ? `${liveOffers} live ${plural(liveOffers, 'offer')} in ${activeBorough || 'your borough'}`
                    : `No new offers in ${activeBorough || 'your borough'} yet`}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="z-10 w-fit mt-4 px-6 py-2 bg-white text-[#a14000] rounded-full font-label-md text-label-md hover:bg-[#ffdbcc] transition-colors"
          >
            Explore Now
          </button>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
            <Store className="w-full h-full" />
          </div>
        </div>
      </section>

      {/* ── Recommended for You ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-[#261812]">
            Recommended for You
          </h2>
          <button
            onClick={() => setActiveTab('discover')}
            className="text-[#a14000] font-label-md text-label-md flex items-center"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {trending.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trending.slice(0, 4).map((biz) => {
              const CategoryIcon = categoryIcon(biz.category);
              const image = biz.bannerUrl || biz.logoUrl;
              return (
                <div
                  key={biz.id}
                  onClick={() => setActiveTab('discover')}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-[#e2bfb0]/30 cursor-pointer"
                >
                  <div className="h-40 relative bg-gradient-to-br from-[#f8ddd2] to-[#fff1ec]">
                    {image ? (
                      <img
                        alt={biz.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-[#a14000]/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-[#ff9969] text-[#773005] font-label-sm text-label-sm font-bold rounded-full shadow-sm">
                      {biz.category}
                    </div>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md text-white font-label-sm text-label-sm font-bold rounded flex items-center gap-1">
                      <CategoryIcon className="w-[14px] h-[14px]" />
                      {biz.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-headline-md leading-tight text-[#261812]">
                        {biz.businessName}
                      </h3>
                      <span className="flex items-center gap-0.5 text-[#97481e] font-bold">
                        {Number(biz.rating || 0).toFixed(1)}{' '}
                        <Star className="w-[16px] h-[16px] fill-[#97481e] text-[#97481e]" />
                      </span>
                    </div>
                    <p className="text-[#5a4136] font-body-md text-body-md mb-4 line-clamp-2">
                      {biz.shortDescription || 'A local business in your borough.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[#f8ddd2] text-[#5a4136] rounded font-label-sm text-label-sm font-bold">
                        {biz.reviewCount}{' '}
                        {plural(biz.reviewCount, 'review')}
                      </span>
                      {biz.distance && (
                        <span className="px-2 py-1 bg-[#f8ddd2] text-[#5a4136] rounded font-label-sm text-label-sm font-bold">
                          {biz.distance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2bfb0]/30 p-6 text-center">
            <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#5a4136]">
              {isLoadingHome
                ? 'Loading businesses in your borough...'
                : 'No businesses listed in your borough yet.'}
            </p>
          </div>
        )}
      </section>

      {/* ── Picked for You ── */}
      {(rewardItems.length > 0 || deals.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#a14000]" />
            <h2 className="font-headline-md text-headline-md text-[#261812]">
              Picked for you
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewardItems.length > 0 ? (
              <>
                <div className="col-span-2 row-span-2 bg-white/70 backdrop-blur-[12px] border border-white/30 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                  <div className="z-10">
                    <span className="text-[#a14000] font-label-sm text-label-sm font-bold uppercase tracking-widest mb-2 block">
                      {rewardItems[0].brand || 'Reward'}
                    </span>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile max-w-[220px] mb-4 text-[#261812]">
                      {rewardItems[0].title}
                    </h3>
                    <p className="text-[#5a4136] font-body-md text-body-md mb-6 line-clamp-3">
                      {rewardItems[0].description ||
                        'Redeem this reward with your points.'}
                    </p>
                  </div>
                  <div className="z-10 flex items-center gap-3">
                    <span className="bg-[#a14000] text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      REDEEM {rewardItems[0].cost.toLocaleString()} PTS
                    </span>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="text-xs font-bold text-[#a14000] flex items-center"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {rewardItems[0].image && (
                    <img
                      alt={rewardItems[0].title}
                      src={rewardItems[0].image}
                      className="absolute inset-0 w-full h-full object-cover opacity-10"
                    />
                  )}
                  <div className="absolute -right-10 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-[200px] h-[200px]" />
                  </div>
                </div>

                {rewardItems.slice(1, 3).map((reward) => (
                  <div
                    key={reward.id}
                    onClick={() => setActiveTab('rewards')}
                    className="bg-[#f8ddd2] rounded-3xl p-4 flex flex-col items-center text-center justify-center gap-2 border border-[#e2bfb0]/30 cursor-pointer"
                  >
                    <Gift className="w-9 h-9 text-[#a14000]" />
                    <h4 className="font-label-md text-label-md font-bold text-[#261812] line-clamp-2">
                      {reward.title}
                    </h4>
                    <span className="bg-[#009efb] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      REDEEM {reward.cost.toLocaleString()} PTS
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div
                  onClick={() => setActiveTab('discover')}
                  className="col-span-2 row-span-2 bg-white/70 backdrop-blur-[12px] border border-white/30 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer"
                >
                  <div className="z-10">
                    <span className="text-[#a14000] font-label-sm text-label-sm font-bold uppercase tracking-widest mb-2 block">
                      Offer in {activeBorough || 'your borough'}
                    </span>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile max-w-[220px] mb-4 text-[#261812]">
                      {deals[0].name}
                    </h3>
                    <p className="text-[#5a4136] font-body-md text-body-md mb-6 line-clamp-3">
                      {deals[0].description || 'Available from a local merchant.'}
                    </p>
                  </div>
                  <div className="z-10 flex items-center gap-2">
                    <span className="bg-[#a14000] text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      +{deals[0].points} PTS
                    </span>
                    {deals[0].businesses[0] && (
                      <span className="text-[10px] font-semibold text-[#5a4136]">
                        {deals[0].businesses[0]}
                      </span>
                    )}
                  </div>
                  <div className="absolute -right-10 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Store className="w-[200px] h-[200px]" />
                  </div>
                </div>

                {deals.slice(1, 3).map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setActiveTab('discover')}
                    className="bg-[#f8ddd2] rounded-3xl p-4 flex flex-col items-center text-center justify-center gap-2 border border-[#e2bfb0]/30 cursor-pointer"
                  >
                    <Ticket className="w-9 h-9 text-[#a14000]" />
                    <h4 className="font-label-md text-label-md font-bold text-[#261812] line-clamp-2">
                      {deal.name}
                    </h4>
                    <span className="bg-[#ff6900] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      +{deal.points} PTS
                    </span>
                  </div>
                ))}
              </>
            )}

            <div className="col-span-2 bg-[#ff6900] text-white rounded-3xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-headline-md text-headline-md">
                  Boost Rewards
                </h4>
                <p className="font-label-sm text-label-sm font-semibold opacity-80">
                  Invite a friend to MCOM Mall
                </p>
              </div>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator
                      .share({
                        title: 'Join me on MCOM Mall',
                        url: typeof window !== 'undefined' ? window.location.origin : undefined,
                      })
                      .catch(() => undefined);
                  }
                }}
                className="bg-white text-[#a14000] px-4 py-2 rounded-full font-label-md text-label-md font-bold"
              >
                Share
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Integrated Stats & Activities ── */}
      <section className="space-y-4 pt-2 border-t border-[#e2bfb0]/30">
        <div>
          <h3 className="font-headline-md text-headline-md text-[#261812]">
            Your Rewards &amp; Stats Overview
          </h3>
          <p className="font-label-sm text-label-sm font-semibold text-[#5a4136] mt-0.5">
            Real-time statistics of your Mcom purchases
          </p>
        </div>
        {isLoadingStats ? (
          <div className="py-4 text-center text-xs text-[#5a4136] font-semibold">
            Loading stats...
          </div>
        ) : stats ? (
          <StatsCards stats={stats} role={UserRole.CUSTOMER} />
        ) : (
          <div className="py-4 text-center text-xs text-[#5a4136] font-semibold">
            No statistics available.
          </div>
        )}
      </section>

      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-[#261812]">
            Recent Activity Feed
          </h3>
          <span className="text-[10px] font-bold text-[#a14000] uppercase tracking-widest">
            History
          </span>
        </div>
        <RecentActivities activities={activities} isLoading={isLoadingActivities} />
      </section>

      {/* ── Trending in Borough ── */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-headline-md text-[#261812]">
          Trending in {activeBorough || 'your borough'}
        </h3>
        {trending.length > 0 ? (
          <div className="space-y-3">
            {trending.slice(0, 5).map((item, index) => {
              const rating = Number(item.rating || 0);
              const image = item.logoUrl || item.bannerUrl;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('discover')}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e2bfb0]/30 hover:bg-[#fff1ec] transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#fff1ec] flex-shrink-0 flex items-center justify-center">
                    {image ? (
                      <img
                        alt={item.businessName}
                        className="w-full h-full object-cover"
                        src={image}
                      />
                    ) : (
                      <Store className="w-7 h-7 text-[#a14000]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-label-md text-label-md font-bold text-[#261812] truncate">
                        {item.businessName}
                      </h4>
                      <span className="font-extrabold text-[10px] text-[#a14000] whitespace-nowrap">
                        #{index + 1} Trending
                      </span>
                    </div>
                    <p className="text-[#5a4136] text-[11px] font-semibold truncate">
                      {item.shortDescription || item.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 flex-1 bg-[#f8ddd2] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#a14000] rounded-full"
                          style={{ width: `${Math.min(100, (rating / 5) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-[#5a4136] uppercase tracking-wider whitespace-nowrap">
                        {rating.toFixed(1)} &middot; {item.reviewCount}{' '}
                        {plural(item.reviewCount, 'review')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2bfb0]/30 p-6 text-center">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#5a4136]">
              {isLoadingHome
                ? 'Loading trending businesses...'
                : 'No trending businesses in your borough yet.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
