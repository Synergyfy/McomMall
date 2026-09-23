'use client';

import { useMemo, useState } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Gift,
    Star,
    Award,
    Trophy,
    Pause,
    Play,
    Trash2,
    Store,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetLoyaltyStats,
    useGetLoyaltyRules,
    useUpdateLoyaltyRule,
    useDeleteLoyaltyRule,
    useGetLoyaltySettings,
    useUpdateLoyaltySettings,
} from '@/service/loyalty/hook';

export default function LoyaltyPage() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);

    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const businesses = useMemo(() => businessesData?.data ?? [], [businessesData]);

    const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: refetchStats } =
        useGetLoyaltyStats(businessId);
    const { data: rules, isLoading: rulesLoading } = useGetLoyaltyRules(businessId);
    const updateRule = useUpdateLoyaltyRule(businessId);
    const deleteRule = useDeleteLoyaltyRule(businessId);

    const statCards = [
        { label: 'Active Rewards', value: stats?.activeRewards, icon: Gift, tone: 'bg-emerald-100 text-emerald-600' },
        { label: 'Points Issued', value: stats?.pointsIssued, icon: Star, tone: 'bg-amber-100 text-amber-600' },
        { label: 'Redemption Rate %', value: stats?.redemptionRate, icon: Award, tone: 'bg-blue-100 text-blue-600' },
        { label: 'Members w/ Points', value: stats?.programGrowth, icon: Trophy, tone: 'bg-purple-100 text-purple-600' },
        { label: 'Completed Bookings', value: stats?.completedBookings, icon: Store, tone: 'bg-indigo-100 text-indigo-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Rewards &amp; Loyalty</h1>
                    <p className="text-slate-500">Live loyalty data per business from the API</p>
                </div>
                <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    <Select value={businessId ?? ''} onValueChange={(v) => setBusinessId(v || undefined)}>
                        <SelectTrigger className="w-64 bg-white">
                            <SelectValue placeholder={businessesLoading ? 'Loading businesses…' : 'Select a business'} />
                        </SelectTrigger>
                        <SelectContent>
                            {businesses.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!businessId && (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center text-sm text-slate-500">
                        Select a business above to load its live loyalty stats, rewards, rules and settings.
                    </CardContent>
                </Card>
            )}

            {businessId && (
                <>
                    {statsError && (
                        <Card className="border-rose-200 bg-rose-50">
                            <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                                <AlertTriangle className="h-4 w-4" />
                                Failed to load loyalty stats: {(statsErr as Error)?.message ?? 'Unknown error'}
                                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchStats()}>
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {statCards.map((s) => (
                            <Card key={s.label} className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={cn('p-3 rounded-xl', s.tone)}>
                                        <s.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        {statsLoading ? (
                                            <div className="h-7 w-16 rounded bg-slate-100 animate-pulse" />
                                        ) : (
                                            <p className="text-2xl font-bold text-slate-900">
                                                {(s.value ?? '—').toLocaleString?.() ?? s.value ?? '—'}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Tabs defaultValue="rewards" className="w-full">
                        <TabsList className="bg-slate-100 p-1 gap-1">
                            <TabsTrigger value="rewards" className="gap-2">
                                <Trophy className="h-4 w-4" /> Active Rewards
                            </TabsTrigger>
                            <TabsTrigger value="rules" className="gap-2">
                                <Star className="h-4 w-4" /> Earn Rules
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="gap-2">
                                <Gift className="h-4 w-4" /> Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="rewards" className="mt-6">
                            <Card className="border-0 shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                    {statsLoading ? (
                                        <div className="p-6 space-y-3">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (stats?.offers.length ?? 0) === 0 ? (
                                        <p className="p-8 text-center text-sm text-slate-400">
                                            No active rewards for this business.
                                        </p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead>Reward</TableHead>
                                                    <TableHead>Points</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stats?.offers.map((o) => (
                                                    <TableRow key={o.id}>
                                                        <TableCell className="font-medium text-slate-900">{o.title}</TableCell>
                                                        <TableCell>
                                                            <span className="text-amber-600 font-bold">
                                                                {o.points.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    o.isActive
                                                                        ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                                                        : 'text-slate-500 border-slate-200',
                                                                )}
                                                            >
                                                                {o.isActive ? 'active' : 'inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rules" className="mt-6">
                            <Card className="border-0 shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                    {rulesLoading ? (
                                        <div className="p-6 space-y-3">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (rules?.length ?? 0) === 0 ? (
                                        <p className="p-8 text-center text-sm text-slate-400">
                                            No earn rules configured for this business.
                                        </p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead>Rule</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Value</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rules?.map((r) => (
                                                    <TableRow key={r.id}>
                                                        <TableCell>
                                                            <p className="font-medium text-slate-900">{r.name}</p>
                                                            {r.description && (
                                                                <p className="text-xs text-slate-400">{r.description}</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs capitalize">
                                                            {r.ruleType.replace(/_/g, ' ')}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-slate-600">
                                                            {r.pointsPerCurrency != null && `${r.pointsPerCurrency} pt/£`}
                                                            {r.fixedPoints != null && `${r.fixedPoints} pts`}
                                                            {r.multiplier != null && `×${r.multiplier}`}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled={updateRule.isPending}
                                                                    title={r.isActive ? 'Pause rule' : 'Activate rule'}
                                                                    onClick={() =>
                                                                        updateRule.mutate({
                                                                            id: r.id,
                                                                            dto: { isActive: !r.isActive },
                                                                        })
                                                                    }
                                                                >
                                                                    {r.isActive ? (
                                                                        <Pause className="h-4 w-4 text-amber-500" />
                                                                    ) : (
                                                                        <Play className="h-4 w-4 text-emerald-500" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled={deleteRule.isPending}
                                                                    onClick={() => {
                                                                        if (confirm(`Delete rule "${r.name}"?`)) {
                                                                            deleteRule.mutate(r.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-6">
                            {businessId && <LoyaltySettingsForm businessId={businessId} />}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}

function LoyaltySettingsForm({ businessId }: { businessId: string }) {
    const { data, isLoading, isError, error, refetch } = useGetLoyaltySettings(businessId);
    const save = useUpdateLoyaltySettings(businessId);
    const [form, setForm] = useState({ pointsPerCurrency: '', pointsMultiplier: '', signupBonusPoints: '', terms: '' });
    const [touched, setTouched] = useState(false);

    const current = {
        pointsPerCurrency: touched ? form.pointsPerCurrency : String(data?.pointsPerCurrency ?? ''),
        pointsMultiplier: touched ? form.pointsMultiplier : String(data?.pointsMultiplier ?? ''),
        signupBonusPoints: touched ? form.signupBonusPoints : String(data?.signupBonusPoints ?? ''),
        terms: touched ? form.terms : (data?.terms ?? ''),
    };

    if (isLoading) return <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />;
    if (isError || !data)
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load settings: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );

    return (
        <div className="max-w-2xl space-y-6">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Program Settings</CardTitle>
                    <CardDescription>
                        Live settings for this business · Status: {data.isEnabled ? 'enabled' : 'disabled'} · Approval:{' '}
                        {data.redemptionApproval}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points per £1</label>
                            <Input
                                type="number"
                                value={current.pointsPerCurrency}
                                onChange={(e) => {
                                    setTouched(true);
                                    setForm((f) => ({ ...f, pointsPerCurrency: e.target.value }));
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points multiplier</label>
                            <Input
                                type="number"
                                value={current.pointsMultiplier}
                                onChange={(e) => {
                                    setTouched(true);
                                    setForm((f) => ({ ...f, pointsMultiplier: e.target.value }));
                                }}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Signup bonus points</label>
                        <Input
                            type="number"
                            value={current.signupBonusPoints}
                            onChange={(e) => {
                                setTouched(true);
                                setForm((f) => ({ ...f, signupBonusPoints: e.target.value }));
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Terms</label>
                        <Input
                            value={current.terms}
                            onChange={(e) => {
                                setTouched(true);
                                setForm((f) => ({ ...f, terms: e.target.value }));
                            }}
                        />
                    </div>
                    <Button
                        className="bg-slate-900"
                        disabled={save.isPending}
                        onClick={() =>
                            save.mutate({
                                ...(current.pointsPerCurrency !== '' ? { pointsPerCurrency: Number(current.pointsPerCurrency) } : {}),
                                ...(current.pointsMultiplier !== '' ? { pointsMultiplier: Number(current.pointsMultiplier) } : {}),
                                ...(current.signupBonusPoints !== '' ? { signupBonusPoints: Number(current.signupBonusPoints) } : {}),
                                terms: current.terms || undefined,
                            })
                        }
                    >
                        {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Settings
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
