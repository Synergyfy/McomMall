"use client";
import { PartnershipService } from "@/service/partnerships/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { Button } from "./ui/button";
import { ShoppingCart, Zap } from "lucide-react";

interface ServiceListProps {
  services: PartnershipService[];
  isDashboardView?: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, isDashboardView = false }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No associated services found for this product.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
          <div className="grid md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="relative h-full min-h-[200px]">
                <Image
                  src={service.media && service.media.length > 0 ? service.media[0] : 'https://via.placeholder.com/300x300.png?text=No+Image'}
                  alt={service.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold text-gray-900">{service.name}</CardTitle>
                  <Badge
                    className="capitalize text-sm"
                    variant={service.pricingModel === 'fixed' ? 'default' : 'secondary'}
                  >
                    {service.pricingModel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{service.description}</p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Pricing</h4>
                  <div className="space-y-2">
                    {service.pricingModel === 'fixed' && service.fixedPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Standard Price:</span>
                        <span className="font-bold text-xl text-gray-900">${service.fixedPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {service.pricingModel === 'hourly' && service.hourlyRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="font-bold text-xl text-gray-900">${service.hourlyRate.toFixed(2)}/hour</span>
                      </div>
                    )}
                    {service.enableGuestPricing && service.guestPrice && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-semibold">Guest Price:</span>
                        <span className="font-bold text-xl">${service.guestPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {service.isQuoteModel && (
                      <div className="text-center text-gray-500">
                        Contact us for a custom quote.
                      </div>
                    )}
                  </div>
                </div>

                {!isDashboardView && (
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="outline">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button>
                      <Zap className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ServiceList;