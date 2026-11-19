'use client';

import { Service } from '@/service/services/types';
import {
  CUSTOMER_ACTION_LABELS,
  DELIVERY_OPTION_LABELS,
  getPricingTypeLabel,
} from '@/lib/service-pricing';

interface ServiceFactsProps {
  service: Service;
}

export default function ServiceFacts({ service }: ServiceFactsProps) {
  const delivery = (service.deliveryOptions ?? [])
    .map((option) => DELIVERY_OPTION_LABELS[option])
    .filter(Boolean)
    .join(', ');

  const facts = [
    { label: 'Pricing', value: getPricingTypeLabel(service) },
    {
      label: 'Service Delivery',
      value:
        delivery ||
        (service.deliveryConfig?.mode === 'atShop'
          ? 'At business premises'
          : service.deliveryConfig?.mode === 'remote'
            ? 'Online / Remote'
            : 'At customer location'),
    },
    {
      label: 'Customer Action',
      value: service.customerAction
        ? CUSTOMER_ACTION_LABELS[service.customerAction]
        : service.isQuoteModel
          ? CUSTOMER_ACTION_LABELS.requestQuote
          : CUSTOMER_ACTION_LABELS.bookNow,
    },
    {
      label: 'Duration',
      value:
        service.duration || service.availability?.slotDuration
          ? `${service.duration || service.availability?.slotDuration} minutes`
          : null,
    },
    {
      label: 'Unit',
      value: service.unitName,
    },
    {
      label: 'Booking Fee',
      value:
        service.bookingFee && parseFloat(service.bookingFee) > 0
          ? `£${service.bookingFee}`
          : null,
    },
  ];

  const validFacts = facts.filter(
    (fact) =>
      fact.value !== null && fact.value !== undefined && fact.value !== '',
  );

  if (validFacts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
      <div className="grid grid-cols-1 gap-y-6 gap-x-12 sm:grid-cols-2">
        {validFacts.map((fact) => (
          <div key={fact.label}>
            <p className="text-sm text-gray-500 mb-1">{fact.label}</p>
            <p className="text-base font-semibold text-gray-900">
              {fact.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
