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
import { List, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { categories, listings } from '@/lib/listing-data';
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

function ListingsPageContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { accessToken, userRole } = useSelector((state: RootState) => state.auth);

  const handleAddNewListing = () => {
    if (!accessToken) {
      dispatch(setLoginModalOpen(true));
    } else {
      if (userRole === 'owner') {
        router.push('/add-listing');
      } else {
        toast.error('Only business owners can add new listings.');
      }
    }
  };

  const searchParams = useSearchParams();
  const queryText = searchParams.get('queryText');
  // Default to Lagos, Nigeria
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.454075,
    lng: 3.394673,
  });

  // Fetch user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Keep default Lagos coordinates if permission denied
        }
      );
    }
  }, []);

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

      setActiveFilters(prevFilters => ({
        ...initialFilters,
        ...newFilters,
      }));
      setFiltersVisible(true);
    }
  }, [searchParams]);

  const {
    isLoading: isInHouseLoading,
    isSuccess: isInHouseSuccess,
    data: inHouseData,
  } = useGetInHouseBusiness({
    queryText: activeFilters.searchTerm || queryText,
  });

  const {
    isLoading: isGoogleLoading,
    isSuccess: isGoogleSuccess,
    data: googleData,
  } = useGetGoogleListings({
    queryText: activeFilters.searchTerm || queryText,
    lat: coords.lat,
    lng: coords.lng,
  });

  const combinedListings = useMemo(() => {
    const inHouseResults = inHouseData || [];
    const googleResults = googleData || [];
    return [...inHouseResults, ...googleResults];
  }, [inHouseData, googleData]);

  const isLoading = isInHouseLoading || isGoogleLoading;
  const isSuccess = isInHouseSuccess || isGoogleSuccess;

  const [currentPage, setCurrentPage] = useState(1);

  const listingsPerPage = 4;

  const MapComponent = useMemo(
    () =>
      dynamic(() => import('@/components/MapComponent'), {
        loading: () => (
          <div className="bg-gray-200 w-full h-full animate-pulse" />
        ),
        ssr: false,
      }),
    []
  );

  const listingsForMap = useMemo(
    () =>
      combinedListings.filter(l => {
        if (isGoogleResult(l)) {
          return l.geometry?.location?.lat && l.geometry?.location?.lng;
        }
        return l.location?.lat != null && l.location?.lng != null;
      }),
    [combinedListings]
  );

  const mapCenter: [number, number] = useMemo(() => {
    if (listingsForMap.length > 0) {
      const first = listingsForMap[0];
      if (isGoogleResult(first)) {
        return [first.geometry.location.lat, first.geometry.location.lng];
      }
      return [first.location.lat, first.location.lng];
    }
    return [coords.lat, coords.lng];
  }, [listingsForMap, coords]);

  const handleFilterChange = (newFilters: FilterState) => {
    let combinedQuery = newFilters.searchTerm;
    newFilters.subCategories.forEach(subCategory => {
      if (!combinedQuery.toLowerCase().includes(subCategory.toLowerCase())) {
        combinedQuery = `${combinedQuery} ${subCategory}`;
      }
    });

    if (newFilters.subCategories.length === 0 && newFilters.category) {
      if (!combinedQuery.toLowerCase().includes(newFilters.category.toLowerCase())) {
        combinedQuery = `${combinedQuery} ${newFilters.category}`;
      }
    }

    const updatedFilters = { ...newFilters, searchTerm: combinedQuery.trim() };
    setActiveFilters(updatedFilters);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (updatedFilters.searchTerm) {
      params.set('queryText', updatedFilters.searchTerm);
    }
    if (newFilters.category) {
      params.set('category', newFilters.category);
    }
    if (newFilters.subCategories.length > 0) {
      params.set('subcategory', newFilters.subCategories.join(','));
    }
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  const totalPages = Math.ceil((combinedListings?.length || 0) / listingsPerPage);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="w-1/3 h-full flex-shrink-0 hidden lg:block">
          <div className="bg-gray-200 w-full h-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (isSuccess)
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <AnimatePresence>
          {filtersVisible && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-0 z-40 md:relative md:w-80 md:h-full md:flex-shrink-0"
            >
              <FilterSidebar
                initialState={activeFilters}
                onFilterChange={handleFilterChange}
                onClose={() => setFiltersVisible(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col">
          <div className="flex-shrink-0 p-4 border-b bg-white z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <div className="hidden md:flex items-center border rounded-md">
                  <Button variant="ghost" size="icon">
                    <LayoutGrid className="h-5 w-5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-gray-100">
                    <List className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Listings</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
              {combinedListings && combinedListings.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">
                    No listings found
                  </h2>
                  <p className="text-gray-600 mb-6">
                    There are no listings that match your search criteria.
                  </p>
                  <Button
                    className="bg-orange-600 text-white hover:bg-orange-700"
                    onClick={handleAddNewListing}
                  >
                    Add New Listing
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {combinedListings &&
                      combinedListings.map(listing => (
                        <ListingCard
                          key={
                            isGoogleResult(listing)
                              ? listing.placeId
                              : listing.id
                          }
                          listing={listing}
                        />
                      ))}
                  </div>
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          size="icon"
                          className={
                            currentPage === page
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="w-1/3 h-screen sticky top-0 flex-shrink-0 hidden lg:block">
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
