'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, LayoutGrid, Layers } from 'lucide-react';
import { BannerTab } from './components/BannerTab';
import { CategoryTab } from './components/CategoryTab';
import { SectionTab } from './components/SectionTab';

export default function MarketplacePage() {
    const [activeTab, setActiveTab] = useState('banners');

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketplace Configuration</h1>
                    <p className="text-slate-500">Manage banners, sidebar categories, and section configurations</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex flex-shrink-0">
                    <TabsTrigger value="banners" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Banners</span>
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="hidden sm:inline">Sidebar Categories</span>
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">Sections</span>
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden mt-4 bg-slate-50/50 rounded-lg border border-slate-200">
                    <TabsContent value="banners" className="h-full p-0 m-0 overflow-y-auto">
                        <BannerTab />
                    </TabsContent>

                    <TabsContent value="categories" className="h-full p-0 m-0 overflow-y-auto">
                        <CategoryTab />
                    </TabsContent>

                    <TabsContent value="sections" className="h-full p-0 m-0 overflow-y-auto">
                        <SectionTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
