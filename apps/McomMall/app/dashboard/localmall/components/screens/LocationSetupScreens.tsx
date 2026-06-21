'use client';

import { FC, useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Check, 
  Map, 
  Compass, 
  Tag, 
  Home, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '@/service/api';

// ─── BOROUGH SCREEN ─────────────────────────────────────────────────────────
interface BoroughScreenProps {
  onNavigate: (screen: string) => void;
  onPostcodeResolved: (postcode: string, borough: string) => void;
  businessName: string;
}

export const BoroughScreen: FC<BoroughScreenProps> = ({
  onNavigate,
  onPostcodeResolved,
  businessName,
}) => {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedArea, setResolvedArea] = useState<any>(null);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    setLoading(true);
    setError(null);
    setResolvedArea(null);

    try {
      const res = await api.post('localmall/onboarding/check-location', {
        postcode: postcode.trim(),
      });
      if (res.data) {
        setResolvedArea(res.data);
      } else {
        setError('Could not find borough boundaries for this postcode.');
      }
    } catch (err: any) {
      console.error('Error resolving postcode:', err);
      setError(err.response?.data?.message || 'Error communicating with location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (resolvedArea) {
      localStorage.setItem('businessArea', resolvedArea.resolvedArea);
      localStorage.setItem('businessPostcode', resolvedArea.postcode || postcode);
      onPostcodeResolved(resolvedArea.postcode || postcode, resolvedArea.resolvedArea);
      onNavigate('sublocation');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight mb-1">Set Your Location Boundaries</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          We reverse-geocode your business postcode via Nominatim mapping to assign your high street boundaries.
        </p>

        <form onSubmit={handleResolve} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. SE10 9NN"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 uppercase"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Resolve
          </button>
        </form>

        {error && (
          <p className="text-[11px] font-bold text-red-500 mt-2">{error}</p>
        )}
      </div>

      {resolvedArea && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Borough Zone Assigned</p>
              <p className="text-lg font-black text-orange-600 mt-0.5">{resolvedArea.resolvedArea}</p>
              <p className="text-[10px] text-gray-400 mt-1">Coordinates: {resolvedArea.latitude}, {resolvedArea.longitude}</p>
            </div>
          </div>

          <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-100 relative bg-gray-100">
            <iframe
              title="Nominatim Resolved Map"
              src={`https://maps.google.com/maps?q=${resolvedArea.latitude},${resolvedArea.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 absolute inset-0 filter grayscale-[5%] contrast-[95%]"
              loading="lazy"
            />
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
          >
            Confirm High Street boundaries <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};


// ─── SUBLOCATION SCREEN ──────────────────────────────────────────────────────
interface SublocationScreenProps {
  onNavigate: (screen: string) => void;
  businessName: string;
}

export const SublocationScreen: FC<SublocationScreenProps> = ({
  onNavigate,
  businessName,
}) => {
  const [landmark, setLandmark] = useState('');
  const [clusterTag, setClusterTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await api.get('businesses/my-profile');
        if (res.data) {
          setMyBusiness(res.data);
          setLandmark(res.data.landmark || '');
          setClusterTag(res.data.clusterTag || '');
        }
      } catch (err) {
        console.error('Error fetching profile in sublocation screen:', err);
      }
    };
    fetchMyProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness?.id) return;

    setLoading(true);
    setSuccess(false);

    try {
      await api.patch(`listings/${myBusiness.id}`, {
        landmark: landmark.trim(),
        clusterTag: clusterTag.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigate('home');
      }, 1000);
    } catch (err) {
      console.error('Error updating sublocation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight mb-1">Sublocation & Landmarks</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Specify unique landmarks and sector tags so clients can pinpoint your store within high street clusters.
        </p>

        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">High Street Landmark</label>
            <div className="relative">
              <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="e.g. Opposite the Old Town Hall clock tower"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cluster/Sector Tag</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="e.g. GreenMarket, FashionAlley, WellnessRow"
                value={clusterTag}
                onChange={(e) => setClusterTag(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
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
              <>Saved Successfully <Check className="w-4 h-4" /></>
            ) : (
              <>Save Landmark Details <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
