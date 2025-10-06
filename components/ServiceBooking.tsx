"use client";
import React, { useState } from 'react';
import { PartnershipService } from '@/service/partnerships/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { Button } from './ui/button';
import { Zap, Tag, Clock, Users, Calendar, CheckCircle } from 'lucide-react';
import { DateTimePicker } from './ui/date-time-picker';
import { ServiceBookingDetailsDto } from '@/hooks/useCheckout';

interface ServiceBookingProps {
  service: PartnershipService;
  onBookingConfirmation?: (bookingDetails: ServiceBookingDetailsDto) => void;
}

const ServiceBooking: React.FC<ServiceBookingProps> = ({ service, onBookingConfirmation }) => {
  const [selectedDateTime, setSelectedDateTime] = useState<{ start: Date; end: Date } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleDateTimeChange = (dateTime: { start: Date; end: Date } | null) => {
    setSelectedDateTime(dateTime);
  };

  const handleConfirmBooking = () => {
    if (selectedDateTime && onBookingConfirmation) {
      const bookingDetails: ServiceBookingDetailsDto = {
        serviceId: service.id,
        startTime: selectedDateTime.start.toISOString(),
        endTime: selectedDateTime.end.toISOString(),
      };
      onBookingConfirmation(bookingDetails);
      setIsBooking(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl border-transparent hover:border-orange-500 border-2">
      <div className="grid md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="relative h-full min-h-[250px]">
            <Image
              src={service.media && service.media.length > 0 ? service.media[0] : 'https://via.placeholder.com/400x400.png?text=Service'}
              alt={service.name}
              layout="fill"
              objectFit="cover"
              className="rounded-l-2xl"
            />
          </div>
        </div>
        <div className="md:col-span-8 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold text-gray-800">{service.name}</CardTitle>
              <Badge
                className="capitalize text-sm py-1 px-3 rounded-full"
                variant={service.pricingModel === 'fixed' ? 'default' : 'secondary'}
              >
                {service.pricingModel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <p className="text-gray-600 mb-6">{service.description}</p>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-3">
              <h4 className="text-lg font-semibold text-orange-800 mb-2">Pricing Details</h4>
              <div className="space-y-2">
                {service.pricingModel === 'fixed' && typeof service.fixedPrice === 'number' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 flex items-center"><Tag className="mr-2 h-5 w-5 text-orange-500"/>Standard Price:</span>
                    <span className="font-bold text-2xl text-gray-900">${service.fixedPrice.toFixed(2)}</span>
                  </div>
                )}
                {service.pricingModel === 'hourly' && typeof service.hourlyRate === 'number' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 flex items-center"><Clock className="mr-2 h-5 w-5 text-orange-500"/>Hourly Rate:</span>
                    <span className="font-bold text-2xl text-gray-900">${service.hourlyRate.toFixed(2)}/hour</span>
                  </div>
                )}
                {service.enableGuestPricing && typeof service.guestPrice === 'number' && (
                  <div className="flex justify-between items-center text-green-700">
                    <span className="font-semibold flex items-center"><Users className="mr-2 h-5 w-5 text-green-500"/>Guest Price:</span>
                    <span className="font-bold text-2xl">${service.guestPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {onBookingConfirmation && (
              <>
                {isBooking ? (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Select a Date and Time</h3>
                    <DateTimePicker onDateTimeChange={handleDateTimeChange} />
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" onClick={() => setIsBooking(false)}>Cancel</Button>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={!selectedDateTime}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-6">
                    <Button
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 rounded-full"
                      onClick={() => setIsBooking(true)}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Book This Service
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ServiceBooking;