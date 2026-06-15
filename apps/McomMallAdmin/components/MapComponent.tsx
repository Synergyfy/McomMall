import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { InHouseBusiness, GooglePlaceResult } from '@/service/listings/types';

export interface MapLayerData {
    id: string;
    type: 'zone' | 'activation' | 'business' | 'traffic' | 'cluster';
    name: string;
    coordinates?: [number, number]; // For points
    bounds?: [number, number][];   // For polygons
    radius?: number;               // For circles
    intensity?: number;            // For heat/density (0-1)
    color?: string;
    details?: string;
}

function isGoogleResult(
    listing: GooglePlaceResult | InHouseBusiness
): listing is GooglePlaceResult {
    return 'place_id' in listing;
}

// Function to create custom markers based on type
const createCustomIcon = (type: string, color: string) => {
    return L.divIcon({
        html: `<div class="relative flex items-center justify-center w-6 h-6 rounded-full shadow-lg border-2 border-white" style="background-color: ${color}">
                <div class="w-2 h-2 bg-white rounded-full animate-pulse opacity-50"></div>
               </div>`,
        className: 'bg-transparent border-0',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

export default function MapComponent({
    data = [],
    listings = [],
    center = [51.5074, -0.1278],
    zoom = 13
}: {
    data?: MapLayerData[];
    listings?: (GooglePlaceResult | InHouseBusiness)[];
    center?: [number, number];
    zoom?: number;
}) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {data.map((item) => {
                // 1. High Street Zones (Polygons)
                if (item.type === 'zone' && item.bounds) {
                    return (
                        <Polygon 
                            key={item.id}
                            positions={item.bounds}
                            pathOptions={{ 
                                fillColor: item.color || '#f97316', 
                                fillOpacity: 0.2, 
                                color: item.color || '#f97316', 
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h4 className="font-bold text-orange-600">{item.name}</h4>
                                    <p className="text-xs text-slate-500">{item.details}</p>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                }

                // 2. Activation Zones & Engagement Clusters (Circles)
                if ((item.type === 'activation' || item.type === 'cluster' || item.type === 'traffic') && item.coordinates) {
                    const isTraffic = item.type === 'traffic';
                    const isCluster = item.type === 'cluster';
                    
                    return (
                        <Circle
                            key={item.id}
                            center={item.coordinates}
                            radius={item.radius || 200}
                            pathOptions={{
                                fillColor: item.color || (isTraffic ? '#3b82f6' : '#ec4899'),
                                fillOpacity: item.intensity || 0.4,
                                color: 'transparent',
                                stroke: false
                            }}
                        >
                            <LeafletTooltip permanent={false} direction="top">
                                <span className="text-[10px] font-bold">{item.name}: {Math.round((item.intensity || 0) * 100)}% Intensity</span>
                            </LeafletTooltip>
                        </Circle>
                    );
                }

                // 3. Participating Businesses (Markers)
                if (item.type === 'business' && item.coordinates) {
                    return (
                        <Marker
                            key={item.id}
                            position={item.coordinates}
                            icon={createCustomIcon(item.type, item.color || '#10b981')}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h4 className="font-bold">{item.name}</h4>
                                    <Badge className="text-[9px] h-4 mb-1 bg-emerald-100 text-emerald-700 border-none">Participating Business</Badge>
                                    <p className="text-[10px] text-slate-500 leading-tight">{item.details}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }

                return null;
            })}

            {listings.map((listing) => {
                const lat = isGoogleResult(listing) 
                    ? listing.geometry?.location?.lat 
                    : listing.location?.lat;
                const lng = isGoogleResult(listing) 
                    ? listing.geometry?.location?.lng 
                    : listing.location?.lng;
                
                if (lat != null && lng != null) {
                    const name = isGoogleResult(listing) 
                        ? (listing.name || 'Unknown Google Place') 
                        : (listing.businessName || listing.name || 'Unknown Business');
                    
                    const id = isGoogleResult(listing) ? listing.place_id : listing.id;
                    
                    let details = '';
                    if (isGoogleResult(listing)) {
                        details = listing.vicinity || listing.formatted_address || '';
                    } else {
                        details = listing.location?.addressLine1 || listing.location?.city || '';
                    }

                    return (
                        <Marker
                            key={id}
                            position={[lat, lng]}
                            icon={createCustomIcon('business', '#10b981')}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h4 className="font-bold">{name}</h4>
                                    <Badge className="text-[9px] h-4 mb-1 bg-emerald-100 text-emerald-700 border-none">
                                        {isGoogleResult(listing) ? 'Google Listing' : 'Verified Business'}
                                    </Badge>
                                    <p className="text-[10px] text-slate-500 leading-tight">{details}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
                return null;
            })}
        </MapContainer>
    );
}
