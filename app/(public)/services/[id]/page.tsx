'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetServiceById } from '@/service/services/hook';
import Image from 'next/image';

export default function ServicePage() {
  const { id } = useParams();
  const serviceId = id as string;
  const { data: service, isLoading, isError } = useGetServiceById(serviceId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading service...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl text-red-500">Error loading service.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Image */}
        <div className="relative bg-white rounded-lg shadow-md p-6">
          <Image
            src={service.images?.[0] || '/placeholder.png'}
            alt={service.name || 'Service Image'}
            width={500}
            height={500}
            className="object-contain w-full h-full"
          />
          {service.hotspots?.map(hotspot => (
            <a
                key={hotspot.id}
                href={hotspot.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute w-6 h-6 rounded-full bg-red-500/80 border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-xl hover:scale-125 transition-transform"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </a>
          ))}
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
          <p className="text-gray-800 mb-6">{service.description}</p>

          {/* Add more service details here as needed */}

        </div>
      </div>
    </div>
  );
}
