'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  LayoutGrid, 
  List as ListIcon, 
  ChevronLeft, 
  ChevronRight,
  X,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ListingCard from '@/components/listingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import { useGetAllListings } from '@/service/listings/hook';
import { useGetCategories } from '@/service/taxonomy/hook';
import Footer from '@/components/Footer';

function AllListingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [queryText, setQueryText] = useState(searchParams.get('queryText') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const limit = 12;

  const { data, isLoading, isError } = useGetAllListings({
    queryText: queryText || undefined,
    category: category === 'all' ? undefined : category,
    location: location || undefined,
    page,
    limit,
    sortBy,
  });

  const { data: categories } = useGetCategories();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (queryText) params.set('queryText', queryText);
    if (category && category !== 'all') params.set('category', category);
    if (location) params.set('location', location);
    if (page > 1) params.set('page', page.toString());
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    
    const queryString = params.toString();
    router.push(`/all-listings${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [queryText, category, location, page, sortBy, router]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setQueryText('');
    setCategory('all');
    setLocation('');
    setPage(1);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header / Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Explore All Listings
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Discover the best businesses, products, and services in your neighbourhood. Filter by category, location, or search for exactly what you need.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search listings..." 
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={queryText}
                  onChange={(e) => {
                    setQueryText(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="relative flex-1 hidden md:block">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Location..." 
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
              <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
                <SelectTrigger className="w-[160px] h-11 bg-gray-50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setPage(1); }}>
                <SelectTrigger className="w-[160px] h-11 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-gray-400" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-11 border-l mx-2 hidden md:block" />

              <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setLayout('grid')}
                  className={`p-2 rounded-md transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-[#f58220]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setLayout('list')}
                  className={`p-2 rounded-md transition-all ${layout === 'list' ? 'bg-white shadow-sm text-[#f58220]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ListIcon size={18} />
                </button>
              </div>

              <Button 
                variant="outline" 
                className="lg:hidden h-11 border-dashed"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={18} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500 text-sm">
            {isLoading ? 'Searching...' : `Showing ${data?.data.length || 0} of ${data?.meta.total || 0} listings`}
          </p>
          {(queryText || category !== 'all' || location) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-[#f58220] hover:underline flex items-center gap-1"
            >
              Clear all filters <X size={14} />
            </button>
          )}
        </div>

        {/* Listings Grid */}
        {isError ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">We couldn't load the listings. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : isLoading ? (
          <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm px-4">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No listings found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We couldn't find any listings matching your current filters. Try adjusting your search or category.
            </p>
            <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
          </div>
        ) : (
          <>
            <motion.div 
              layout
              className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
            >
              <AnimatePresence>
                {data?.data.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListingCard listing={listing} layout={layout} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {data && data.meta.lastPage > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-full"
                >
                  <ChevronLeft size={20} />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: data.meta.lastPage }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === data.meta.lastPage || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                        <Button
                          variant={page === p ? 'default' : 'ghost'}
                          onClick={() => handlePageChange(p)}
                          className={`w-10 h-10 rounded-full ${page === p ? 'bg-[#f58220] hover:bg-[#e67a1d]' : ''}`}
                        >
                          {p}
                        </Button>
                      </div>
                    ))
                  }
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === data.meta.lastPage}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-full"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex items-end"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Enter city or postcode" 
                      className="pl-10 h-12"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={clearFilters}>
                    Reset
                  </Button>
                  <Button className="flex-1 h-12 rounded-xl bg-[#f58220] hover:bg-[#e67a1d]" onClick={() => setShowMobileFilters(false)}>
                    Show Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function AllListingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllListingsPageContent />
    </Suspense>
  );
}
