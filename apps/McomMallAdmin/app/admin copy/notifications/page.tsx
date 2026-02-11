'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    Settings,
    History,
    Search,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500">Manage communication channels, templates and routing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <History className="h-4 w-4 mr-2" />
                        Sent Logs
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Send className="h-4 w-4 mr-2" />
                        Send Broadcast
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Channel Status */}
                <Card className="border-0 shadow-sm md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Delivery Channels</CardTitle>
                        <CardDescription>Configure active notification routes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Email (SendGrid)</span>
                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Operational
                                    </span>
                                </div>
                            </div>
                            <Switch checked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Push (Firebase)</span>
                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Operational
                                    </span>
                                </div>
                            </div>
                            <Switch checked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">SMS (Twilio)</span>
                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Low Balance
                                    </span>
                                </div>
                            </div>
                            <Switch checked />
                        </div>
                    </CardContent>
                </Card>

                {/* Templates and Logs */}
                <Card className="border-0 shadow-sm md:col-span-2">
                    <CardContent className="p-0">
                        <Tabs defaultValue="templates" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-14 px-6">
                                <TabsTrigger value="templates" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full bg-transparent">
                                    Templates
                                </TabsTrigger>
                                <TabsTrigger value="events" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full bg-transparent">
                                    Event Routing
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="templates" className="p-0 m-0">
                                <div className="p-4 border-b">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input placeholder="Search templates..." className="pl-10" />
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Template Name</TableHead>
                                            <TableHead>Recipient Types</TableHead>
                                            <TableHead>Channels</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Welcome Email', target: 'Customer, Business', channels: ['Email'] },
                                            { name: 'Order Confirmation', target: 'Customer', channels: ['Email', 'Push'] },
                                            { name: 'Dispute Update', target: 'All Parties', channels: ['Email', 'Push', 'SMS'] },
                                            { name: 'Payout Success', target: 'Business', channels: ['Email'] },
                                            { name: 'Login Alert', target: 'All User', channels: ['Email', 'Push'] },
                                        ].map((t, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium text-slate-900">{t.name}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{t.target}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {t.channels.map(c => (
                                                            <Badge key={c} variant="secondary" className="text-[10px] uppercase font-bold py-0">
                                                                {c}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
