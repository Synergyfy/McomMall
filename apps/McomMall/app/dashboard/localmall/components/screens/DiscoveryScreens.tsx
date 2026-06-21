'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  UserPlus, 
  TrendingUp, 
  Eye, 
  Bookmark, 
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react';
import { BusinessCard } from '../shared/BusinessCard';
import { StatusBadge } from '../shared/StatusBadge';
import api from '@/service/api';

// ─── DISCOVER SCREEN ─────────────────────────────────────────────────────────
interface DiscoverScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const DiscoverScreen: FC<DiscoverScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const businesses = mallData?.businesses || [];

  const filteredBusinesses = businesses.filter((b: any) => 
    b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Explore Neighbors</h2>
        <p className="text-xs text-gray-400 mt-1">Search and connect with merchants in your Borough.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by business name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
        />
      </div>

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
            No matching neighboring businesses found.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── BUSINESS PROFILE SCREEN ──────────────────────────────────────────────────
interface BusinessProfileScreenProps {
  onNavigate: (screen: string) => void;
  businessId: string;
}

export const BusinessProfileScreen: FC<BusinessProfileScreenProps> = ({
  onNavigate,
  businessId,
}) => {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await api.get(`businesses/${businessId}`);
        if (res.data) {
          setBusiness(res.data);
        }
      } catch (err) {
        console.error('Error fetching business detail profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12 text-gray-400 text-xs">
        Business profile details not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Profile card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-2xl shrink-0 border border-orange-100 overflow-hidden">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.businessName} className="w-full h-full object-cover" />
            ) : (
              business.businessName.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{business.category?.name || 'Merchant'}</span>
              <StatusBadge isVerified={business.isVerified} isClaimed={business.isClaimed} />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight mt-1">{business.businessName}</h2>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {business.location?.addressLine1 || 'High Street, Greenwich'}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">About Store</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {business.shortDescription || 'No description provided by this business profile.'}
        </p>
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Contact Information</h3>
        <div className="flex flex-col gap-2.5">
          {business.website && (
            <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-orange-500 transition-colors">
              <Globe className="w-4 h-4 text-gray-400" /> {business.website} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {business.phone && (
            <p className="flex items-center gap-2.5 text-xs text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" /> {business.phone}
            </p>
          )}
          {business.email && (
            <p className="flex items-center gap-2.5 text-xs text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" /> {business.email}
            </p>
          )}
        </div>
      </div>

      {/* B2B Collab Action */}
      <button 
        onClick={() => onNavigate('partnerships')}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
      >
        <UserPlus className="w-4 h-4" /> Propose Collaboration Request
      </button>
    </div>
  );
};

// ─── COMMUNITY SCREEN ────────────────────────────────────────────────────────
interface CommunityScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const CommunityScreen: FC<CommunityScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const unclaimedBusinesses = (mallData?.businesses || []).filter((b: any) => !b.isClaimed && !b.isVerified);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteSuccess(false);

    try {
      // Create support ticket or request to invite a store
      await api.post('support-tickets', {
        subject: `Local Mall Invitation Request: ${inviteName}`,
        description: `Invite requested for neighbor merchant. Name: ${inviteName}, Email: ${inviteEmail}`,
        priority: 'low',
      });
      setInviteSuccess(true);
      setInviteEmail('');
      setInviteName('');
    } catch (err) {
      console.error('Error submitting referral invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Invite Neighbors */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Community referrals</h2>
        <p className="text-xs text-gray-400 mt-1">Know a shop on your High Street that isn't on MCOM Mall yet? Invite them and earn loyalty points!</p>

        <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text"
              placeholder="Business Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
            <input 
              type="email"
              placeholder="Business Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Referral Invitation'}
          </button>
        </form>

        {inviteSuccess && (
          <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Invitation referral request logged successfully!
          </p>
        )}
      </div>

      {/* Unclaimed Listings in Area */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-3">Unclaimed Nearby Shops</h3>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          The following businesses are registered postcode listings. Click Claim to verify ownership of your secondary shop, or refer a neighbor to claim.
        </p>

        <div className="flex flex-col gap-3">
          {unclaimedBusinesses.map((b: any) => (
            <div key={b.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">{b.businessName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{b.address || 'Greenwich Area'}</p>
              </div>
              <button 
                onClick={() => onNavigate('status')}
                className="px-3.5 py-1.5 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg text-[10px] font-bold transition-colors active:scale-95 duration-150"
              >
                Claim
              </button>
            </div>
          ))}

          {unclaimedBusinesses.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              All neighboring storefront listings in your postcode zone are claimed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── INTEREST SIGNALS SCREEN ─────────────────────────────────────────────────
interface InterestScreenProps {
  onNavigate: (screen: string) => void;
}

export const InterestScreen: FC<InterestScreenProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Interest Signals</h2>
        <p className="text-xs text-gray-400 mt-1">Real-time local consumer engagement and page activity tracker.</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Eye, label: 'Profile Views', val: '1,280', color: 'text-blue-600' },
          { icon: Bookmark, label: 'Bookmarks', val: '246', color: 'text-purple-600' },
          { icon: TrendingUp, label: 'Interaction %', val: '8.4%', color: 'text-emerald-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-400">
              <item.icon className="w-4 h-4" />
            </div>
            <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Traffic Charts Mock/Stylised representation */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Traffic Weekly Trend</h3>
        
        <div className="h-32 flex items-end gap-3 px-2 pt-2 border-b border-gray-150">
          {[40, 60, 45, 90, 75, 110, 85].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div 
                className="w-full bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-lg transition-all duration-500 hover:opacity-85" 
                style={{ height: `${height}%` }}
              />
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
