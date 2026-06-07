'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LocationSection from './locationSection';
import {
  GooglePlaceResult,
  InHouseBusiness,
} from '@/service/listings/types';
import { ReviewsTabContent } from '@/app/(public)/listings/[id]/components/ReviewsTabContent';
import {
  Clock,
  Info,
  Truck,
  Globe,
} from 'lucide-react';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

export default function OverviewSection({
  listing,
  isLoading,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
  isLoading: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const isGoogle = isGoogleResult(listing);
  const today = new Date().getDay();

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      },
      err => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${minutes} ${ampm}`;
  };

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const location = isGoogle ? (listing as GooglePlaceResult).geometry : (listing as InHouseBusiness).location;
  const address = isGoogle
    ? (listing as GooglePlaceResult).formattedAddress || (listing as GooglePlaceResult).vicinity
    : `${(listing as InHouseBusiness).location.addressLine1}, ${(listing as InHouseBusiness).location.city}`;
  const reviews = isGoogle ? (listing as GooglePlaceResult).reviews : []; // In-house doesn't have reviews yet
  const businessId = isGoogle
    ? (listing as GooglePlaceResult).placeId
    : (listing as InHouseBusiness).id;

  if (isGoogle) {
    // Keeping Google result view simpler as requested
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Status:</strong> {(listing as GooglePlaceResult).businessStatus}
            </p>
            <p>
              <strong>Types:</strong> {(listing as GooglePlaceResult).types?.join(', ')}
            </p>
            {(listing as GooglePlaceResult).openingHours && (
              <p>
                <strong>Availability:</strong>{' '}
                {(listing as GooglePlaceResult).openingHours?.openNow ? 'Open Now' : 'Closed'}
              </p>
            )}
          </div>
        </div>
        <div className="py-8">
          <LocationSection listing={location} address={address} />
        </div>
        <div className="bg-gray-50 py-8 px-6 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">FAQ</h3>
          <p className="text-gray-600">FAQ content goes here.</p>
        </div>
        <div className="py-8">
          <ReviewsTabContent businessId={businessId} />
        </div>
      </div>
    );
  }

  const DAY_MAP: Record<string, number> = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
  };

  // InHouseBusiness
  return (
    <div className="-mx-6">
      {!isGoogle && !(listing as InHouseBusiness).isClaimed && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mx-6 mb-8 rounded-r-lg">
          <h3 className="text-xl font-bold text-yellow-800">
            Do you know the owner of this business?
          </h3>
          <p className="text-yellow-700 mt-2">
            Tell them to claim this listing to unlock more features and manage
            their business information.
          </p>
          <Button
            onClick={handleCopy}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isCopied ? 'Copied!' : 'Copy Listing URL'}
          </Button>
        </div>
      )}

      {/* About Section */}
      <div className="py-8 px-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          About {(listing as InHouseBusiness).businessName}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {(listing as InHouseBusiness).about || (listing as InHouseBusiness).shortDescription}
        </p>
      </div>

      {/* Opening Hours Section */}
      {(listing as InHouseBusiness).businessHours && (listing as InHouseBusiness).businessHours.length > 0 && (
        <div className="bg-slate-50 py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Opening Hours
          </h3>
          <ul className="space-y-2">
            {(() => {
              const hours = (listing as InHouseBusiness).businessHours;
              if (!hours || hours.length === 0) return null;

              const isAll247 = hours.length === 7 && hours.every(h => h.is24h || (h.openTime === '00:00' && h.closeTime === '23:59'));
              if (isAll247) {
                return (
                  <li className="flex justify-between items-center p-3 rounded-lg bg-orange-50 text-orange-800">
                    <span className="font-semibold flex items-center gap-2"><Clock size={18} /> Always Open</span>
                    <span className="font-bold">24/7</span>
                  </li>
                );
              }

              const isStandard = hours.length === 5 && hours.every(h => 
                ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(h.dayOfWeek) &&
                h.openTime === '09:00' && h.closeTime === '17:00'
              );
              if (isStandard) {
                return (
                  <li className="flex justify-between items-center p-3 rounded-lg bg-blue-50 text-blue-800">
                    <span className="font-semibold flex items-center gap-2"><Clock size={18} /> Standard Hours</span>
                    <span className="font-bold">Mon-Fri, 9:00 AM - 5:00 PM</span>
                  </li>
                );
              }

              return hours.sort((a, b) => DAY_MAP[a.dayOfWeek] - DAY_MAP[b.dayOfWeek]).map(hour => (
                <li
                  key={hour.id}
                  className={`flex justify-between p-3 rounded-lg ${DAY_MAP[hour.dayOfWeek] === today
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-700'
                    }`}
                >
                  <span className="font-semibold">
                    {daysOfWeek[DAY_MAP[hour.dayOfWeek]]}
                  </span>
                  <span
                    className={
                      DAY_MAP[hour.dayOfWeek] === today ? 'font-bold' : ''
                    }
                  >
                    {hour.is24h
                      ? '24 Hours'
                      : `${formatTime(hour.openTime)} - ${formatTime(
                        hour.closeTime
                      )}`}
                  </span>
                </li>
              ));
            })()}
          </ul>
        </div>
      )}

      {/* Amenities Section */}
      {((listing as InHouseBusiness).productSellerProfile || (listing as InHouseBusiness).serviceProviderProfile) && (
        <div className="py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Amenities & Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(listing as InHouseBusiness).productSellerProfile && (
              <>
                <div className="flex items-start space-x-3">
                  <Truck className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Selling Modes</h4>
                    <p className="text-gray-600">
                      {(listing as InHouseBusiness).productSellerProfile?.sellingModes?.join(', ')}
                    </p>
                  </div>
                </div>
                {(listing as InHouseBusiness).productSellerProfile?.returnsPolicy && (
                  <div className="flex items-start space-x-3">
                    <Info className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">Returns Policy</h4>
                      <p className="text-gray-600">
                        {(listing as InHouseBusiness).productSellerProfile?.returnsPolicy}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            {(listing as InHouseBusiness).serviceProviderProfile && (
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Booking Method</h4>
                  <p className="text-gray-600">
                    {(listing as InHouseBusiness).serviceProviderProfile?.bookingMethod}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info Section */}
      {((listing as InHouseBusiness).website || (listing as InHouseBusiness).businessEmail) && (
        <div className="bg-slate-50 py-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Contact
          </h3>
          <div className="space-y-3">
            {(listing as InHouseBusiness).website && (
              <a
                href={(listing as InHouseBusiness).website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-red-500 hover:underline"
              >
                <Globe className="mr-2 h-5 w-5" />
                {(listing as InHouseBusiness).website}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="py-8 px-6">
        <LocationSection listing={location} address={address} />
      </div>

      <div className="bg-slate-50 py-8 px-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">FAQ</h3>
        <p className="text-gray-600">FAQ content goes here.</p>
      </div>

      <div className="py-8 px-6">
        <ReviewsTabContent businessId={businessId} />
      </div>
    </div>
  );
}