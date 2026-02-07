'use client';

import { useState, useMemo } from 'react';
import { Search, LayoutGrid, ListIcon, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import VoucherCard from '@/components/marketplace/VoucherCard';
import Pagination from '@/components/marketplace/Pagination';
import { useGetPublicCoupons } from '@/service/marketplace/discovery';
import { PromotionalItem } from '@/lib/listing-data';

const ITEMS_PER_PAGE = 12;

type MarketItem = {
    id?: string | number;
    title?: string;
    name?: string;
    price?: number | string;
    salePrice?: number | string;
    amount?: number | string;
    fixedAmounts?: number[];
    imageUrl?: string | null;
    image?: string;
    url?: string;
    backgroundImage?: string;
    media?: string[] | null;
    category?: string;
};

export default function CouponsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: couponsData, isLoading } = useGetPublicCoupons({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
    });

    // Transform coupons to display items
    const displayItems = useMemo(() => {
        if (!couponsData?.data) return [];

        return couponsData.data.map((item: MarketItem) => {
            const title = item.title || item.name || 'Untitled Coupon';
            const price = item.price || item.amount || item.fixedAmounts?.[0] || 0;
            const image = item.imageUrl || item.image || item.url || item.backgroundImage || (item.media && item.media[0]) || '/placeholder.png';

            return {
                id: item.id,
                title,
                price: Number(price),
                image,
                category: item.category || 'coupon',
                items_left: 10,
                rating: 4.5,
                reviews: 10,
                discountedPrice: item.salePrice ? Number(item.salePrice) : undefined,
                link: `/coupons/${item.id}`,
                bonusThreshold: (item as any).bonusThreshold,
                bonusAmount: (item as any).bonusAmount,
                fixedAmounts: (item as any).fixedAmounts,
                allowCustomAmount: (item as any).allowCustomAmount,
                minCustomAmount: (item as any).minCustomAmount,
                maxCustomAmount: (item as any).maxCustomAmount,
            } as PromotionalItem;
        });
    }, [couponsData]);

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <Tag className="h-8 w-8 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">All Coupons</h1>
                            <p className="text-gray-600 mt-1">Discover amazing deals and exclusive offers</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-28 z-30">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search coupons..."
                                className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">New Arrivals</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                        <p>Showing <span className="font-semibold text-gray-900">{displayItems.length}</span> coupons</p>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-64 md:h-80 bg-white rounded-xl shadow-sm animate-pulse" />
                        ))}
                    </div>
                ) : displayItems.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={
                            viewMode === 'grid'
                                ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
                                : "flex flex-col gap-4"
                        }
                    >
                        {displayItems.map((item) => (
                            <VoucherCard key={item.id} voucher={item} viewMode={viewMode} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No coupons found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? "Try adjusting your search." : "No coupons available right now."}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="link"
                                className="mt-2 text-primary"
                                onClick={() => setSearchQuery('')}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {couponsData?.meta && couponsData.meta.totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination
                            currentPage={couponsData.meta.currentPage}
                            totalPages={couponsData.meta.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
