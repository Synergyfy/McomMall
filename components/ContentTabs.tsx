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

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

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
import GiftCardTabContent from '@/app/(public)/listings/[id]/components/GiftCardTabContent';
import VoucherContent from './VoucherContent';

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
        {(listing as InHouseBusiness).products?.map(product => {
          const firstImageUrl = product.fileUrls?.find(isImageUrl) || product.imageUrl;
          return (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            className="border rounded-lg p-4 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="relative w-full h-32 mb-2">
              <Image
                src={
                  firstImageUrl ||
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
        )})}
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
        {services.map(service => {
          const firstImageUrl = service.images?.find(isImageUrl);
          return (
          <Link
            href={`/services/${service.id}`}
            key={service.id}
            className="border rounded-lg p-4 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="relative w-full h-32 mb-2">
              <Image
                src={firstImageUrl || `https://source.unsplash.com/random/400x300?service&sig=${service.id}`}
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
        )})}
      </div>
      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseModal}
      />
    </div>
  );
}

import OverviewSection from './OverviewSection';

function PromotionsTabs({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) {
  const isGoogle = isGoogleResult(listing);
  const businessId = isGoogle ? undefined : (listing as InHouseBusiness).id;

  return (
    <Tabs defaultValue="loyalty" className="w-full">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-3 mb-6 min-w-max">
          <TabsTrigger value="loyalty">Loyalty & Reward</TabsTrigger>
          <TabsTrigger value="voucher">Voucher</TabsTrigger>
          <TabsTrigger value="gift-card">Gift Card</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="loyalty">
        <LoyaltyContent businessId={businessId} />
      </TabsContent>
      <TabsContent value="voucher">
        <VoucherContent businessId={businessId} />
      </TabsContent>
      <TabsContent value="gift-card">
        {businessId ? (
          <GiftCardTabContent businessId={businessId} />
        ) : (
          <p>Gift cards are not available for this listing.</p>
        )}
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

  const tabs = [];
  if (!isGoogle) {
    const inHouseListing = listing as InHouseBusiness;
    const listingType = inHouseListing.listingType ?? [];
    const hasProduct = listingType.includes('product');
    const hasService = listingType.includes('service');

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
  }

  tabs.push({
    value: 'promotions',
    label: 'Promotions',
    component: <PromotionsTabs listing={listing} />,
  });
  tabs.push({
    value: 'about-business',
    label: 'About this business',
    component: <OverviewSection listing={listing} isLoading={isLoading} />,
  });

  const gridColsClass =
    tabs.length === 1
      ? 'grid-cols-1'
      : tabs.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-3';

  return (
    <Tabs defaultValue={tabs[0].value} className="w-full">
      <div className="overflow-x-auto">
        <TabsList className={`grid w-full ${gridColsClass} mb-6 min-w-max`}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
