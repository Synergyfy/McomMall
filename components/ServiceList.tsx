"use client";
import { PartnershipService } from "@/service/partnerships/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { Button } from "./ui/button";
import { ShoppingCart, Zap, Tag, Clock, Users } from "lucide-react";

interface ServiceListProps {
  services: PartnershipService[];
  isDashboardView?: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, isDashboardView = false }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold text-gray-700">No Associated Services</h3>
        <p className="text-gray-500 mt-2">This product does not have any associated services yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl border-transparent hover:border-orange-500 border-2">
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
                    {service.pricingModel === 'fixed' && service.fixedPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 flex items-center"><Tag className="mr-2 h-5 w-5 text-orange-500"/>Standard Price:</span>
                        <span className="font-bold text-2xl text-gray-900">${service.fixedPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {service.pricingModel === 'hourly' && service.hourlyRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 flex items-center"><Clock className="mr-2 h-5 w-5 text-orange-500"/>Hourly Rate:</span>
                        <span className="font-bold text-2xl text-gray-900">${service.hourlyRate.toFixed(2)}/hour</span>
                      </div>
                    )}
                    {service.enableGuestPricing && service.guestPrice && (
                      <div className="flex justify-between items-center text-green-700">
                        <span className="font-semibold flex items-center"><Users className="mr-2 h-5 w-5 text-green-500"/>Guest Price:</span>
                        <span className="font-bold text-2xl">${service.guestPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {service.isQuoteModel && (
                      <div className="text-center text-gray-500 py-2">
                        Contact us for a custom quote.
                      </div>
                    )}
                  </div>
                </div>

                {!isDashboardView && (
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button variant="outline" size="lg" className="rounded-full">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 rounded-full">
                      <Zap className="mr-2 h-5 w-5" />
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