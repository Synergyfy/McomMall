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

export const HIGH_STREET_REGISTRY: HighStreet[] = [
  {
    id: "hs_peckham",
    name: "Peckham High Street",
    latitude: 51.4741,
    longitude: -0.0689,
    radiusMiles: 0.3,
    borough: "Southwark",
    city: "London",
    country: "UK",
    status: "active",
    economicPriority: "premium"
  },
  {
    id: "hs_brixton",
    name: "Brixton High Street",
    latitude: 51.4613,
    longitude: -0.1156,
    radiusMiles: 0.5,
    borough: "Lambeth",
    city: "London",
    country: "UK",
    status: "active",
    economicPriority: "premium"
  },
  {
    id: "hs_camden",
    name: "Camden High Street",
    latitude: 51.539,
    longitude: -0.1426,
    radiusMiles: 0.4,
    borough: "Camden",
    city: "London",
    country: "UK",
    status: "active",
    economicPriority: "premium"
  },
];

export interface GeocodeResponse {
  postcode: string;
  latitude: number;
  longitude: number;
}

// Mocking a postcode lookup API (like postcodes.io)
export const mockGeocodePostcode = async (postcode: string): Promise<GeocodeResponse | null> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
  
  // Hardcoded mocks for testing
  if (cleanPostcode.startsWith("SE15")) {
    // Near Peckham
    return { postcode, latitude: 51.475, longitude: -0.068 };
  } else if (cleanPostcode.startsWith("SW9")) {
    // Near Brixton
    return { postcode, latitude: 51.462, longitude: -0.115 };
  } else if (cleanPostcode.startsWith("NW1")) {
    // Near Camden
    return { postcode, latitude: 51.54, longitude: -0.14 };
  } else if (cleanPostcode.startsWith("SW1A")) {
    // Remote (Central London, away from our mocked high streets)
    return { postcode, latitude: 51.501, longitude: -0.141 };
  }
  
  // Generic fallback that gives a somewhat random coordinate in London
  return {
    postcode,
    latitude: 51.5 + (Math.random() * 0.1 - 0.05),
    longitude: -0.1 + (Math.random() * 0.1 - 0.05),
  };
};
