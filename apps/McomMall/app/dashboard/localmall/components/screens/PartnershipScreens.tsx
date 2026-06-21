'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  UserPlus, 
  Check, 
  X, 
  ShieldAlert,
  Percent,
  Plus,
  Loader2,
  Map,
  Compass,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import api from '@/service/api';

// ─── PARTNERSHIPS SCREEN ──────────────────────────────────────────────────────
interface PartnershipsScreenProps {
  onNavigate: (screen: string) => void;
  businessName: string;
}

export const PartnershipsScreen: FC<PartnershipsScreenProps> = ({
  onNavigate,
  businessName,
}) => {
  const [activePartners, setActivePartners] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartnershipsData = async () => {
    try {
      const [partnersRes, requestsRes] = await Promise.all([
        api.get('partnerships/my-partners'),
        api.get('partnerships/requests/user/received')
      ]);
      setActivePartners(partnersRes.data || []);
      setReceivedRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Error fetching partnership status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnershipsData();
  }, []);

  const handleRespond = async (id: string, response: 'approved' | 'rejected') => {
    try {
      await api.patch(`partnerships/user-request/${id}/respond`, { response });
      fetchPartnershipsData();
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">B2B Partnerships</h2>
          <p className="text-xs text-gray-400 mt-1">Manage joint marketing agreements and local merchant deals.</p>
        </div>
        <button 
          onClick={() => onNavigate('partner-matches')}
          className="px-3.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 duration-150 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Matchmaker
        </button>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('share-exchange')}
          className="p-4 bg-white rounded-3xl border border-gray-150 hover:bg-orange-50/20 text-left shadow-sm flex items-center justify-between group transition-colors"
        >
          <div>
            <p className="text-xs font-bold text-gray-900">Share Exchange Pool</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Pool points with neighbors.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </button>
        <button 
          onClick={() => onNavigate('campaign-builder')}
          className="p-4 bg-white rounded-3xl border border-gray-150 hover:bg-orange-50/20 text-left shadow-sm flex items-center justify-between group transition-colors"
        >
          <div>
            <p className="text-xs font-bold text-gray-900">Campaign Builder</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Launch co-deal packages.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </button>
      </div>

      {/* Pending Received Requests */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Incoming Proposals</h3>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
        ) : receivedRequests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {receivedRequests.map((req) => (
              <div key={req.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.initiator?.businessName || 'Neighbor Store'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{req.message || 'Proposing joint campaign partnership.'}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleRespond(req.id, 'approved')}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors active:scale-90"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleRespond(req.id, 'rejected')}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors active:scale-90"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">No pending incoming proposals received.</p>
        )}
      </div>

      {/* Active Collaborating Partners */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Active Agreements</h3>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
        ) : activePartners.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {activePartners.map((partner, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200">
                  {partner.businessName?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{partner.businessName}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{partner.address || partner.postcode || 'High Street Merchant'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">No active B2B partnership agreements established.</p>
        )}
      </div>
    </div>
  );
};

// ─── PARTNER MATCHES SCREEN ──────────────────────────────────────────────────
interface PartnerMatchesScreenProps {
  onNavigate: (screen: string) => void;
}

export const PartnerMatchesScreen: FC<PartnerMatchesScreenProps> = ({
  onNavigate,
}) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('localmall/business/partnerships');
        setMatches(res.data || []);
      } catch (err) {
        console.error('Error fetching partner compatibility matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">AI Compatibility Matches</h2>
        <p className="text-xs text-gray-400 mt-1">AI suggestions based on sector synergy and proximity reach.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{item.pct}% Compatibility</span>
                <h4 className="text-xs font-black text-gray-900 mt-0.5">{item.name}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.description}</p>
              </div>
              <button 
                onClick={() => onNavigate('request-partner')}
                className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-colors active:scale-95 duration-150"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── REQUEST PARTNER SCREEN ──────────────────────────────────────────────────
interface RequestPartnerScreenProps {
  onNavigate: (screen: string) => void;
}

export const RequestPartnerScreen: FC<RequestPartnerScreenProps> = ({
  onNavigate,
}) => {
  const [targetName, setTargetName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Find list of owners matching search to resolve targetUserId
      const searchRes = await api.get(`/partnerships/search-owners?q=${encodeURIComponent(targetName)}`);
      const matches = searchRes.data || [];
      const targetUserId = matches[0]?.id;

      if (!targetUserId) {
        alert('Could not resolve business owner name. Please enter a valid partner name.');
        setLoading(false);
        return;
      }

      await api.post('partnerships/user-request', {
        targetUserId,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        onNavigate('partnerships');
      }, 1000);
    } catch (err) {
      console.error('Error submitting B2B proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Propose B2B Collaboration</h2>
        <p className="text-xs text-gray-400 mt-1">Submit proposal to establish joint reward agreements.</p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Target Partner Store</label>
            <input 
              type="text"
              placeholder="Enter exact business or owner name"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Proposal Message</label>
            <textarea 
              placeholder="Explain how both stores can share points pools and cross-deals..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 h-24 resize-none"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <>Submitted Successfully <Check className="w-4 h-4" /></>
            ) : (
              <>Submit Proposal Agreement <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── SHARE EXCHANGE SCREEN ───────────────────────────────────────────────────
interface ShareExchangeScreenProps {
  onNavigate: (screen: string) => void;
}

export const ShareExchangeScreen: FC<ShareExchangeScreenProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Share Exchange Pool</h2>
        <p className="text-xs text-gray-400 mt-1">Cross-pollinate your audience! Swap and pool point reserves with active verified partners.</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Your Share Balance</p>
            <p className="text-xl font-black text-orange-600 mt-1">500 shares</p>
          </div>
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Ecosystem Pool</p>
            <p className="text-xl font-black text-amber-600 mt-1">2,400 shares</p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('campaign-builder')}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
        >
          Create Joint Campaign Promotion
        </button>
      </div>
    </div>
  );
};

// ─── CAMPAIGN BUILDER SCREEN ─────────────────────────────────────────────────
interface CampaignBuilderScreenProps {
  onNavigate: (screen: string) => void;
}

export const CampaignBuilderScreen: FC<CampaignBuilderScreenProps> = ({
  onNavigate,
}) => {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [pointsRate, setPointsRate] = useState(10);
  const [budget, setBudget] = useState(100);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.post('campaigns', {
        name: campaignTitle.trim(),
        type: 'localmall_loyalty',
        budget,
        pointsRate,
        startDate: new Date().toISOString(),
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigate('partnerships');
      }, 1000);
    } catch (err) {
      console.error('Error creating localmall campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Joint Campaign Wizard</h2>
        <p className="text-xs text-gray-400 mt-1">Configure co-deals and award loyalty points to customers visiting both stores.</p>

        <form onSubmit={handleLaunch} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Campaign Title</label>
            <input 
              type="text"
              placeholder="e.g. Greenwich Bakeries & Cafes Double Point Weekend"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Loyalty Points Rate</label>
              <input 
                type="number"
                value={pointsRate}
                onChange={(e) => setPointsRate(parseInt(e.target.value))}
                className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Points Budget</label>
              <input 
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <>Launched Co-Campaign <Check className="w-4 h-4" /></>
            ) : (
              <>Publish Live Joint Campaign <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
