'use client';

import dynamic from 'next/dynamic';
import { Geometry, Location } from '@/service/listings/types';

// Dynamically import the map to prevent SSR issues
const ListingMap = dynamic(() => import('./ListingMap'), {
  loading: () => (
    <div className="h-[400px] w-full bg-gray-200 rounded-xl animate-pulse" />
  ),
  ssr: false,
});

function isGeometry(
  location: Geometry | Location | undefined
): location is Geometry {
  return location !== undefined && 'location' in location;
}

export default function LocationSection({
  listing,
  address,
}: {
  listing: Geometry | Location | undefined;
  address: string;
}) {
  let lat: number | undefined;
  let lng: number | undefined;

  if (isGeometry(listing)) {
    lat = listing.location?.lat;
    lng = listing.location?.lng;
  } else if (listing) {
    lat = listing.lat;
    lng = listing.lng;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Location</h2>
      <p className="text-gray-600">{address}</p>
      <ListingMap lat={lat} lng={lng} />
    </section>
  );
}
