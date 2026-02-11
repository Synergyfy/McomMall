'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, UserCheck, FileSearch, Star, Plus } from 'lucide-react';

export default function QualityPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quality Assurance</h1>
                    <p className="text-slate-500">Monitor service quality, audits, and certifications</p>
                </div>
            </div>

            <Tabs defaultValue="mystery" className="space-y-6">
                <TabsList className="bg-white border p-1">
                    <TabsTrigger value="mystery" className="gap-2">
                        <UserCheck className="h-4 w-4" />
                        Mystery Shoppers
                    </TabsTrigger>
                    <TabsTrigger value="audits" className="gap-2">
                        <FileSearch className="h-4 w-4" />
                        Audit Reports
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="gap-2">
                        <Award className="h-4 w-4" />
                        Certifications
                    </TabsTrigger>
                </TabsList>

                {/* Mystery Shopper Tab */}
                <TabsContent value="mystery">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Mystery Shopper Missions</CardTitle>
                                <CardDescription>Manage covert quality checks on businesses.</CardDescription>
                            </div>
                            <Button className="bg-slate-900 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Assign Mission
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { business: 'Urban Eats', shopper: 'Agent 47', status: 'In Progress', date: 'Feb 5, 2026' },
                                    { business: 'Tech Fix Pro', shopper: 'Agent 99', status: 'Completed', date: 'Feb 1, 2026', score: 4.8 },
                                ].map((mission, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                <UserCheck className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">Audit: {mission.business}</p>
                                                <p className="text-xs text-slate-500">Shopper: {mission.shopper} • Assigned: {mission.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {mission.score && (
                                                <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                                    <Star className="h-4 w-4 fill-emerald-600" />
                                                    {mission.score}
                                                </div>
                                            )}
                                            <Badge variant={mission.status === 'Completed' ? 'default' : 'outline'}>
                                                {mission.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm">Details</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audits Tab */}
                <TabsContent value="audits">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            No recent audit reports generated.
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="badges">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Verified Seller', icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
                            { name: 'Top Rated', icon: '⭐', color: 'bg-amber-100 text-amber-700' },
                            { name: 'Fast Shipper', icon: '🚚', color: 'bg-blue-100 text-blue-700' },
                        ].map((badge) => (
                            <Card key={badge.name}>
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${badge.color}`}>
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{badge.name}</h3>
                                        <p className="text-sm text-slate-500">Awarded to top performers</p>
                                    </div>
                                    <Button variant="outline" className="w-full">Manage Criteria</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
