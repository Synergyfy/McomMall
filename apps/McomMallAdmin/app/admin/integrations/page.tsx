'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Plug,
    Webhook as WebhookIcon,
    Plus,
    Trash2,
    Store,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetIntegrationSettings,
    useUpdateIntegrationSettings,
} from '@/service/settings/hook';
import {
    useGetWebhooks,
    useCreateWebhook,
    useUpdateWebhook,
    useDeleteWebhook,
} from '@/service/webhooks/hook';

const INTEGRATION_ROWS = [
    { key: 'googleConnected', label: 'Google Business', category: 'Listings' },
    { key: 'stripeConnected', label: 'Stripe', category: 'Payments' },
    { key: 'bookingsConnected', label: 'Bookings', category: 'Scheduling' },
] as const;

function ConnectedAppsTab() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const { data, isLoading, isError, error, refetch } = useGetIntegrationSettings(businessId);
    const save = useUpdateIntegrationSettings(businessId);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-md">
                <Store className="h-4 w-4 text-slate-400 shrink-0" />
                <Select value={businessId ?? ''} onValueChange={(v) => setBusinessId(v || undefined)}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder={businessesLoading ? 'Loading businesses…' : 'Select a business'} />
                    </SelectTrigger>
                    <SelectContent>
                        {(businessesData?.data ?? []).map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                                {b.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!businessId && (
                <p className="text-sm text-slate-400">Select a business to view its live integration toggles.</p>
            )}

            {businessId && isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {businessId && isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load integrations: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {businessId && !isLoading && !isError && data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INTEGRATION_ROWS.map((app) => (
                        <Card key={app.key} className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <Plug className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{app.label}</h3>
                                            <p className="text-sm text-slate-500">{app.category}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data[app.key] ?? false}
                                        disabled={save.isPending}
                                        onCheckedChange={(v) => save.mutate({ [app.key]: v })}
                                    />
                                </div>
                                <div className="mt-6">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            data[app.key]
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-slate-100 text-slate-500',
                                        )}
                                    >
                                        {data[app.key] ? 'connected' : 'disconnected'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function WebhooksTab() {
    const { data, isLoading, isError, error, refetch } = useGetWebhooks();
    const create = useCreateWebhook();
    const update = useUpdateWebhook();
    const remove = useDeleteWebhook();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [events, setEvents] = useState('');

    const webhooks = data ?? [];

    const handleCreate = () => {
        if (!name.trim() || !url.trim()) return;
        create.mutate(
            {
                name: name.trim(),
                url: url.trim(),
                events: events.split(',').map((e) => e.trim()).filter(Boolean),
            },
            {
                onSuccess: () => {
                    setDialogOpen(false);
                    setName('');
                    setUrl('');
                    setEvents('');
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Webhook Endpoint
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load webhooks: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : webhooks.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent>
                        <div className="text-center py-12">
                            <WebhookIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-slate-900">No webhooks configured</h3>
                            <p className="text-sm text-slate-500 mt-1">Start receiving event updates by creating your first webhook.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {webhooks.map((wh) => (
                        <Card key={wh.id} className="border-0 shadow-sm">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-slate-900">{wh.name}</p>
                                        <Badge variant={wh.isActive ? 'default' : 'secondary'}>
                                            {wh.isActive ? 'Active' : 'Paused'}
                                        </Badge>
                                        {wh.failureCount > 0 && (
                                            <Badge variant="outline" className="text-red-600 border-red-200">
                                                {wh.failureCount} failures
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono truncate mt-1">{wh.url}</p>
                                    {(wh.events ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {wh.events.map((e) => (
                                                <Badge key={e} variant="secondary" className="font-mono text-[10px]">
                                                    {e}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Switch
                                        checked={wh.isActive}
                                        disabled={update.isPending}
                                        onCheckedChange={(v) => update.mutate({ id: wh.id, dto: { isActive: v } })}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500"
                                        disabled={remove.isPending}
                                        onClick={() => {
                                            if (confirm(`Delete webhook "${wh.name}"?`)) remove.mutate(wh.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <p className="text-xs text-slate-400">
                Delivery logs and automatic retries are not implemented in the API yet — this registry tracks
                endpoints, subscribed events and activation state.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Webhook Endpoint</DialogTitle>
                        <DialogDescription>Registers a live endpoint via POST /webhooks.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Order events to ERP" />
                        </div>
                        <div className="space-y-2">
                            <Label>URL *</Label>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
                        </div>
                        <div className="space-y-2">
                            <Label>Events (comma separated)</Label>
                            <Input value={events} onChange={(e) => setEvents(e.target.value)} placeholder="order.created, order.paid" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!name.trim() || !url.trim() || create.isPending} onClick={handleCreate}>
                            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Register
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function IntegrationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
                    <p className="text-slate-500">Live business integrations and webhook endpoints</p>
                </div>
            </div>

            <Tabs defaultValue="connected" className="w-full">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="connected">Connected Apps</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                </TabsList>

                <TabsContent value="connected" className="mt-6">
                    <ConnectedAppsTab />
                </TabsContent>

                <TabsContent value="webhooks" className="mt-6">
                    <WebhooksTab />
                </TabsContent>
            </Tabs>

            <Card className="border-0 shadow-sm bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-base">Platform API Keys</CardTitle>
                    <CardDescription>
                        API keys and provider secrets are managed through environment configuration and never
                        displayed in the dashboard.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
