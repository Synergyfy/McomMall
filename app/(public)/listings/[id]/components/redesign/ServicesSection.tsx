'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Service } from '@/service/services/types';
import { useState } from 'react';
import { BookingModal } from '@/components/BookingModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

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
      return `£${service.pricePerHour}/hr`;
    case 'PER_UNIT':
      return `£${service.pricePerUnit}/${service.unitName}`;
    default:
      return 'Quote Only';
  }
};

export default function ServicesSection({ businessId }: ServicesSectionProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 6;
  const { data: servicesData, isLoading, isError } = useGetServicesByBusiness(businessId, page, limit);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (isError || !servicesData || servicesData.data.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesData.data.map((service, index) => {
           const firstImageUrl = service.media?.find(isImageUrl) || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div 
                onClick={() => router.push(`/services/${service.id}`)}
                className="h-full bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={firstImageUrl}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                      Service
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl">
                      <p className="text-xl font-black text-gray-900">{getPriceDisplay(service)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#f58220] transition-colors line-clamp-1">{service.name}</h3>
                    <ShieldCheck size={20} className="text-blue-500" />
                  </div>

                  <p className="text-gray-400 text-sm font-bold leading-relaxed line-clamp-3 mb-8 flex-1">
                    {service.description || "Expertly delivered professional service customized for your specific requirements."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <Button 
                      className="bg-[#f58220] hover:bg-[#e67a1d] text-white font-black text-xs uppercase tracking-widest rounded-xl px-6"
                      onClick={(e) => handleBookNow(e, service)}
                    >
                      Book Appointment
                    </Button>
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-[#f58220] transition-all">
                      <ArrowRight size={22} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {servicesData.total > limit && (
        <div className="flex justify-center items-center gap-4 mt-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-12 h-12 rounded-2xl hover:bg-orange-50 hover:text-[#f58220]"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="bg-gray-100 px-6 py-2 rounded-xl text-sm font-black text-gray-400 uppercase tracking-widest">
            {page} / {Math.ceil(servicesData.total / limit)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(p => p + 1)}
            disabled={page * limit >= servicesData.total}
            className="w-12 h-12 rounded-2xl hover:bg-orange-50 hover:text-[#f58220]"
          >
            <ChevronRight size={24} />
          </Button>
        </div>
      )}
      
      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseModal}
      />
    </>
  );
}