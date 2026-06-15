'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    MapPin,
    MessageSquare,
    Calendar,
    Megaphone,
    Store,
    Users,
    Activity,
    Navigation,
    Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommunityActivityPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Community & Activity</h1>
                    <p className="text-slate-500">Monitor local interactions and physical engagement</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Megaphone className="h-4 w-4 mr-2" /> Send Community Blast
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Community Feed */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-0 shadow-sm h-[calc(100vh-140px)] overflow-hidden flex flex-col">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" /> Live Feed
                            </CardTitle>
                            <CardDescription>Real-time ecosystem activity</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1 bg-slate-50/50">
                            <div className="divide-y divide-slate-100">
                                {[
                                    { type: 'discussion', title: 'New post in Camden Chat', desc: '"Anyone know when the night market opens?"', icon: MessageSquare, color: 'text-blue-500 bg-blue-100', time: '2m ago' },
                                    { type: 'event', title: 'High Street RSVP', desc: '45 users joined "Tech Expo"', icon: Calendar, color: 'text-purple-500 bg-purple-100', time: '15m ago' },
                                    { type: 'campaign', title: 'Campaign Engagement', desc: 'Flash Deal claimed 120 times', icon: Megaphone, color: 'text-orange-500 bg-orange-100', time: '24m ago' },
                                    { type: 'business', title: 'Business Interaction', desc: 'Local Grocer responded to 5 reviews', icon: Store, color: 'text-emerald-500 bg-emerald-100', time: '1h ago' },
                                    { type: 'borough', title: 'Borough Trend', desc: 'Southwark activity spiked by 40%', icon: Activity, color: 'text-rose-500 bg-rose-100', time: '2h ago' },
                                    { type: 'discussion', title: 'New post in Hackney Hub', desc: '"Best coffee place nearby?"', icon: MessageSquare, color: 'text-blue-500 bg-blue-100', time: '2h ago' },
                                    { type: 'event', title: 'Event Started', desc: 'Foodie Weekend Carnival is now live', icon: Calendar, color: 'text-purple-500 bg-purple-100', time: '3h ago' },
                                    { type: 'business', title: 'New Storefront', desc: 'The Artisan Bakery verified their profile', icon: Store, color: 'text-emerald-500 bg-emerald-100', time: '4h ago' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-white transition-colors cursor-pointer">
                                        <div className="flex gap-3">
                                            <div className={cn('p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0', item.color)}>
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between gap-4 mb-1">
                                                    <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                                                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{item.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-snug">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Map */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm h-full flex flex-col overflow-hidden">
                        <CardHeader className="pb-0 absolute z-10 w-full bg-gradient-to-b from-white/90 to-transparent">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-rose-500" /> Interactive Activity Map
                            </CardTitle>
                            <CardDescription>Live engagement, traffic, and physical hotspots</CardDescription>
                            
                            <div className="flex gap-2 mt-4 pb-4">
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur border shadow-sm cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <Flame className="h-3 w-3 mr-1 text-rose-500" /> Heat Maps
                                </Badge>
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur border shadow-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <Users className="h-3 w-3 mr-1 text-indigo-500" /> Engagement Zones
                                </Badge>
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur border shadow-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <Navigation className="h-3 w-3 mr-1 text-emerald-500" /> Foot Traffic
                                </Badge>
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur border shadow-sm cursor-pointer hover:bg-amber-50 hover:text-amber-600 transition-colors">
                                    <Calendar className="h-3 w-3 mr-1 text-amber-500" /> Event Activity
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        {/* Mock Map Area */}
                        <CardContent className="p-0 flex-1 relative bg-slate-100 min-h-[500px]">
                            {/* Map Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            
                            {/* Map UI Elements */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                                Interactive Map Container
                            </div>
                            
                            {/* Hotspots */}
                            <div className="absolute top-[30%] left-[40%] text-center">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-rose-500/20 rounded-full animate-ping"></div>
                                    <div className="absolute -inset-2 bg-rose-500/40 rounded-full animate-pulse"></div>
                                    <div className="relative h-6 w-6 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
                                        <Flame className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-800">
                                    Camden High St
                                </div>
                            </div>
                            
                            <div className="absolute top-[60%] left-[65%] text-center">
                                <div className="relative">
                                    <div className="absolute -inset-6 bg-indigo-500/10 rounded-full animate-pulse"></div>
                                    <div className="relative h-5 w-5 bg-indigo-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
                                        <Users className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-800">
                                    Borough Market
                                </div>
                            </div>
                            
                            <div className="absolute top-[45%] left-[25%] text-center">
                                <div className="relative">
                                    <div className="relative h-4 w-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
                                        <Navigation className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                                <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold text-slate-600">
                                    Hyde Park
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
