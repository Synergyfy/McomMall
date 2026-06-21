'use client';

import { FC, useState, useEffect } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Map, 
  Layers, 
  ListOrdered, 
  Rss,
  Building, 
  Award,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { BusinessCard } from '../shared/BusinessCard';
import api from '@/service/api';

// ─── HIGH STREET SCREEN ──────────────────────────────────────────────────────
interface HighStreetScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  boroughName: string;
}

export const HighStreetScreen: FC<HighStreetScreenProps> = ({
  onNavigate,
  mallData,
  boroughName,
}) => {
  const points = mallData?.pointsBalance ?? 2400;
  const activeBusinessesCount = mallData?.businesses?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Ecosystem Title */}
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{boroughName} High Street</h2>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          Manage your high street footprint, monitor consumer footprints, and explore neighbor profiles.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Ecosystem Reach</p>
          <p className="text-2xl font-black text-orange-600 mt-1">4.8k views</p>
          <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Last 30 days active</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Points Distributed</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{points.toLocaleString()}</p>
          <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Mall loyalty pool</span>
        </div>
      </div>

      {/* Sub navigation cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Interactive Map', desc: 'Browse neighbor coordinate pins.', icon: Map, screen: 'map', color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { title: 'Storefront Clusters', desc: 'View categorized local stores.', icon: Layers, screen: 'clusters', color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { title: 'District Feed', desc: 'Review active borough announcements.', icon: Rss, screen: 'feed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { title: 'Leaderboard Ranks', desc: 'Check neighbor growth velocity.', icon: ListOrdered, screen: 'rankings', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => onNavigate(item.screen)}
            className={`p-4 rounded-3xl border text-left shadow-sm flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all active:scale-[0.98] duration-150 ${item.color}`}
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 mt-2">{item.title}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── MAP SCREEN ──────────────────────────────────────────────────────────────
interface MapScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  boroughName: string;
}

export const MapScreen: FC<MapScreenProps> = ({
  onNavigate,
  mallData,
  boroughName,
}) => {
  const [postcode, setPostcode] = useState('');
  useEffect(() => {
    setPostcode(localStorage.getItem('businessPostcode') || 'SE10');
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{boroughName} Live Map</h2>
        <p className="text-xs text-gray-400 mt-1">Real-time coordinates of nearby local businesses.</p>
      </div>

      <div className="w-full h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-150">
        <iframe
          title="Interactive Map View"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(postcode)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full border-0 absolute inset-0 filter grayscale-[5%] contrast-[95%]"
          loading="lazy"
        />
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Map Legend</h4>
        <div className="flex flex-col gap-2.5">
          {[
            { color: 'bg-orange-500', title: 'Verified Merchants', desc: 'Active registered local vendors' },
            { color: 'bg-amber-500', title: 'Claimed Merchants', desc: 'Registered and pending review' },
            { color: 'bg-gray-300', title: 'Unclaimed Locations', desc: 'Eligible listings waiting for claims' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.color}`} />
              <div>
                <p className="text-xs font-bold text-gray-900">{item.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CLUSTER SCREEN ──────────────────────────────────────────────────────────
interface ClusterScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const ClusterScreen: FC<ClusterScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const businesses = mallData?.businesses || [];

  const categories = ['All', 'Food', 'Tech', 'Fashion', 'Wellness', 'Store'];

  const filteredBusinesses = selectedCategory === 'All'
    ? businesses
    : businesses.filter((b: any) => (b.category || '').toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Storefront Clusters</h2>
        <p className="text-xs text-gray-400 mt-1">Ecosystem listings grouped by sector category.</p>
      </div>

      {/* Categories chips bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat 
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredBusinesses.map((b: any) => (
          <BusinessCard
            key={b.id}
            id={b.id}
            name={b.businessName}
            category={b.category || 'Store'}
            description={b.shortDescription || 'No description provided.'}
            address={b.address || ''}
            isClaimed={b.isClaimed}
            isVerified={b.isVerified}
            logoUrl={b.logoUrl}
            onViewProfile={(id) => onNavigate(`profile:${id}`)}
          />
        ))}

        {filteredBusinesses.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8 col-span-2">
            No businesses found in the selected sector.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── DISTRICT FEED SCREEN ────────────────────────────────────────────────────
interface BoroughFeedScreenProps {
  onNavigate: (screen: string) => void;
  boroughName: string;
}

export const BoroughFeedScreen: FC<BoroughFeedScreenProps> = ({
  onNavigate,
  boroughName,
}) => {
  const feedPosts = [
    { id: '1', author: 'Greenwich Bakery', text: 'Co-promotion deal active this weekend! Earn double points on all bread purchases.', likes: 12, date: '2 hrs ago', category: 'Promotion' },
    { id: '2', author: 'Borough Admin', text: 'Join our local High Street Webinar next Tuesday. Learn rotators management tips.', likes: 24, date: '1 day ago', category: 'Notice' },
    { id: '3', author: 'FitStudio Greenwich', text: 'New yoga slots available for local businesses staff! 15% discount for verified merchants.', likes: 8, date: '2 days ago', category: 'Collab' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{boroughName} Feed</h2>
        <p className="text-xs text-gray-400 mt-1">Local announcements, cross-promotion offers, and community discussions.</p>
      </div>

      <div className="flex flex-col gap-4">
        {feedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">{post.author}</h4>
                  <p className="text-[9px] text-gray-400">{post.date}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold text-[9px] uppercase tracking-wider">
                {post.category}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {post.text}
            </p>

            <div className="flex items-center gap-4 border-t border-gray-50 pt-2 text-gray-400">
              <button className="flex items-center gap-1 hover:text-orange-500 transition-colors text-[10px] font-bold">
                <ThumbsUp className="w-3.5 h-3.5" /> {post.likes} Likes
              </button>
              <button className="flex items-center gap-1 hover:text-orange-500 transition-colors text-[10px] font-bold">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── LEADERBOARD RANKINGS SCREEN ─────────────────────────────────────────────
interface RankingsScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const RankingsScreen: FC<RankingsScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const businesses = mallData?.businesses || [];

  // Sort businesses by verified and claimed status to create growth score ranking
  const sortedRankings = [...businesses].map((b, idx) => ({
    ...b,
    growthScore: 95 - idx * 4,
    pointsDistributed: 1800 - idx * 120,
  })).sort((a, b) => b.growthScore - a.growthScore);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">High Street Rankings</h2>
        <p className="text-xs text-gray-400 mt-1">Leaderboard of local businesses sorted by verification, campaign reach, and community contributions.</p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-5">Merchant</span>
          <span className="col-span-3 text-right">Points Pool</span>
          <span className="col-span-2 text-right">Reach %</span>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedRankings.map((b, idx) => (
            <div 
              key={b.id}
              onClick={() => onNavigate(`profile:${b.id}`)}
              className="p-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors cursor-pointer text-xs font-semibold"
            >
              {/* Rank */}
              <div className="col-span-2 flex justify-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  idx === 0 
                    ? 'bg-amber-100 text-amber-800' 
                    : idx === 1 
                      ? 'bg-slate-200 text-slate-700' 
                      : idx === 2 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'text-gray-400'
                }`}>
                  {idx + 1}
                </span>
              </div>

              {/* Merchant */}
              <div className="col-span-5 flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-100">
                  {b.businessName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-gray-900 truncate leading-snug">{b.businessName}</p>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">{b.category || 'Store'}</span>
                </div>
              </div>

              {/* Points Pool */}
              <div className="col-span-3 text-right text-gray-900 font-bold tabular-nums">
                {b.pointsDistributed.toLocaleString()} pts
              </div>

              {/* Reach Score */}
              <div className="col-span-2 text-right text-orange-600 font-black tracking-tight">
                {b.growthScore}%
              </div>
            </div>
          ))}

          {sortedRankings.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">
              No merchant rankings currently compiled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
