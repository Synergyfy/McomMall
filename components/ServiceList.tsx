"use client";
import { PartnershipService } from "@/service/partnerships/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Image from "next/image";

interface ServiceListProps {
  services: PartnershipService[];
}

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No services available for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">{service.name}</CardTitle>
              <Badge
                variant={service.pricingModel === 'fixed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {service.pricingModel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {service.media && service.media.length > 0 && (
              <Carousel className="w-full max-w-full mb-4">
                <CarouselContent>
                  {service.media.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={url}
                          alt={`${service.name} image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
            <div className="flex justify-end items-center text-lg font-semibold text-gray-900 dark:text-white">
              {service.pricingModel === 'fixed' && service.fixedPrice && (
                <span>${service.fixedPrice.toFixed(2)}</span>
              )}
              {service.pricingModel === 'hourly' && service.hourlyRate && (
                <span>${service.hourlyRate.toFixed(2)}/hour</span>
              )}
              {service.pricingModel === 'quote' && (
                <span className="text-sm font-normal text-gray-500">Price available upon request</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceList;