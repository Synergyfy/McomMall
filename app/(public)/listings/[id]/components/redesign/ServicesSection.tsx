
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

  if (isLoading) {
    return <p>Loading services...</p>;
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
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const firstImageUrl = service.images?.find(isImageUrl);
            return (
              <motion.div key={service.id} whileHover={{ y: -5 }} className="h-full">
                <Card className="flex flex-col h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-56 w-full">
                      <Image
                        src={firstImageUrl || `https://source.unsplash.com/random/400x300?service&sig=${service.id}`}
                        alt={service.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-xl font-semibold text-gray-800 mb-2">{service.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50 flex-col items-start">
                    <div className="flex justify-between items-center w-full mb-4">
                      <p className="text-lg font-bold text-orange-600">{getPriceDisplay(service)}</p>
                    </div>
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={(e) => handleBookNow(e, service)}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
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
