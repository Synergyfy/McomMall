// lib/listing-data.ts

// ==================================
// ## TYPE DEFINITIONS
// ==================================

export type Amenity =
  | 'wifi'
  | 'parking'
  | 'power'
  | 'transmission'
  | 'storage'
  | 'condition'
  | 'remote'
  | 'pets';

// Base type for listings shown in the directory view
export interface Listing {
  id: number;
  title: string;
  category: string;
  categoryTag: string;
  location: string;
  priceDisplay: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  lat: number;
  lng: number;
  amenities: Amenity[];
  featured?: boolean;
  isVerified?: boolean;
}

// Type for the rating breakdown in the reviews section
export interface RatingBreakdown {
  service: number;
  location: number;
  valueForMoney: number;
  cleanliness: number;
}

// Type for a reply from the listing owner
export interface OwnerReply {
  author: 'Owner';
  avatarUrl: string;
  date: string;
  comment: string;
}

// Type for a single review, including optional reply
export interface Review {
  id: number;
  author: string;
  avatarUrl: string;
  date: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  reply?: OwnerReply;
}

// Type for a listing feature (e.g., parking, pets)
export interface Feature {
  name: string;
  icon: 'Parking' | 'Workspace' | 'Pet';
}

// The complete type for the detailed listing page
export interface DetailedListing extends Listing {
  description: string;
  images: string[];
  features: Feature[];
  reviews: Review[];
  ratingBreakdown: RatingBreakdown;
  author: {
    name: string;
    avatarUrl: string;
    bio: string;
  };
}

// Type for Hotspots
export interface Hotspot {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  link: string;
}

// Type for Promotional Items
export interface PromotionalItem {
    id: number;
    title: string;
    image: string;
    category: string;
    price: number;
    discountedPrice?: number;
    items_left: number;
    hotspots?: Hotspot[];
}


export const promotionalItems: PromotionalItem[] = [
  { id: 1, title: 'Do Pass Yourself', image: 'https://placehold.co/200x200/png', category: 'Appliances', price: 120.00, discountedPrice: 99.99, items_left: 15, hotspots: [{id: 'hs1', x: 50, y: 50, link: '/some-product'}] },
  { id: 2, title: 'Awoof Deals', image: 'https://placehold.co/200x200/png', category: 'Phones & Tablets', price: 850.00, discountedPrice: 799.99, items_left: 10 },
  { id: 3, title: 'Up to 80% Off', image: 'https://placehold.co/200x200/png', category: 'Health & Beauty', price: 50.00, discountedPrice: 39.99, items_left: 25 },
  { id: 4, title: 'Send Packages Securely', image: 'https://placehold.co/200x200/png', category: 'Home & Office', price: 200.00, discountedPrice: 179.99, items_left: 5 },
  { id: 5, title: 'Unbeatable Offers', image: 'https://placehold.co/200x200/png', category: 'Electronics', price: 500.00, discountedPrice: 449.99, items_left: 12 },
  { id: 6, title: 'Earn While You Shop', image: 'https://placehold.co/200x200/png', category: 'Fashion', price: 70.00, discountedPrice: 59.99, items_left: 30 },
  { id: 7, title: 'Unlock Your Deal', image: 'https://placehold.co/200x200/png', category: 'Supermarket', price: 30.00, discountedPrice: 24.99, items_left: 50 },
  { id: 8, title: 'Deals Reloaded', image: 'https://placehold.co/200x200/png', category: 'Computing', price: 1200.00, discountedPrice: 1099.99, items_left: 8 },
  { id: 9, title: 'More Deals', image: 'https://placehold.co/200x200/png', category: 'Baby Products', price: 90.00, discountedPrice: 79.99, items_left: 20 },
];

import { CURRENCY } from './utils';

// ==================================
// ## MOCK DATA
// ==================================

