'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plug,
    Webhook,
    Database,
    Cloud,
    Search,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Copy,
    RefreshCw,
} from 'lucide-react';

export default function IntegrationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
                    <p className="text-slate-500">Manage external services, API keys and webhooks</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        New Integration
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="connected" className="w-full">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="connected">Connected Apps</TabsTrigger>
                    <TabsTrigger value="api">API Keys</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                </TabsList>

                <TabsContent value="connected" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Stripe', category: 'Payments', icon: '💳', status: 'connected' },
                            { name: 'SendGrid', category: 'Email', icon: '✉️', status: 'connected' },
                            { name: 'Twilio', category: 'SMS', icon: '📱', status: 'connected' },
                            { name: 'Firebase', category: 'Push/Auth', icon: '🔥', status: 'connected' },
                            { name: 'Cloudinary', category: 'Storage', icon: '☁️', status: 'connected' },
                            { name: 'Google Analytics', category: 'Analytics', icon: '📊', status: 'disconnected' },
                        ].map((app, i) => (
                            <Card key={i} className="border-0 shadow-sm transition-all hover:shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                                                {app.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{app.name}</h3>
                                                <p className="text-sm text-slate-500">{app.category}</p>
                                            </div>
                                        </div>
                                        <Switch checked={app.status === 'connected'} />
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <Badge variant={app.status === 'connected' ? 'outline' : 'secondary'}
                                            className={app.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}>
                                            {app.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="text-slate-600">Configure</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="api" className="mt-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Platform API Keys</CardTitle>
                            <CardDescription>Secret keys used to authenticate with our API</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-xl border border-slate-100 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">Production Key</p>
                                        <p className="text-xs text-slate-500">Created on Jan 1, 2026</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Copy className="h-4 w-4" /> Copy
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 gap-2">
                                            <RefreshCw className="h-4 w-4" /> Revoke
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Input value="mk_live_•••••••••••••••••••••••••••••" readOnly className="font-mono bg-slate-50" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="mt-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Active Webhooks</CardTitle>
                            <CardDescription>Receive real-time updates for platform events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Webhook className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="font-semibold text-slate-900">No webhooks configured</h3>
                                <p className="text-sm text-slate-500 mt-1">Start receiving event updates by creating your first webhook.</p>
                                <Button className="mt-4 bg-orange-500 hover:bg-orange-600">Add Webhook Endpoint</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
