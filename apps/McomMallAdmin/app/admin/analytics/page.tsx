'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Download,
    TrendingUp,
    MapPin,
    Store,
    Megaphone,
    QrCode,
    Gift,
    Gamepad2,
    Users,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple Bar Chart Mock
function SimpleBarChart({ data, color }: { data: { label: string; value: number }[], color: string }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end justify-between h-40 gap-2 pt-4">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-8 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value}
                    </div>
                    <div
                        className={cn('w-full rounded-t-md transition-all hover:opacity-80', color)}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500 truncate max-w-[40px]">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics & Reporting</h1>
                    <p className="text-slate-500">Visual operational insights across boroughs</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700">
                        <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Global Filters Panel */}
            <Card className="border-0 shadow-sm bg-slate-50/50">
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center text-sm font-medium text-slate-500 mr-2">
                        <Filter className="h-4 w-4 mr-2" /> Filters:
                    </div>
                    <Select defaultValue="30days">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="this-year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Borough" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Boroughs</SelectItem>
                            <SelectItem value="camden">Camden</SelectItem>
                            <SelectItem value="hackney">Hackney</SelectItem>
                            <SelectItem value="southwark">Southwark</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Business Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="fnb">Food & Beverage</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Campaign Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            <SelectItem value="flash">Flash Deals</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Membership Tier" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tiers</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Borough Engagement */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-indigo-500" /> Borough Engagement
                                </CardTitle>
                                <CardDescription>Activity levels across major boroughs</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart 
                            color="bg-indigo-500"
                            data={[
                                { label: 'Cam', value: 85 },
                                { label: 'Hack', value: 92 },
                                { label: 'South', value: 78 },
                                { label: 'West', value: 65 },
                                { label: 'Isling', value: 88 },
                                { label: 'Lamb', value: 54 },
                                { label: 'Green', value: 70 },
                            ]} 
                        />
                    </CardContent>
                </Card>

                {/* Storefront Traffic */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-blue-500" /> Storefront Traffic
                                </CardTitle>
                                <CardDescription>Digital storefront profile views</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart 
                            color="bg-blue-500"
                            data={[
                                { label: 'Mon', value: 1200 },
                                { label: 'Tue', value: 1400 },
                                { label: 'Wed', value: 1100 },
                                { label: 'Thu', value: 1600 },
                                { label: 'Fri', value: 2400 },
                                { label: 'Sat', value: 3100 },
                                { label: 'Sun', value: 2800 },
                            ]} 
                        />
                    </CardContent>
                </Card>

                {/* Campaign Reach */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-orange-500" /> Campaign Reach
                                </CardTitle>
                                <CardDescription>Unique users reached by active campaigns</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart 
                            color="bg-orange-500"
                            data={[
                                { label: 'Wk1', value: 45000 },
                                { label: 'Wk2', value: 52000 },
                                { label: 'Wk3', value: 48000 },
                                { label: 'Wk4', value: 61000 },
                            ]} 
                        />
                    </CardContent>
                </Card>

                {/* QR Activity */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-slate-700" /> QR Activity
                                </CardTitle>
                                <CardDescription>Physical QLink scans in the real world</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart 
                            color="bg-slate-700"
                            data={[
                                { label: 'Mon', value: 320 },
                                { label: 'Tue', value: 350 },
                                { label: 'Wed', value: 310 },
                                { label: 'Thu', value: 420 },
                                { label: 'Fri', value: 850 },
                                { label: 'Sat', value: 1200 },
                                { label: 'Sun', value: 950 },
                            ]} 
                        />
                    </CardContent>
                </Card>

                {/* Rewards Usage & Gamification (Combined row layout) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-sm md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-emerald-500" /> Rewards Usage
                            </CardTitle>
                            <CardDescription>Points redeemed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart 
                                color="bg-emerald-500"
                                data={[
                                    { label: 'Jan', value: 120 },
                                    { label: 'Feb', value: 145 },
                                    { label: 'Mar', value: 180 },
                                    { label: 'Apr', value: 210 },
                                    { label: 'May', value: 195 },
                                ]} 
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Gamepad2 className="h-5 w-5 text-purple-500" /> Gamification
                            </CardTitle>
                            <CardDescription>Minigame participation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart 
                                color="bg-purple-500"
                                data={[
                                    { label: 'Spin', value: 8500 },
                                    { label: 'Scratch', value: 4200 },
                                    { label: 'Box', value: 3100 },
                                    { label: 'Quest', value: 1500 },
                                ]} 
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-rose-500" /> Customer Retention
                            </CardTitle>
                            <CardDescription>Returning users %</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-40 flex items-center justify-center flex-col">
                                <p className="text-5xl font-bold text-slate-900">42%</p>
                                <p className="text-sm text-emerald-500 font-medium flex items-center mt-2">
                                    <TrendingUp className="h-4 w-4 mr-1" /> +3.2% vs last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
