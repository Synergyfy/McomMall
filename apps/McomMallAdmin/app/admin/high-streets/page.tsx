'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Plus,
    Search,
    MoreVertical,
    MapPin,
    Building2,
    Globe,
    Trash2,
    AlertTriangle,
    Loader2,
    Map as MapIcon,
    Store,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HighStreetActivationWizard, HighStreetWizardData } from './components/HighStreetActivationWizard';
import { cn } from '@/lib/utils';
import { MapLayerData } from '@/components/MapComponent';
import {
    useGetHighStreets,
    useGetHighStreetStats,
    useCreateHighStreet,
    useUpdateHighStreet,
    useDeleteHighStreet,
} from '@/service/high-streets/hook';
import { useGetBoroughs } from '@/service/boroughs/hook';
import type { HighStreetStatus } from '@/service/high-streets/types';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-lg">
            <MapIcon className="h-8 w-8 text-slate-300" />
        </div>
    ),
});

function hubFlags(hubType: string): { hasPhysicalHub: boolean; hasVirtualHub: boolean } {
    const t = hubType.toLowerCase();
    if (t.includes('both') || t.includes('physical') && t.includes('virtual')) {
        return { hasPhysicalHub: true, hasVirtualHub: true };
    }
    if (t.includes('physical')) return { hasPhysicalHub: true, hasVirtualHub: false };
    if (t.includes('virtual')) return { hasPhysicalHub: false, hasVirtualHub: true };
    return { hasPhysicalHub: false, hasVirtualHub: false };
}

