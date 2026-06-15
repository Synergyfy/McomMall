'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    TrendingUp,
    Store,
    Activity,
    Map,
    Megaphone,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AuditsVisibilityPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audits & Visibility</h1>
                    <p className="text-slate-500">Monitor and improve business growth and discoverability</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        Run Global Audit
                    </Button>
                </div>
            </div>

            {/* Visibility Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">82/100</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Avg Visibility Score</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">68%</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Storefront Completion</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">4.8</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Engagement Rating</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <Map className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">Top 3</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Borough Ranking</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">+45%</p>
                            <p className="text-sm text-slate-500 font-medium leading-tight">Campaign Perf.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Storefront List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Business Audits</CardTitle>
                                    <CardDescription>Review storefront scores and send recommendations</CardDescription>
                                </div>
                                <div className="w-64">
                                    <Input placeholder="Search businesses..." className="h-9" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Business</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Completion</TableHead>
                                        <TableHead>Issues</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { name: 'The Artisan Bakery', score: 92, completion: '100%', issues: 0, status: 'good' },
                                        { name: 'Camden Coffee', score: 65, completion: '70%', issues: 2, status: 'warning' },
                                        { name: 'Tech Repairs', score: 42, completion: '45%', issues: 5, status: 'critical' },
                                        { name: 'Vintage Threads', score: 88, completion: '90%', issues: 1, status: 'good' },
                                        { name: 'Local Grocer', score: 55, completion: '60%', issues: 3, status: 'warning' },
                                    ].map((biz, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{biz.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    biz.score >= 80 ? 'text-emerald-600 border-emerald-200' :
                                                    biz.score >= 60 ? 'text-amber-600 border-amber-200' :
                                                    'text-red-600 border-red-200'
                                                )}>
                                                    {biz.score}/100
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{biz.completion}</TableCell>
                                            <TableCell>
                                                {biz.issues > 0 ? (
                                                    <span className="flex items-center text-red-600 text-sm font-medium">
                                                        <AlertCircle className="h-3 w-3 mr-1" /> {biz.issues} found
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-emerald-600 text-sm font-medium">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> All clear
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-indigo-600">
                                                    Audit <ArrowRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Recommendations Panel */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Search className="h-5 w-5 text-orange-500" /> Audit Recommendations
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Global suggestions to improve ecosystem visibility
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <Store className="h-4 w-4 text-emerald-400" /> Improve storefront images
                                </p>
                                <p className="text-sm text-slate-400">230 businesses have missing or low-quality images.</p>
                                <Button variant="link" className="text-orange-400 p-0 h-auto text-sm mt-2">Send Notification →</Button>
                            </div>
                            
                            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <Megaphone className="h-4 w-4 text-blue-400" /> Launch promotions
                                </p>
                                <p className="text-sm text-slate-400">15 boroughs are experiencing low mid-week traffic.</p>
                                <Button variant="link" className="text-orange-400 p-0 h-auto text-sm mt-2">Suggest Campaign →</Button>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <Map className="h-4 w-4 text-purple-400" /> Join borough campaigns
                                </p>
                                <p className="text-sm text-slate-400">Camden High Street has an active campaign with low uptake.</p>
                                <Button variant="link" className="text-orange-400 p-0 h-auto text-sm mt-2">Target Businesses →</Button>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-amber-400" /> Improve reward participation
                                </p>
                                <p className="text-sm text-slate-400">Reward redemptions are down 12% globally.</p>
                                <Button variant="link" className="text-orange-400 p-0 h-auto text-sm mt-2">Boost Rewards →</Button>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <Activity className="h-4 w-4 text-rose-400" /> Increase QR activity
                                </p>
                                <p className="text-sm text-slate-400">Physical QLink scans dropped in Southwark.</p>
                                <Button variant="link" className="text-orange-400 p-0 h-auto text-sm mt-2">Audit Placements →</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
