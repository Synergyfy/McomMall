'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
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
  ArrowUpDown,
  Filter,
  ChevronDown,
  ArrowRight,
  Home
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
import {
  Badge
} from '@/components/ui/badge';
import ListingCard from '@/components/listingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import { useGetAllListings } from '@/service/listings/hook';
import { useGetCategories } from '@/service/taxonomy/hook';
import Footer from '@/components/Footer';
import Link from 'next/link';

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

  // Sync URL
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

  const activeFilters = useMemo(() => {
    const filters = [];
    if (queryText) filters.push({ id: 'query', label: `"${queryText}"`, clear: () => setQueryText('') });
    if (category !== 'all') filters.push({ id: 'category', label: category, clear: () => setCategory('all') });
    if (location) filters.push({ id: 'location', label: location, clear: () => setLocation('') });
    return filters;
  }, [queryText, category, location]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Premium Hero Section */}
      <div className="relative bg-[#1A1A1A] py-16 md:py-24 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-orange-500/80 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-orange-400 transition-colors flex items-center gap-1">
              <Home size={14} /> Home
            </Link>
            <ArrowRight size={12} />
            <span className="text-white/60">Directory</span>
          </nav>
          
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
            >
              The Ultimate <span className="text-[#f58220]">Marketplace</span> Directory
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/60 leading-relaxed"
            >
              Connect with premium businesses, expert services, and exclusive products across the UK. Everything you need, all in one place.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Search Bar (Floating) */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-12 relative z-20">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-[2] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Search by name, description or tags..." 
                className="pl-12 h-14 bg-gray-50 border-none text-lg rounded-xl focus-visible:ring-2 focus-visible:ring-orange-500/20 transition-all"
                value={queryText}
                onChange={(e) => { setQueryText(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Postcode or City" 
                className="pl-12 h-14 bg-gray-50 border-none text-lg rounded-xl focus-visible:ring-2 focus-visible:ring-orange-500/20 transition-all"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              />
            </div>
            <Button className="h-14 px-8 bg-[#f58220] hover:bg-[#e67a1d] text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all">
              Search Results
            </Button>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Filter size={18} className="text-[#f58220]" /> Categories
                  </h3>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => setCategory('all')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all font-medium ${category === 'all' ? 'bg-orange-50 text-[#f58220]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setCategory(cat.name)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all font-medium ${category === cat.name ? 'bg-orange-50 text-[#f58220]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-bold text-xl mb-4">Display Options</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Latest Uploads</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name">Alphabetical (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">View Style</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setLayout('grid')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-[#f58220]' : 'text-gray-500'}`}
                      >
                        <LayoutGrid size={16} /> <span className="text-sm font-bold">Grid</span>
                      </button>
                      <button 
                        onClick={() => setLayout('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${layout === 'list' ? 'bg-white shadow-sm text-[#f58220]' : 'text-gray-500'}`}
                      >
                        <ListIcon size={16} /> <span className="text-sm font-bold">List</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Widget */}
              <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                <h4 className="font-black text-xl mb-2">Grow Your Business</h4>
                <p className="text-orange-100 text-sm mb-4">List your services on McomMall and reach thousands of customers daily.</p>
                <Link href="/add-listing" className="inline-block bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                  Add Listing Free
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Results Area */}
          <main className="flex-1">
            {/* Top Bar - Mobile Only / Filters Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {isLoading ? 'Scanning Directory...' : `${data?.meta.total || 0} Results Found`}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <AnimatePresence>
                    {activeFilters.map((filter) => (
                      <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge variant="secondary" className="pl-3 pr-1 py-1.5 gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-full">
                          <span className="text-xs font-bold">{filter.label}</span>
                          <button onClick={filter.clear} className="p-0.5 rounded-full hover:bg-gray-300 transition-colors">
                            <X size={14} />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {activeFilters.length > 0 && (
                    <button 
                      onClick={() => { setQueryText(''); setCategory('all'); setLocation(''); }}
                      className="text-xs font-bold text-[#f58220] hover:underline ml-2"
                    >
                      Reset All
                    </button>
                  )}
                </div>
              </div>

              <div className="flex lg:hidden items-center gap-3">
                <Button 
                  onClick={() => setShowMobileFilters(true)}
                  className="flex-1 bg-white border-gray-200 text-gray-900 hover:bg-gray-50 shadow-none border"
                >
                  <SlidersHorizontal size={18} className="mr-2" /> Filters
                </Button>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setLayout('grid')} className={`p-2 rounded-lg ${layout === 'grid' ? 'bg-white text-[#f58220]' : 'text-gray-400'}`}>
                    <LayoutGrid size={18} />
                  </button>
                  <button onClick={() => setLayout('list')} className={`p-2 rounded-lg ${layout === 'list' ? 'bg-white text-[#f58220]' : 'text-gray-400'}`}>
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Container */}
            {isLoading ? (
              <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Could not load results</h3>
                <p className="text-gray-500 mb-6">There was a technical issue fetching the listings.</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : data?.data.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-gray-300" size={40} />
                </div>
                <h3 className="text-2xl font-black mb-2 text-gray-900">No Match Found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find anything matching your filters. Try a different category or broader search.</p>
                <Button onClick={() => { setQueryText(''); setCategory('all'); setLocation(''); }} variant="outline" className="rounded-xl px-8 border-gray-300">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
                >
                  {data?.data.map((listing) => (
                    <motion.div key={listing.id} variants={itemVariants}>
                      <ListingCard listing={listing} layout={layout} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Modern Pagination */}
                {data && data.meta.lastPage > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="rounded-xl w-11 h-11 hover:bg-orange-50 hover:text-[#f58220]"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: data.meta.lastPage }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === data.meta.lastPage || Math.abs(p - page) <= 1)
                        .map((p, i, arr) => (
                          <div key={p} className="flex items-center">
                            {i > 0 && arr[i-1] !== p - 1 && <span className="px-1 text-gray-300">...</span>}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                                page === p 
                                  ? 'bg-[#f58220] text-white shadow-lg shadow-orange-500/20' 
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        ))
                      }
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page === data.meta.lastPage}
                      onClick={() => handlePageChange(page + 1)}
                      className="rounded-xl w-11 h-11 hover:bg-orange-50 hover:text-[#f58220]"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden flex items-end"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full rounded-t-[2.5rem] p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Refine Results</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setCategory('all'); setShowMobileFilters(false); }}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${category === 'all' ? 'bg-[#f58220] text-white border-[#f58220]' : 'bg-gray-50 border-transparent text-gray-600'}`}
                    >
                      All
                    </button>
                    {categories?.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => { setCategory(cat.name); setShowMobileFilters(false); }}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${category === cat.name ? 'bg-[#f58220] text-white border-[#f58220]' : 'bg-gray-50 border-transparent text-gray-600'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">Sort Options</label>
                  <div className="space-y-2">
                    {['newest', 'oldest', 'name'].map((s) => (
                      <button 
                        key={s}
                        onClick={() => { setSortBy(s); setShowMobileFilters(false); }}
                        className={`w-full text-left px-5 py-4 rounded-xl text-sm font-bold transition-all border ${sortBy === s ? 'bg-orange-50 text-[#f58220] border-orange-200' : 'bg-gray-50 border-transparent text-gray-600'}`}
                      >
                        {s === 'newest' ? 'Latest First' : s === 'oldest' ? 'Oldest First' : 'Alphabetical (A-Z)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-14 bg-[#f58220] hover:bg-[#e67a1d] text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20" 
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Apply Filters
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Initializing Directory</p>
        </div>
      </div>
    }>
      <AllListingsPageContent />
    </Suspense>
  );
}