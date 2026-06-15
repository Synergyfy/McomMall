'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Bell,
    Megaphone,
    Gift,
    Calendar,
    AlertTriangle,
    Server,
    Send,
    Clock,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications & Communication</h1>
                    <p className="text-slate-500">Manage platform-wide communication and alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Communication Types Overview */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-0 shadow-sm bg-slate-900 text-white h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-400" /> Communication Types
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Active channels and recent usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Megaphone className="h-4 w-4 text-orange-400" />
                                    <span className="font-medium text-sm">Borough Announcements</span>
                                </div>
                                <Badge className="bg-slate-700 hover:bg-slate-600">12 Active</Badge>
                            </div>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-4 w-4 text-blue-400" />
                                    <span className="font-medium text-sm">Push Notifications</span>
                                </div>
                                <Badge className="bg-slate-700 hover:bg-slate-600">145k Sent</Badge>
                            </div>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Gift className="h-4 w-4 text-emerald-400" />
                                    <span className="font-medium text-sm">Reward Alerts</span>
                                </div>
                                <Badge className="bg-slate-700 hover:bg-slate-600">Auto</Badge>
                            </div>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-purple-400" />
                                    <span className="font-medium text-sm">Event Reminders</span>
                                </div>
                                <Badge className="bg-slate-700 hover:bg-slate-600">8 Scheduled</Badge>
                            </div>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="font-medium text-sm">Emergency Notices</span>
                                </div>
                                <Badge className="bg-red-500 hover:bg-red-600 border-0">0 Active</Badge>
                            </div>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Server className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-sm">Platform Updates</span>
                                </div>
                                <Badge className="bg-slate-700 hover:bg-slate-600">Drafting</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message Creator */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle>Message Creator</CardTitle>
                            <CardDescription>Compose and schedule a new broadcast or alert</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Message Title</label>
                                    <Input placeholder="e.g. Summer Night Market is Live!" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Communication Type</label>
                                    <Select defaultValue="borough">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="borough">Borough Announcement</SelectItem>
                                            <SelectItem value="push">Push Notification</SelectItem>
                                            <SelectItem value="reward">Reward Alert</SelectItem>
                                            <SelectItem value="event">Event Reminder</SelectItem>
                                            <SelectItem value="emergency">Emergency Notice</SelectItem>
                                            <SelectItem value="platform">Platform Update</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Message Body</label>
                                <Textarea 
                                    placeholder="Type your message here... (Max 250 characters for push notifications)" 
                                    className="min-h-[120px] resize-none"
                                />
                                <p className="text-xs text-slate-400 text-right">0 / 250</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Audience Targeting</label>
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select audience..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="customers">Customers Only</SelectItem>
                                            <SelectItem value="businesses">Businesses Only</SelectItem>
                                            <SelectItem value="active">Active this week</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Borough</label>
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select borough..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Boroughs (Global)</SelectItem>
                                            <SelectItem value="camden">Camden</SelectItem>
                                            <SelectItem value="hackney">Hackney</SelectItem>
                                            <SelectItem value="southwark">Southwark</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Call to Action (CTA) Button</label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Button Text (e.g. View Deal)" className="w-1/2" />
                                        <Input placeholder="Link URL" className="w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Schedule</label>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="w-1/2 justify-start font-normal text-slate-600">
                                            <Calendar className="mr-2 h-4 w-4" /> Today
                                        </Button>
                                        <Button variant="outline" className="w-1/2 justify-start font-normal text-slate-600">
                                            <Clock className="mr-2 h-4 w-4" /> 12:00 PM
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <Button variant="ghost" className="text-slate-500">Save as Draft</Button>
                                <div className="flex gap-2">
                                    <Button variant="outline">
                                        <Clock className="h-4 w-4 mr-2" /> Schedule
                                    </Button>
                                    <Button className="bg-orange-500 hover:bg-orange-600">
                                        <Send className="h-4 w-4 mr-2" /> Send Now
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
