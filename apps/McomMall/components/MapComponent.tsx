'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GooglePlaceResult, InHouseBusiness } from '@/service/listings/types';

function isGoogleResult(
  listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
  return 'placeId' in listing;
}

// Helper component to dynamically fit bounds of all active markers
function ChangeView({
  listings,
  center,
}: {
  listings: (GooglePlaceResult | InHouseBusiness)[];
  center?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (listings.length > 0) {
      const points = listings
        .map(l => {
          if (isGoogleResult(l)) {
            return [l.geometry.location.lat, l.geometry.location.lng] as [number, number];
          }
          return [l.location.lat, l.location.lng] as [number, number];
        })
        .filter(p => p[0] != null && p[1] != null);

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        // Automatically zoom/pan to fit all active markers
        // maxZoom caps zoom at 14 to prevent excessive zoom-in for single markers or extremely close markers
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    } else if (center) {
      map.setView(center, 12);
    }
  }, [listings, center, map]);

  return null;
}

// Helper to map category/type to a premium CSS gradient and inline vector SVG icon
function getCategoryDesign(listing: GooglePlaceResult | InHouseBusiness): {
  gradient: string;
  bottomColor: string;
  svgHtml: string;
} {
  const isGoogle = isGoogleResult(listing);
  let categoryName = '';
  let googleTypes: string[] = [];

  if (isGoogle) {
    googleTypes = listing.types || [];
    categoryName = (listing.types && listing.types[0]) || '';
  } else {
    categoryName = (listing.categories && listing.categories.map(c => c.name).join(' ')) || '';
  }

  const nameLower = categoryName.toLowerCase();

  // 1. Food & Dining
  const isFood = 
    nameLower.includes('food') || 
    nameLower.includes('restaurant') || 
    nameLower.includes('cafe') || 
    nameLower.includes('dining') || 
    nameLower.includes('bakery') || 
    nameLower.includes('beverage') ||
    googleTypes.some(t => ['restaurant', 'cafe', 'bar', 'bakery', 'food'].includes(t));

  if (isFood) {
    return {
      gradient: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
      bottomColor: '#feb47b',
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
    };
  }

  // 2. Shopping & Retail
  const isShopping = 
    nameLower.includes('shopping') || 
    nameLower.includes('retail') || 
    nameLower.includes('clothing') || 
    nameLower.includes('store') || 
    nameLower.includes('electronics') || 
    nameLower.includes('fashion') || 
    nameLower.includes('boutique') ||
    googleTypes.some(t => ['clothing_store', 'shopping_mall', 'department_store', 'store', 'shoe_store', 'electronics_store', 'book_store'].includes(t));

  if (isShopping) {
    return {
      gradient: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
      bottomColor: '#6dd5ed',
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    };
  }

  // 3. Health & Beauty
  const isHealthBeauty = 
    nameLower.includes('beauty') || 
    nameLower.includes('spa') || 
    nameLower.includes('salon') || 
    nameLower.includes('hair') || 
    nameLower.includes('health') || 
    nameLower.includes('gym') || 
    nameLower.includes('fitness') || 
    nameLower.includes('wellness') || 
    nameLower.includes('medical') ||
    googleTypes.some(t => ['beauty_salon', 'hair_care', 'spa', 'gym', 'health', 'physiotherapist', 'dentist', 'doctor'].includes(t));

  if (isHealthBeauty) {
    return {
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      bottomColor: '#38ef7d',
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    };
  }

  // 4. Professional Services
  const isServices = 
    nameLower.includes('service') || 
    nameLower.includes('professional') || 
    nameLower.includes('consulting') || 
    nameLower.includes('finance') || 
    nameLower.includes('repair') || 
    nameLower.includes('cleaning') || 
    nameLower.includes('legal') || 
    nameLower.includes('it') ||
    googleTypes.some(t => ['local_government_office', 'bank', 'finance', 'lawyer', 'real_estate_agency', 'travel_agency', 'car_repair', 'plumber', 'electrician'].includes(t));

  if (isServices) {
    return {
      gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      bottomColor: '#7c3aed',
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    };
  }

  // 5. Leisure & Entertainment & Arts
  const isLeisure = 
    nameLower.includes('entertainment') || 
    nameLower.includes('art') || 
    nameLower.includes('museum') || 
    nameLower.includes('leisure') || 
    nameLower.includes('hotel') || 
    nameLower.includes('travel') || 
    nameLower.includes('tourism') ||
    googleTypes.some(t => ['museum', 'amusement_park', 'movie_theater', 'art_gallery', 'park', 'tourist_attraction', 'hotel', 'lodging'].includes(t));

  if (isLeisure) {
    return {
      gradient: 'linear-gradient(135deg, #ff007f, #ff4e50)',
      bottomColor: '#ff4e50',
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    };
  }

  // Default Business fallback
  return {
    gradient: 'linear-gradient(135deg, #f857a6, #ff5858)',
    bottomColor: '#ff5858',
    svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M7 22V14h10v8"/><path d="M2 10h20"/></svg>`,
  };
}

// Function to create custom premium categorized icons using an HTML template with gradients & inline vector icons
const createCategorizedIcon = (listing: GooglePlaceResult | InHouseBusiness, number: number) => {
  const { gradient, bottomColor, svgHtml } = getCategoryDesign(listing);
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white text-white hover:scale-115 hover:shadow-xl transition-all duration-300" style="background: ${gradient};">
        ${svgHtml}
        <!-- Dynamic index number badge -->
        <div class="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-white text-gray-900 text-[10px] font-black rounded-full border border-gray-100 shadow-sm">${number}</div>
        <!-- Pin arrow -->
        <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-white" style="background: ${bottomColor};"></div>
      </div>
    `,
    className: 'bg-transparent border-0', // Custom wrapper styling
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
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
      : [51.5074, -0.1278]); // Default to London coords instead of NYC

  return (
    <MapContainer
      center={position}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <ChangeView listings={listings} center={center} />
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
            icon={createCategorizedIcon(listing, index + 1)}
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
