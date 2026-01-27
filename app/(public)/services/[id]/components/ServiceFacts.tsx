'use client';

import { Service } from '@/service/services/types';

interface ServiceFactsProps {
  service: Service;
}

export default function ServiceFacts({ service }: ServiceFactsProps) {
  const facts = [
    { label: 'Pricing Model', value: service.pricingModel, capitalize: true },
    { label: 'Unit', value: service.unitName },
    { label: 'Min Guests', value: service.minGuests > 0 ? service.minGuests : null },
    { label: 'Max Guests', value: service.maxGuests > 0 ? service.maxGuests : null },
    { label: 'Booking Fee', value: service.bookingFee && parseFloat(service.bookingFee) > 0 ? `£${service.bookingFee}` : 'None' },
  ];

  const validFacts = facts.filter(f => f.value !== null && f.value !== undefined && f.value !== '');

  if (validFacts.length === 0) return null;

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
        {validFacts.map((fact) => (
          <div key={fact.label}>
            <p className="text-sm text-gray-500 mb-1">{fact.label}</p>
            <p className={`text-base font-semibold text-gray-900 ${fact.capitalize ? 'capitalize' : ''}`}>
              {fact.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
