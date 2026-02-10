"use client";
import { IService } from "@/service/services/types";
import ServiceBooking from "./ServiceBooking";
import { ServiceBookingDetailsDto } from "@/hooks/useCheckout";

interface ServiceListProps {
  services: IService[];
  isDashboardView?: boolean;
  onServiceBooked?: (bookingDetails: ServiceBookingDetailsDto) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, isDashboardView = false, onServiceBooked }) => {
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
        <ServiceBooking
          key={service.id}
          service={service}
          onBookingConfirmation={isDashboardView ? undefined : onServiceBooked}
        />
      ))}
    </div>
  );
};

export default ServiceList;