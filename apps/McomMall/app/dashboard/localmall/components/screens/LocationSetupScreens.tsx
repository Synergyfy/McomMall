'use client';

import { FC, useState, useEffect, useRef } from 'react';
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=6&addressdetails=1&countrycodes=gb`,
        {
          headers: {
            'User-Agent': 'McomMall/1.0 (contact@mcommall.com)',
          },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
        setSuggestionsOpen(true);
        setActiveIndex(-1);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!postcode || postcode.trim().length < 3) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(postcode);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postcode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: any) => {
    const address = suggestion.address || {};
    const pc = address.postcode || suggestion.display_name;
    setPostcode(pc);
    setSuggestionsOpen(false);
    setSuggestions([]);
    setResolvedArea(null);
    setError(null);
    handleResolveWith(pc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestionsOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  };

  const handleResolveWith = async (pc: string) => {
    if (!pc.trim()) return;

    setLoading(true);
    setError(null);
    setResolvedArea(null);

    try {
      const res = await api.post('localmall/onboarding/check-location', {
        postcode: pc.trim(),
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

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    setSuggestionsOpen(false);
    await handleResolveWith(postcode);
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
              ref={inputRef}
              type="text"
              placeholder="e.g. SE10 9NN"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestionsOpen(true);
              }}
              autoComplete="off"
              className="w-full pl-10 pr-9 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 uppercase"
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
            {suggestionsOpen && suggestions.length > 0 && (
              <ul className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li key={s.place_id || i}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2 transition-colors ${
                        i === activeIndex
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                      <span className="leading-relaxed">{s.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
    const fetchMyListing = async () => {
      try {
        const res = await api.get('listings/mine');
        const listing = res.data?.data?.[0];
        if (listing) {
          setMyBusiness(listing);
          setLandmark(listing.landmark || localStorage.getItem('localmall_landmark') || '');
          setClusterTag(listing.clusterTag || localStorage.getItem('localmall_cluster_tag') || '');
          return;
        }
      } catch (err) {
        console.error('Error fetching listing in sublocation screen:', err);
      }
      setLandmark(localStorage.getItem('localmall_landmark') || '');
      setClusterTag(localStorage.getItem('localmall_cluster_tag') || '');
    };
    fetchMyListing();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (myBusiness?.id) {
        await api.patch(`listings/${myBusiness.id}`, {
          landmark: landmark.trim(),
          clusterTag: clusterTag.trim(),
        });
      }
      localStorage.setItem('localmall_landmark', landmark.trim());
      localStorage.setItem('localmall_cluster_tag', clusterTag.trim());
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
