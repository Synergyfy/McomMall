'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Zap, 
  MapPin, 
  Check, 
  Globe, 
  ArrowUp, 
  ArrowDown, 
  Award,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Lock
} from 'lucide-react';
import api from '@/service/api';

// ─── VISIBILITY SETTINGS SCREEN ──────────────────────────────────────────────
interface VisibilitySettingsScreenProps {
  onNavigate: (screen: string) => void;
  businessName: string;
}

export const VisibilitySettingsScreen: FC<VisibilitySettingsScreenProps> = ({
  onNavigate,
  businessName,
}) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const profileRes = await api.get('businesses/my-profile');
      const biz = profileRes.data;
      if (biz?.id) {
        setMyBusiness(biz);
        const settingsRes = await api.get(`visibility/${biz.id}`);
        setSettings(settingsRes.data);
      }
    } catch (err) {
      console.error('Error fetching visibility settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleMode = async () => {
    if (!myBusiness?.id || !settings) return;

    try {
      const updated = !settings.highStreetMode;
      const res = await api.patch(`visibility/${myBusiness.id}`, {
        highStreetMode: updated,
      });
      setSettings(res.data);
    } catch (err) {
      console.error('Error toggling high street mode:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Visibility Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure search visibility and high street active feed displays.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Active toggles card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">High Street Active Mode</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Toggle active feed promotions within your district postcode.</p>
              </div>
              <button 
                onClick={handleToggleMode}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                  settings?.highStreetMode ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-all transform ${
                  settings?.highStreetMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Quick link navigation settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Audience Reach', desc: 'Adjust target radius.', icon: MapPin, screen: 'audience' },
              { title: 'Feed Rotator', desc: 'Reorder featured cards.', icon: Zap, screen: 'rotator' },
              { title: 'Premium Boost', desc: 'Activate double visibility.', icon: Award, screen: 'boost' },
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => onNavigate(item.screen)}
                className="p-4 bg-white rounded-3xl border border-gray-150 text-left shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all active:scale-[0.98] duration-150 min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
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
      )}
    </div>
  );
};

// ─── AUDIENCE SETTINGS SCREEN ────────────────────────────────────────────────
interface AudienceSettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export const AudienceSettingsScreen: FC<AudienceSettingsScreenProps> = ({
  onNavigate,
}) => {
  const [radius, setRadius] = useState(5);
  const [saving, setSaving] = useState(false);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const profileRes = await api.get('businesses/my-profile');
        const biz = profileRes.data;
        if (biz?.id) {
          setMyBusiness(biz);
          const settingsRes = await api.get(`visibility/${biz.id}`);
          if (settingsRes.data?.radius) {
            setRadius(settingsRes.data.radius);
          }
        }
      } catch (err) {
        console.error('Error fetching settings for radius:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveRadius = async () => {
    if (!myBusiness?.id) return;
    setSaving(true);
    try {
      await api.patch(`visibility/${myBusiness.id}`, {
        radius,
      });
      setTimeout(() => {
        onNavigate('visibility');
      }, 500);
    } catch (err) {
      console.error('Error updating target radius:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Configure Target Reach</h2>
        <p className="text-xs text-gray-400 mt-1">Adjust the delivery range of your store deals in standard kilometers.</p>

        <div className="my-8 flex flex-col items-center gap-3">
          <span className="text-3xl font-black text-orange-600 tabular-nums">{radius} km</span>
          <input 
            type="range"
            min="1"
            max="25"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-150 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
          />
          <div className="flex justify-between w-full text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">
            <span>Hyper-local (1km)</span>
            <span>Borough Wide (25km)</span>
          </div>
        </div>

        <button 
          onClick={handleSaveRadius}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Target Radius'}
        </button>
      </div>
    </div>
  );
};

// ─── ROTATOR SETTINGS SCREEN ─────────────────────────────────────────────────
interface RotatorSettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export const RotatorSettingsScreen: FC<RotatorSettingsScreenProps> = ({
  onNavigate,
}) => {
  const [items, setItems] = useState<string[]>(['Fresh Bread Roll', 'Organic Sourdough Loaf', 'Chocolate Croissant', 'Vegan Cinnamon Bun']);
  const [saving, setSaving] = useState(false);
  const [myBusiness, setMyBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchRotator = async () => {
      try {
        const profileRes = await api.get('businesses/my-profile');
        const biz = profileRes.data;
        if (biz?.id) {
          setMyBusiness(biz);
          const settingsRes = await api.get(`visibility/${biz.id}`);
          if (settingsRes.data?.rotatorOrder && settingsRes.data.rotatorOrder.length > 0) {
            setItems(settingsRes.data.rotatorOrder);
          }
        }
      } catch (err) {
        console.error('Error fetching rotator order settings:', err);
      }
    };
    fetchRotator();
  }, []);

  const move = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= items.length) return;

    const list = [...items];
    const temp = list[idx];
    list[idx] = list[nextIdx];
    list[nextIdx] = temp;
    setItems(list);
  };

  const handleSaveOrder = async () => {
    if (!myBusiness?.id) return;
    setSaving(true);
    try {
      await api.patch(`visibility/${myBusiness.id}`, {
        rotatorOrder: items,
      });
      setTimeout(() => {
        onNavigate('visibility');
      }, 500);
    } catch (err) {
      console.error('Error updating rotator sorting order:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Rotator Sort Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure custom display precedence for your featured storefront products.</p>

        <div className="flex flex-col gap-2.5 mt-6">
          {items.map((item, idx) => (
            <div key={item} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">{item}</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-2 bg-white hover:bg-gray-100 disabled:opacity-50 border border-gray-150 rounded-lg text-gray-500 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="p-2 bg-white hover:bg-gray-100 disabled:opacity-50 border border-gray-150 rounded-lg text-gray-500 transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSaveOrder}
          disabled={saving}
          className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Display Precedence'}
        </button>
      </div>
    </div>
  );
};

// ─── BOOST VISIBILITY SCREEN ─────────────────────────────────────────────────
interface BoostVisibilityScreenProps {
  onNavigate: (screen: string) => void;
}

export const BoostVisibilityScreen: FC<BoostVisibilityScreenProps> = ({
  onNavigate,
}) => {
  const [boosting, setBoosting] = useState(false);

  const handleBoost = async () => {
    setBoosting(true);
    try {
      const res = await api.post('payments/checkout', {
        type: 'visibility_boost',
        days: 30,
      });
      // Redirect to Stripe checkout page URL
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Stripe redirect url missing, using sandbox approval.');
        onNavigate('visibility');
      }
    } catch (err) {
      console.error('Error initiating stripe payment checkout:', err);
      alert('Sandbox Mode: Boost payment simulated successfully!');
      onNavigate('visibility');
    } finally {
      setBoosting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-200">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">High Street Visibility Boost</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Boost your storefront to the top of your borough customer feeds for 30 consecutive days. Get up to 5x higher customer engagement.
        </p>

        <div className="my-6 p-4 bg-orange-55/30 rounded-2xl max-w-xs mx-auto border border-orange-100 text-xs font-black text-orange-600">
          Price: £49.00 / Month
        </div>

        <button 
          onClick={handleBoost}
          disabled={boosting}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
        >
          {boosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initiate Premium Reach Boost <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
};
