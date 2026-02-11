'use client';

import { Star, CheckCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VerificationFeeDialog } from '@/components/VerificationFeeDialog';
import BookingSidebar from '@/components/BookingSidebar';
import ContentTabs from '@/components/ContentTabs';
import ImageGallery from '@/components/ImageGallery';
import { useAuth } from '@/service/auth/hook';
import {
  GooglePlaceResult,
  InHouseBusiness,
} from '@/service/listings/types';

type Listing = GooglePlaceResult | InHouseBusiness;

interface ListingPageProps {
  listing: Listing;
  isGoogle: boolean;
  isWishlisted: boolean;
  handleWishlistToggle: () => void;
  imageUrls: string[];
  placeId: string;
  isLoading: boolean;
}

export default function ListingPage({
  listing,
  isGoogle,
  isWishlisted,
  handleWishlistToggle,
  imageUrls,
  placeId,
  isLoading,
}: ListingPageProps) {
  const { user: currentUser } = useAuth();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 text-xs text-white bg-red-500 rounded-md">
                  {isGoogle
                    ? (listing as GooglePlaceResult).types?.[0]
                    : (listing as InHouseBusiness).categories?.[0]?.name}
                </span>
                {isGoogle && (listing as GooglePlaceResult).priceLevel && (
                  <span className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded-md">
                    {(listing as GooglePlaceResult).priceLevel}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isGoogle
                  ? (listing as GooglePlaceResult).name
                  : (listing as InHouseBusiness).businessName}
              </h1>
              <p className="text-md text-gray-500 mt-1">
                {isGoogle
                  ? (listing as GooglePlaceResult)?.formatted_address ||
                  (listing as GooglePlaceResult)?.vicinity
                  : (listing as InHouseBusiness).location
                    ? `${(listing as InHouseBusiness).location?.addressLine1}, ${(listing as InHouseBusiness).location?.city
                    }`
                    : ''}
              </p>
              {isGoogle && (
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-bold">
                    {(listing as GooglePlaceResult)?.rating?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    (
                    {(listing as GooglePlaceResult)?.user_ratings_total} reviews)
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-4">
              <Button variant="outline" onClick={handleWishlistToggle}>
                <Heart
                  className={`mr-2 h-4 w-4 ${isWishlisted ? 'text-red-500 fill-current' : ''
                    }`}
                />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
              {(listing as InHouseBusiness)?.isClaimed ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-600">
                    Verified Listing
                  </span>
                </div>
              ) : (
                <VerificationFeeDialog listingId={placeId} />
              )}
            </div>
          </div>
        </header>

        {/* Image Gallery */}
        <ImageGallery images={imageUrls} />

        {/* Main Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {listing && <ContentTabs listing={listing} isLoading={isLoading} />}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSidebar
                phoneNumber={
                  isGoogle
                    ? (listing as GooglePlaceResult).formatted_phone_number || ''
                    : (listing as InHouseBusiness).businessPhone ?? ''
                }
                priceDisplay={isGoogle ? String((listing as GooglePlaceResult)?.priceLevel ?? '') : ''}
                author={{
                  id: isGoogle
                    ? ''
                    : (listing as InHouseBusiness)?.user?.id ?? '',
                  name: isGoogle
                    ? (listing as GooglePlaceResult)?.name ?? ''
                    : (listing as InHouseBusiness)?.user?.name ??
                    (listing as InHouseBusiness).businessName ?? '',
                  email: isGoogle
                    ? ''
                    : (listing as InHouseBusiness)?.user?.email ?? '',
                  avatarUrl: '', // Provide a default or actual avatar URL if available
                  bio: '', // Provide a default or actual bio if available
                }}
                currentUserId={currentUser?.id}
                isVerified={(listing as InHouseBusiness).isGoogleVerified ?? false}
                businessId={placeId}
                listingType={
                  isGoogle ? [] : (listing as InHouseBusiness).listingType ?? []
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
