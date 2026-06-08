'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin as MapPinIcon, 
  Clock as ClockIcon, 
  Check as CheckIcon, 
  Users as UsersIcon 
} from 'lucide-react';

interface MallEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  description: string;
  image: string;
}

const MALL_EVENTS: MallEvent[] = [
  {
    id: 'e1',
    title: 'Manhattan Street Food Expo',
    date: 'Friday, June 12',
    time: '12:00 PM - 8:00 PM',
    location: 'Manhattan Central Court',
    attendees: 342,
    description: 'Experience gourmet dishes from the top 15 street food vendors in New York. Exclusive discounts for Mcom members.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e2',
    title: 'Sneaker Hunt Challenge',
    date: 'Saturday, June 13',
    time: '3:00 PM - 6:00 PM',
    location: 'Level 2, North Wing',
    attendees: 189,
    description: 'Find hidden QR codes throughout the mall. Discover rewards and points in our digital treasure hunt.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e3',
    title: 'Artisan Coffee Tasting',
    date: 'Tuesday, June 16',
    time: '10:00 AM - 11:30 AM',
    location: 'The Artisan Grind Cafe',
    attendees: 45,
    description: 'Learn the secrets of master espresso brewing and bean roasting from award-winning local baristas.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600'
  }
];

export const EventsView: React.FC = () => {
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleJoin = (id: string, title: string) => {
    if (joinedEventIds.includes(id)) {
      setJoinedEventIds((prev) => prev.filter((eventId) => eventId !== id));
      setToastMessage(`Cancelled registration for ${title}`);
      window.setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    setJoinedEventIds((prev) => [...prev, id]);
    setToastMessage(`Successfully registered for ${title}!`);
    window.setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h3 className="text-base font-bold text-slate-800">High Street Events</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Join neighborhood campaigns & gatherings</p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      <div className="space-y-5">
        {MALL_EVENTS.map((event) => {
          const isJoined = joinedEventIds.includes(event.id);

          return (
            <article 
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col sm:flex-row"
            >
              <div className="relative h-44 sm:h-auto sm:w-48 overflow-hidden shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  alt={event.title}
                  className="w-full h-full object-cover relative z-0"
                  src={event.image}
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{event.title}</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed line-clamp-2">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.attendees + (isJoined ? 1 : 0)} joined</span>
                  </div>

                  <button
                    onClick={() => handleJoin(event.id, event.title)}
                    className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 ${
                      isJoined 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/10'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5" />
                        Registered
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
