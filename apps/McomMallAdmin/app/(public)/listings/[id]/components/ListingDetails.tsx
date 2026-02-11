'use client';

import { useSearchParams } from 'next/navigation';
import {
  useGetBusinessData,
  useGetGoogleListing,
} from '@/service/listings/hook';
import { useWishlist } from '@/hooks/useWishlist';
import {
  Photo,
  InHouseBusiness,
  GooglePlaceResult,
} from '@/service/listings/types';
import ListingPage from './ListingPage';

type ClientListingDetailProps = {
  placeId: string;
};

function isGooglePlaceResult(
  listing: InHouseBusiness | GooglePlaceResult
): listing is GooglePlaceResult {
  return 'name' in listing && !('businessName' in listing);
}

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
  if (!listing) return <p>Listing not found</p>;

  let imageUrls: string[] = [];
  if (isSuccess) {
    if (isGoogle && isGooglePlaceResult(listing) && listing.photos && listing.photos.length > 0) {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://mcom-mall-api.vercel.app/api/v1';
      imageUrls = listing.photos
        .slice(0, 5)
        .map(
          (photo: Photo) =>
            `${API_URL}/google/google-business/photo/${photo.photo_reference}`
        );
    } else if (!isGoogle && !isGooglePlaceResult(listing) && listing.logoUrl) {
      imageUrls.push(listing.logoUrl);
    } else {
      imageUrls.push(
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      );
    }
  }

  return (
    <ListingPage
      listing={listing}
      isGoogle={isGoogle}
      isWishlisted={isWishlisted || false}
      handleWishlistToggle={handleWishlistToggle}
      imageUrls={imageUrls}
      placeId={placeId}
      isLoading={isLoading}
    />
  );
}
