'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Zap,
    Play,
    Pause,
    Trash2,
    Activity,
    Gift,
    Bell,
    MapPin,
    Store,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetAutomationsByBusiness,
    useGetAutomationSummary,
    useUpdateAutomation,
    useDeleteAutomation,
} from '@/service/automations/hook';
import type { Automation } from '@/service/automations/types';

function StatusDot({ isActive }: { isActive: boolean }) {
    return (
        <div className={cn('h-2 w-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-amber-400')} />
    );
}

export default function AutomationsPage() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const businesses = useMemo(() => businessesData?.data ?? [], [businessesData]);

    const {
        data: automations,
        isLoading: automationsLoading,
        isError: automationsError,
        error: automationsErr,
        refetch: refetchAutomations,
    } = useGetAutomationsByBusiness(businessId);
    const { data: summary, isLoading: summaryLoading } = useGetAutomationSummary(businessId);

    const updateMutation = useUpdateAutomation(businessId);
    const deleteMutation = useDeleteAutomation(businessId);

    const selected: Automation | undefined = useMemo(
        () => (automations ?? []).find((a) => a.id === (selectedId ?? (automations?.[0]?.id ?? ''))),
        [automations, selectedId],
    );

    const flowSteps: { kind: string; text: string }[] = useMemo(() => {
        if (!selected) return [];
        const raw = selected.flowConfig as { steps?: { kind?: string; text?: string }[] } | undefined;
        if (raw?.steps && Array.isArray(raw.steps)) {
            return raw.steps.map((s) => ({ kind: s.kind ?? 'step', text: s.text ?? '' }));
        }
        return [
            { kind: 'trigger', text: `Trigger: ${selected.triggerType} · ${selected.targetRadius} mi radius` },
            { kind: 'audience', text: `Audience: ${(selected.customerTiers ?? []).join(', ') || 'All tiers'}` },
            { kind: 'status', text: selected.isActive ? 'Status: active' : 'Status: paused' },
        ];
    }, [selected]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Automation Systems</h1>
                    <p className="text-slate-500">Live automation flows per business from the API</p>
                </div>
                <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    <Select
                        value={businessId ?? ''}
                        onValueChange={(v) => {
                            setBusinessId(v || undefined);
                            setSelectedId(undefined);
                        }}
                    >
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
                        Select a business above to load its live automation flows and summary.
                    </CardContent>
                </Card>
            )}

            {businessId && (
                <>
                    {/* Live summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total flows', value: summary?.totalCampaigns },
                            { label: 'Active flows', value: summary?.activeCampaigns },
                            { label: 'Hours saved', value: summary?.efficiencyHoursSaved },
                            { label: 'Attributed revenue £', value: summary?.autoGeneratedRevenue },
                        ].map((s) => (
                            <Card key={s.label} className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-xs text-slate-500">{s.label}</p>
                                    {summaryLoading ? (
                                        <div className="h-7 mt-1 rounded bg-slate-100 animate-pulse" />
                                    ) : (
                                        <p className="text-xl font-bold text-slate-900 mt-1">
                                            {s.value ?? '—'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {automationsError && (
                        <Card className="border-rose-200 bg-rose-50">
                            <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                                <AlertTriangle className="h-4 w-4" />
                                Failed to load automations: {(automationsErr as Error)?.message ?? 'Unknown error'}
                                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchAutomations()}>
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Live flows sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" /> Active Flows
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {automationsLoading ? (
                                        <div className="p-4 space-y-3">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (automations ?? []).length === 0 ? (
                                        <p className="p-6 text-sm text-slate-400 text-center">
                                            No automation flows for this business yet.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {(automations ?? []).map((a) => (
                                                <button
                                                    key={a.id}
                                                    onClick={() => setSelectedId(a.id)}
                                                    className={cn(
                                                        'w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left',
                                                        selected?.id === a.id && 'bg-indigo-50/60',
                                                    )}
                                                >
                                                    <span>
                                                        <span className="block font-medium text-slate-700 text-sm">
                                                            {a.name}
                                                        </span>
                                                        <span className="block text-xs text-slate-400 capitalize">
                                                            {a.triggerType} · {a.targetRadius} mi
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {a.triggerType}
                                                        </Badge>
                                                        <StatusDot isActive={a.isActive} />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Selected flow detail — live */}
                        <div className="lg:col-span-3 space-y-4">
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div>
                                            <CardTitle>{selected?.name ?? 'No flow selected'}</CardTitle>
                                            <CardDescription>
                                                {selected
                                                    ? `Trigger ${selected.triggerType} · radius ${selected.targetRadius} mi · tiers ${(selected.customerTiers ?? []).join(', ') || 'all'}`
                                                    : 'Select a flow on the left to inspect it'}
                                            </CardDescription>
                                        </div>
                                        {selected && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updateMutation.isPending}
                                                    onClick={() =>
                                                        updateMutation.mutate({
                                                            id: selected.id,
                                                            dto: { isActive: !selected.isActive },
                                                        })
                                                    }
                                                >
                                                    {updateMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : selected.isActive ? (
                                                        <Pause className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <Play className="h-4 w-4 mr-2" />
                                                    )}
                                                    {selected.isActive ? 'Pause' : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-rose-600"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Delete automation "${selected.name}"?`)) {
                                                            deleteMutation.mutate(selected.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {!selected ? (
                                        <p className="text-sm text-slate-400 text-center py-10">
                                            {(automations ?? []).length === 0
                                                ? 'Create automations via the API to see them here.'
                                                : 'Choose a flow to view its live configuration.'}
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {flowSteps.map((step, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                                >
                                                    {step.kind === 'trigger' ? (
                                                        <Activity className="h-4 w-4 mt-0.5 text-indigo-600" />
                                                    ) : step.kind === 'audience' ? (
                                                        <MapPin className="h-4 w-4 mt-0.5 text-purple-600" />
                                                    ) : step.kind === 'reward' ? (
                                                        <Gift className="h-4 w-4 mt-0.5 text-emerald-600" />
                                                    ) : step.kind === 'notification' ? (
                                                        <Bell className="h-4 w-4 mt-0.5 text-rose-600" />
                                                    ) : (
                                                        <Zap className="h-4 w-4 mt-0.5 text-amber-500" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            {step.kind}
                                                        </p>
                                                        <p className="text-sm text-slate-700">{step.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-xs text-slate-400 pt-2">
                                                Updated {new Date(selected.updatedAt).toLocaleString()} · Created{' '}
                                                {new Date(selected.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
