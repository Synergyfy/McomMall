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
  const points = mallData?.pointsBalance ?? 0;
  const activeBusinessesCount = mallData?.businesses?.length ?? 0;
  const mallName = mallData?.mallName || `${boroughName} High Street`;

  return (
    <div className="flex flex-col gap-6">
      {/* Ecosystem Title */}
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{mallName}</h2>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          {mallData?.highStreet
            ? `${mallData.highStreet}, ${boroughName}. `
            : ''}
          Manage your local mall footprint and explore neighbouring businesses.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Customers</p>
          <p className="text-2xl font-black text-orange-600 mt-1">
            {(mallData?.consumerCount ?? 0).toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-gray-400 mt-0.5">In your local mall</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Active Businesses</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{activeBusinessesCount}</p>
          <span className="text-[9px] font-semibold text-gray-400 mt-0.5">
            Your ecosystem points: {points.toLocaleString()}
          </span>
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
    setPostcode(mallData?.postcode || localStorage.getItem('businessPostcode') || '');
  }, [mallData?.postcode]);

  const latitude = mallData?.latitude;
  const longitude = mallData?.longitude;
  const mapQuery =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? `${latitude},${longitude}`
      : mallData?.postcode || postcode;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {mallData?.mallName || `${boroughName} Live Map`}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {mallData?.highStreet
            ? `Centred on ${mallData.highStreet}.`
            : 'Local mall map view.'}
        </p>
      </div>

      <div className="w-full h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-150">
        {mapQuery ? (
          <iframe
            title="Interactive Map View"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full border-0 absolute inset-0 filter grayscale-[5%] contrast-[95%]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No location available for this local mall yet.
          </div>
        )}
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
  mallData: any;
}

export const BoroughFeedScreen: FC<BoroughFeedScreenProps> = ({
  boroughName,
  mallData,
}) => {
  const campaigns = mallData?.activeCampaigns || [];
  const deals = mallData?.nearbyDeals || [];
  const mallName = mallData?.mallName || `${boroughName} Feed`;

  const feedPosts = [
    ...campaigns.map((campaign: any, index: number) => ({
      id: `campaign-${campaign.id || index}`,
      author: campaign.title || 'Local campaign',
      text: `Campaign live in ${mallName}. Budget: ${Number(
        campaign.budget || 0,
      ).toLocaleString()}. Expires in ${campaign.expires}.`,
      date: `Expires in ${campaign.expires}`,
      category: 'Campaign',
    })),
    ...deals.map((deal: any, index: number) => ({
      id: `deal-${index}`,
      author: deal.business,
      text: `${deal.deal} — earn ${deal.points} points. Offer expires in ${deal.expires}.`,
      date: `Expires in ${deal.expires}`,
      category: 'Offer',
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{mallName}</h2>
        <p className="text-xs text-gray-400 mt-1">
          Live campaigns and offers from businesses in your local mall.
        </p>
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

            <p className="text-xs text-gray-600 leading-relaxed">{post.text}</p>
          </div>
        ))}

        {feedPosts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">
            No live campaigns or offers in {mallName} yet.
          </p>
        )}
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

  // Verified businesses first, then alphabetical. Only real attributes are
  // shown — no synthetic growth/reach scores.
  const sortedRankings = [...businesses].sort((a, b) => {
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return (a.businessName || '').localeCompare(b.businessName || '');
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {mallData?.mallName || 'Local Mall'} Businesses
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Businesses assigned to your local mall in MCOM Central.
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span className="col-span-2 text-center">#</span>
          <span className="col-span-6">Merchant</span>
          <span className="col-span-4 text-right">Status</span>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedRankings.map((b, idx) => (
            <div 
              key={b.id}
              onClick={() => onNavigate(`profile:${b.id}`)}
              className="p-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors cursor-pointer text-xs font-semibold"
            >
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

              <div className="col-span-6 flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-100">
                  {(b.businessName || '?').charAt(0)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-gray-900 truncate leading-snug">{b.businessName}</p>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">{b.category || 'Store'}</span>
                </div>
              </div>

              <div className="col-span-4 text-right">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  b.isVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {b.isVerified ? 'Verified' : 'Listed'}
                </span>
              </div>
            </div>
          ))}

          {sortedRankings.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">
              No businesses are assigned to this local mall yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
