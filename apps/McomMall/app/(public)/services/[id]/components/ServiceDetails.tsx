'use client';

import { useState } from 'react';
import { useGetServiceById } from '@/service/services/hook';
import { Button } from '@/components/ui/button';
import { Star, Heart, Clock, Users, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BookingModal } from '@/components/BookingModal';
import { Service } from '@/service/services/types';

const isImageUrl = (url: string) => {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

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
        <div className="grid md:grid-cols-2 gap-12">
          <div className="animate-pulse bg-gray-200 rounded-2xl h-[500px]"></div>
          <div className="space-y-6">
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
    return <div className="text-center py-20 text-red-500">Error loading service. Please try again later.</div>;
  }

  if (!service) {
    return <div className="text-center py-20">Service not found.</div>;
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
        return 'Enquire for Price';
    }
  };

  const firstImageUrl =
    service.media?.find(isImageUrl) || 'https://via.placeholder.com/500x500.png?text=No+Image';

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Service Image */}
          <div className="aspect-square relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <img
              src={firstImageUrl}
              alt={service.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Service Info */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                {service.name}
              </h1>
              <div className="flex items-center">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < 4 ? 'fill-current' : ''
                        }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-md text-gray-600">(5 customer reviews)</span>
              </div>
            </div>

            <div>
              <p className="text-5xl font-bold text-gray-900">
                {getPriceDisplay(service)}
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {service.description}
            </p>

            {/* Booking and Wishlist */}
            <div className="flex items-center space-x-6">
              <Button
                size="lg"
                className="flex-1 text-lg py-7 bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={() => toast.info('Wishlist functionality coming soon!')}>
                <Heart className="h-7 w-7 text-gray-400" />
              </Button>
            </div>

            {/* Service Details */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center text-gray-600">
                <Award className="h-5 w-5 mr-3 text-green-500" />
                <span>Professional & Verified Provider</span>
              </div>
              {service.pricingModel === 'perHour' && (
                <div className="flex items-center text-gray-600"><Clock className="h-5 w-5 mr-3 text-blue-500" /> Billed on an hourly basis</div>
              )}
              {service.enableGuestPricing && (
                <div className="flex items-center text-gray-600"><Users className="h-5 w-5 mr-3 text-orange-500" /> Custom pricing per guest available</div>
              )}
            </div>
          </div>
        </div>

        {/* Description, Reviews, etc. */}
        <div className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 text-lg p-2 h-auto">
              <TabsTrigger value="description" className="py-3">Service Details</TabsTrigger>
              <TabsTrigger value="reviews" className="py-3">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6 p-8 border rounded-lg text-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {service.description}
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6 p-8 border rounded-lg text-lg">
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