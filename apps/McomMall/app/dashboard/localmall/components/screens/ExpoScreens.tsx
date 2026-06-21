'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  Calendar, 
  Plus, 
  Check, 
  Play, 
  Tv, 
  Settings,
  ArrowRight,
  Loader2,
  ChevronRight,
  Camera
} from 'lucide-react';
import api from '@/service/api';

// ─── EXPO HUB SCREEN ─────────────────────────────────────────────────────────
interface ExpoHubScreenProps {
  onNavigate: (screen: string) => void;
}

export const ExpoHubScreen: FC<ExpoHubScreenProps> = ({
  onNavigate,
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('events/my-events');
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching expo events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Expo Hub</h2>
          <p className="text-xs text-gray-400 mt-1">Host live product demos and configure virtual storefront booths.</p>
        </div>
        <button 
          onClick={() => onNavigate('event-demo')}
          className="px-3.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 duration-150 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule Event
        </button>
      </div>

      {/* Quick links to setup */}
      <button 
        onClick={() => onNavigate('booth-setup')}
        className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-900">Virtual Booth Setup</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Customize virtual booth details, banners, and links.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
      </button>

      {/* Events timeline lists */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Live Demos & Webinars</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          </div>
        ) : events.length > 0 ? (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate leading-snug">{event.name}</p>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">{event.status}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('event-demo')}
                  className="px-3.5 py-1.5 bg-white border border-gray-150 text-gray-600 hover:bg-gray-100 rounded-lg text-[10px] font-bold transition-colors active:scale-95 duration-150"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">No scheduled expo webinars or live streams yet.</p>
        )}
      </div>
    </div>
  );
};

// ─── VIRTUAL BOOTH SETUP SCREEN ──────────────────────────────────────────────
interface VirtualBoothSetupScreenProps {
  onNavigate: (screen: string) => void;
}

export const VirtualBoothSetupScreen: FC<VirtualBoothSetupScreenProps> = ({
  onNavigate,
}) => {
  const [boothTitle, setBoothTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Mock Booth saving by saving settings in local storage/submitting to support ticketing
      await api.post('support-tickets', {
        subject: `Virtual Booth Setup Request: ${boothTitle}`,
        description: `Booth Banner URL: ${bannerUrl}`,
        priority: 'low',
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigate('expo');
      }, 1000);
    } catch (err) {
      console.error('Error saving virtual booth configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Virtual Booth Setup</h2>
        <p className="text-xs text-gray-400 mt-1">Configure asset banners, dates, and products displayed in the virtual booth.</p>

        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Booth Name</label>
            <input 
              type="text"
              placeholder="e.g. Greenwich Artisan Bread Stall"
              value={boothTitle}
              onChange={(e) => setBoothTitle(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Banner Image URL</label>
            <div className="relative">
              <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="url"
                placeholder="https://example.com/banner.jpg"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
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
              <>Save Booth Details <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── EVENT DEMO MANAGEMENT SCREEN ────────────────────────────────────────────
interface EventDemoManagementScreenProps {
  onNavigate: (screen: string) => void;
}

export const EventDemoManagementScreen: FC<EventDemoManagementScreenProps> = ({
  onNavigate,
}) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeDemoEvent, setActiveDemoEvent] = useState<any>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await api.post('events', {
        name: eventName.trim(),
        description: description.trim(),
        type: 'webinar',
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hr duration
      });
      setActiveDemoEvent(res.data);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('expo');
      }, 1000);
    } catch (err) {
      console.error('Error creating event demo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStream = async (eventId: string) => {
    try {
      await api.patch(`events/${eventId}/status`, { status: 'live' });
      alert('Event webinar is now live! Stream streaming successfully.');
    } catch (err) {
      console.error('Error starting live demo stream:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Schedule Live Event</h2>
        <p className="text-xs text-gray-400 mt-1">Configure direct links and timing schedules for customer webinars.</p>

        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Event Title</label>
            <input 
              type="text"
              placeholder="e.g. Sourdough Bread-Making Live Masterclass"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Event Description</label>
            <textarea 
              placeholder="Provide event details so local consumers can reserve slots..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 h-20 resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date & Time</label>
            <input 
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
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
              <>Scheduled Successfully <Check className="w-4 h-4" /></>
            ) : (
              <>Publish Webinar Event <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>

      {activeDemoEvent && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
          <p className="text-xs font-black text-gray-900">Start Active Webinar Stream</p>
          <button 
            onClick={() => handleStartStream(activeDemoEvent.id)}
            className="py-3 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4" /> Start Webinar Stream (Live)
          </button>
        </div>
      )}
    </div>
  );
};
