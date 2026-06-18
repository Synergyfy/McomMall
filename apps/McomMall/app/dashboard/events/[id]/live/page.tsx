'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Settings,
  Users,
  QrCode,
  Gift,
  Send,
  Volume2,
  Clock,
  History,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  UserCheck,
  MapPin,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

interface Comment {
  id: string;
  name: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

interface ActionLog {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export default function LiveEventControlRoom() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Real Database Event Info
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Simulation States
  const [seconds, setSeconds] = useState(9852); // Starting simulation time (approx 2h 44m)
  const [registrations, setRegistrations] = useState(245);
  const [checkIns, setCheckIns] = useState(168);
  const [rewardsClaimed, setRewardsClaimed] = useState(84);
  const [activeTab, setActiveTab] = useState<'all' | 'checkins'>('all');

  // Interactive UI Modals
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [scannerPostcode, setScannerPostcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Live Comments state (User selected to mock frontend)
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      name: 'Marcus Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmRwy7VtoNo4SdzhP1jQWi2xaZTNfAPr77vFtMw50K91FURqrldKPZJ4_bNHddaSXgYNDEy8P6XiBIihxPlI8UkajKMPOnRuC-pvDiYNeA6f8r-WVUglPd9craEWC5OKmt5Qj0zqu7zbQFcPdZmmFqSDz7FXS5dfSd2RNRRusN7K71eQvT0oKPK74pvdunpyemWXB4UDxU3LK56BQuvvk8rYUlH__rZkYPxZEJYkkglQ4Ok46LH3mPq1_4uw1oSjZvWvQoarBBIQ',
      time: '2m ago',
      text: "The keynote was absolutely incredible! Can't wait for the breakout sessions to start. 🚀",
      likes: 12
    },
    {
      id: '2',
      name: 'Elena Rodriguez',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTT4-OKwT6Q78jjEmnnGlYzWSEGsHXRnfpcSr29HKoRABkMX0kb2Lc4y1OkxAsCEyhKWZ-oNeymiZVBhSqTKYUmE415T6awBaGdTru-WYkwM3fjfGjFlsIPqfvPI7HITEoIhnigBlf8FdmbfEjFFeZ-36vfgl6zXJsMXOlCKGwgEtHNsoOjoM47aSkXktNNurQjOQXm1GkiEYOCWmE7m1bByh-ub-gOhka-8uTVxBgq2sIVdNoC5V19MGLmbZOppea3evOjfzt4Hk',
      time: '5m ago',
      text: "Does anyone know where the QR scan station for the rewards is located?",
      likes: 4
    }
  ]);

  // Action logs
  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: 'log_1',
      icon: 'campaign',
      title: 'Broadcast: "Lunch is served!"',
      subtitle: 'Sent to all attendees • 12:30 PM'
    },
    {
      id: 'log_2',
      icon: 'edit_calendar',
      title: 'Schedule updated: Track B',
      subtitle: 'Updated by Merchant • 11:45 AM'
    }
  ]);

  // Fetch event details
  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const data = response.data?.data || response.data;
        if (data) {
          setEvent(data);
          // Set initial simulation offsets based on capacity
          setRegistrations(Math.max(45, Math.floor(data.capacity * 0.85)));
          setCheckIns(Math.max(22, Math.floor(data.capacity * 0.62)));
          setRewardsClaimed(Math.max(10, Math.floor(data.capacity * 0.35)));
        }
      } catch (err) {
        console.error('Error loading event:', err);
        toast.error('Failed to load event data. Showing default mixer template.');
        // Default fallback mock info
        setEvent({
          title: 'Community Mixer',
          description: 'A friendly community mixer for storefront local merchants.',
          date: 'Today',
          time: 'Live Stream',
          location: 'Main Hall',
          capacity: 300,
          borough: 'Southwark',
          highStreet: 'Peckham High Street'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Timer update interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format elapsed time
  const formatTime = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, []);

  // Submit new comment
  const handlePostComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      name: 'You (Merchant)',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqRnxhqLG5_XGTVz5-DwFxaKrtcF6aBP-l4RbEdmf7YnU4QCvu2-1ENBFF530MVT9waCIreLa8QgmX64Ls3qw5pqJeb3MvUUmhHN9DMoTJzFQmWWAb6iZ286JO47136gQPew_j2uOUVONkQCw8Dv_vRltOQL2psK1OgFsTQq5sosaoJmZYc45ZeTG0rtmEvsqLD7XSwUMCWJZLWF8IpMorm8GhdSlRJyBwNZsfmNFGisOCN8cszMG-upXQUgwEh1Pr4vS8089Rr68',
      time: 'Just now',
      text: commentText,
      likes: 0
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast.success('Broadcast comment posted to live feed!');
  };

  // Submit Broadcast Announcement
  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    
    // Add to logs
    const newLog: ActionLog = {
      id: Date.now().toString(),
      icon: 'campaign',
      title: `Broadcast: "${broadcastMessage}"`,
      subtitle: `Sent to ${registrations} attendees • Just now`
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Add warning notification comment to chat feed
    const alertComment: Comment = {
      id: `alert_${Date.now()}`,
      name: 'System Alert',
      avatar: '',
      time: 'Just now',
      text: `📢 ANNOUNCEMENT: ${broadcastMessage}`,
      likes: 0
    };
    setComments(prev => [alertComment, ...prev]);

    setBroadcastMessage('');
    setIsBroadcastOpen(false);
    toast.success('Broadcast notification pushed to all users!');
  };

  // QR check-in simulation
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setCheckIns(prev => prev + 1);
      
      // Update logs
      const scanLog: ActionLog = {
        id: Date.now().toString(),
        icon: 'qr_code',
        title: `Attendee Checked In successfully`,
        subtitle: `Verifying registration • Just now`
      };
      setLogs(prev => [scanLog, ...prev]);

      setIsScannerOpen(false);
      setScannerPostcode('');
      toast.success('QR Code Scanned! Attendee check-in verified successfully.');
    }, 1200);
  };

  // End Event
  const handleEndEvent = async () => {
    if (!confirm('Are you sure you want to end this event? This action will save statistics and cannot be undone.')) {
      return;
    }

    try {
      if (id) {
        await api.patch(`/events/${id}/status`, { status: 'past' });
      }
      toast.success('Event ended successfully. Generating post-event report...');
      router.push(`/dashboard/events/${id}/performance`);
    } catch (err) {
      console.error('Error ending event:', err);
      toast.error('Failed to update event status on database, but ending session locally.');
      router.push('/dashboard/events');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const capacityLimit = event?.capacity || 300;
  const rewardsPercentage = Math.min(100, Math.floor((rewardsClaimed / capacityLimit) * 100));

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans pb-32">
      {/* TopAppBar Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden border-2 border-orange-500">
              <span className="text-sm">MIX</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-orange-600 flex items-center gap-2">
                Live: {event?.title || 'Community Mixer'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                  Live Control active
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/events')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-orange-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Live Metrics Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registrations Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registrations</span>
                <span className="p-2 bg-orange-50 rounded-xl text-orange-600">
                  <Users size={18} />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{registrations}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">+12% from last hour</span>
            </div>
          </div>

          {/* QR Check-Ins Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">QR Check-Ins</span>
                <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <QrCode size={18} />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{checkIns}</div>
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="mt-4 z-10 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <UserCheck size={14} />
              Scan Check-in
            </button>
          </div>

          {/* Attendees Avatars Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendees Live</span>
                <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Users size={18} />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{checkIns - 5}</div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                <img className="w-6 h-6 rounded-full border border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7E_Y8feJrG4hpqEOKuwH69tDXvjkgKKGL5Ben1eXaiMbb_RhsEfLOZ6ca1wR81wphyUbfe2JGI2kZ81CNP8WKRlDVQsQOd4xmDh40Y4gp6l7_Uo1Ahxm2BPMFTrKMh2lkDeJFM_mUjjQtXeRNCybNsNqkPeVc3NJsF-smzKw3gTGMhYZRJ15exrUDRvhrrtyJrh8RMs2RBG3SPvrtjJ5CxuAVwkX2v8FPkWgQOOXYcJ-rzRoCeZcJXcsxzbaAOYL3cUjYhJX2Hac" alt="User" />
                <img className="w-6 h-6 rounded-full border border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEEhizdOOXtIQy36ZhSH50zMrP5Fh2wr6BKElL99UxiaRGN4i8F_bzD1zXLwLplg_hfwQRy4O9S_3hsA7J0mkRfDSq7eE7_JBGQ0hPybNGqbdiR4IhSVwGc8nXztUSsYuj9YysjwMYCe1pGkPcTh8l6H-PAkyvLLslTK90O_TOVnDfGirZNecY1lagsw8Gm8xCr-6L5ry0y1Gh8OS_QbxpG6Jzbz_bV3yNcgIQBz20a97Tikam55cl3mJmvt_pPxSjXKb7zJVX9MA" alt="User" />
                <div className="w-6 h-6 rounded-full border border-white bg-orange-100 text-[9px] flex items-center justify-center font-bold text-orange-600">
                  +{checkIns - 7}
                </div>
              </div>
            </div>
          </div>

          {/* Reward Claims Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reward Claims</span>
                <span className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <Gift size={18} />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{rewardsClaimed}</div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${rewardsPercentage}%` }}></div>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase block">
                {rewardsPercentage}% of allocated claimed
              </span>
            </div>
          </div>
        </section>

        {/* Live Engagement Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feed & Chat (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col h-[550px]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="text-orange-600" size={20} />
                <h2 className="text-sm font-bold text-gray-800">Live Engagement Feed</h2>
              </div>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">
                {checkIns} Active Users
              </span>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {comments.map((comment) => {
                const isAlert = comment.id.startsWith('alert_');
                return (
                  <div key={comment.id}>
                    {isAlert ? (
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs font-semibold text-orange-900 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-4 items-start group">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden border border-orange-100">
                          {comment.avatar ? (
                            <img className="w-full h-full object-cover" src={comment.avatar} alt={comment.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold">
                              {comment.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-gray-800 truncate">{comment.name}</h4>
                            <span className="text-[10px] text-gray-400 shrink-0">{comment.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            {comment.text}
                          </p>
                          <div className="mt-2 flex gap-3 text-[10px] font-bold text-gray-400">
                            <button className="hover:text-orange-600 flex items-center gap-1">
                              Reply
                            </button>
                            <span className="text-gray-300">•</span>
                            <button className="hover:text-orange-600 flex items-center gap-1">
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Post Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Post a live update to feed..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 text-slate-700"
                />
                <button
                  onClick={handlePostComment}
                  className="absolute right-2 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column Side widgets (1/3 width) */}
          <div className="space-y-6">
            {/* Session Timer widget */}
            <div className="bg-[#0b1c30] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="z-10 relative">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  Active Session Time
                </span>
                <div className="text-4xl font-extrabold mt-2 mb-4 tracking-tight">
                  {formatTime(seconds)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 w-[78%] h-full"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">78% Complete</span>
                </div>
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-[0.03]">
                <Clock size={160} />
              </div>
            </div>

            {/* Recent Actions */}
            <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                <History size={16} className="text-orange-500" />
                Recent Actions
              </h3>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                      {log.icon === 'campaign' ? <Volume2 size={16} /> : <QrCode size={16} />}
                    </div>
                    <div className="flex-1 border-b border-gray-100 pb-2">
                      <p className="text-xs font-bold text-gray-700">{log.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{log.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => toast.info('Full event logs export coming soon!')}
                className="w-full mt-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors bg-white border border-dashed border-orange-200"
              >
                View All History
              </button>
            </div>

            {/* Event Info Details Box */}
            <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                Setup Configurations
              </h3>
              <div className="space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-slate-400" />
                  <span>{event?.date} · {event?.time}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-slate-400" />
                  <span className="truncate">{event?.location}</span>
                </div>
                {event?.borough && (
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={15} className="text-slate-400" />
                    <span>Region: {event?.borough} ({event?.highStreet})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Quick Action Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Volume2 size={16} />
              Broadcast Message
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
            >
              <QrCode size={16} />
              Check-In Portal
            </button>
          </div>
          <button
            onClick={handleEndEvent}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <X size={16} />
            End Event
          </button>
        </div>
      </div>

      {/* --- Broadcast Announcement Modal --- */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <Volume2 size={18} className="text-orange-600" />
                Broadcast Announcement
              </h3>
              <button onClick={() => setIsBroadcastOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Type an update to send instantly to all registered users.
            </p>
            <textarea
              placeholder="e.g. Lunch is starting at Table B! Come grab a slice."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-700 bg-slate-50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-500 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                className="flex-1 py-3 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Check-In Simulator Modal --- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <QrCode size={18} className="text-orange-600" />
                QR Code Scanner Portal
              </h3>
              <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 flex flex-col items-center bg-orange-50/10">
              <QrCode size={64} className="text-orange-400 animate-pulse" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">
                Simulating camera stream...
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Simulate manual passcode or postcode</label>
              <input
                type="text"
                placeholder="e.g. SE15 4QL"
                value={scannerPostcode}
                onChange={(e) => setScannerPostcode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-700 bg-slate-50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsScannerOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-500 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="flex-1 py-3 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50"
              >
                {isScanning ? 'Verifying...' : 'Simulate Scan Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
