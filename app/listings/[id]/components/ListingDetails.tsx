'use client';

import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle, Heart } from 'lucide-react';

import {
  useGetBusinessData,
  useGetGoogleListing,
} from '@/service/listings/hook';
import { useAuth } from '@/service/auth/hook';
import { useWishlist } from '@/hooks/useWishlist';
import { Photo } from '@/service/listings/types';
import { Button } from '@/components/ui/button';
import { VerificationFeeDialog } from '@/components/VerificationFeeDialog';
import BookingSidebar from '@/components/BookingSidebar';
import ContentTabs from '@/components/ContentTabs';
import ImageGallery from '@/components/ImageGallery';

type ClientListingDetailProps = {
  placeId: string;
};

export default function ClientListingDetail({
  placeId,
}: ClientListingDetailProps) {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  const isGoogle = source !== 'in-house';

  const googleListingQuery = useGetGoogleListing({
    placeId: placeId,
  });

  const inHouseListingQuery = useGetBusinessData({
    id: placeId,
  });

  const {
    data: listing,
    isSuccess,
    isLoading,
  } = isGoogle ? googleListingQuery : inHouseListingQuery;

  const { user: currentUser } = useAuth();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();

  const isWishlisted = wishlist?.items?.some(
    item => item.product.id === placeId
  );

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeItemFromWishlist(placeId);
    } else {
      addItemToWishlist({ productId: placeId });
    }
  };

  if (isLoading) return <p>Loading...</p>;

  let imageUrls: string[] = [];
  if (isSuccess && listing) {
    if (isGoogle && listing.photos && listing.photos.length > 0) {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://mcom-mall-api.vercel.app/api/v1';
      imageUrls = listing.photos
        .slice(0, 5)
        .map(
          (photo: Photo) =>
            `${API_URL}/google/google-business/photo/${photo.photoReference}`
        );
    } else if (!isGoogle && listing.logoUrl) {
      imageUrls.push(listing.logoUrl);
    } else {
      imageUrls.push(
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      );
    }

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
                      ? listing.types?.[0]
                      : listing.categories?.[0]?.name}
                  </span>
                  {listing.priceLevel && (
                    <span className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded-md">
                      {listing?.priceLevel}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {isGoogle ? listing.name : listing.businessName}
                </h1>
                <p className="text-md text-gray-500 mt-1">
                  {isGoogle
                    ? listing?.formattedAddress || listing?.vicinity
                    : `${listing.location.addressLine1}, ${listing.location.city}`}
                </p>
                {isGoogle && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-bold">
                      {listing?.rating?.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({listing?.userRatingsTotal} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-4">
                <Button variant="outline" onClick={handleWishlistToggle}>
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isWishlisted ? 'text-red-500 fill-current' : ''
                    }`}
                  />
                  {isWishlisted
                    ? 'Remove from Wishlist'
                    : 'Add to Wishlist'}
                </Button>
                {listing?.isClaimed ? (
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
              {listing && (
                <ContentTabs listing={listing} isLoading={isLoading} />
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BookingSidebar
                  phoneNumber={
                    isGoogle
                      ? listing.formattedPhoneNumber || ''
                      : listing.businessPhone
                  }
                  priceDisplay={String(listing?.priceLevel ?? '')}
                  author={{
                    id: isGoogle ? '' : listing?.user?.id ?? '',
                    name: isGoogle
                      ? listing?.name ?? ''
                      : listing?.user?.name ?? listing.businessName,
                    avatarUrl: '', // Provide a default or actual avatar URL if available
                    bio: '', // Provide a default or actual bio if available
                  }}
                  currentUserId={currentUser?.id}
                  isVerified={listing.isGoogleVerified}
                  businessId={placeId}
                  listingType={isGoogle ? [] : listing.listingType}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
