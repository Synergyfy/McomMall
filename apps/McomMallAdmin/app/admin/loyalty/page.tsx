'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Heart,
    Star,
    Gift,
    History,
    Settings as SettingsIcon,
    Search,
    Plus,
    TrendingUp,
    Users,
    Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoyaltyPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Loyalty & Rewards</h1>
                    <p className="text-slate-500">Manage customer loyalty programs and reward points</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        New Reward
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">8.5k</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Active Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">1.2M</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Points Issued</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <Gift className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">15.4k</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Redemptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Trophy className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">452</p>
                                <p className="text-xs text-slate-500 font-medium lowercase">Elite Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="programs" className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-1">
                    <TabsTrigger value="programs" className="gap-2">
                        <Trophy className="h-4 w-4" />
                        Reward Programs
                    </TabsTrigger>
                    <TabsTrigger value="redemptions" className="gap-2">
                        <History className="h-4 w-4" />
                        Redemption Logs
                    </TabsTrigger>
                    <TabsTrigger value="members" className="gap-2">
                        <Users className="h-4 w-4" />
                        Top Members
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        Program Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="programs" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Standard Cashback', points: '1pt / £1', members: '8,450', status: 'active', color: 'bg-emerald-500' },
                            { name: 'Business Referral', points: '500pt / ref', members: '1,200', status: 'active', color: 'bg-blue-500' },
                            { name: 'Holiday Special', points: '2pt / £1', members: '4,500', status: 'expired', color: 'bg-slate-400' },
                        ].map((program, i) => (
                            <Card key={i} className="border-0 shadow-sm overflow-hidden">
                                <div className={cn("h-2", program.color)} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{program.name}</CardTitle>
                                        <Badge variant={program.status === 'active' ? 'outline' : 'secondary'} className={program.status === 'active' ? 'text-emerald-600 border-emerald-200' : ''}>
                                            {program.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>{program.points}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Active Members</span>
                                            <span className="font-semibold text-slate-900">{program.members}</span>
                                        </div>
                                        <Button variant="outline" className="w-full">Edit Program</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="redemptions" className="mt-6">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Reward</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { user: 'Sarah Jenkins', reward: '£10 Wallet Credit', points: '1,000', date: '2 hours ago', status: 'completed' },
                                        { user: 'Robert Fox', reward: 'Free Delivery Voucher', points: '250', date: '5 hours ago', status: 'completed' },
                                        { user: 'Amiya Gupta', reward: 'TechHub 10% Discount', points: '500', date: 'Yesterday', status: 'processing' },
                                    ].map((log, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium text-slate-900">{log.user}</TableCell>
                                            <TableCell>{log.reward}</TableCell>
                                            <TableCell>
                                                <span className="text-amber-600 font-bold">{log.points}</span>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">{log.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={cn(
                                                    log.status === 'completed' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'
                                                )}>
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <div className="max-w-2xl space-y-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Point Conversion</CardTitle>
                                <CardDescription>Set how points are earned and spent</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Earning Rate (£1 = ? pts)</label>
                                        <Input type="number" defaultValue="1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Redemption Value (100 pts = ? £)</label>
                                        <Input type="number" defaultValue="1" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Points Expiry (months)</label>
                                    <Input type="number" defaultValue="12" />
                                </div>
                                <Button className="bg-slate-900">Save Rules</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
