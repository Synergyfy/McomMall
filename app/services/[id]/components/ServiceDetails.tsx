'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useGetServiceById } from '@/service/services/hook';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, Heart, Clock, Calendar, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BookingModal } from '@/components/BookingModal';
import { Service } from '@/service/services/types';

type ServiceDetailsProps = {
  serviceId: string;
};

export default function ServiceDetails({ serviceId }: ServiceDetailsProps) {
  const { data: service, isLoading, isError } = useGetServiceById(serviceId);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
          <div>
            <div className="animate-pulse bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/4 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 w-1/2 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error loading service.</div>;
  }

  if (!service) {
    return <div>Service not found.</div>;
  }

  const getPriceDisplay = (service: Service) => {
    switch (service.pricingModel) {
      case 'fixed':
        return `£${service.fixedPrice}`;
      case 'perHour':
        return `£${service.pricePerHour}/hour`;
      case 'perUnit':
        return `£${service.pricePerUnit}/${service.unitName}`;
      default:
        return 'Price not available';
    }
  };

  const imageUrl =
    service.images?.[0] || 'https://via.placeholder.com/500x500.png?text=No+Image';

  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Service Image */}
          <div className="aspect-square relative w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {service.name}
              </h1>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">(5 Reviews)</span>
              </div>
            </div>

            <div>
              <p className="text-4xl font-bold text-gray-900">
                {getPriceDisplay(service)}
              </p>
            </div>

            <p className="text-gray-600 text-base leading-relaxed">
              {service.description}
            </p>

            {/* Booking and Wishlist */}
            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
              <Button variant="outline" size="icon" onClick={() => toast.info('Wishlist functionality coming soon!')}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Service Details */}
            <div className="text-sm text-gray-500 space-y-2 pt-4 border-t">
              {service.pricingModel === 'perHour' && (
                  <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Billed hourly</p>
              )}
              {service.enableGuestPricing && (
                <p className="flex items-center"><Users className="h-4 w-4 mr-2" /> Priced per guest</p>
              )}
            </div>
          </div>
        </div>

        {/* Description, Reviews, etc. */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Service Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4 p-6 border rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">
                {service.description}
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 p-6 border rounded-md">
              <p className="text-gray-700">No reviews yet.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BookingModal
        service={service}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