// Data for the main directory page (list view)
export const listings: Listing[] = [
  {
    id: 1,
    title: 'George Burton - Life Coach',
    category: 'Coaching',
    categoryTag: 'Business Coach, Coaching',
    location: 'Ocean Avenue, New York',
    priceDisplay: `Starts from ${CURRENCY}100.00`,
    rating: 5.0,
    reviewCount: 3, // Updated to match detailed review count
    imageUrl:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    lat: 40.7128,
    lng: -74.006,
    amenities: ['wifi', 'parking'],
    featured: true,
    isVerified: true,
  },
  {
    id: 2,
    title: 'Luxury Sports Car',
    category: 'Cars',
    categoryTag: 'Cars, For Rent',
    location: 'Suffolk County, New York',
    priceDisplay: `Starts from ${CURRENCY}20.00 per hour`,
    rating: 4.3,
    reviewCount: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    lat: 40.8448,
    lng: -73.1368,
    amenities: ['power', 'transmission'],
    isVerified: false,
  },
  {
    id: 3,
    title: "George's Barber Shop",
    category: 'Services',
    categoryTag: 'Barber, Services',
    location: 'Auburndale, Queens, NY',
    priceDisplay: `${CURRENCY}12.00 - ${CURRENCY}40.00`,
    rating: 4.9,
    reviewCount: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1621607512214-68297480165e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    lat: 40.7583,
    lng: -73.7915,
    amenities: ['wifi', 'parking', 'power'],
    isVerified: false,
  },
  // Add the rest of your listings (4-9) here...
];

// Data for the category filter bar
export const categories = [
  { name: 'All', icon: 'LayoutGrid' },
  { name: 'Apartments', icon: 'Home' },
  { name: 'Real Estate', icon: 'Building' },
  { name: 'Cars', icon: 'Car' },
  { name: 'Classifieds', icon: 'Tag' },
  { name: 'Services', icon: 'Wrench' },
  { name: 'Electronics', icon: 'Smartphone' },
  { name: 'Coaching', icon: 'Users' },
  { name: 'Jobs', icon: 'Briefcase' },
  { name: 'Events', icon: 'Calendar' },
  { name: 'Eat & Drink', icon: 'Utensils' },
];

// This object contains the *extra* details for a listing page.
// In a real app, this data would be fetched from your database for a specific ID.
export const extraDetailedData = {
  description:
    "Struggling with making a big career change or building your confidence? I'm here to help! I specialize in guiding people like you to unlock their full potential, whether it's finding the right path in your career, building self-belief, or working on personal growth.",
  images: [
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80',
  ],
  features: [
    { name: 'Free Parking', icon: 'Parking' as const },
    { name: 'Friendly workspace', icon: 'Workspace' as const },
    { name: 'Pet Friendly', icon: 'Pet' as const },
  ],
  author: {
    name: 'Tom Wilson',
    avatarUrl: 'https://i.pravatar.cc/150?u=tomwilson',
    bio: "I'm Tom Wilson, a non-existing person, and here is my bio for demo purposes. 🙂",
  },
  ratingBreakdown: {
    service: 3.7,
    location: 4.0,
    valueForMoney: 3.0,
    cleanliness: 2.5,
  },
  reviews: [
    {
      id: 1,
      author: 'Tom Perry',
      avatarUrl: 'https://i.pravatar.cc/150?u=tomperry',
      date: 'July 9, 2025 at 7:45 pm',
      rating: 3.5,
      comment: 'George helped me a lot thank you',
      helpfulCount: 3,
    },
    {
      id: 2,
      author: 'Tom Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=tomsmith',
      date: 'December 29, 2022 at 4:52 am',
      rating: 5,
      comment: 'Great service! 🥰 Five stars!',
      helpfulCount: 126,
      reply: {
        author: 'Owner' as const,
        avatarUrl: 'https://i.pravatar.cc/150?u=tomwilson',
        date: 'October 9, 2024 at 6:46 pm',
        comment: 'Thanks!',
      },
    },
    {
      id: 3,
      author: 'Tom Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=tomsmith',
      date: 'August 22, 2022 at 3:02 pm',
      rating: 2.5,
      comment: 'Not great',
      helpfulCount: 126,
    },
  ],
};

// ==================================
// ## DATA FETCHING FUNCTION
// ==================================

// Simulates fetching detailed data for a specific listing ID
export function getListingById(id: string) {
  const listingId = parseInt(id, 10);
  // Find the basic listing info from our main array
  const baseListing = listings.find(l => l.id === listingId);

  // If no listing with that ID exists, return null
  if (!baseListing) {
    return null;
  }

  // In a real app, you would fetch the detailed parts from your database here.
  // For this demo, we merge the base listing with our static detailed data.
  return {
    ...baseListing,
    ...extraDetailedData,
  };
}