export default function HighStreetsPage() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'pending' | 'inactive'>('All');
    const [boroughFilter, setBoroughFilter] = useState<string>('all');
    const [districtLayer, setDistrictLayer] = useState<'physical' | 'virtual'>('physical');

    const { data, isLoading, isError, error, refetch } = useGetHighStreets();
    const { data: stats, isLoading: statsLoading } = useGetHighStreetStats();
    const { data: boroughs } = useGetBoroughs();
    const create = useCreateHighStreet();
    const update = useUpdateHighStreet();
    const remove = useDeleteHighStreet();

    const streets = useMemo(() => data ?? [], [data]);

    const filtered = useMemo(
        () =>
            streets.filter((hs) => {
                const q = searchQuery.trim().toLowerCase();
                const matchesSearch =
                    !q ||
                    hs.name.toLowerCase().includes(q) ||
                    (hs.borough?.name ?? '').toLowerCase().includes(q);
                const matchesStatus = statusFilter === 'All' || hs.status === statusFilter;
                const matchesBorough = boroughFilter === 'all' || hs.boroughId === boroughFilter;
                const matchesLayer = districtLayer === 'physical' ? hs.hasPhysicalHub : hs.hasVirtualHub;
                return matchesSearch && matchesStatus && matchesBorough && matchesLayer;
            }),
        [streets, searchQuery, statusFilter, boroughFilter, districtLayer],
    );

    const markers: MapLayerData[] = useMemo(
        () =>
            filtered
                .filter((hs) => hs.latitude != null && hs.longitude != null)
                .map((hs) => ({
                    id: `hs-${hs.id}`,
                    type: 'business',
                    name: hs.name,
                    coordinates: [hs.latitude as number, hs.longitude as number] as [number, number],
                    color: districtLayer === 'physical' ? '#f97316' : '#3b82f6',
                    details: `${hs.borough?.name ?? 'No borough'} • ${hs.status}`,
                })),
        [filtered, districtLayer],
    );

    const handleWizardComplete = (wizard: HighStreetWizardData) => {
        const matched = (boroughs ?? []).find(
            (b) => b.name.toLowerCase() === wizard.borough.trim().toLowerCase(),
        );
        create.mutate(
            {
                name: wizard.name.trim(),
                description: wizard.description || undefined,
                status: 'pending',
                boroughId: matched?.id,
                ...hubFlags(wizard.hubType),
            },
            { onSuccess: () => setIsWizardOpen(false) },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">High Street Management</h1>
                    <p className="text-slate-500">Live high street records from the API.</p>
                </div>
                <Button onClick={() => setIsWizardOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Activate High Street
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: 'Total High Streets', value: stats?.total, icon: Store },
                    { title: 'Active', value: stats?.active, icon: CheckCircle2 },
                    { title: 'Pending Activation', value: stats?.pending, icon: Clock },
                ].map((s) => (
                    <Card key={s.title} className="border-slate-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.title}</p>
                                <p className="text-2xl font-black text-slate-900">{statsLoading ? '…' : (s.value ?? '—')}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load high streets: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold">High Street Map</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 h-5 px-1.5 text-[10px]">
                                    {markers.length} plotted from live records
                                </Badge>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setDistrictLayer('physical')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                                    districtLayer === 'physical' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500',
                                )}
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                Physical
                            </button>
                            <button
                                onClick={() => setDistrictLayer('virtual')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                                    districtLayer === 'virtual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500',
                                )}
                            >
                                <Globe className="h-3.5 w-3.5" />
                                Virtual
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 z-0">
                            <MapComponent data={markers} center={[51.5074, -0.1278]} zoom={11} />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Only streets with saved coordinates appear. Traffic, zones and engagement overlays are not
                            provided by the API.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-800">Quick Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search high streets..."
                                className="pl-9 border-slate-200 h-9 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                            <div className="flex flex-wrap gap-2">
                                {(['All', 'active', 'pending', 'inactive'] as const).map((status) => (
                                    <Button
                                        key={status}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStatusFilter(status)}
                                        className={cn(
                                            'rounded-full h-7 px-3 text-[11px] font-semibold capitalize',
                                            statusFilter === status
                                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                : 'text-slate-600 border-slate-200',
                                        )}
                                    >
                                        {status === 'All' ? 'All' : status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borough</label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBoroughFilter('all')}
                                    className={cn(
                                        'rounded-full h-7 px-3 text-[11px] font-semibold',
                                        boroughFilter === 'all'
                                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                                            : 'text-slate-600 border-slate-200',
                                    )}
                                >
                                    All Boroughs
                                </Button>
                                {(boroughs ?? []).map((b) => (
                                    <Button
                                        key={b.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setBoroughFilter(b.id)}
                                        className={cn(
                                            'rounded-full h-7 px-3 text-[11px] font-semibold',
                                            boroughFilter === b.id
                                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                : 'text-slate-600 border-slate-200',
                                        )}
                                    >
                                        {b.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">High Street Inventory</CardTitle>
                    <CardDescription>{isLoading ? 'Loading…' : `${filtered.length} streets shown`}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No high streets found</p>
                            <p className="text-sm text-slate-400">Activate your first high street to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="pl-6">High Street Name</TableHead>
                                    <TableHead>Borough</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Physical Hub</TableHead>
                                    <TableHead className="text-center">Virtual Hub</TableHead>
                                    <TableHead className="text-right pr-6" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((hs) => (
                                    <TableRow key={hs.id}>
                                        <TableCell className="pl-6 py-4">
                                            <p className="font-bold text-slate-900">{hs.name}</p>
                                            {hs.description && (
                                                <p className="text-xs text-slate-400 truncate max-w-64">{hs.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">{hs.borough?.name ?? '—'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={cn(
                                                    'border-none text-[10px] font-black uppercase',
                                                    hs.status === 'active'
                                                        ? 'bg-emerald-500 text-white'
                                                        : hs.status === 'pending'
                                                          ? 'bg-amber-500 text-white'
                                                          : 'bg-slate-200 text-slate-500',
                                                )}
                                            >
                                                {hs.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm">{hs.hasPhysicalHub ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="text-center text-sm">{hs.hasVirtualHub ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase px-2 py-1.5">
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    {(Object.keys({ active: 1, pending: 1, inactive: 1 }) as HighStreetStatus[])
                                                        .filter((s) => s !== hs.status)
                                                        .map((s) => (
                                                            <DropdownMenuItem
                                                                key={s}
                                                                className="capitalize cursor-pointer"
                                                                disabled={update.isPending}
                                                                onClick={() => update.mutate({ id: hs.id, dto: { status: s } })}
                                                            >
                                                                Mark {s}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    <DropdownMenuItem
                                                        className="text-red-600 cursor-pointer"
                                                        disabled={remove.isPending}
                                                        onClick={() => {
                                                            if (confirm(`Remove "${hs.name}"?`)) remove.mutate(hs.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <HighStreetActivationWizard
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onComplete={handleWizardComplete}
                isSaving={create.isPending}
            />
        </div>
    );
}
