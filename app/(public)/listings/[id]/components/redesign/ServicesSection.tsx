
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Service } from '@/service/services/types';
import { useState } from 'react';
import { BookingModal } from '@/components/BookingModal';
import Image from 'next/image';

interface ServicesSectionProps {
  businessId: string;
}

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

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

export default function ServicesSection({ businessId }: ServicesSectionProps) {
  const { data: services, isLoading, isError } = useGetServicesByBusiness(businessId);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBookNow = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (isError || !services || services.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="py-12"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
            Our <span className="text-orange-600">Services</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const firstImageUrl = service.images?.find(isImageUrl);
              return (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="flex flex-col h-full overflow-hidden border border-orange-200/80 hover:border-orange-400 transition-all duration-300 bg-white">
                    <CardHeader className="p-0 border-b border-orange-200/80">
                    <div className="relative h-48 w-full">
                        <Image
                          src={
                            firstImageUrl ||
                            `https://source.unsplash.com/random/400x300?service&sig=${service.id}`
                          }
                          alt={service.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {service.name}
                      </CardTitle>
                      <p className="text-gray-600 text-sm">
                        {service.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 bg-gray-50/50 flex-col items-start space-y-2">
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xl font-extrabold text-orange-600">
                          {getPriceDisplay(service)}
                        </p>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                        onClick={(e) => handleBookNow(e, service)}
                      >
                        Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseModal}
      />
    </>
  );
}
