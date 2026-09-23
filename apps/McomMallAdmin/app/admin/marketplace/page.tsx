'use client';

import { useState } from 'react';
import { Store, Search, Plus, Trash2, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useGetAdminBusinesses, useGetBusinessStats } from '@/service/admin/hook';
import {
    useGetMarketplaceBanners,
    useUpdateMarketplaceBanner,
    useDeleteMarketplaceBanner,
    useGetMarketplaceCategories,
    useCreateMarketplaceCategory,
    useUpdateMarketplaceCategory,
    useDeleteMarketplaceCategory,
    useGetMarketplaceSections,
    useUpdateMarketplaceSection,
} from '@/service/marketplace';

const PAGE_SIZE = 10;

export default function MarketplaceAdmin() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: stats, isLoading: statsLoading } = useGetBusinessStats();
    const {
        data: businessesData,
        isLoading: storesLoading,
        isError: storesError,
        error: storesErr,
        refetch: refetchStores,
    } = useGetAdminBusinesses({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE });

    const stores = businessesData?.data ?? [];
    const totalPages = businessesData?.totalPages ?? 1;
    const total = businessesData?.total ?? 0;

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">
                    Live storefront directory and storefront curation from the API.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Storefronts', value: stats?.total },
                    { title: 'Active', value: stats?.active },
                    { title: 'Pending Approvals', value: stats?.pending },
                    { title: 'Verified', value: stats?.verified },
                ].map((kpi) => (
                    <Card key={kpi.title} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                                <Store className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {kpi.title}
                                </p>
                                <p className="text-2xl font-black text-slate-900">
                                    {statsLoading ? '…' : (kpi.value ?? '—')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="stores" className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-1">
                    <TabsTrigger value="stores">Stores</TabsTrigger>
                    <TabsTrigger value="banners">Banners</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                </TabsList>

                <TabsContent value="stores" className="mt-6">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Stores</CardTitle>
                                    <CardDescription>
                                        {storesLoading ? 'Loading…' : `${total} stores found`}
                                    </CardDescription>
                                </div>
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search stores…"
                                        className="pl-11 h-12 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setPage(1);
                                            window.clearTimeout((window as unknown as { __ms?: number }).__ms);
                                            (window as unknown as { __ms?: number }).__ms = window.setTimeout(
                                                () => setDebouncedSearch(e.target.value.trim()),
                                                400,
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 relative">
                            {storesLoading && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            )}
                            {storesError && (
                                <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    Failed to load stores: {(storesErr as Error)?.message ?? 'Unknown error'}
                                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchStores()}>
                                        Retry
                                    </Button>
                                </div>
                            )}
                            {!storesLoading && !storesError && stores.length === 0 && (
                                <p className="p-12 text-center text-sm text-slate-400">No stores found.</p>
                            )}
                            {stores.length > 0 && (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/30">
                                                <TableHead className="pl-8">Store</TableHead>
                                                <TableHead>Sector</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead className="text-center">Listings</TableHead>
                                                <TableHead className="text-center">Verification</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stores.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="pl-8 py-4">
                                                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                            {s.category || 'Uncategorized'} • {s.owner || 'No owner'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600">{s.sector || '—'}</TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600">{s.address || '—'}</TableCell>
                                                    <TableCell className="text-center font-black">{s.listingCount}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'border-none text-[10px] font-black uppercase',
                                                                s.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                                                            )}
                                                        >
                                                            {s.verified ? 'Verified' : 'Pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="border-none text-[10px] font-black uppercase capitalize">
                                                            {s.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-500">
                                                Page {page} of {totalPages} · {total} total
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={page >= totalPages}
                                                    onClick={() => setPage((p) => p + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="banners" className="mt-6">
                    <BannersTab />
                </TabsContent>
                <TabsContent value="categories" className="mt-6">
                    <CategoriesTab />
                </TabsContent>
                <TabsContent value="sections" className="mt-6">
                    <SectionsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BannersTab() {
    const { data, isLoading, isError, error, refetch } = useGetMarketplaceBanners();
    const update = useUpdateMarketplaceBanner();
    const remove = useDeleteMarketplaceBanner();

    if (isLoading)
        return (
            <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    if (isError)
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load banners: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    if ((data?.length ?? 0) === 0) return <p className="text-sm text-slate-400 p-8 text-center">No banners configured.</p>;

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="pl-6">Banner</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead className="text-center">Active</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((b) => (
                            <TableRow key={b.id}>
                                <TableCell className="pl-6 py-4">
                                    <p className="text-sm font-bold">{b.title}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-xs">{b.link}</p>
                                </TableCell>
                                <TableCell className="text-xs capitalize">{b.type.replace(/_/g, ' ')}</TableCell>
                                <TableCell className="text-center">{b.displayOrder}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={b.isActive ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500'}>
                                        {b.isActive ? 'active' : 'inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={update.isPending}
                                            onClick={() => update.mutate({ id: b.id, data: { isActive: !b.isActive } })}
                                        >
                                            {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={remove.isPending}
                                            onClick={() => confirm(`Delete banner "${b.title}"?`) && remove.mutate(b.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function CategoriesTab() {
    const { data, isLoading, isError, error, refetch } = useGetMarketplaceCategories();
    const create = useCreateMarketplaceCategory();
    const update = useUpdateMarketplaceCategory();
    const remove = useDeleteMarketplaceCategory();
    const [name, setName] = useState('');
    const [iconName, setIconName] = useState('Store');

    if (isLoading)
        return (
            <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    if (isError)
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load categories: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Add category</CardTitle>
                    <CardDescription>Creates a live sidebar category via the API.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Icon name (e.g. Store)" value={iconName} onChange={(e) => setIconName(e.target.value)} className="sm:w-56" />
                    <Button
                        disabled={!name.trim() || create.isPending}
                        onClick={() =>
                            create.mutate(
                                {
                                    name: name.trim(),
                                    iconName: iconName.trim() || 'Store',
                                    targetCategoryId: 'general',
                                    displayOrder: (data?.length ?? 0) + 1,
                                    isVisible: true,
                                },
                                { onSuccess: () => setName('') },
                            )
                        }
                    >
                        {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-0">
                    {(data?.length ?? 0) === 0 ? (
                        <p className="text-sm text-slate-400 p-8 text-center">No categories configured.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="pl-6">Category</TableHead>
                                    <TableHead>Icon</TableHead>
                                    <TableHead className="text-center">Order</TableHead>
                                    <TableHead className="text-center">Visible</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="pl-6 font-bold text-sm">{c.name}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{c.iconName}</TableCell>
                                        <TableCell className="text-center">{c.displayOrder}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={c.isVisible ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500'}>
                                                {c.isVisible ? 'visible' : 'hidden'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={update.isPending}
                                                    onClick={() => update.mutate({ id: c.id, data: { isVisible: !c.isVisible } })}
                                                >
                                                    {c.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={remove.isPending}
                                                    onClick={() => confirm(`Delete category "${c.name}"?`) && remove.mutate(c.id)}
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
        </div>
    );
}

function SectionsTab() {
    const { data, isLoading, isError, error, refetch } = useGetMarketplaceSections();
    const update = useUpdateMarketplaceSection();

    if (isLoading)
        return (
            <div className="space-y-3">
                {[0, 1].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    if (isError)
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load sections: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    if ((data?.length ?? 0) === 0) return <p className="text-sm text-slate-400 p-8 text-center">No sections configured.</p>;

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="pl-6">Section</TableHead>
                            <TableHead className="text-center">Visible</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((s) => (
                            <TableRow key={s.type}>
                                <TableCell className="pl-6 font-bold text-sm">{s.title || s.type}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={s.isVisible ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500'}>
                                        {s.isVisible ? 'visible' : 'hidden'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={update.isPending}
                                        onClick={() => update.mutate({ type: s.type, data: { isVisible: !s.isVisible } })}
                                    >
                                        {s.isVisible ? 'Hide' : 'Show'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
