// app/components/MapComponent.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GooglePlaceResult, InHouseBusiness } from '@/service/listings/types';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

// Function to create custom numbered icons using a string with Tailwind classes
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full shadow-lg border-2 border-white">${number}</div>`,
    className: 'bg-transparent border-0', // This class on the wrapper is important
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function MapComponent({
  listings,
  center,
}: {
  listings: (GooglePlaceResult | InHouseBusiness)[];
  center?: [number, number];
}) {
  const position =
    center ??
    (listings.length > 0
      ? isGoogleResult(listings[0])
        ? [
            listings[0].geometry.location.lat,
            listings[0].geometry.location.lng,
          ]
        : [listings[0].location.lat, listings[0].location.lng]
      : [40.7128, -74.006]); // Default to NYC

  return (
    <MapContainer
      center={position}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing, index) => {
        const isGoogle = isGoogleResult(listing);
        const key = isGoogle ? listing.placeId : listing.id;
        const position: [number, number] = isGoogle
          ? [listing.geometry.location.lat, listing.geometry.location.lng]
          : [listing.location.lat, listing.location.lng];
        const name = isGoogle ? listing.name : listing.businessName;
        const vicinity = isGoogle
          ? listing.vicinity
          : `${listing.location.addressLine1}, ${listing.location.city}`;

        return (
          <Marker
            key={key}
            position={position}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup>
              <div className="font-bold">{name}</div>
              <div className="text-sm">{vicinity}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
