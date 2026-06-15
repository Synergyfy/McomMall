'use client';

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
    Gift,
    Star,
    Award,
    MapPin,
    Trophy,
    ShieldAlert,
    History,
    Settings as SettingsIcon,
    Plus,
    Users,
    Zap,
    Play,
    Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

export default function LoyaltyPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Rewards & Loyalty</h1>
                    <p className="text-slate-500">Manage community-driven reward systems and engagement</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700">
                        <Zap className="h-4 w-4 mr-2" /> Assign Bonus
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" /> Create Reward
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <Gift className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">15.4k</p>
                            <p className="text-sm text-slate-500 font-medium">Rewards Redeemed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <Star className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">1.2M</p>
                            <p className="text-sm text-slate-500 font-medium">Points Issued</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Award className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">24</p>
                            <p className="text-sm text-slate-500 font-medium">Active Loyalty Programs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">14</p>
                            <p className="text-sm text-slate-500 font-medium">Borough Participation</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">120</p>
                            <p className="text-sm text-slate-500 font-medium">Top Rewards</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">8</p>
                            <p className="text-sm text-slate-500 font-medium">Abuse Detection Alerts</p>
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
                            { name: 'Standard Cashback', points: '1pt / £1', members: '8,450', status: 'active', color: 'bg-emerald-500', isFeatured: true },
                            { name: 'Business Referral', points: '500pt / ref', members: '1,200', status: 'active', color: 'bg-blue-500', isFeatured: false },
                            { name: 'Holiday Special', points: '2pt / £1', members: '4,500', status: 'paused', color: 'bg-amber-500', isFeatured: false },
                        ].map((program, i) => (
                            <Card key={i} className="border-0 shadow-sm overflow-hidden relative">
                                <div className={cn("h-2", program.color)} />
                                {program.isFeatured && (
                                    <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Featured
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg pr-16">{program.name}</CardTitle>
                                    </div>
                                    <CardDescription>{program.points}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Active Members</span>
                                            <span className="font-semibold text-slate-900">{program.members}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Status</span>
                                            <Badge variant="outline" className={cn(
                                                program.status === 'active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'
                                            )}>
                                                {program.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-2">
                                            <Button variant="outline" className="flex-1 text-slate-600 text-xs h-8">
                                                <SettingsIcon className="mr-1.5 h-3.5 w-3.5" /> Configure
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Star className="mr-2 h-4 w-4" /> Feature Reward
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        {program.status === 'active' ? (
                                                            <><Pause className="mr-2 h-4 w-4" /> Pause Reward</>
                                                        ) : (
                                                            <><Play className="mr-2 h-4 w-4" /> Activate Reward</>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
                                <CardTitle className="text-lg">Program Rules Configuration</CardTitle>
                                <CardDescription>Configure base rules and points conversions</CardDescription>
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
