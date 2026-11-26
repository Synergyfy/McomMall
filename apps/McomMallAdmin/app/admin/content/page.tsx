'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FolderTree,
    Image as ImageIcon,
    FileText,
    LayoutGrid,
    ChevronRight,
    GripVertical,
    Layers,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
    fetchSectors,
    fetchCategories,
    fetchSubcategories,
} from './api';
import { Sector, Category, Subcategory } from '@/app/admin/types';

function getLastSyncedAt(rows: Array<{ centralSyncedAt?: string | Date | null }>): string | null {
    const timestamps = rows
        .map((row) => (row.centralSyncedAt ? new Date(row.centralSyncedAt).getTime() : NaN))
        .filter((value) => Number.isFinite(value));

    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps)).toLocaleString();
}

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState('sectors');

    // Selection State
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // --- Data Queries ---
    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: fetchSectors,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: subcategories = [] } = useQuery({
        queryKey: ['subcategories', selectedCategoryId],
        queryFn: () => fetchSubcategories(selectedCategoryId!),
        enabled: !!selectedCategoryId,
    });

    // Derived Data
    const selectedSector = sectors.find((sector) => sector.id === selectedSectorId);
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
    const sectorCategories = categories.filter((category) => category.sectorId === selectedSectorId);
    const categorySubcategories = subcategories;
    const lastSyncedAt = getLastSyncedAt([...sectors, ...categories]);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900">Content Taxonomy</h1>
                        <Badge variant="outline" className="border-orange-200 text-orange-600">
                            Read-only · MCOM Central Hub
                        </Badge>
                    </div>
                    <p className="text-slate-500">
                        Sectors, categories and subcategories are synced from MCOM Central Hub. Manage them there.
                    </p>
                    {lastSyncedAt && (
                        <p className="text-xs text-slate-400">Last synced: {lastSyncedAt}</p>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex flex-shrink-0">
                    <TabsTrigger value="sectors" className="gap-2">
                        <FolderTree className="h-4 w-4" />
                        <span className="hidden sm:inline">Taxonomy</span>
                    </TabsTrigger>
                    {/* Other tabs placeholders */}
                    <TabsTrigger value="pages" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Pages</span>
                    </TabsTrigger>
                    <TabsTrigger value="banners" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Banners</span>
                    </TabsTrigger>
                    <TabsTrigger value="faqs" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">FAQs</span>
                    </TabsTrigger>
                </TabsList>

                {/* Sectors & Categories & Subcategories View */}
                <TabsContent value="sectors" className="flex-1 overflow-hidden mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

                        {/* Column 1: Sectors */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Sectors</CardTitle>
                                    <CardDescription className="text-xs">{sectors.length} items</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {sectors.map((sector) => (
                                    <div
                                        key={sector.id}
                                        onClick={() => {
                                            setSelectedSectorId(sector.id);
                                            setSelectedCategoryId(null); // Reset category when sector changes
                                        }}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                            selectedSectorId === sector.id
                                                ? "bg-white border-orange-500 shadow-sm"
                                                : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {sector.icon && <img src={sector.icon} alt="" className="w-8 h-8 rounded bg-slate-100 object-cover" />}
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-slate-900 truncate">{sector.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{sector.categoryCount} categories</p>
                                            </div>
                                        </div>
                                        {selectedSectorId === sector.id && (
                                            <ChevronRight className="h-4 w-4 text-orange-500" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Column 2: Categories */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Categories</CardTitle>
                                    <CardDescription className="text-xs">
                                        {selectedSector ? `In ${selectedSector.name}` : 'Select a sector'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {!selectedSectorId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <ArrowRight className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Select a sector</p>
                                    </div>
                                ) : sectorCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No categories</p>
                                    </div>
                                ) : (
                                    sectorCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                            className={cn(
                                                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                                selectedCategoryId === category.id
                                                    ? "bg-white border-orange-500 shadow-sm"
                                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {category.image && <img src={category.image} alt="" className="w-8 h-8 rounded bg-slate-100 object-cover" />}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-slate-900 truncate">{category.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{category.subcategoryCount} subcategories</p>
                                                </div>
                                            </div>
                                            {selectedCategoryId === category.id && (
                                                <ChevronRight className="h-4 w-4 text-orange-500" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Column 3: Subcategories */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Subcategories</CardTitle>
                                    <CardDescription className="text-xs">
                                        {selectedCategory ? `In ${selectedCategory.name}` : 'Select a category'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {!selectedCategoryId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <ArrowRight className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Select a category</p>
                                    </div>
                                ) : categorySubcategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No subcategories</p>
                                    </div>
                                ) : (
                                    categorySubcategories.map((sub: Subcategory) => (
                                        <div
                                            key={sub.id}
                                            className="group flex items-center justify-between p-3 rounded-lg bg-white border border-transparent hover:border-slate-200 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-slate-900 truncate">{sub.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{sub.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                {/* Other Tabs Content placeholders */}
                <TabsContent value="pages">
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        Pages content not implemented in this task
                    </div>
                </TabsContent>
                <TabsContent value="banners">
                     <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        Banners content not implemented in this task
                     </div>
                </TabsContent>
                <TabsContent value="faqs">
                     <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        FAQs content not implemented in this task
                     </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
