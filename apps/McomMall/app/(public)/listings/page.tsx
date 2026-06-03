'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { setLoginModalOpen } from '@/service/store/uiSlice';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { List, LayoutGrid, SlidersHorizontal, MapPin } from 'lucide-react';
import FilterSidebar, { type FilterState } from '@/components/FilterSidebar';
import ListingCard from '@/components/listingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import {
  useGetGoogleListings,
  useGetInHouseBusiness,
} from '@/service/listings/hook';
import { InHouseBusiness, GooglePlaceResult } from '@/service/listings/types';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

const initialFilters: FilterState = {
  searchTerm: '',
  category: '',
  subCategories: [],
  location: '',
  radius: 100,
  priceRange: [0, 1000],
};

async function fetchIpLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return { lat: data.latitude, lng: data.longitude };
      }
    }
  } catch (e) {
    console.warn('Failed to fetch from ipapi.co, trying fallback...', e);
  }

  try {
    const res = await fetch('https://ip-api.com/json/');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.lat === 'number' && typeof data.lon === 'number') {
        return { lat: data.lat, lng: data.lon };
      }
    }
  } catch (e) {
    console.error('Failed to fetch from ip-api.com', e);
  }

  return null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 14,
    },
  },
} as const;

function ListingsPageContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { accessToken, userRole } = useSelector(
    (state: RootState) => state.auth
  );

  const handleAddNewListing = () => {
    if (!accessToken) {
      dispatch(setLoginModalOpen(true));
    } else if (userRole === 'owner') {
      router.push('/add-listing');
    } else {
      toast.error('Only business owners can add new listings.');
    }
  };

  const searchParams = useSearchParams();
  const queryText = searchParams.get('queryText');

  const [locationStatus, setLocationStatus] = useState<'checking' | 'prompt' | 'granted' | 'denied'>('checking');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 51.5074,
    lng: -0.1278,
  });

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('granted');
        },
        () => {
          fetchIpLocation().then(ipCoords => {
            if (ipCoords) {
              setCoords(ipCoords);
              setLocationStatus('granted');
            } else {
              setLocationStatus('denied');
            }
          });
        },
        { timeout: 8000 }
      );
    } else {
      fetchIpLocation().then(ipCoords => {
        if (ipCoords) {
          setCoords(ipCoords);
          setLocationStatus('granted');
        } else {
          setLocationStatus('denied');
        }
      });
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setLocationStatus('granted');
          requestLocation();
        } else if (permissionStatus.state === 'denied') {
          setLocationStatus('denied');
        } else {
          setLocationStatus('prompt');
        }

        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setLocationStatus('granted');
            requestLocation();
          } else if (permissionStatus.state === 'denied') {
            setLocationStatus('denied');
          } else {
            setLocationStatus('prompt');
          }
        };
      }).catch(() => {
        requestLocation();
      });
    } else {
      requestLocation();
    }
  }, []);

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(initialFilters);
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const showFilters = searchParams.get('showFilters');

    if (category || subcategory || showFilters) {
      const newFilters: Partial<FilterState> = {};
      let combinedQuery = '';

      if (subcategory) {
        combinedQuery = subcategory;
        newFilters.subCategories = [subcategory];
      } else if (category) {
        combinedQuery = category;
        newFilters.category = category;
      }

      newFilters.searchTerm = combinedQuery;

      setActiveFilters(prev => ({
        ...initialFilters,
        ...newFilters,
      }));
      setFiltersVisible(true);
    }
  }, [searchParams]);

  const { isLoading: isInHouseLoading, isSuccess: isInHouseSuccess, data: inHouseData } = useGetInHouseBusiness({
    queryText: activeFilters.searchTerm || queryText,
  });

  const { isLoading: isGoogleLoading, isSuccess: isGoogleSuccess, data: googleData } = useGetGoogleListings({
    queryText: activeFilters.searchTerm || queryText,
    lat: coords.lat,
    lng: coords.lng,
  });

  const combinedListings = useMemo(() => [...(inHouseData || []), ...(googleData || [])], [inHouseData, googleData]);

  const isLoading = isInHouseLoading || isGoogleLoading;
  const isSuccess = isInHouseSuccess || isGoogleSuccess;

  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 4;

  const MapComponent = useMemo(
    () =>
      dynamic(() => import('@/components/MapComponent'), {
        loading: () => <div className="bg-gray-200 w-full h-full animate-pulse" />,
        ssr: false,
      }),
    []
  );

  const listingsForMap = useMemo(
    () =>
      combinedListings.filter(l => {
        if (isGoogleResult(l)) return l.geometry?.location?.lat && l.geometry?.location?.lng;
        return l.location?.lat != null && l.location?.lng != null;
      }),
    [combinedListings]
  );

  const mapCenter: [number, number] = useMemo(() => {
    if (listingsForMap.length > 0) {
      const first = listingsForMap[0];
      if (isGoogleResult(first)) return [first.geometry.location.lat, first.geometry.location.lng];
      return [first.location.lat, first.location.lng];
    }
    return [coords.lat, coords.lng];
  }, [listingsForMap, coords]);

  const handleFilterChange = (newFilters: FilterState) => {
    let combinedQuery = newFilters.searchTerm;
    newFilters.subCategories.forEach(sub => {
      if (!combinedQuery.toLowerCase().includes(sub.toLowerCase())) combinedQuery += ` ${sub}`;
    });

    if (newFilters.subCategories.length === 0 && newFilters.category) {
      if (!combinedQuery.toLowerCase().includes(newFilters.category.toLowerCase()))
        combinedQuery += ` ${newFilters.category}`;
    }

    const updatedFilters = { ...newFilters, searchTerm: combinedQuery.trim() };
    setActiveFilters(updatedFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (updatedFilters.searchTerm) params.set('queryText', updatedFilters.searchTerm);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.subCategories.length > 0) params.set('subcategory', newFilters.subCategories.join(','));
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  const totalPages = Math.ceil((combinedListings?.length || 0) / listingsPerPage);

  const renderLocationBlocker = () => {
    if (locationStatus === 'granted' || locationStatus === 'checking') return null;

    return (
      <div className="absolute inset-0 z-35 flex justify-center items-start pt-24 px-4 bg-slate-900/10 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col items-center z-40 mt-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-4 shrink-0">
            <MapPin className="w-8 h-8 animate-bounce" />
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-2">
            Location Access Required
          </h2>
          
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Please allow location permission to browse local listings and check proximity perks.
          </p>

          {locationStatus === 'prompt' ? (
            <Button
              onClick={requestLocation}
              className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold rounded-2xl shadow-md shadow-orange-500/20 hover:brightness-105 transition-all text-sm border-none"
            >
              Allow Location Access
            </Button>
          ) : (
            <div className="w-full">
              <div className="bg-red-50 text-red-800 text-xs font-semibold rounded-2xl p-3 mb-3 border border-red-100">
                Location access blocked. Please enable it in browser settings.
              </div>
              <Button
                onClick={requestLocation}
                variant="outline"
                className="w-full py-5 text-slate-700 font-bold border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm"
              >
                Retry Access Check
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  if (locationStatus === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 pt-16">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"
          />
          <p className="text-slate-500 font-semibold">Checking location permissions...</p>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex h-screen bg-slate-50 overflow-x-hidden pt-16 relative">
        {renderLocationBlocker()}
        <div className={`flex-1 min-w-0 p-4 overflow-y-auto transition-all duration-300 ${
          locationStatus !== 'granted' ? 'blur-sm pointer-events-none select-none' : ''
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[...Array(4)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className={`w-1/3 max-w-[33%] h-full flex-shrink-0 hidden lg:block transition-all duration-300 ${
          locationStatus !== 'granted' ? 'blur-sm pointer-events-none select-none' : ''
        }`}>
          <div className="bg-gray-200 w-full h-full animate-pulse" />
        </div>
      </div>
    );

  if (isSuccess)
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/50 overflow-x-hidden pt-16 relative">
        {renderLocationBlocker()}
        <AnimatePresence>
          {filtersVisible && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`fixed inset-0 z-40 md:relative md:w-80 md:h-full md:flex-shrink-0 transition-all duration-300 ${
                locationStatus !== 'granted' ? 'blur-sm pointer-events-none select-none' : ''
              }`}
            >
              <FilterSidebar
                initialState={activeFilters}
                onFilterChange={handleFilterChange}
                onClose={() => setFiltersVisible(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`flex-1 flex min-w-0 flex-col transition-all duration-300 ${
          locationStatus !== 'granted' ? 'blur-sm pointer-events-none select-none' : ''
        }`}>
          <div className="flex-shrink-0 p-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-none px-6 py-5 flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLayout('grid')}
                    className={`rounded-xl transition-all duration-300 ${layout === 'grid' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid
                      className="h-5 w-5"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLayout('list')}
                    className={`rounded-xl transition-all duration-300 ${layout === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List
                      className="h-5 w-5"
                    />
                  </Button>
                </div>
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="newest">Newest Listings</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden min-w-0">
            <div className="flex-1 min-w-0 p-6 overflow-y-auto">
              {combinedListings.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-2xl font-black mb-4 text-slate-800">No listings found</h2>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    There are no listings that match your search criteria.
                  </p>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6"
                    onClick={handleAddNewListing}
                  >
                    Add New Listing
                  </Button>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className={`grid gap-6 w-full ${layout === 'grid'
                      ? `grid-cols-1 ${filtersVisible ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`
                      : 'grid-cols-1'
                      }`}
                  >
                    {combinedListings.map(listing => (
                      <motion.div
                        key={isGoogleResult(listing) ? listing.placeId : listing.id}
                        variants={itemVariants}
                      >
                        <ListingCard
                          listing={listing}
                          layout={layout}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        size="icon"
                        className={
                          currentPage === page
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all'
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="w-1/3 max-w-[33%] h-screen sticky top-0 flex-shrink-0 hidden lg:block border-l border-slate-200/50 shadow-inner">
              <MapComponent listings={listingsForMap} center={mapCenter} />
            </div>
          </div>
        </main>
      </div>
    );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsPageContent />
    </Suspense>
  );
}
