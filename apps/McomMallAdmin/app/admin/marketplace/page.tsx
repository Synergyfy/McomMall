'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
    Store,
    LayoutList,
    Star,
    MapPin,
    Activity,
    MousePointerClick,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Eye,
    Edit3,
    Ban,
    ShieldAlert,
    Plus,
    GripVertical,
    Smartphone,
    ShoppingBag,
    Utensils,
    Coffee,
    Dumbbell,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    LayoutGrid,
    ChevronDown,
    X,
    ArrowUp,
    ArrowDown,
    Check,
    Trash2,
    Heart,
    Gem,
    Briefcase,
    Car,
    Music,
    Home,
    Book,
    Camera,
    Plane,
    type LucideIcon
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const kpis = [
    { title: 'Total Storefronts', value: '4,892', trend: '+12%', icon: Store, trendType: 'up' },
    { title: 'Active Listings', value: '142.5k', trend: '+8.4%', icon: LayoutList, trendType: 'up' },
    { title: 'Featured Biz', value: '156', trend: '+2', icon: Star, trendType: 'up' },
    { title: 'Borough Coverage', value: '32/32', trend: '100%', icon: MapPin, trendType: 'up' },
    { title: 'Weekly Traffic', value: '2.4M', trend: '+15%', icon: Activity, trendType: 'up' },
    { title: 'Avg Conversion', value: '4.8%', trend: '-0.2%', icon: MousePointerClick, trendType: 'down' },
];

const mockStores = [
    { id: 'S1', name: 'Artisan Coffee Roasters', borough: 'Camden', category: 'Food & Bev', tier: 'Gold', score: 94, visibility: 'High', status: 'Active', engagement: '98%', activityLevel: 'Very High', verified: 'Verified' },
    { id: 'S2', name: 'Urban Sneakers', borough: 'Hackney', category: 'Retail', tier: 'Platinum', score: 98, visibility: 'Very High', status: 'Active', engagement: '99%', activityLevel: 'Very High', verified: 'Verified' },
    { id: 'S3', name: 'Local Fit Gym', borough: 'Islington', category: 'Health', tier: 'Silver', score: 72, visibility: 'Medium', status: 'Warning', engagement: '65%', activityLevel: 'Medium', verified: 'Pending' },
    { id: 'S4', name: 'Borough Bookshop', borough: 'Westminster', category: 'Retail', tier: 'Bronze', score: 45, visibility: 'Low', status: 'Pending', engagement: '20%', activityLevel: 'Low', verified: 'Unverified' },
    { id: 'S5', name: 'Tech Haven', borough: 'Tower Hamlets', category: 'Electronics', tier: 'Gold', score: 88, visibility: 'High', status: 'Active', engagement: '85%', activityLevel: 'High', verified: 'Verified' },
    { id: 'S6', name: 'Green Grocers', borough: 'Camden', category: 'Food & Bev', tier: 'Silver', score: 81, visibility: 'Medium', status: 'Active', engagement: '78%', activityLevel: 'Medium', verified: 'Pending' },
];

const iconMap: Record<string, LucideIcon> = {
    Utensils, ShoppingBag, Dumbbell, Smartphone, Coffee,
    Store, Heart, Gem, Briefcase, Car, Music, Home, Book, Camera, Plane, Star,
};

type CategoryItem = {
    id: string;
    name: string;
    iconKey: string;
    count: number;
    featured: boolean;
};

const initialCategories: CategoryItem[] = [
    { id: 'c1', name: 'Food & Beverage', iconKey: 'Utensils', count: 1240, featured: true },
    { id: 'c2', name: 'Retail / Fashion', iconKey: 'ShoppingBag', count: 980, featured: true },
    { id: 'c3', name: 'Health & Fitness', iconKey: 'Dumbbell', count: 450, featured: false },
    { id: 'c4', name: 'Tech / Electronics', iconKey: 'Smartphone', count: 320, featured: false },
    { id: 'c5', name: 'Cafes & Bakeries', iconKey: 'Coffee', count: 890, featured: true },
];

