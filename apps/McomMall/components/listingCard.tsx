'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin,
  Star,
  Heart,
  CheckCircle,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GooglePlaceResult, InHouseBusiness } from '@/service/listings/types';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

function getListingImageUrl(listing: GooglePlaceResult | InHouseBusiness): string {
  const isGoogle = isGoogleResult(listing);
  let imgUrl = '';

  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mcom-mall-api.vercel.app/api/v1';

  // Normalize API_URL by removing trailing slash if present
  const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

  // Base API host (without /api/v1) for serving static media/uploads
  const API_BASE = API_URL.replace('/api/v1', '');

  if (isGoogle) {
    if (listing.photos && listing.photos.length > 0) {
      const { photoReference } = listing.photos[0];
      if (photoReference) {
        imgUrl = `${API_URL}/google/google-business/photo/${photoReference}`;
      }
    }
  } else {
    const inHouse = listing as InHouseBusiness;
    imgUrl = inHouse.logoUrl || inHouse.bannerUrl || (inHouse.media && inHouse.media.length > 0 ? inHouse.media[0] : '');

    if (imgUrl) {
      // If it's a relative path starting with /uploads or uploads
      if (imgUrl.startsWith('/') || imgUrl.startsWith('uploads/')) {
        const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
        imgUrl = `${API_BASE}${cleanPath}`;
      }
    }
  }

  // Premium, thematic fallback images from Unsplash (which is already configured in next.config.ts remote patterns)
  if (!imgUrl) {
    const nameLower = (isGoogle ? listing.name : listing.businessName || '').toLowerCase();
    
    let categoryName = '';
    if (isGoogle) {
      categoryName = listing.types?.[0] || '';
    } else {
      const inHouse = listing as InHouseBusiness;
      categoryName = inHouse.category?.name || inHouse.categories?.map(c => c.name).join(' ') || '';
    }
    const catLower = categoryName.toLowerCase();

    if (nameLower.includes('cafe') || nameLower.includes('coffee') || catLower.includes('cafe') || catLower.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'; // Beautiful Coffee Shop
    }
    if (nameLower.includes('restaurant') || nameLower.includes('food') || catLower.includes('restaurant') || catLower.includes('food')) {
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'; // Beautiful Restaurant
    }
    if (nameLower.includes('store') || nameLower.includes('shop') || catLower.includes('store') || catLower.includes('shop') || catLower.includes('retail')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'; // Beautiful Retail Shop
    }
    if (catLower.includes('beauty') || catLower.includes('spa') || catLower.includes('salon') || catLower.includes('health') || catLower.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80'; // Beautiful Spa / Wellness / Fitness
    }
    
    // Default high-quality modern office / storefront placeholder
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
  }

  return imgUrl;
}

export default function ListingCard({
  listing,
  layout = 'grid',
}: {
  listing: GooglePlaceResult | InHouseBusiness;
  layout: 'grid' | 'list';
}) {
  const isGoogle = isGoogleResult(listing);
  const finalImgUrl = getListingImageUrl(listing);

  const name = isGoogle ? listing.name : listing.businessName;
  const category = (isGoogle ? listing.types?.[0] : ((listing as InHouseBusiness).category?.name || (listing as InHouseBusiness).categories?.[0]?.name)) || null;
  const vicinity = isGoogle
    ? listing.formattedAddress || listing.vicinity
    : (listing as InHouseBusiness).location
    ? `${(listing as InHouseBusiness).location.city}${ (listing as InHouseBusiness).location.postcode ? ', ' + (listing as InHouseBusiness).location.postcode : ''}`
    : null;
  
  const shortDescription = isGoogle
    ? listing.businessStatus ? `Status: ${listing.businessStatus}` : null
    : (listing as InHouseBusiness).shortDescription;
    
  const rating = isGoogle ? listing.rating : null; 
  const ratingCount = isGoogle ? listing.userRatingsTotal : null;
  const isVerified = isGoogle ? true : (listing as InHouseBusiness).isVerified || (listing as InHouseBusiness).isGoogleVerified;
  
  const listingId = isGoogle ? listing.placeId : (listing as InHouseBusiness).id;
  const href = isGoogle
    ? `/listings/${listingId}`
    : `/listings/${listingId}?source=in-house`;

  const dateStr = !isGoogle && (listing as InHouseBusiness).createdAt 
    ? new Date((listing as InHouseBusiness).createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="group relative"
      >
        <Link href={href} className="block">
          <Card className="w-full overflow-hidden border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 rounded-3xl flex flex-col md:flex-row h-full">
            <div className="relative md:w-80 h-64 md:h-auto overflow-hidden bg-gray-100">
              {finalImgUrl && (
                <Image
                  src={finalImgUrl}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {category && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-[#f58220] rounded-full shadow-lg">
                    {category}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#f58220] transition-colors line-clamp-1">{name}</h3>
                    {isVerified && <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
                  </div>
                  {vicinity && (
                    <div className="flex items-center text-gray-400 font-bold text-sm">
                      <MapPin className="w-4 h-4 mr-1 text-[#f58220]" />
                      {vicinity}
                    </div>
                  )}
                </div>
                <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {shortDescription && (
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6">
                  {shortDescription}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-6">
                  {rating !== null && rating !== undefined && rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-black text-gray-900">{rating.toFixed(1)}</span>
                      {ratingCount !== null && (
                        <span className="text-xs font-bold text-gray-400">({ratingCount})</span>
                      )}
                    </div>
                  )}
                  {dateStr && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                      <Clock size={14} /> {dateStr}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[#f58220] font-black text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                  View Business <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="group h-full"
    >
      <Link href={href} className="block h-full">
        <Card className="h-full overflow-hidden border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2.5rem] flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {finalImgUrl && (
              <Image
                src={finalImgUrl}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Overlay Elements */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
              {category ? (
                <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-black/20 backdrop-blur-md border border-white/20 rounded-full">
                  {category}
                </span>
              ) : <div />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white hover:text-red-500 transition-all duration-300">
                      <Heart className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Favourites</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Price/Quick Info Badge */}
            {rating !== null && rating !== undefined && rating > 0 && (
              <div className="absolute bottom-5 left-5 z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white px-4 py-2 rounded-xl shadow-xl">
                   <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-black text-gray-900">{rating.toFixed(1)}</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-black text-gray-900 group-hover:text-[#f58220] transition-colors truncate flex-1">{name}</h3>
              {isVerified && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" />}
            </div>

            {vicinity && (
              <div className="flex items-center text-gray-400 font-bold text-xs mb-4">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#f58220]" />
                <span className="truncate">{vicinity}</span>
              </div>
            )}

            {shortDescription && (
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-6 flex-1">
                {shortDescription}
              </p>
            )}

            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
               <div className="flex items-center">
                  {dateStr && (
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> {dateStr}
                    </span>
                  )}
               </div>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-[#f58220] group-hover:text-white transition-all duration-300">
                  <ArrowUpRight size={20} />
               </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
