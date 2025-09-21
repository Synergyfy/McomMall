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
import { ReviewsTabContent } from '@/app/(public)/listings/[id]/components/ReviewsTabContent';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart'; // Import the useCart hook
import { useWishlist } from '@/hooks/useWishlist';
import {
  Heart,
  Clock,
  Info,
  Truck,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import ChatIcon from './ChatIcon';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

// You would create more detailed components for each tab
import { useState } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoyaltyContent from './LoyaltyContent';

function ProductPage({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) {
  const router = useRouter();
  const { addItemToCart } = useCart(); // Use the useCart hook
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({ productId: product.id, quantity: 1 });
    toast.success(`${product.title} has been added to your cart.`);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const isWishlisted = wishlist?.items?.some(
      item => item.product.id === product.id
    );
    if (isWishlisted) {
      removeItemFromWishlist(product.id);
      toast.success(`${product.title} has been removed from your wishlist.`);
    } else {
      addItemToWishlist({ productId: product.id });
      toast.success(`${product.title} has been added to your wishlist.`);
    }
  };

  const handleOrderNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/checkout?productId=${product.id}`);
  };

  const isGoogle = isGoogleResult(listing);

  if (isGoogle) {
    return <p>No products available for this listing.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold border-t pt-6">Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {(listing as InHouseBusiness).products?.map(product => (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            className="border rounded-lg p-4 flex flex-col transition-shadow hover:shadow-lg"
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
              <Button
                size="icon"
                className="absolute top-2 right-2 bg-white/70 hover:bg-white"
                onClick={e => handleWishlistToggle(e, product)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    wishlist?.items?.some(item => item.product.id === product.id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-500'
                  }`}
                />
              </Button>
              <ChatIcon
                receiverId={(listing as InHouseBusiness).user.id}
                listingName={product.title}
                buttonClassName="absolute top-14 right-2 bg-white/70 hover:bg-white"
                iconClassName="text-orange-600"
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
              onClick={e => handleAddToCart(e, product)}
            >
              Add to Cart
            </Button>
            <Button
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={e => handleOrderNow(e, product)}
            >
              Order Now
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useGetServicesByBusiness } from '@/service/services/hook';
import { BookingModal } from './BookingModal';
import { Service } from '@/service/services/types';

function ServicePage({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) {
  const isGoogle = isGoogleResult(listing);
  const businessId = isGoogle ? '' : (listing as InHouseBusiness).id;

  const {
    data: services,
    isLoading,
    isError,
  } = useGetServicesByBusiness(businessId);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBookNow = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const getPriceDisplay = (service: Service) => {
    switch (service.pricingModel.toUpperCase()) {
      case 'FIXED':
        return `£${service.fixedPrice}`;
      case 'HOURLY':
        return `£${service.pricePerHour}/hour`;
      case 'PER_UNIT':
        return `£${service.pricePerUnit}/${service.unitName}`;
      default:
        return 'Price not available';
    }
  };

  if (isGoogle) {
    return <p>No services available for this listing.</p>;
  }

  if (isLoading) {
    return <p>Loading services...</p>;
  }

  if (isError || !services || services.length === 0) {
    return <p>No services available for this listing.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold border-t pt-6">Services</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {services.map(service => (
          <Link
            href={`/services/${service.id}`}
            key={service.id}
            className="border rounded-lg p-4 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="relative w-full h-32 mb-2">
              <Image
                src={`https://source.unsplash.com/random/400x300?service&sig=${service.id}`}
                alt={service.name}
                layout="fill"
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold">{service.name}</h4>
              <p className="text-gray-600">{getPriceDisplay(service)}</p>
              {service.enableGuestPricing && (
                <p className="text-sm text-gray-500 mt-1">
                  Guest pricing: £{service.pricePerGuest} per guest
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {service.description}
              </p>
            </div>
            <Button
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={e => handleBookNow(e, service)}
            >
              Book Now
            </Button>
          </Link>
        ))}
      </div>
      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseModal}
      />
    </div>
  );
}