type Filters = {
    borough: string;
    category: string;
    tier: string;
    visibility: string;
    activityLevel: string;
    verified: string;
};

const defaultFilters: Filters = { borough: '', category: '', tier: '', visibility: '', activityLevel: '', verified: '' };

const filterOptions = {
    borough: ['Camden', 'Hackney', 'Islington', 'Westminster', 'Tower Hamlets'],
    category: ['Food & Bev', 'Retail', 'Health', 'Electronics'],
    tier: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    visibility: ['Very High', 'High', 'Medium', 'Low'],
    activityLevel: ['Very High', 'High', 'Medium', 'Low'],
    verified: ['Verified', 'Pending', 'Unverified'],
};

const filterLabels: Record<keyof Filters, string> = {
    borough: 'Borough',
    category: 'Category',
    tier: 'Membership Tier',
    visibility: 'Visibility Score',
    activityLevel: 'Activity Level',
    verified: 'Verification Status',
};

import { StorefrontEditManagement } from './components/StorefrontEditManagement';
import { MerchantOnboardingModal } from './components/MerchantOnboardingModal';

export default function MarketplaceAdmin() {
    const [view, setView] = useState<'list' | 'store-console' | 'edit-store'>('list');
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [stores, setStores] = useState(mockStores);
    const [selectedStore, setSelectedStore] = useState<typeof mockStores[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>(defaultFilters);

    // Category management state
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
    const [createMode, setCreateMode] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('Store');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);

    const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>(
        Object.fromEntries(Object.keys(filterLabels).map(k => [k, true]))
    );

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const toggleFilterSection = (key: string) => {
        setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const filteredStores = useMemo(() => {
        return stores.filter((store) => {
            if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase()) && !store.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filters.borough && store.borough !== filters.borough) return false;
            if (filters.category && store.category !== filters.category) return false;
            if (filters.tier && store.tier !== filters.tier) return false;
            if (filters.visibility && store.visibility !== filters.visibility) return false;
            if (filters.activityLevel && store.activityLevel !== filters.activityLevel) return false;
            if (filters.verified && store.verified !== filters.verified) return false;
            return true;
        });
    }, [stores, searchQuery, filters]);

    const setFilter = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    };

    const clearAllFilters = () => {
        setFilters(defaultFilters);
        setSearchQuery('');
    };

    // --- Store Actions ---
    const handleSuspend = (id: string) => {
        setStores(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Suspended' ? 'Active' : 'Suspended' } : s));
        if (selectedStore?.id === id) {
            setSelectedStore(prev => prev ? { ...prev, status: prev.status === 'Suspended' ? 'Active' : 'Suspended' } : null);
        }
    };

    const handleFeature = (id: string) => {
        setStores(prev => prev.map(s => s.id === id ? { ...s, visibility: s.visibility === 'Featured' ? 'High' : 'Featured' } : s));
        if (selectedStore?.id === id) {
            setSelectedStore(prev => prev ? { ...prev, visibility: prev.visibility === 'Featured' ? 'High' : 'Featured' } : null);
        }
    };

    const handleAudit = (id: string) => {
        setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'Warning', verified: 'Pending' } : s));
        if (selectedStore?.id === id) {
            setSelectedStore(prev => prev ? { ...prev, status: 'Warning', verified: 'Pending' } : null);
        }
    };

    const handleDeleteStore = (id: string) => {
        setStores(prev => prev.filter(s => s.id !== id));
        if (selectedStore?.id === id) {
            setSelectedStore(null);
            setView('list');
        }
    };

    const handleOnboardingComplete = (data: any) => {
        const newStore = {
            id: `S${stores.length + 100}`, // Production-like ID
            name: data.businessName,
            borough: data.borough,
            category: data.category,
            tier: data.tier,
            score: 0,
            visibility: 'Low',
            status: 'Pending',
            engagement: '0%',
            activityLevel: 'Low',
            verified: 'Unverified',
            merchantName: data.merchantName,
            email: data.email,
            phone: data.phone
        };
        setStores(prev => [newStore, ...prev]);
        setIsOnboardingOpen(false);
    };

    const createCategory = () => {
        if (!newCatName.trim()) return;
        const newCat: CategoryItem = {
            id: `c${Date.now()}`,
            name: newCatName.trim(),
            iconKey: newCatIcon,
            count: 0,
            featured: false,
        };
        setCategories(prev => [...prev, newCat]);
        setNewCatName('');
        setNewCatIcon('Store');
        setCreateMode(false);
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const saveEditName = (id: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName } : c));
        setEditingId(null);
    };

    const moveCategory = (id: string, direction: 'up' | 'down') => {
        setCategories(prev => {
            const idx = prev.findIndex(c => c.id === id);
            if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === prev.length - 1)) return prev;
            const next = [...prev];
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
            return next;
        });
    };

    const assignIcon = (catId: string, iconKey: string) => {
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, iconKey } : c));
        setIconPickerFor(null);
    };

    const toggleFeatured = (id: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, featured: !c.featured } : c));
    };

    if (view === 'edit-store' && selectedStore) {
        return (
            <StorefrontEditManagement 
                store={selectedStore} 
                onBack={() => setView('list')}
                onSave={(updatedStore) => {
                    setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
                    setView('list');
                    setSelectedStore(null);
                }}
            />
        );
    }

    if (view === 'store-console' && selectedStore) {
        return (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Immersive Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-6">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setView('list')}
                            className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </Button>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-slate-200">
                                {selectedStore.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> {selectedStore.verified}
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                        {selectedStore.tier} Member
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    {selectedStore.name}
                                    <span className="text-sm font-bold text-slate-400">ID: {selectedStore.id}</span>
                                </h1>
                                <div className="flex items-center gap-4 mt-1 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {selectedStore.borough}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="flex items-center gap-1.5"><LayoutList className="w-4 h-4 text-slate-400" /> {selectedStore.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => handleAudit(selectedStore.id)}
                            variant="outline" 
                            className="font-bold border-slate-200 text-blue-600 bg-white hover:bg-blue-50 gap-2 h-11 px-6 rounded-xl"
                        >
                            <ShieldAlert className="w-4 h-4" /> Run Content Audit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-slate-200 gap-2">
                                    Manage Entity <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-100">
                                <DropdownMenuItem onClick={() => handleFeature(selectedStore.id)} className="gap-2.5 rounded-lg py-2.5 font-bold text-sm">
                                    <Star className={cn("w-4 h-4", selectedStore.visibility === 'Featured' ? "fill-orange-400 text-orange-400" : "text-slate-500")} /> 
                                    {selectedStore.visibility === 'Featured' ? 'Remove Featured' : 'Feature on Homepage'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSuspend(selectedStore.id)} className={cn("gap-2.5 rounded-lg py-2.5 font-bold text-sm", selectedStore.status === 'Suspended' ? "text-emerald-600" : "text-red-600")}>
                                    <Ban className="w-4 h-4" /> {selectedStore.status === 'Suspended' ? 'Unsuspend Entity' : 'Suspend Operations'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1.5" />
                                <DropdownMenuItem onClick={() => handleDeleteStore(selectedStore.id)} className="gap-2.5 rounded-lg py-2.5 font-bold text-sm text-red-700 bg-red-50 hover:bg-red-100">
                                    <Trash2 className="w-4 h-4" /> Permanently Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Analytics & Moderation */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Top Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storefront Score</p>
                                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-3xl font-black text-slate-900">{selectedStore.score}.4</h2>
                                        <span className="text-xs font-black text-emerald-500">+1.2%</span>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${selectedStore.score}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Ranking</p>
                                        <Activity className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-3xl font-black text-slate-900">#12</h2>
                                        <span className="text-xs font-black text-emerald-500">TOP 1%</span>
                                    </div>
                                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Among 1,350 {selectedStore.category} entities</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-3xl font-black text-slate-900">£42.8k</h2>
                                        <span className="text-xs font-black text-slate-400">MTD</span>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Traffic Trends Chart Mock */}
                        <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-6">
                                <div>
                                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Traffic Trends (Last 30 Days)</CardTitle>
                                </div>
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                    <Button size="sm" className="h-7 text-[10px] font-black bg-white text-slate-900 shadow-sm border-none">Views</Button>
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-slate-500 hover:text-slate-900">Clicks</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex items-end justify-between h-48 gap-3">
                                    {[35, 45, 30, 55, 65, 95, 40, 50, 75, 45, 30, 55].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div 
                                                className={cn(
                                                    "w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80",
                                                    i === 5 ? "bg-orange-600" : "bg-blue-100"
                                                )} 
                                                style={{ height: `${h}%` }}
                                            />
                                            {i % 4 === 0 && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aug {1 + i*2}</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Day</p>
                                            <p className="text-sm font-black text-slate-900">Aug 15 (14.2k)</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Engagement</p>
                                            <p className="text-sm font-black text-slate-900">{selectedStore.engagement}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50">FULL ANALYTICS EXPORT <ArrowUpRight className="ml-1 w-3 h-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Moderation & Violations */}
                        <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-6">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Moderation & Violations</CardTitle>
                                <Button variant="ghost" size="sm" className="text-[10px] font-black text-orange-600 hover:text-orange-700">VIEW FULL HISTORY</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 border-none">
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest h-10 pl-6">Event Date</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest h-10">Type</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest h-10">Details</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest h-10 text-right pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="border-slate-50 hover:bg-slate-50 transition-colors">
                                            <TableCell className="text-[11px] font-bold text-slate-500 pl-6">2023-08-28 14:22</TableCell>
                                            <TableCell className="text-[11px] font-black text-slate-900">Review Flag</TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-600">Potential fake review detected on ID #921.</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge className="bg-orange-100 text-orange-700 text-[9px] font-black uppercase px-2 py-0.5 border-none">RESOLVED - DISMISSED</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-50 hover:bg-slate-50 transition-colors">
                                            <TableCell className="text-[11px] font-bold text-slate-500 pl-6">2023-08-15 09:05</TableCell>
                                            <TableCell className="text-[11px] font-black text-slate-900">Content Audit</TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-600">Updated storefront imagery meets compliance.</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 border-none">PASSED</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Operational Profile & AI Insights */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Operational Profile */}
                        <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-50">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant</span>
                                    <span className="text-sm font-black text-slate-900">Julian Marone</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</span>
                                    <span className="text-sm font-black text-slate-900">Oct 2021 (22 Mos)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
                                    <span className="text-sm font-black text-orange-600">Artisanal Bakery</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff Access</span>
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
                                                JM
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mt-4 italic text-[11px] font-bold text-slate-600 leading-relaxed">
                                    "Specializing in sourdough and heritage grains. Rated top 10 for customer experience in London Bridge area."
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Operational Insights */}
                        <Card className="border-none bg-slate-900 text-white shadow-2xl shadow-slate-400 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                            <CardHeader className="p-6">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-orange-400">
                                    <Star className="w-3.5 h-3.5 fill-orange-400" /> AI Operational Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-white">Promotion Opportunity</h4>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                                        High weekend traffic predicted. Suggest activating "Saturday Morning Special" promotion to maximize conversion.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-white">Competitive Edge</h4>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                                        Ranking higher than 92% of local peers in repeat customer loyalty. Visibility boost recommended.
                                    </p>
                                </div>
                                <Button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black h-11 rounded-xl shadow-xl mt-4">
                                    Deploy Smart Promotion
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Controls Card */}
                        <Card className="border-none bg-white shadow-xl shadow-slate-100 overflow-hidden">
                            <CardContent className="p-6 space-y-3">
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl gap-2 shadow-lg shadow-orange-200">
                                    <Settings className="w-4 h-4" /> Advanced Configuration
                                </Button>
                                <Button variant="outline" className="w-full border-slate-200 text-slate-700 font-bold h-12 rounded-xl hover:bg-slate-50">
                                    View Live Storefront
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Global oversight of storefronts, categories, and marketplace health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 gap-2">
                                <LayoutGrid className="w-4 h-4" /> Category Management
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-xl font-black text-slate-900">Category Structure</SheetTitle>
                                <SheetDescription className="text-xs font-bold text-slate-500">
                                    Create, reorder, and configure taxonomy for the entire marketplace.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-6">
                                {/* Create Category */}
                                {!createMode ? (
                                    <Button onClick={() => setCreateMode(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold border-none shadow-sm gap-2">
                                        <Plus className="w-4 h-4" /> Create New Category
                                    </Button>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Category</p>
                                        <Input
                                            placeholder="Category name..."
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                            className="text-xs font-bold border-slate-200"
                                            autoFocus
                                        />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Choose Icon</p>
                                            <div className="grid grid-cols-8 gap-1.5">
                                                {Object.entries(iconMap).map(([key, IconComp]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => setNewCatIcon(key)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                                                            newCatIcon === key
                                                                ? "bg-orange-100 border-orange-400 text-orange-700"
                                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                                        )}
                                                    >
                                                        <IconComp className="w-3.5 h-3.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={createCategory} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 flex-1">
                                                <Check className="w-3 h-3" /> Create
                                            </Button>
                                            <Button onClick={() => { setCreateMode(false); setNewCatName(''); }} variant="outline" size="sm" className="text-xs font-bold">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Category List */}
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Categories ({categories.length})</h3>
                                    {categories.map((cat, idx) => {
                                        const IconComp = iconMap[cat.iconKey] || Store;
                                        return (
                                            <div key={cat.id} className="bg-slate-50 rounded-xl border border-slate-100 group hover:border-orange-200 transition-colors">
                                                <div className="flex items-center justify-between p-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Reorder Arrows */}
                                                        <div className="flex flex-col">
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCategory(cat.id, 'up')}
                                                                disabled={idx === 0}
                                                                className={cn("p-0.5 rounded hover:bg-white transition-colors", idx === 0 ? "text-slate-200" : "text-slate-400 hover:text-slate-700")}
                                                            >
                                                                <ArrowUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCategory(cat.id, 'down')}
                                                                disabled={idx === categories.length - 1}
                                                                className={cn("p-0.5 rounded hover:bg-white transition-colors", idx === categories.length - 1 ? "text-slate-200" : "text-slate-400 hover:text-slate-700")}
                                                            >
                                                                <ArrowDown className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        {/* Icon */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setIconPickerFor(iconPickerFor === cat.id ? null : cat.id)}
                                                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                                                            title="Change Icon"
                                                        >
                                                            <IconComp className="w-4 h-4" />
                                                        </button>
                                                        {/* Name (editable) */}
                                                        {editingId === cat.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <Input
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    className="h-7 text-xs font-bold w-36 border-slate-200"
                                                                    autoFocus
                                                                    onKeyDown={(e) => e.key === 'Enter' && saveEditName(cat.id)}
                                                                />
                                                                <Button onClick={() => saveEditName(cat.id)} variant="ghost" size="icon" className="w-7 h-7 text-emerald-600 hover:bg-emerald-50"><Check className="w-3.5 h-3.5" /></Button>
                                                                <Button onClick={() => setEditingId(null)} variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:bg-slate-100"><X className="w-3.5 h-3.5" /></Button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900">{cat.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-500">{cat.count} stores</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {/* Featured Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFeatured(cat.id)}
                                                            className={cn(
                                                                "px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-black border transition-colors",
                                                                cat.featured
                                                                    ? "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200"
                                                                    : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600"
                                                            )}
                                                            title={cat.featured ? 'Remove Featured' : 'Set as Featured'}
                                                        >
                                                            <Star className="w-2.5 h-2.5 inline mr-0.5" />
                                                            {cat.featured ? 'Featured' : 'Feature'}
                                                        </button>
                                                        {/* Edit Name */}
                                                        <Button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-slate-900" title="Edit Name">
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        {/* Delete */}
                                                        <Button onClick={() => deleteCategory(cat.id)} variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-red-600" title="Delete Category">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {/* Icon Picker Expansion */}
                                                {iconPickerFor === cat.id && (
                                                    <div className="px-3 pb-3 border-t border-slate-100 pt-2">
                                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Assign Icon</p>
                                                        <div className="grid grid-cols-8 gap-1.5">
                                                            {Object.entries(iconMap).map(([key, Ic]) => (
                                                                <button
                                                                    key={key}
                                                                    type="button"
                                                                    onClick={() => assignIcon(cat.id, key)}
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                                                                        cat.iconKey === key
                                                                            ? "bg-blue-100 border-blue-400 text-blue-700"
                                                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                                                    )}
                                                                >
                                                                    <Ic className="w-3.5 h-3.5" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <SheetFooter className="mt-8 border-t border-slate-100 pt-4">
                                <SheetClose asChild>
                                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200">Save Taxonomy Changes</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                    
                    <Button onClick={() => setIsOnboardingOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-lg shadow-orange-200">
                        <Store className="h-4 w-4" /> Onboard Merchant
                    </Button>
                </div>
            </div>

            <MerchantOnboardingModal 
                isOpen={isOnboardingOpen} 
                onClose={() => setIsOnboardingOpen(false)}
                onComplete={handleOnboardingComplete}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-orange-200 transition-colors group bg-white">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                                    <kpi.icon className="h-4 w-4 text-slate-600 group-hover:text-orange-600" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    kpi.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {kpi.trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Advanced Filters & Table */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-lg font-black text-slate-900">Store List Master Table</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Complete directory of all registered MCOM entities.</CardDescription>
                        </div>
                        
                        {/* Search + Single Filter Dropdown */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search store name, ID..." 
                                    className="pl-9 h-10 text-xs font-bold border-slate-200 shadow-sm bg-white" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-10 text-xs font-bold text-slate-700 border-slate-200 bg-white gap-2 shadow-sm relative">
                                        <Filter className="w-3.5 h-3.5" />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[9px] font-black">{activeFilterCount}</span>
                                        )}
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl max-h-[420px] overflow-y-auto">
                                    {(Object.keys(filterLabels) as Array<keyof Filters>).map((key) => (
                                        <div key={key}>
                                            <button
                                                type="button"
                                                className="flex items-center justify-between w-full px-2 py-1.5 mt-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors"
                                                onClick={() => toggleFilterSection(key)}
                                            >
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {filterLabels[key]}
                                                    {filters[key] && <span className="ml-1.5 text-orange-600">• {filters[key]}</span>}
                                                </span>
                                                <ChevronDown className={cn(
                                                    "w-3 h-3 text-slate-400 transition-transform duration-200",
                                                    !expandedFilters[key] && "-rotate-90"
                                                )} />
                                            </button>
                                            {expandedFilters[key] && filterOptions[key].map((opt) => (
                                                <DropdownMenuItem 
                                                    key={opt} 
                                                    className={cn(
                                                        "rounded-lg py-1.5 cursor-pointer font-bold text-xs gap-2",
                                                        filters[key] === opt && "bg-orange-50 text-orange-700"
                                                    )}
                                                    onSelect={(e) => { e.preventDefault(); setFilter(key, opt); }}
                                                >
                                                    <span className={cn(
                                                        "w-3 h-3 rounded-sm border flex items-center justify-center",
                                                        filters[key] === opt ? "bg-orange-600 border-orange-600" : "border-slate-300"
                                                    )}>
                                                        {filters[key] === opt && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                                    </span>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator className="my-1" />
                                        </div>
                                    ))}
                                    {activeFilterCount > 0 && (
                                        <DropdownMenuItem 
                                            className="rounded-lg py-2 cursor-pointer font-black text-xs text-red-600 gap-2 mt-1"
                                            onSelect={() => clearAllFilters()}
                                        >
                                            <X className="w-3.5 h-3.5" /> Clear All Filters
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6 h-12">Business / Category</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Location</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-12">Membership</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-12">Store Score</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-12">Visibility</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-12">Engagement</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                <TableHead className="text-right pr-6 h-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStores.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <Filter className="w-8 h-8 text-slate-300" />
                                            <p className="text-sm font-bold text-slate-500">No stores match the current filters.</p>
                                            <Button variant="outline" size="sm" className="text-xs font-bold" onClick={clearAllFilters}>Clear Filters</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredStores.map((store) => (
                                <TableRow 
                                    key={store.id} 
                                    className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                                    onClick={() => { setSelectedStore(store); setView('store-console'); }}
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200">
                                                {store.name.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{store.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{store.category} • ID: {store.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {store.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-2.5 py-0.5",
                                            store.tier === 'Platinum' ? "bg-slate-900 text-white" :
                                            store.tier === 'Gold' ? "bg-amber-100 text-amber-700" :
                                            store.tier === 'Silver' ? "bg-slate-200 text-slate-700" : "bg-orange-50 text-orange-700"
                                        )}>
                                            {store.tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center text-[10px] font-black",
                                            store.score > 90 ? "border-emerald-500 text-emerald-600" : 
                                            store.score > 70 ? "border-blue-500 text-blue-600" : "border-orange-500 text-orange-600"
                                        )}>
                                            {store.score}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{store.visibility}</span>
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: store.engagement }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500">{store.engagement}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-2",
                                            store.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                                            store.status === 'Warning' ? "bg-orange-50 text-orange-600" : 
                                            store.status === 'Suspended' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {store.status === 'Active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {store.status === 'Warning' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                            {store.status === 'Suspended' && <Ban className="w-3 h-3 mr-1" />}
                                            {store.status === 'Pending' && <Activity className="w-3 h-3 mr-1" />}
                                            {store.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl shadow-xl">
                                                <DropdownMenuLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Quick Actions</DropdownMenuLabel>
                                                <DropdownMenuItem 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStore(store); setView('store-console'); }}
                                                    className="gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setSelectedStore(store); 
                                                        setView('edit-store'); 
                                                    }}
                                                    className="gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={(e) => { e.stopPropagation(); handleFeature(store.id); }}
                                                    className="gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs"
                                                >
                                                    <Star className={cn("w-3.5 h-3.5", store.visibility === 'Featured' ? "text-orange-600 fill-orange-600" : "text-orange-500")} /> 
                                                    {store.visibility === 'Featured' ? 'Unfeature' : 'Feature'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1" />
                                                <DropdownMenuItem 
                                                    onClick={(e) => { e.stopPropagation(); handleAudit(store.id); }}
                                                    className="gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs text-blue-600"
                                                >
                                                    <ShieldAlert className="w-3.5 h-3.5" /> Audit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={(e) => { e.stopPropagation(); handleSuspend(store.id); }}
                                                    className={cn("gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs", store.status === 'Suspended' ? "text-emerald-600" : "text-red-600")}
                                                >
                                                    <Ban className="w-3.5 h-3.5" /> {store.status === 'Suspended' ? 'Activate' : 'Suspend'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteStore(store.id); }}
                                                    className="gap-2.5 rounded-lg py-2 cursor-pointer font-bold text-xs text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

