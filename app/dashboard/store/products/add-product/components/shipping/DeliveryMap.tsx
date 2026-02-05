"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface DeliveryMapProps {
  radiusMiles: number;
  center: [number, number];
}

export default function DeliveryMap({ radiusMiles, center }: DeliveryMapProps) {
  const radiusMeters = (radiusMiles || 0) * 1609.34;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-orange-200 shadow-inner mt-4 z-0 relative">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            Store Location
          </Popup>
        </Marker>
        {radiusMeters > 0 && (
          <Circle
            center={center}
            radius={radiusMeters}
            pathOptions={{ color: '#f48c25', fillColor: '#f48c25', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