function OverviewSection({
  listing,
  isLoading,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
  isLoading: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const isGoogle = isGoogleResult(listing);
  const today = new Date().getDay();

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

  const location = isGoogle ? listing.geometry : listing.location;
  const address = isGoogle
    ? listing.formattedAddress || listing.vicinity
    : `${listing.location.addressLine1}, ${listing.location.city}`;
  const reviews = isGoogle ? listing.reviews : []; // In-house doesn't have reviews yet
  const businessId = isGoogle
    ? (listing as GooglePlaceResult).placeId
    : (listing as InHouseBusiness).id;

  if (isGoogle) {
    // Keeping Google result view simpler as requested
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Status:</strong> {listing.businessStatus}
            </p>
            <p>
              <strong>Types:</strong> {listing.types?.join(', ')}
            </p>
            {listing.openingHours && (
              <p>
                <strong>Availability:</strong>{' '}
                {listing.openingHours.openNow ? 'Open Now' : 'Closed'}
              </p>
            )}
          </div>
        </div>
        <div className="py-8">
          <LocationSection listing={location} address={address} />
        </div>
        <div className="bg-gray-50 py-8 px-6 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">FAQ</h3>
          <p className="text-gray-600">FAQ content goes here.</p>
        </div>
        <div className="py-8">
          <ReviewsTabContent businessId={businessId} />
        </div>
      </div>
    );
  }

  // InHouseBusiness
  return (
    <div className="-mx-6">
      {!isGoogle && !(listing as InHouseBusiness).isClaimed && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mx-6 mb-8 rounded-r-lg">
          <h3 className="text-xl font-bold text-yellow-800">
            Do you know the owner of this business?
          </h3>
          <p className="text-yellow-700 mt-2">
            Tell them to claim this listing to unlock more features and manage
            their business information.
          </p>
          <Button
            onClick={handleCopy}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isCopied ? 'Copied!' : 'Copy Listing URL'}
          </Button>
        </div>
      )}

      {/* About Section */}
      <div className="py-8 px-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          About {listing.businessName}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {listing.about || listing.shortDescription}
        </p>
      </div>

      {/* Opening Hours Section */}
      {listing.businessHours && listing.businessHours.length > 0 && (
        <div className="bg-slate-50 py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Opening Hours
          </h3>
          <ul className="space-y-2">
            {listing.businessHours
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map(hour => (
                <li
                  key={hour.id}
                  className={`flex justify-between p-3 rounded-lg ${
                    hour.dayOfWeek === today
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="font-semibold">
                    {daysOfWeek[hour.dayOfWeek]}
                  </span>
                  <span
                    className={
                      hour.dayOfWeek === today ? 'font-bold' : ''
                    }
                  >
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

      {/* Amenities Section */}
      {(listing.productSellerProfile || listing.serviceProviderProfile) && (
        <div className="py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Amenities & Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listing.productSellerProfile && (
              <>
                <div className="flex items-start space-x-3">
                  <Truck className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Selling Modes</h4>
                    <p className="text-gray-600">
                      {listing.productSellerProfile.sellingModes.join(', ')}
                    </p>
                  </div>
                </div>
                {listing.productSellerProfile.returnsPolicy && (
                  <div className="flex items-start space-x-3">
                    <Info className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">Returns Policy</h4>
                      <p className="text-gray-600">
                        {listing.productSellerProfile.returnsPolicy}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            {listing.serviceProviderProfile && (
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Booking Method</h4>
                  <p className="text-gray-600">
                    {listing.serviceProviderProfile.bookingMethod}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info Section */}
      {(listing.website || listing.businessEmail) && (
        <div className="bg-slate-50 py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Contact
          </h3>
          <div className="space-y-3">
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-red-500 hover:underline"
              >
                <Globe className="mr-2 h-5 w-5" />
                {listing.website}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="py-8 px-6">
        <LocationSection listing={location} address={address} />
      </div>

      <div className="bg-slate-50 py-8 px-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">FAQ</h3>
        <p className="text-gray-600">FAQ content goes here.</p>
      </div>

      <div className="py-8 px-6">
        <ReviewsTabContent businessId={businessId} />
      </div>
    </div>
  );
}

function AboutBusinessTabs({
  listing,
  isLoading,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
  isLoading: boolean;
}) {
  const isGoogle = isGoogleResult(listing);
  const businessId = isGoogle ? undefined : listing.id;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="loyalty">Loyalty & Reward</TabsTrigger>
        <TabsTrigger value="voucher">Voucher</TabsTrigger>
        <TabsTrigger value="gift-card">Gift Card</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewSection listing={listing} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="loyalty">
        <LoyaltyContent businessId={businessId} />
      </TabsContent>
      <TabsContent value="voucher">
        <p>Voucher content goes here.</p>
      </TabsContent>
      <TabsContent value="gift-card">
        <p>Gift Card content goes here.</p>
      </TabsContent>
    </Tabs>
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

  if (isGoogle) {
    // For Google listings, we can keep a simpler or different tab structure
    // if required. For now, let's keep it similar to the old "About" tab.
    return <AboutBusinessTabs listing={listing} isLoading={isLoading} />;
  }

  const inHouseListing = listing as InHouseBusiness;
  const listingType = inHouseListing.listingType ?? [];
  const hasProduct = listingType.includes('product');
  const hasService = listingType.includes('service');

  const tabs = [];
  if (hasProduct) {
    tabs.push({
      value: 'product-page',
      label: 'Products',
      component: <ProductPage listing={listing} />,
    });
  }
  if (hasService) {
    tabs.push({
      value: 'service-page',
      label: 'Services',
      component: <ServicePage listing={listing} />,
    });
  }
  tabs.push({
    value: 'about-business',
    label: 'About this business',
    component: <AboutBusinessTabs listing={listing} isLoading={isLoading} />,
  });

  const gridColsClass =
    tabs.length === 1
      ? 'grid-cols-1'
      : tabs.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-3';

  return (
    <Tabs defaultValue={tabs[0].value} className="w-full">
      <TabsList className={`grid w-full ${gridColsClass} mb-6`}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
