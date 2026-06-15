'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    MapPin, 
    Users, 
    Building2, 
    Activity,
    Globe,
    QrCode,
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    Rocket,
    Store,
    Map as MapIcon,
    Rss,
    ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { HighStreetActivationWizard } from './components/HighStreetActivationWizard';
import { cn } from '@/lib/utils';
import { MapLayerData } from '@/components/MapComponent';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-lg">
            <MapIcon className="h-8 w-8 text-slate-300" />
        </div>
    )
});

// Advanced Simulated Map Data
const mapData: MapLayerData[] = [
    // High Street Zones (Polygons)
    {
        id: 'z1',
        type: 'zone',
        name: 'Oxford Street Core',
        bounds: [
            [51.5160, -0.1500],
            [51.5165, -0.1400],
            [51.5135, -0.1400],
            [51.5130, -0.1500]
        ],
        color: '#f97316',
        details: 'Primary commercial zone with 145 active businesses.'
    },
    {
        id: 'z2',
        type: 'zone',
        name: 'Kings Road District',
        bounds: [
            [51.4890, -0.1750],
            [51.4895, -0.1600],
            [51.4865, -0.1600],
            [51.4860, -0.1750]
        ],
        color: '#3b82f6',
        details: 'Upscale retail and dining district.'
    },

    // Activation Zones (Circles)
    {
        id: 'a1',
        type: 'activation',
        name: 'West End Tech Hub',
        coordinates: [51.5145, -0.1448],
        radius: 300,
        intensity: 0.5,
        color: '#f59e0b'
    },
    {
        id: 'a2',
        type: 'activation',
        name: 'Chelsea Virtual Zone',
        coordinates: [51.4875, -0.1685],
        radius: 400,
        intensity: 0.3,
        color: '#6366f1'
    },

    // Traffic Density (Circles/Heat)
    {
        id: 't1',
        type: 'traffic',
        name: 'Oxford Circus Peak',
        coordinates: [51.5152, -0.1418],
        radius: 150,
        intensity: 0.9,
        color: '#ef4444'
    },
    {
        id: 't2',
        type: 'traffic',
        name: 'Tottenham Court Rd Flow',
        coordinates: [51.5165, -0.1300],
        radius: 200,
        intensity: 0.6,
        color: '#f97316'
    },

    // Participating Businesses (Markers)
    {
        id: 'b1',
        type: 'business',
        name: 'Selfridges & Co',
        coordinates: [51.5144, -0.1519],
        details: 'Flagship store, premium partner.',
        color: '#10b981'
    },
    {
        id: 'b2',
        type: 'business',
        name: 'Liberty London',
        coordinates: [51.5137, -0.1396],
        details: 'Heritage retail, active community member.',
        color: '#10b981'
    },

    // Engagement Clusters (Circles)
    {
        id: 'c1',
        type: 'cluster',
        name: 'Soho Social Cluster',
        coordinates: [51.5130, -0.1330],
        radius: 250,
        intensity: 0.7,
        color: '#ec4899'
    }
];

// Mock data for High Streets (Inventory Table)
const highStreets = [
    {
        id: '1',
        name: 'Oxford Street',
        borough: 'Westminster',
        status: 'Active',
        physicalHub: 'Yes',
        virtualHub: 'Yes',
        communityGroup: 'Active',
        totalBusinesses: 145,
        engagementScore: 92,
        location: { lat: 51.5145, lng: -0.1448 },
        hasPhysical: true,
        hasVirtual: true
    },
    {
        id: '2',
        name: 'Kings Road',
        borough: 'Kensington & Chelsea',
        status: 'Active',
        physicalHub: 'No',
        virtualHub: 'Yes',
        communityGroup: 'Active',
        totalBusinesses: 88,
        engagementScore: 78,
        location: { lat: 51.4875, lng: -0.1685 },
        hasPhysical: false,
        hasVirtual: true
    },
    {
        id: '3',
        name: 'Brick Lane',
        borough: 'Tower Hamlets',
        status: 'Pending',
        physicalHub: 'No',
        virtualHub: 'No',
        communityGroup: 'Inactive',
        totalBusinesses: 122,
        engagementScore: 45,
        location: { lat: 51.5218, lng: -0.0718 },
        hasPhysical: false,
        hasVirtual: false
    },
];

