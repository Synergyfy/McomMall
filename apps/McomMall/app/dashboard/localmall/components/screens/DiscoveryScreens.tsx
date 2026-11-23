'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { PartnershipRequestDialog } from '@/components/partnership/PartnershipRequestDialog';

// ─── DISCOVER SCREEN ─────────────────────────────────────────────────────────
interface DiscoverScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  isCustomer?: boolean;
}

export const DiscoverScreen: FC<DiscoverScreenProps> = ({
  onNavigate,
  mallData,
  isCustomer = false,
}) => {
  const router = useRouter();
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
            viewLabel={isCustomer ? 'View Listing' : 'View Profile'}
            listingHref={
              isCustomer ? undefined : `/listings/${b.id}?source=in-house`
            }
            onViewProfile={(id) =>
              isCustomer
                ? router.push(`/listings/${id}?source=in-house`)
                : onNavigate(`profile:${id}`)
            }
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
  mallData?: any;
  isCustomer?: boolean;
}

export const BusinessProfileScreen: FC<BusinessProfileScreenProps> = ({
  onNavigate,
  businessId,
  mallData,
  isCustomer = false,
}) => {
  const fromMall = mallData?.businesses?.find(
    (b: any) => b.id === businessId,
  );
  const [business, setBusiness] = useState<any>(fromMall || null);
  const [loading, setLoading] = useState(!fromMall);
  const [partnershipOpen, setPartnershipOpen] = useState(false);

  useEffect(() => {
    // Always fetch the public listing so the full profile (and its owner id)
    // is available even when the business was seeded from the mall feed.
    const fetchBusiness = async () => {
      try {
        const res = await api.get(`listings/${businessId}`);
        if (res.data) {
          setBusiness((prev: any) => ({ ...(prev || {}), ...res.data }));
        }
      } catch (err) {
        console.error('Error fetching business detail profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const ownerUserId = business?.user?.id || business?.userId;
  const publicListingUrl = `/listings/${business?.id || businessId}?source=in-house`;

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
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                {business.category?.name || business.category || 'Merchant'}
              </span>
              <StatusBadge isVerified={business.isVerified} isClaimed={business.isClaimed} />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight mt-1">{business.businessName}</h2>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />{' '}
              {business.location?.addressLine1 ||
                business.address ||
                mallData?.highStreet ||
                mallData?.mallName ||
                'Local mall'}
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

      {/* B2B Collab Action — business owners only */}
      {!isCustomer && (
        <div className="flex flex-col gap-3">
          <a
            href={publicListingUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
          >
            <ExternalLink className="w-4 h-4" /> View Public Listing
          </a>
          <button
            onClick={() => {
              if (ownerUserId) {
                setPartnershipOpen(true);
              } else {
                onNavigate('request-partner');
              }
            }}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
          >
            <UserPlus className="w-4 h-4" /> Propose Collaboration Request
          </button>

          {ownerUserId && (
            <PartnershipRequestDialog
              open={partnershipOpen}
              onOpenChange={setPartnershipOpen}
              targetUserId={ownerUserId}
              businessName={business.businessName}
            />
          )}
        </div>
      )}
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
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {b.address || mallData?.highStreet || mallData?.mallName}
                </p>
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
  mallData?: any;
  businessName?: string;
}

export const InterestScreen: FC<InterestScreenProps> = ({
  mallData,
  businessName,
}) => {
  const myBusiness = mallData?.businesses?.find(
    (b: any) => b.businessName === businessName,
  );
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!myBusiness?.id) return;
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`interest-signals/${myBusiness.id}`);
        setMetrics(res.data);
      } catch (err) {
        console.error('Error fetching interest signals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [myBusiness?.id]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Interest Signals</h2>
        <p className="text-xs text-gray-400 mt-1">
          Consumer engagement recorded for your business in {mallData?.mallName || 'your local mall'}.
        </p>
      </div>

      {!myBusiness ? (
        <p className="text-xs text-gray-400 text-center py-8">
          Your business is not listed in this local mall yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Total Signals', val: metrics?.totalVotes ?? 0, color: 'text-blue-600' },
              { icon: Bookmark, label: 'Goal Progress', val: `${metrics?.progressPercent ?? 0}%`, color: 'text-purple-600' },
              { icon: TrendingUp, label: 'Sentiment', val: `${metrics?.sentimentScore ?? 0}%`, color: 'text-emerald-600' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <p className={`text-xl font-black ${item.color}`}>
                  {loading ? '—' : item.val}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Top Signal Categories
            </h3>
            {(metrics?.topCategories || []).length === 0 ? (
              <p className="text-xs text-gray-400">
                No interest signals have been submitted yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {metrics.topCategories.map((category: any) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-gray-700">{category.category}</span>
                    <span className="font-bold text-gray-900">{category.votes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
