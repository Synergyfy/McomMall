'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Play,
    Settings,
    Activity,
    Plus,
    Clock,
    GitCommit,
    Gift,
    Bell,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AutomationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Automation Systems</h1>
                    <p className="text-slate-500">Smart operational automation and ecosystem triggers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" /> Create Automation
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Automation Types Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" /> Active Flows
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {[
                                    { name: 'Auto Campaigns', count: 12, status: 'running' },
                                    { name: 'Scheduled Promotions', count: 8, status: 'running' },
                                    { name: 'Reward Triggers', count: 24, status: 'running' },
                                    { name: 'Inactivity Campaigns', count: 2, status: 'paused' },
                                    { name: 'Event Reminders', count: 5, status: 'running' },
                                    { name: 'Borough Pushes', count: 1, status: 'error' },
                                ].map((type, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <span className="font-medium text-slate-700 text-sm">{type.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {type.count}
                                            </span>
                                            <div className={cn(
                                                'h-2 w-2 rounded-full',
                                                type.status === 'running' ? 'bg-emerald-500' :
                                                type.status === 'paused' ? 'bg-amber-400' : 'bg-red-500'
                                            )} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Automation Flow Builder Mockup */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-0 shadow-sm h-[calc(100vh-140px)] flex flex-col">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Automation Flow Builder</CardTitle>
                                    <CardDescription>Drag and drop to build smart local triggers</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Settings className="h-4 w-4 mr-2" /> Settings
                                    </Button>
                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                        <Play className="h-4 w-4 mr-2" /> Activate Flow
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Builder Toolbox */}
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-indigo-200 text-indigo-700">
                                    <Activity className="h-3.5 w-3.5 mr-1.5" /> Triggers
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-blue-200 text-blue-700">
                                    <GitCommit className="h-3.5 w-3.5 mr-1.5" /> Conditions
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-amber-200 text-amber-700">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" /> Delays
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-rose-200 text-rose-700">
                                    <Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-emerald-200 text-emerald-700">
                                    <Gift className="h-3.5 w-3.5 mr-1.5" /> Rewards
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1.5 cursor-grab bg-white shadow-sm border-purple-200 text-purple-700">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5" /> Borough Target
                                </Badge>
                            </div>
                        </CardHeader>

                        {/* Visual Canvas Area */}
                        <CardContent className="p-0 flex-1 relative bg-[#f8fafc] overflow-auto">
                            {/* Dot Grid Background */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                            
                            <div className="relative p-12 min-w-[800px] flex flex-col items-center">
                                
                                {/* Start Node */}
                                <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl shadow-sm w-72 text-center z-10 relative">
                                    <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold mb-1">
                                        <Activity className="h-4 w-4" /> Trigger
                                    </div>
                                    <p className="text-sm text-slate-600">User scans QR Code in Borough Market</p>
                                    
                                    {/* Connection Line */}
                                    <div className="absolute left-1/2 -bottom-10 w-0.5 h-10 bg-slate-300"></div>
                                    <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 translate-y-full text-slate-400">
                                        <ArrowRight className="h-4 w-4 rotate-90" />
                                    </div>
                                </div>

                                <div className="h-16"></div>

                                {/* Condition Node */}
                                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl shadow-sm w-72 text-center z-10 relative">
                                    <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold mb-1">
                                        <GitCommit className="h-4 w-4" /> Condition
                                    </div>
                                    <p className="text-sm text-slate-600">Is first scan this week?</p>
                                    
                                    {/* Connection Lines Branching */}
                                    <div className="absolute left-1/2 -bottom-10 w-0.5 h-10 bg-slate-300"></div>
                                    <div className="absolute left-1/2 -bottom-10 w-64 h-0.5 bg-slate-300 -translate-x-1/2"></div>
                                    
                                    <div className="absolute left-[calc(50%-128px)] -bottom-10 w-0.5 h-10 bg-slate-300"></div>
                                    <div className="absolute left-[calc(50%-128px)] -bottom-10 -translate-x-1/2 translate-y-full text-slate-400">
                                        <ArrowRight className="h-4 w-4 rotate-90" />
                                    </div>
                                    <div className="absolute left-[calc(50%-128px)] -bottom-4 -translate-x-[120%] text-xs font-bold text-emerald-500">YES</div>

                                    <div className="absolute left-[calc(50%+128px)] -bottom-10 w-0.5 h-10 bg-slate-300"></div>
                                    <div className="absolute left-[calc(50%+128px)] -bottom-10 -translate-x-1/2 translate-y-full text-slate-400">
                                        <ArrowRight className="h-4 w-4 rotate-90" />
                                    </div>
                                    <div className="absolute left-[calc(50%+128px)] -bottom-4 translate-x-2 text-xs font-bold text-slate-400">NO</div>
                                </div>

                                <div className="h-16"></div>

                                <div className="flex justify-between w-[540px] z-10">
                                    {/* Action Node 1 (Yes) */}
                                    <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl shadow-sm w-60 text-center relative">
                                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold mb-1">
                                            <Gift className="h-4 w-4" /> Reward
                                        </div>
                                        <p className="text-sm text-slate-600">Issue 500 Borough Points</p>
                                        
                                        {/* Connection Line */}
                                        <div className="absolute left-1/2 -bottom-10 w-0.5 h-10 bg-slate-300"></div>
                                        <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 translate-y-full text-slate-400">
                                            <ArrowRight className="h-4 w-4 rotate-90" />
                                        </div>
                                    </div>

                                    {/* End Node (No) */}
                                    <div className="bg-slate-100 border-2 border-slate-200 p-3 rounded-full shadow-sm w-32 flex items-center justify-center text-slate-500 font-semibold text-sm">
                                        End Flow
                                    </div>
                                </div>

                                <div className="h-16"></div>

                                {/* Action Node 2 (Yes Path Continued) */}
                                <div className="flex justify-start w-[540px] z-10">
                                    <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl shadow-sm w-60 text-center relative">
                                        <div className="flex items-center justify-center gap-2 text-rose-700 font-semibold mb-1">
                                            <Bell className="h-4 w-4" /> Notification
                                        </div>
                                        <p className="text-sm text-slate-600">Push: "You earned 500pts!"</p>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