export default function HighStreetsPage() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');
    const [boroughFilter, setBoroughFilter] = useState('All Boroughs');
    const [districtLayer, setDistrictLayer] = useState<'physical' | 'virtual'>('physical');

    // Filter high street data based on ALL active filters
    const filteredHighStreets = highStreets.filter(hs => {
        const matchesSearch = hs.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             hs.borough.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || hs.status === statusFilter;
        const matchesBorough = boroughFilter === 'All Boroughs' || hs.borough === boroughFilter;
        return matchesSearch && matchesStatus && matchesBorough;
    });

    // 1. Transform inventory high streets into map layer data
    const highStreetMarkers: MapLayerData[] = filteredHighStreets
        .filter(hs => districtLayer === 'physical' ? hs.hasPhysical : hs.hasVirtual)
        .map(hs => ({
            id: `hs-${hs.id}`,
            type: 'business', // Using business type for markers
            name: hs.name,
            coordinates: [hs.location.lat, hs.location.lng] as [number, number],
            color: districtLayer === 'physical' ? '#f97316' : '#3b82f6',
            details: `${hs.borough} • ${hs.totalBusinesses} Businesses`
        }));

    // 2. Combine with the advanced simulation data
    const finalMapData = [...highStreetMarkers, ...mapData];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">High Street Management</h1>
                    <p className="text-slate-500">Manage physical and virtual high street ecosystems across boroughs.</p>
                </div>
                <Button 
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Activate High Street
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Active High Streets" value="24" trend="+2" icon={MapIcon} />
                <StatCard title="Pending Activations" value="7" trend="-1" icon={Clock} />
                <StatCard title="Community Part." value="85%" trend="+5%" icon={Users} />
                <StatCard title="Borough Coverage" value="12" trend="0" icon={MapPin} />
                <StatCard title="Traffic Activity" value="1.2k" trend="+12%" icon={Activity} />
                <StatCard title="QR Engagement" value="4.8k" trend="+18%" icon={QrCode} />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <Card className="lg:col-span-2 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold">High Street Activity Map</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 h-5 px-1.5 text-[10px]">Live View</Badge>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic">District Overlay Active</span>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setDistrictLayer('physical')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    districtLayer === 'physical' 
                                        ? "bg-white text-orange-600 shadow-sm" 
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                Physical
                            </button>
                            <button
                                onClick={() => setDistrictLayer('virtual')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    districtLayer === 'virtual' 
                                        ? "bg-white text-blue-600 shadow-sm" 
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Globe className="h-3.5 w-3.5" />
                                Virtual
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 z-0">
                            <MapComponent 
                                data={finalMapData} 
                                center={[51.5145, -0.1448]} // Centered on Oxford St
                                zoom={14}
                            />

                            {/* Map Legend (Kept as overlay) */}
                            <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[400]">
                                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
                                        <span className="text-[10px] font-bold text-slate-700">High Traffic Hub</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                                        <span className="text-[10px] font-bold text-slate-700">Activation Zone</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                        <span className="text-[10px] font-bold text-slate-700">Participating Biz</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters & Operational Feed Sidebar */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Filters */}
                    <Card className="border-slate-200 shadow-sm flex-1">
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
                                    {['All', 'Active', 'Pending', 'Inactive'].map((status) => (
                                        <Button 
                                            key={status}
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setStatusFilter(status as any)}
                                            className={cn(
                                                "rounded-full h-7 px-3 text-[11px] font-semibold transition-all",
                                                statusFilter === status 
                                                    ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm ring-1 ring-orange-100" 
                                                    : "hover:bg-slate-50 text-slate-600 border-slate-200"
                                            )}
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borough</label>
                                <div className="flex flex-wrap gap-2">
                                    {['All Boroughs', 'Westminster', 'Camden', 'Tower Hamlets'].map((borough) => (
                                        <Button 
                                            key={borough}
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setBoroughFilter(borough)}
                                            className={cn(
                                                "rounded-full h-7 px-3 text-[11px] font-semibold transition-all",
                                                boroughFilter === borough 
                                                    ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm ring-1 ring-orange-100" 
                                                    : "hover:bg-slate-50 text-slate-600 border-slate-200"
                                            )}
                                        >
                                            {borough}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Feed */}
                    <Card className="border-slate-200 shadow-sm flex-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-100">
                                    <Rss className="h-3.5 w-3.5 text-orange-600" />
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">Operational Feed</CardTitle>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Live</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-1">
                            <FeedItem 
                                icon={ShoppingCart} 
                                iconColor="text-blue-600" 
                                bgColor="bg-blue-50"
                                title="Marylebone Zone spike detected"
                                details="(+22% foot traffic)."
                                time="2 minutes ago"
                                location="Borough: Westminster"
                                indicatorColor="bg-blue-600"
                            />
                            <FeedItem 
                                icon={Rocket} 
                                iconColor="text-orange-600" 
                                bgColor="bg-orange-50"
                                title="Hackney Virtual Hub successfully deployed."
                                time="14 minutes ago"
                                location="District: East"
                                indicatorColor="bg-orange-700"
                            />
                            <FeedItem 
                                icon={QrCode} 
                                iconColor="text-emerald-600" 
                                bgColor="bg-emerald-50"
                                title="QR Engagement Milestone reached in Islington."
                                time="32 minutes ago"
                                location="Users: 5,000+"
                                indicatorColor="bg-emerald-600"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* High Street List */}
            <Card className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">High Street Inventory</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Advanced Filters
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-700">High Street Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Borough</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700">Physical Hub</TableHead>
                                <TableHead className="font-semibold text-slate-700">Virtual Hub</TableHead>
                                <TableHead className="font-semibold text-slate-700">Community Group</TableHead>
                                <TableHead className="font-semibold text-slate-700">Businesses</TableHead>
                                <TableHead className="font-semibold text-slate-700">Eng. Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHighStreets.length > 0 ? (
                                filteredHighStreets.map((hs) => (
                                    <TableRow key={hs.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">{hs.name}</TableCell>
                                        <TableCell className="text-slate-600">{hs.borough}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                className={cn(
                                                    "rounded-full px-2.5 py-0.5 font-medium",
                                                    hs.status === 'Active' 
                                                        ? "bg-emerald-100 text-emerald-700" 
                                                        : "bg-amber-100 text-amber-700"
                                                )}
                                            >
                                                {hs.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {hs.physicalHub === 'Yes' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-slate-300" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {hs.virtualHub === 'Yes' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-slate-300" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "gap-1",
                                                hs.communityGroup === 'Active' ? "text-emerald-600" : "text-slate-400"
                                            )}>
                                                <Users className="h-3 w-3" />
                                                {hs.communityGroup}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-medium">{hs.totalBusinesses}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            hs.engagementScore > 80 ? "bg-emerald-500" : "bg-amber-500"
                                                        )}
                                                        style={{ width: `${hs.engagementScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-700">{hs.engagementScore}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem className="gap-2">
                                                        <Activity className="h-4 w-4" /> Manage Ecosystem
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2">
                                                        <Users className="h-4 w-4" /> Assign Manager
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2">
                                                        <BarChart3 className="h-4 w-4" /> View Analytics
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="gap-2 text-orange-600">
                                                        <Rocket className="h-4 w-4" /> Launch Campaign
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                                        No high streets match your current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Activation Wizard Modal */}
            <HighStreetActivationWizard 
                open={isWizardOpen} 
                onOpenChange={setIsWizardOpen} 
            />
        </div>
    );
}

function FeedItem({ icon: Icon, iconColor, bgColor, title, details, time, location, indicatorColor }: any) {
    return (
        <div className="flex gap-4 relative group">
            <div className={cn("p-2 rounded-full h-fit shadow-sm relative z-10", bgColor)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
                <div className={cn("absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white", indicatorColor)} />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-xs text-slate-800 leading-snug">
                    <span className="font-bold">{title.split(' ')[0]} {title.split(' ')[1]}</span> {title.split(' ').slice(2).join(' ')}
                    {details && <span className="text-slate-500 ml-1 font-medium">{details}</span>}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>{time}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-slate-500">{location}</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon }: { title: string, value: string, trend: string, icon: any }) {
    const isPositive = trend.startsWith('+');
    return (
        <Card className="border-slate-200">
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        isPositive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                        {trend}
                    </span>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
