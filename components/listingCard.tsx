'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
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
  Wifi,
  ParkingSquare,
  Zap,
  Gauge,
  CheckCircle,
} from 'lucide-react';
import { Amenity, Listing } from '@/lib/listing-data';
import Link from 'next/link';
import { GooglePlaceResult, InHouseBusiness } from '@/service/listings/types';

// Helper objects to map amenities to icons and tooltips
const amenityIcons: Record<Amenity, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4 text-gray-500" />,
  parking: <ParkingSquare className="w-4 h-4 text-gray-500" />,
  power: <Zap className="w-4 h-4 text-gray-500" />,
  transmission: <Gauge className="w-4 h-4 text-gray-500" />,
  storage: <Gauge className="w-4 h-4 text-gray-500" />,
  condition: <Gauge className="w-4 h-4 text-gray-500" />,
  remote: <Gauge className="w-4 h-4 text-gray-500" />,
  pets: <Gauge className="w-4 h-4 text-gray-500" />,
};

const amenityTooltips: Record<Amenity, string> = {
  wifi: 'Free WiFi',
  parking: 'Parking Available',
  power: '443 Power (hp)',
  transmission: '8-speed PDK',
  storage: 'Ample Storage',
  condition: 'Excellent Condition',
  remote: 'Remote Start',
  pets: 'Pet Friendly',
};

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'place_id' in listing;
}

export default function ListingCard({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) {
  const isGoogle = isGoogleResult(listing);

  let imgUrl;
  if (isGoogle) {
    if (listing.photos && listing.photos.length > 0) {
      const { photo_reference } = listing.photos[0];
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://mcom-mall-api.vercel.app/api/v1';
      imgUrl = `${API_URL}/google/google-business/photo/${photo_reference}`;
    } else {
      imgUrl =
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
    }
  } else {
    imgUrl =
      listing.logoUrl ||
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
  }

  const name = isGoogle ? listing.name : listing.businessName;
  const place_id = isGoogle ? listing.place_id : listing.id;
  const category =
    (isGoogle
      ? listing.types?.[0]
      : (listing as InHouseBusiness).categories?.[0]?.name) || 'Business';
  const vicinity = isGoogle
    ? listing.vicinity
    : listing.location
    ? `${listing.location.addressLine1}, ${listing.location.city}`
    : '';
  const rating = isGoogle ? listing.rating : undefined; // InHouseBusiness doesn't have rating
  const ratingCount = isGoogle ? listing.user_ratings_total : undefined;
  const priceLevel = isGoogle ? listing.price_level : undefined;
  const isVerified = isGoogle ? false : listing.isGoogleVerified;
  const altText = isGoogle
    ? listing.name
    : listing.logoAltText || listing.businessName;

  const listingId = isGoogle ? place_id : listing.id;
  const href = isGoogle
    ? `/listings/${listingId}`
    : `/listings/${listingId}?source=in-house`;

  return (
    <Link href={href} className="block">
      <Card className="w-full overflow-hidden shadow-md border rounded-xl hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          {/* Category Tag */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 text-xs text-white bg-red-500 rounded-md">
              {category}
            </span>
          </div>

          {/* Wishlist Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to Wishlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Listing Image */}
          <Image
            src={imgUrl}
            alt={altText}
            width={400}
            height={250}
            className="object-cover w-full h-56"
          />
        </div>

        {/* Card Content */}
        <CardContent className="p-4 bg-white">
          <h3 className="text-lg font-bold truncate text-gray-800">{name}</h3>
          {isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified Listing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{vicinity}</span>
          </div>

          {/* Rating and Price */}
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center">
              {rating && (
                <>
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold ml-1">
                    {rating?.toFixed(1)}
                  </span>
                </>
              )}
              {ratingCount && (
                <span className="text-sm text-gray-500 ml-1">
                  ({ratingCount})
                </span>
              )}
            </div>
            {priceLevel && (
              <p className="text-base font-semibold text-gray-900">
                {priceLevel}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
