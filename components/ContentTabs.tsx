// app/components/listing-detail/ContentTabs.tsx
'use client';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LocationSection from './locationSection';
import {
  GooglePlaceResult,
  InHouseBusiness,
  Product,
} from '@/service/listings/types';
import { ReviewsTabContent } from '@/app/listings/[id]/components/ReviewsTabContent';
import { useDispatch } from 'react-redux';
import { addProduct } from '@/service/store/cartSlice';
import { toast } from 'sonner';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'place_id' in listing;
}

// You would create more detailed components for each tab
import { useState } from 'react';

import { useRouter } from 'next/navigation';
function OverviewSection({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAddToCart = (product: Product) => {
    dispatch(addProduct(product));
    toast.success(`${product.title} has been added to your cart.`);
  };

  const handleOrderNow = (product: Product) => {
    router.push(`/checkout?productId=${product.id}`);
  };
  const isGoogle = isGoogleResult(listing);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      },
      err => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${minutes} ${ampm}`;
  };

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  if (isGoogle) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Business Status</h3>
          <p className="text-gray-600">{listing.business_status}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Types</h3>
          <p className="text-gray-600">{listing.types?.join(', ')}</p>
        </div>
        {listing.opening_hours && (
          <div>
            <h3 className="text-lg font-semibold">Availability</h3>
            <p className="text-gray-600">
              {listing.opening_hours.open_now ? 'Open Now' : 'Closed'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // InHouseBusiness
  return (
    <div className="space-y-6">
      {!isGoogle && !(listing as InHouseBusiness).isClaimed && (
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold">
            Do you know the owner of this business?
          </h3>
          <p className="text-gray-700 mt-2">
            Tell them to claim this listing to unlock more features and manage
            their business information.
          </p>
          <Button
            onClick={handleCopy}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
          >
            {isCopied ? 'Copied!' : 'Copy Listing URL'}
          </Button>
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold">
          About {listing.businessName}
        </h3>
        <p className="text-gray-700 leading-relaxed mt-2">
          {listing.about || listing.shortDescription}
        </p>
      </div>

      {listing.businessHours && listing.businessHours.length > 0 && (
        <div>
          <h3 className="text-xl font-bold border-t pt-6">
            Opening Hours
          </h3>
          <ul className="text-gray-700 mt-2 space-y-1">
            {listing.businessHours
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map(hour => (
                <li key={hour.id} className="flex justify-between">
                  <span>{daysOfWeek[hour.dayOfWeek]}</span>
                  <span>
                    {hour.is24h
                      ? '24 Hours'
                      : `${formatTime(hour.openTime)} - ${formatTime(
                          hour.closeTime
                        )}`}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {listing.productSellerProfile && (
        <div>
          <h3 className="text-xl font-bold border-t pt-6">
            Seller Information
          </h3>
          <div className="text-gray-700 mt-2 space-y-2">
            <p>
              <strong>Selling Modes:</strong>{' '}
              {listing.productSellerProfile.sellingModes.join(', ')}
            </p>
            {listing.productSellerProfile.returnsPolicy && (
              <p>
                <strong>Returns Policy:</strong>{' '}
                {listing.productSellerProfile.returnsPolicy}
              </p>
            )}
            {listing.productSellerProfile.fulfilmentNotes && (
              <p>
                <strong>Fulfilment Notes:</strong>{' '}
                {listing.productSellerProfile.fulfilmentNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {listing.serviceProviderProfile && (
        <div>
          <h3 className="text-xl font-bold border-t pt-6">
            Service Information
          </h3>
          <div className="text-gray-700 mt-2 space-y-2">
            <p>
              <strong>Booking Method:</strong>{' '}
              {listing.serviceProviderProfile.bookingMethod}
            </p>
            {listing.serviceProviderProfile.bookingUrl && (
              <p>
                <strong>Book Online:</strong>{' '}
                <a
                  href={listing.serviceProviderProfile.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline"
                >
                  {listing.serviceProviderProfile.bookingUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {listing.products && listing.products.length > 0 && (
        <div>
          <h3 className="text-xl font-bold border-t pt-6">Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {listing.products.map(product => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex flex-col"
              >
                <div className="relative w-full h-32 mb-2">
                  <Image
                    src={
                      product.imageUrl ||
                      'https://plus.unsplash.com/premium_photo-1664392147011-2a720f214e01?q=80&w=878&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                    alt={product.title}
                    layout="fill"
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">{product.title}</h4>
                  <p className="text-gray-600">£{product.price.toFixed(2)}</p>
                  {product.shortDescription && (
                    <p className="text-sm text-gray-500 mt-1">
                      {product.shortDescription}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
                <Button
                  className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => handleOrderNow(product)}
                >
                  Order Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(listing.website || listing.businessEmail) && (
        <div>
          <h3 className="text-xl font-bold border-t pt-6">
            Contact Information
          </h3>
          <div className="flex flex-col space-y-2 mt-2">
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline"
              >
                {listing.website}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentTabs({
  listing,
  isLoading,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
  isLoading: boolean;
}) {
  const isGoogle = isGoogleResult(listing);
  const location = isGoogle ? listing.geometry : listing.location;
  const address = isGoogle
    ? listing.formatted_address || listing.vicinity
    : `${listing.location.addressLine1}, ${listing.location.city}`;
  const reviews = isGoogle ? listing.reviews : []; // In-house doesn't have reviews yet

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewSection listing={listing} />
      </TabsContent>
      <TabsContent value="location">
        <LocationSection listing={location} address={address} />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsTabContent reviews={reviews} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
