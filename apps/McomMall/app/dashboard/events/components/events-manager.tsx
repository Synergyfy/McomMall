'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/service/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Radio,
  UserPlus,
  QrCode,
  TrendingUp,
  MoreVertical,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TabType = 'upcoming' | 'active' | 'past' | 'drafts' | 'borough' | 'expo' | 'live';

interface EventItem {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  image: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  registrations?: string;
  capacity?: number;
  interest?: string;
  viewers?: number;
  favorites?: string;
  status: 'active' | 'expo' | 'live' | 'upcoming' | 'draft' | 'past';
  attendees?: string[];
}

export function EventsManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/events/my-events');
      const data = response.data?.data || response.data || [];
      
      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.selectedTemplate || 'custom',
        typeLabel: item.status === 'live' ? 'Live Now' : (item.status === 'upcoming' ? 'Active Soon' : item.status),
        image: item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
        date: item.date,
        time: item.time,
        location: item.location,
        description: item.description,
        registrations: `0/${item.capacity}`,
        capacity: item.capacity,
        status: item.status,
        attendees: []
      }));
      setEvents(mapped);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Default Events Mock List
  const defaultEvents: EventItem[] = [
    {
      id: 'summer-solstice-popup',
      title: 'Summer Solstice Pop-up',
      type: 'upcoming',
      typeLabel: 'Active Soon',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
      date: 'June 21, 2026',
      time: '5:00 PM - 9:00 PM',
      location: 'Storefront Entrance',
      registrations: '245/300',
      capacity: 300,
      status: 'upcoming',
      attendees: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPHt1_gG7qU6caIUC6mLBrfZUlnoRgbCt6xY4MhbilAgQNiXYlEhaw3UWglJjPh3qpwG8xTZFgRybotK-f6OiCCUHOJAV_fIxBAJJTBBTGOSmQ5bXLs2mfngp-MTs58zoY-VBGcNpNilcEvSTwrk7vC4pJxlSySqc-bgnSp9xTUOBIojpTe9J-FugnaPyYix7uT4wPuFLby9O_7K-SFwxUw4_Ndolj8dDX9GtqAkbYxnVgkpcHGjqHXB4xs4bNKyvSSPTULNVy3dY',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBgEiGhJ8SGqqROf96_8FH48-q6CECPCsZ38Pye3Irrpkh5oyymEAEycixyCuIovXA_7gAJomnFXjO9l9omVaqWn-IIuK3bry5RCL_I8G5xjZJ-nj3rPMtC7fkz6N2vpOx-GQ3CVx_j9wqQvcur5BB8THt7NS0vu6ADUeLfi1_HcN0uNAx3l9cYQFwT_jjkD2GB-djVr9f8pQD4Qa1FumfUjsemxQOdrLvY_W7yfOzQwOgJYwO12fRFoFZea2HiMqJUyiYEIC8gxhw',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDeRZQr4ua2MEO7aa67y_pnWm2XzrysAWBjOagUNDftPhnfooODFNFkssJ-j5jknJXNBhQ0g21YgAjiwhcTvwRUhpIYNVLSTOi5_xllmLXW21aYI7S-MTTngsAjiDzzNgPvQiGKsqHcZFhfaewMzRW6lO6Mb6Xy_n101G7kmyrnXwKhjaBVeiqQIHKRb6uWbnksmQtNJ1mj2IM_RukFC17r026sFLUUCJSu3HmRB5G2_BN9J5JA3EQ0H7K0J_zm4F00mKBh1d9Nv6I'
      ]
    },
    {
      id: 'tech-to-table-expo',
      title: 'Tech-to-Table Expo',
      type: 'expo',
      typeLabel: 'Expo Event',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsAZU25ijMOlyjubjma8fymwy5C-w_uMKkQS7iJVWy5BZ36gBqF9dgoCK498kUI_jt1hy3DVR8meJoxP5A2-HbblGHGeK0bKinoImFfh7hR7xyTVaiGHBhl12__49vCcBYU26Ov5vk_b5egJrYxLAIh5dbgyca_5SJgTJcEYhUfBnhLioaCej9dTKreSGUs2SKWvspnWOt5M3oJfbfR2vdtn_-inktAXtICiRf4q_KTIt_PSklo2Z2nm-HTOgYEIEakHPBurq7ucY',
      date: 'July 14, 2026',
      time: '10:00 AM - 6:00 PM',
      location: 'Convention Center, Hall B',
      description: 'Booth #124',
      interest: '1.2k',
      status: 'expo'
    },
    {
      id: 'new-arrival-unboxing',
      title: 'New Arrival Unboxing',
      type: 'live',
      typeLabel: 'Live Now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA4fEXM1bm-E54zE10WRRTbYjK77kg9cybV4bcJB37wRy2ZkFvWonHnDMrH_Lngq2hmmbAXqitlAArRBXFuqZ61GUE9GJbFtql56IWM6X2pyzuW0XR_L4d_YfMvXLsGS-hXqjmFLVFGEOmNK3uvkaL7M9wV7DDhzoMt3BZ1jGYZBt7uvWaE88m8yh2IQqyAeeWnqA0vOJbTqCCFuhF5gtgy2xbBuctc3YwHNuCUrIMVFJxNJtoBxnGBrVI5BV-35fIyMc8vI37zDw',
      date: 'Today',
      time: 'Live Stream',
      description: 'Direct from the store floor. Showing the Autumn collection early access.',
      viewers: 452,
      favorites: '1.1k',
      status: 'live'
    },
    {
      id: 'midweek-masterclass',
      title: 'Artisanal Craft Masterclass',
      type: 'active',
      typeLabel: 'Active',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
      date: 'Wednesday, June 24',
      time: '3:00 PM - 5:00 PM',
      location: 'Workshop Table',
      registrations: '18/20',
      capacity: 20,
      status: 'active'
    },
    {
      id: 'vip-style-class',
      title: 'VIP Autumn Styling Class',
      type: 'drafts',
      typeLabel: 'Draft',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA4fEXM1bm-E54zE10WRRTbYjK77kg9cybV4bcJB37wRy2ZkFvWonHnDMrH_Lngq2hmmbAXqitlAArRBXFuqZ61GUE9GJbFtql56IWM6X2pyzuW0XR_L4d_YfMvXLsGS-hXqjmFLVFGEOmNK3uvkaL7M9wV7DDhzoMt3BZ1jGYZBt7uvWaE88m8yh2IQqyAeeWnqA0vOJbTqCCFuhF5gtgy2xbBuctc3YwHNuCUrIMVFJxNJtoBxnGBrVI5BV-35fIyMc8vI37zDw',
      date: 'Sept 15, 2026',
      time: '7:00 PM - 9:00 PM',
      location: 'Styling Zone',
      registrations: '0/25',
      capacity: 25,
      status: 'draft'
    },
    {
      id: 'borough-street-fest',
      title: 'West End Street Fest',
      type: 'borough',
      typeLabel: 'Borough Event',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsAZU25ijMOlyjubjma8fymwy5C-w_uMKkQS7iJVWy5BZ36gBqF9dgoCK498kUI_jt1hy3DVR8meJoxP5A2-HbblGHGeK0bKinoImFfh7hR7xyTVaiGHBhl12__49vCcBYU26Ov5vk_b5egJrYxLAIh5dbgyca_5SJgTJcEYhUfBnhLioaCej9dTKreSGUs2SKWvspnWOt5M3oJfbfR2vdtn_-inktAXtICiRf4q_KTIt_PSklo2Z2nm-HTOgYEIEakHPBurq7ucY',
      date: 'August 1-3, 2026',
      time: 'All Day',
      location: 'Greenwich High Street',
      interest: '4.8k',
      status: 'upcoming'
    }
  ];

  // Filter events based on active tab
  const filteredEvents = useMemo(() => {
    const list = events.length > 0 ? events : defaultEvents;
    return list.filter(event => {
      if (activeTab === 'upcoming') return event.type === 'upcoming' || event.type === 'active' || event.status === 'upcoming';
      if (activeTab === 'active') return event.type === 'active' || event.type === 'live' || event.status === 'active';
      if (activeTab === 'past') return event.type === 'past' || event.status === 'past';
      if (activeTab === 'drafts') return event.type === 'drafts' || event.status === 'draft';
      if (activeTab === 'borough') return event.type === 'borough' || event.status === 'expo';
      if (activeTab === 'expo') return event.type === 'expo' || event.status === 'expo';
      if (activeTab === 'live') return event.type === 'live' || event.status === 'live';
      return true;
    });
  }, [activeTab, events]);

  return (
    <div className="w-full min-h-full bg-transparent text-gray-900 p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Events Dashboard</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage your community engagement and live storefront experiences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/events/new')}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md py-5 font-bold text-xs shrink-0"
          >
            <PlusCircle size={16} />
            Create Event
          </Button>
          <Button
            onClick={() => setIsLiveModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold rounded-xl py-5 text-xs shrink-0 bg-white"
          >
            <Radio size={16} className="animate-pulse" />
            Start Live Session
          </Button>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -z-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 bg-orange-50 rounded-xl text-orange-600">
              <UserPlus size={20} />
            </span>
            <span className="text-[10px] font-bold text-orange-600">+12% vs LW</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Registrations</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-1">1,482</h3>
        </div>

        {/* Active Scan Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -z-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <QrCode size={20} />
            </span>
            <span className="text-[10px] font-bold text-indigo-600">84 Check-ins</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Scan Rate</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-1">68.4%</h3>
        </div>

        {/* Grow Your Community Banner */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-2xl text-white col-span-1 sm:col-span-2 shadow-lg shadow-orange-500/10 border-none relative overflow-hidden group">
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                <Sparkles size={16} />
                Grow Your Community
              </h3>
              <p className="text-xs opacity-90 mt-1 max-w-sm leading-relaxed">
                Run an Expo Event next week to reach 3x more local customers inside your borough.
              </p>
            </div>
            <div className="flex gap-2.5 mt-4">
              <button 
                onClick={() => toast.info('Promoting system tools coming soon')}
                className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all active:scale-95 shrink-0"
              >
                Promote Event
              </button>
              <button 
                onClick={() => toast.info('QR Code generated')}
                className="bg-white/20 hover:bg-white/30 border border-white/20 px-4 py-2 rounded-xl font-bold text-[11px] transition-all active:scale-95 shrink-0"
              >
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation Section */}
      <section className="border-b border-gray-200/80 overflow-x-auto pb-1.5 no-scrollbar flex items-center gap-6">
        {(['upcoming', 'active', 'past', 'drafts', 'borough', 'expo', 'live'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'live' 
            ? 'Live Sessions' 
            : tab === 'past' 
              ? 'Past Events' 
              : tab === 'upcoming' 
                ? 'Upcoming' 
                : tab.charAt(0).toUpperCase() + tab.slice(1);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-xs whitespace-nowrap transition-all font-semibold ${
                isActive 
                  ? 'text-orange-500 font-bold border-b-2 border-orange-500' 
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              {label}
              {tab === 'live' && (
                <span className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          );
        })}
      </section>

      {/* Main Events Grid & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Events List (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border transition-all cursor-pointer flex flex-col h-auto ${
                      isSelected ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-gray-200/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row h-auto sm:h-52">
                      {/* Event Image Banner */}
                      <div className="sm:w-52 h-44 sm:h-full relative overflow-hidden shrink-0 bg-gray-100">
                        <img 
                          className="w-full h-full object-cover" 
                          src={event.image} 
                          alt={event.title} 
                        />
                        
                        {/* Event Status Tag */}
                        <div className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          event.status === 'live'
                            ? 'bg-red-500 text-white flex items-center gap-1 shadow-md shadow-red-500/20'
                            : event.status === 'expo'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                              : event.status === 'active'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        }`}>
                          {event.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                          {event.typeLabel}
                        </div>
                      </div>

                      {/* Event Context & Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="text-base font-black text-gray-900 leading-snug truncate">{event.title}</h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Event context actions menu');
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 text-xs font-semibold mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={13} className="text-gray-400" />
                              <span>{event.time}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={13} className="text-gray-400" />
                                <span className="truncate max-w-[150px]">{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{event.description}</p>
                          )}
                        </div>

                        <div className="flex items-end justify-between gap-4 mt-4 border-t border-gray-100/80 pt-3">
                          {event.attendees && event.attendees.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {event.attendees.map((avatar, aIdx) => (
                                  <img
                                    key={aIdx}
                                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                    src={avatar}
                                    alt="Attendee"
                                  />
                                ))}
                                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">
                                  +242
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</span>
                              <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg text-[10px] text-gray-600 font-bold mt-1 self-start">
                                {event.status === 'live' ? 'Streaming Active' : 'Registration Open'}
                              </span>
                            </div>
                          )}

                          <div className="text-right shrink-0">
                            {event.status === 'live' ? (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5 text-red-500 font-bold text-xs">
                                  <Eye size={13} />
                                  <span>{event.viewers}</span>
                                </div>
                                <div className="flex items-center gap-0.5 text-gray-400 font-semibold text-xs">
                                  <Heart size={13} className="fill-gray-100" />
                                  <span>{event.favorites}</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                  {event.status === 'expo' ? 'Interest' : 'Registrations'}
                                </p>
                                <p className="text-sm font-black text-orange-600 mt-0.5">
                                  {event.registrations || event.interest}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Drawer */}
                    {isSelected && (
                      <div 
                        className="bg-orange-50/50 border-t border-orange-100 p-4 flex flex-wrap gap-3 justify-end items-center" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs text-gray-500 mr-auto font-medium pl-2">
                          Actions for this event:
                        </span>
                        <Button
                          onClick={() => router.push(`/dashboard/events/${event.id}/performance`)}
                          variant="outline"
                          className="flex items-center gap-1.5 border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold rounded-xl text-xs py-2 px-4 bg-white"
                        >
                          <TrendingUp size={14} />
                          View Performance
                        </Button>
                        <Button
                          onClick={() => router.push(`/dashboard/events/${event.id}/live`)}
                          className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs py-2 px-4 shadow-sm"
                        >
                          <Radio size={14} />
                          Go Live Control
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/60 p-12 text-center max-w-lg mx-auto">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-900">No events found</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Create a new event or start a live storefront experience to engage nearby customers.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary Column: Schedule & Trends (1/3 width) */}
        <div className="space-y-6">
          
          {/* Schedule Widget */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Schedule</h4>
              <div className="flex gap-1">
                <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-gray-400 mb-2">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <span className="aspect-square flex items-center justify-center text-gray-300">28</span>
              <span className="aspect-square flex items-center justify-center text-gray-300">29</span>
              <span className="aspect-square flex items-center justify-center text-gray-300">30</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">1</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">2</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">3</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">4</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">5</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700 relative">
                6
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500"></span>
              </span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">7</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">8</span>
              <span className="aspect-square flex items-center justify-center font-bold bg-orange-100 text-orange-600 rounded-lg">9</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">10</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">11</span>
              <span className="aspect-square flex items-center justify-center font-semibold text-gray-700">12</span>
            </div>

            <div className="mt-5 space-y-3.5 border-t border-gray-100 pt-4">
              <div 
                onClick={() => toast.info('Vendor Check-in detail')}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">10:00 AM</p>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-orange-500 transition-colors">Vendor Check-in</p>
                </div>
              </div>
              <div 
                onClick={() => toast.info('Promo Campaign Start detail')}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">02:30 PM</p>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-orange-500 transition-colors">Promo Campaign Start</p>
                </div>
              </div>
            </div>
          </div>

          {/* Borough Insights */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-500" />
              Borough Trend
            </h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Weekend evening events are currently trending in <strong>Greenwich Village</strong> with +42% foot traffic.
            </p>
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Market Alignment</span>
                <span className="text-emerald-600">High</span>
              </div>
            </div>
            <Button
              onClick={() => toast.info('Heatmap analytics is coming soon!')}
              className="w-full mt-5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs py-4 border-none shadow-none"
            >
              View Heatmap
            </Button>
          </div>

        </div>

      </div>

      {/* --- Live Session Selector Modal --- */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-[#0b1c30] flex items-center gap-2">
                  <Radio className="text-orange-500 animate-pulse" size={20} />
                  Start Live Session
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Select an event from the list below to enter the Live Control Room.
                </p>
              </div>
              <button
                onClick={() => setIsLiveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {events.filter(e => e.status === 'upcoming' || e.status === 'active' || e.status === 'live').length > 0 ? (
                events
                  .filter(e => e.status === 'upcoming' || e.status === 'active' || e.status === 'live')
                  .map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setIsLiveModalOpen(false);
                        router.push(`/dashboard/events/${event.id}/live`);
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 hover:border-orange-200/80 rounded-xl text-left transition-all group active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img className="w-full h-full object-cover" src={event.image} alt={event.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                          {event.date} • {event.time}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        event.status === 'live'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {event.status}
                      </span>
                    </button>
                  ))
              ) : (
                <div className="py-6 text-center text-slate-500 space-y-3">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-gray-500">No active or upcoming events found.</p>
                  <Button
                    onClick={() => {
                      setIsLiveModalOpen(false);
                      router.push('/dashboard/events/new');
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm"
                  >
                    + Create Event
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
