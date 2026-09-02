export interface HighStreet {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  borough: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
  economicPriority: 'premium' | 'standard';
}

export interface GeocodeResponse {
  postcode: string;
  latitude: number;
  longitude: number;
}
