'use client';
import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeoContext } from '@/context/GeoContext';
import { HIGH_STREET_REGISTRY } from '@/lib/mock-data/high-street-data';
import { Store, MapPin } from 'lucide-react';
import GeoBadge from '../badges/GeoBadge';

// Helper to draw circle polygon for high street radius
function createGeoJSONCircle(center: [number, number], radiusInMiles: number, points = 64) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMiles * 1.60934;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.574;
  
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);
  
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ret]
      }
    }]
  };
}

export default function NearbyDiscovery() {
  const { latitude, longitude, nearestHighStreet } = useGeoContext();
  const [popupInfo, setPopupInfo] = useState<any>(null);

  // If user location is not set, default to London center
  const initialViewState = {
    longitude: longitude || -0.1276,
    latitude: latitude || 51.5072,
    zoom: 12
  };

  const highStreetData = useMemo(() => {
    if (!nearestHighStreet) return null;
    return createGeoJSONCircle(
      [nearestHighStreet.longitude, nearestHighStreet.latitude], 
      nearestHighStreet.radiusMiles
    );
  }, [nearestHighStreet]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 relative shadow-sm">
      {/* We use Carto basemap to avoid needing a mapbox token for the mock demo */}
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        {/* User Location Marker */}
        {latitude && longitude && (
          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div className="relative cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              setPopupInfo({ title: "Your Business", type: "YOU", longitude, latitude });
            }}>
              <MapPin className="w-8 h-8 text-indigo-600 drop-shadow-md animate-bounce" fill="white" />
            </div>
          </Marker>
        )}

        {/* High Street Centers */}
        {HIGH_STREET_REGISTRY.map(hs => (
          <Marker key={hs.id} longitude={hs.longitude} latitude={hs.latitude} anchor="bottom">
            <div className="cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              setPopupInfo({ title: hs.name, type: "HIGH_STREET", longitude: hs.longitude, latitude: hs.latitude });
            }}>
              <Store className="w-6 h-6 text-amber-600 drop-shadow-md" />
            </div>
          </Marker>
        ))}

        {/* Nearest High Street Radius Area */}
        {highStreetData && (
          <Source id="high-street-radius" type="geojson" data={highStreetData as any}>
            <Layer 
              id="radius-fill" 
              type="fill" 
              paint={{
                'fill-color': '#f59e0b',
                'fill-opacity': 0.15
              }} 
            />
            <Layer 
              id="radius-outline" 
              type="line" 
              paint={{
                'line-color': '#f59e0b',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }} 
            />
          </Source>
        )}

        {/* Popup */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <div className="p-2">
              <h3 className="font-bold text-gray-900 mb-1">{popupInfo.title}</h3>
              {popupInfo.type === 'HIGH_STREET' && <GeoBadge type="HIGH_STREET" className="scale-75 origin-left" />}
              {popupInfo.type === 'YOU' && <span className="text-sm text-gray-500">Your current location</span>}
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Panel */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs">
        <h3 className="font-bold text-gray-900 mb-1">Geographic Ecosystem</h3>
        <p className="text-sm text-gray-500 mb-3">Discover businesses clustered around your local high street.</p>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500"></span>
          Premium High Street Zone
        </div>
      </div>
    </div>
  );
}
