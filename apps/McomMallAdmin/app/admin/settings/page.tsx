'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Code, CreditCard, Users, Store, AlertTriangle, Loader2, Save } from 'lucide-react';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetIntegrationSettings,
    useUpdateIntegrationSettings,
    useGetBillingSummary,
} from '@/service/settings/hook';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500">Live configuration persisted through the settings API</p>
                </div>
            </div>

            <Tabs defaultValue="integrations" className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-1">
                    <TabsTrigger value="integrations" className="gap-2">
                        <Code className="h-4 w-4" /> Integrations
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <CreditCard className="h-4 w-4" /> Billing
                    </TabsTrigger>
                    <TabsTrigger value="membership" className="gap-2">
                        <Users className="h-4 w-4" /> Membership
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="mt-6">
                    <IntegrationsPanel />
                </TabsContent>
                <TabsContent value="billing" className="mt-6">
                    <BillingPanel />
                </TabsContent>
                <TabsContent value="membership" className="mt-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Membership &amp; Plans</CardTitle>
                            <CardDescription>
                                Plans and seasons are managed in their dedicated sections.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Link href="/admin/plans">
                                <Button variant="outline">Manage Plans</Button>
                            </Link>
                            <Link href="/admin/seasons">
                                <Button variant="outline">Manage Seasons</Button>
                            </Link>
                            <Link href="/admin/memberships">
                                <Button variant="outline">Memberships</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function IntegrationsPanel() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const { data, isLoading, isError, error, refetch } = useGetIntegrationSettings(businessId);
    const save = useUpdateIntegrationSettings(businessId);

    const [draft, setDraft] = useState({
        googleConnected: false,
        stripeConnected: false,
        bookingsConnected: false,
        googleProfileId: '',
        stripeAccountId: '',
    });
    const [touched, setTouched] = useState(false);

    const current = touched
        ? draft
        : {
              googleConnected: data?.googleConnected ?? false,
              stripeConnected: data?.stripeConnected ?? false,
              bookingsConnected: data?.bookingsConnected ?? false,
              googleProfileId: data?.googleProfileId ?? '',
              stripeAccountId: data?.stripeAccountId ?? '',
          };

    const set = (key: keyof typeof draft, value: boolean | string) => {
        setTouched(true);
        setDraft((d) => ({ ...d, [key]: value }));
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" /> Business Integrations
                </CardTitle>
                <CardDescription>
                    Persisted via GET/PUT /settings/integrations?businessId=
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2 max-w-md">
                    <Store className="h-4 w-4 text-slate-400 shrink-0" />
                    <Select
                        value={businessId ?? ''}
                        onValueChange={(v) => {
                            setBusinessId(v || undefined);
                            setTouched(false);
                        }}
                    >
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
                    <p className="text-sm text-slate-400">Select a business to load its live integration toggles.</p>
                )}

                {businessId && isLoading && <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />}

                {businessId && isError && (
                    <div className="flex items-center gap-3 text-sm text-rose-700 bg-rose-50 rounded-xl p-4">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                )}

                {businessId && !isLoading && !isError && data && (
                    <>
                        <div className="space-y-4">
                            {(
                                [
                                    { key: 'googleConnected', label: 'Google Business' },
                                    { key: 'stripeConnected', label: 'Stripe Payments' },
                                    { key: 'bookingsConnected', label: 'Bookings' },
                                ] as const
                            ).map((row) => (
                                <div key={row.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                                    <span className="text-sm font-medium">{row.label}</span>
                                    <Switch checked={current[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                                </div>
                            ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Google Profile ID</Label>
                                <Input
                                    value={current.googleProfileId}
                                    onChange={(e) => set('googleProfileId', e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stripe Account ID</Label>
                                <Input
                                    value={current.stripeAccountId}
                                    onChange={(e) => set('stripeAccountId', e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <Button
                            className="bg-slate-900"
                            disabled={save.isPending}
                            onClick={() =>
                                save.mutate(
                                    {
                                        googleConnected: current.googleConnected,
                                        stripeConnected: current.stripeConnected,
                                        bookingsConnected: current.bookingsConnected,
                                        googleProfileId: current.googleProfileId || undefined,
                                        stripeAccountId: current.stripeAccountId || undefined,
                                    },
                                    { onSuccess: () => setTouched(false) },
                                )
                            }
                        >
                            {save.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function BillingPanel() {
    const { data, isLoading, isError, error, refetch } = useGetBillingSummary();

    if (isLoading) return <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />;
    if (isError || !data)
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load billing: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.plan ? (
                        <div className="space-y-2 text-sm">
                            <p className="text-xl font-black">{data.plan.name}</p>
                            <p className="text-slate-500 capitalize">{data.plan.planType}</p>
                            <Badge variant={data.plan.isActive ? 'default' : 'secondary'}>
                                {data.plan.isActive ? 'Active' : 'Inactive'}
                                {data.plan.isTrial ? ' · Trial' : ''}
                            </Badge>
                            {data.plan.expiresAt && (
                                <p className="text-slate-400">Expires {new Date(data.plan.expiresAt).toLocaleDateString()}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No active membership plan.</p>
                    )}
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Payment Methods ({data.paymentMethods.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {data.paymentMethods.length === 0 && (
                        <p className="text-sm text-slate-400">No payment methods on file.</p>
                    )}
                    {data.paymentMethods.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2 text-sm">
                            <span className="font-medium capitalize">
                                {m.provider} {m.brand} {m.last4 ? `•••• ${m.last4}` : ''}
                            </span>
                            {m.isDefault && <Badge>Default</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">Invoices ({data.invoices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.invoices.length === 0 ? (
                        <p className="text-sm text-slate-400">No invoices yet.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100 text-sm">
                            {data.invoices.slice(0, 10).map((inv) => (
                                <li key={String(inv.id)} className="py-2 flex justify-between">
                                    <span className="font-mono text-xs">{String(inv.id).slice(0, 8)}</span>
                                    <span>
                                        {inv.amount != null ? `£${Number(inv.amount).toFixed(2)}` : ''}{' '}
                                        <span className="text-slate-400 capitalize">{String(inv.status ?? '')}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
