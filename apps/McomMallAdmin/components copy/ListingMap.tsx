'use client';

import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface ListingMapProps {
  lat?: number;
  lng?: number;
}

// Custom icon with a red color to match your design
const customIcon = new L.DivIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10"><div class="absolute w-10 h-10 bg-red-500 rounded-full opacity-30"></div><div class="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div></div>`,
  className: 'bg-transparent border-0',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function ListingMap({ lat, lng }: ListingMapProps) {
  const position: [number, number] =
    lat && lng ? [lat, lng] : [51.505, -0.09]; // Default to London if no coords
  const zoomLevel = lat && lng ? 12 : 2; // Zoom in if coords, zoom out if not

  const handleGetDirections = () => {
    if (lat && lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={position}
        zoom={zoomLevel}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lat && lng && <Marker position={position} icon={customIcon} />}
        <ZoomControl position="bottomleft" />
      </MapContainer>
      {lat && lng && (
        <Button
          onClick={handleGetDirections}
          className="absolute top-4 left-4 z-10 bg-white text-gray-800 shadow-lg hover:bg-gray-100"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Get Directions
        </Button>
      )}
    </div>
  );
}
